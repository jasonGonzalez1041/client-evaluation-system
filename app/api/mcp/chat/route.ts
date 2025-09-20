/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/mcp/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

console.log('🚀 MCP Chat Route: Module loaded')

// Inicializar Gemini
console.log('🔑 Checking GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'Present' : 'Missing')
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
console.log('🤖 Gemini AI initialized')

// Schema de la base de datos para que Gemini entienda la estructura
const DATABASE_SCHEMA = `
SCHEMA DE BASE DE DATOS:

model Company {
  id: String (UUID)
  company_name: String
  legal_id: String?
  employees: Int?
  geographic_location: String?
  website: String?
  phone: String?
  email: String?
  evaluation_status: Enum (SUITABLE, POTENTIAL, NOT_SUITABLE)
  total_score: Int
  percentage: Int
  notes: String?
  evaluated_by: String?
  evaluated_at: DateTime?
  created_at: DateTime
  updated_at: DateTime
  leads: Lead[] (relación uno a muchos)
}

model Lead {
  id: String (UUID)
  company_id: String (FK hacia Company)
  lead_type: Enum (direcciones, consejo, comite, otros)
  position: String?
  name: String?
  phone: String?
  extension: String?
  email: String?
  created_at: DateTime
  updated_at: DateTime
  company: Company (relación)
}

MAPEO DE TÉRMINOS:
- "Apto" = SUITABLE
- "Potencial" = POTENTIAL 
- "No Apto" = NOT_SUITABLE
- "direcciones" = direcciones
- "consejo" = consejo
- "comité/comite" = comite
- "otros" = otros
`

const SYSTEM_PROMPT = `
Eres un asistente especializado en generar consultas Prisma basadas en preguntas en español sobre un CRM de leads y empresas.

${DATABASE_SCHEMA}

INSTRUCCIONES:
1. Analiza la pregunta del usuario en español
2. Genera el código Prisma TypeScript apropiado para responder la pregunta
3. Responde ÚNICAMENTE con un objeto JSON que contenga:
   - "query": el código Prisma completo y funcional
   - "explanation": breve explicación en español de qué hace la consulta
   - "responseType": tipo de respuesta esperada ("count", "list", "single", "aggregate")

EJEMPLOS:

Usuario: "¿Cuántos leads tengo?"
Respuesta: {
  "query": "await prisma.lead.count()",
  "explanation": "Cuenta el número total de leads en la base de datos",
  "responseType": "count"
}

Usuario: "Mostrar las 5 empresas con más leads"
Respuesta: {
  "query": "await prisma.company.findMany({ include: { _count: { select: { leads: true } } }, orderBy: { leads: { _count: 'desc' } }, take: 5 })",
  "explanation": "Busca las 5 empresas con mayor cantidad de leads ordenadas descendentemente",
  "responseType": "list"
}

Usuario: "Mostrar empresas aptas con sus leads"
Respuesta: {
  "query": "await prisma.company.findMany({ where: { evaluation_status: 'SUITABLE' }, include: { leads: true, _count: { select: { leads: true } } }, orderBy: { created_at: 'desc' } })",
  "explanation": "Busca todas las empresas con estado SUITABLE incluyendo sus leads",
  "responseType": "list"
}

Usuario: "¿Cuántos leads tiene la empresa Microsoft?"
Respuesta: {
  "query": "await prisma.company.findFirst({ where: { company_name: { contains: 'Microsoft', mode: 'insensitive' } }, include: { _count: { select: { leads: true } } } })",
  "explanation": "Busca la empresa Microsoft y cuenta sus leads",
  "responseType": "single"
}

Usuario: "¿Cuántas empresas hay por cada estado de evaluación?"
Respuesta: {
  "query": "await prisma.company.groupBy({ by: ['evaluation_status'], _count: { evaluation_status: true } })",
  "explanation": "Agrupa las empresas por estado de evaluación y cuenta cada grupo",
  "responseType": "aggregate"
}

REGLAS:
- Usa siempre mode: 'insensitive' para búsquedas de texto
- Para búsquedas por nombre, usa contains en lugar de equals
- Para contar relaciones, usa _count: { select: { relationName: true } }
- Para ordenar por conteo de relaciones, usa orderBy: { relationName: { _count: 'desc' } }
- Usa orderBy apropiado (normalmente por created_at desc)
- Para fechas relativas, calcula desde new Date()
- Siempre incluye las relaciones necesarias con include
- Para queries de ranking con conteo, SIEMPRE usar orderBy: { relationName: { _count: 'desc/asc' } }

Responde SOLO con el JSON, sin texto adicional.
`

async function generatePrismaQuery(userMessage: string) {
    console.log('🧠 Starting generatePrismaQuery with message:', userMessage)

    try {
        console.log('🔧 Creating Gemini model...')
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1000,
            }
        })
        console.log('✅ Gemini model created successfully')

        const prompt = `${SYSTEM_PROMPT}\n\nUsuario: "${userMessage}"`
        console.log('📝 Prompt created, length:', prompt.length)
        console.log('📝 Prompt preview (first 200 chars):', prompt.substring(0, 200) + '...')

        console.log('🚀 Calling Gemini API...')
        const result = await model.generateContent(prompt)
        console.log('✅ Gemini API call successful')

        console.log('🔄 Getting response from result...')
        const response = await result.response
        console.log('✅ Response obtained from result')

        console.log('📄 Getting text from response...')
        const text = response.text().trim()
        console.log('✅ Text extracted, length:', text.length)
        console.log('📄 Gemini raw response:', text);

        // Limpiar la respuesta por si tiene markdown
        console.log('🧹 Cleaning response text...')
        const cleanText = text.replace(/```json\n?|```\n?/g, '').trim()
        console.log('🧹 Cleaned text:', cleanText);

        try {
            console.log('🔍 Parsing JSON response...')
            const parsedResult = JSON.parse(cleanText)
            console.log('✅ JSON parsed successfully:', parsedResult)
            return parsedResult
        } catch (parseError) {
            console.error('❌ Error parsing Gemini response:', parseError)
            console.error('❌ Clean text that failed to parse:', cleanText)
            throw new Error('Respuesta de IA inválida')
        }
    } catch (error) {
        console.error('❌ Error in generatePrismaQuery:', error)
        if (error instanceof Error) {
            console.error('❌ Error message:', error.message)
            console.error('❌ Error stack:', error.stack)
        }
        throw new Error('Error al procesar consulta con IA')
    }
}

async function executePrismaQuery(queryCode: string) {
    console.log('💾 Starting executePrismaQuery with code:', queryCode)

    try {
        console.log('🔧 Testing Prisma connection...')
        await prisma.$connect()
        console.log('✅ Prisma connection successful')

        console.log('⚡ Creating async function wrapper...')
        // Crear una función async que envuelve el código Prisma
        const asyncFunction = new Function('prisma', `
            return (async function() {
                return ${queryCode};
            })();
        `)

        console.log('✅ Async function wrapper created successfully')

        console.log('🚀 Executing Prisma query...')
        const result = await asyncFunction(prisma)
        console.log('✅ Prisma query executed successfully')
        console.log('📊 Query result type:', typeof result)
        console.log('📊 Query result (first 500 chars):', JSON.stringify(result, null, 2).substring(0, 500))

        if (Array.isArray(result)) {
            console.log('📊 Result is array with length:', result.length)
        } else if (typeof result === 'number') {
            console.log('📊 Result is number:', result)
        } else if (result === null) {
            console.log('📊 Result is null')
        }

        return result
    } catch (error) {
        console.error('❌ Error in executePrismaQuery:', error)
        if (error instanceof Error) {
            console.error('❌ Error message:', error.message)
            console.error('❌ Error stack:', error.stack)
        }
        throw new Error('Error ejecutando consulta en base de datos')
    } finally {
        console.log('🔌 Disconnecting from Prisma...')
        await prisma.$disconnect()
        console.log('✅ Prisma disconnected')
    }
}

function formatResponse(data: any, responseType: string, explanation: string): string {
    console.log('📝 Starting formatResponse')
    console.log('📝 Data type:', typeof data)
    console.log('📝 Response type:', responseType)
    console.log('📝 Explanation:', explanation)
    console.log('📝 Data preview:', JSON.stringify(data, null, 2).substring(0, 300))

    try {
        let formattedResult: string;

        switch (responseType) {
            case 'count':
                console.log('📊 Formatting COUNT response')
                formattedResult = `${explanation}: ${data} registros encontrados.`
                break;

            case 'single':
                console.log('📊 Formatting SINGLE response')
                if (!data) {
                    formattedResult = 'No se encontró información para tu consulta.'
                } else if (data._count?.leads !== undefined) {
                    formattedResult = `${data.company_name} tiene ${data._count.leads} leads registrados.`
                } else if (data.company_name) {
                    formattedResult = `Empresa encontrada: ${data.company_name}\nEstado: ${getStatusText(data.evaluation_status)}\nPuntaje: ${data.percentage}%\nFecha de creación: ${new Date(data.created_at).toLocaleDateString()}`
                } else {
                    formattedResult = JSON.stringify(data, null, 2)
                }
                break;

            case 'list':
                console.log('📊 Formatting LIST response')
                if (!Array.isArray(data) || data.length === 0) {
                    formattedResult = 'No se encontraron resultados para tu consulta.'
                } else if (data[0].company_name) {
                    // Lista de empresas
                    console.log('📊 Formatting as company list')
                    const companiesList = data.slice(0, 10).map((company: any) => {
                        let info = `• ${company.company_name}`
                        if (company._count?.leads !== undefined) {
                            info += ` (${company._count.leads} leads)`
                        }
                        if (company.evaluation_status) {
                            info += ` - ${getStatusText(company.evaluation_status)}`
                        }
                        if (company.percentage) {
                            info += ` - ${company.percentage}%`
                        }
                        return info
                    }).join('\n')

                    formattedResult = `${explanation}:\n${companiesList}${data.length > 10 ? '\n... y más resultados' : ''}\n\nTotal encontrados: ${data.length}`
                } else if (data[0].name || data[0].lead_type) {
                    // Lista de leads
                    console.log('📊 Formatting as leads list')
                    const leadsList = data.slice(0, 10).map((lead: any) => {
                        let info = `• ${lead.name || 'Sin nombre'} (${lead.lead_type || 'Sin tipo'})`
                        if (lead.position) info += ` - ${lead.position}`
                        if (lead.company?.company_name) info += ` - ${lead.company.company_name}`
                        if (lead.email) info += `\n  Email: ${lead.email}`
                        if (lead.phone) info += `\n  Tel: ${lead.phone}${lead.extension ? ` ext.${lead.extension}` : ''}`
                        return info
                    }).join('\n\n')

                    formattedResult = `${explanation}:\n${leadsList}${data.length > 10 ? '\n\n... y más resultados' : ''}\n\nTotal encontrados: ${data.length}`
                } else {
                    console.log('📊 Formatting as generic list')
                    formattedResult = `${explanation}: ${data.length} resultados encontrados.\n\n${JSON.stringify(data.slice(0, 3), null, 2)}${data.length > 3 ? '\n... y más resultados' : ''}`
                }
                break;

            case 'aggregate':
                console.log('📊 Formatting AGGREGATE response')
                if (Array.isArray(data)) {
                    const aggregateList = data.map((item: any) => {
                        if (item.evaluation_status) {
                            return `• ${getStatusText(item.evaluation_status)}: ${item._count?.evaluation_status || item.count || 0} empresas`
                        }
                        if (item.lead_type) {
                            return `• ${item.lead_type}: ${item._count?.lead_type || item.count || 0} leads`
                        }
                        return `• ${JSON.stringify(item)}`
                    }).join('\n')

                    formattedResult = `${explanation}:\n${aggregateList}`
                } else {
                    formattedResult = `${explanation}: ${JSON.stringify(data, null, 2)}`
                }
                break;

            default:
                console.log('📊 Formatting DEFAULT response')
                formattedResult = `${explanation}\n\n${JSON.stringify(data, null, 2)}`
        }

        console.log('✅ Response formatted successfully')
        console.log('📝 Formatted result preview:', formattedResult.substring(0, 200))
        return formattedResult;

    } catch (error) {
        console.error('❌ Error in formatResponse:', error)
        return `${explanation}\n\nDatos obtenidos pero hubo un error al formatear la respuesta.`
    }
}

function getStatusText(status: string): string {
    console.log('🏷️ Converting status:', status)
    switch (status) {
        case 'SUITABLE': return 'Apto'
        case 'POTENTIAL': return 'Potencial'
        case 'NOT_SUITABLE': return 'No Apto'
        default: return status
    }
}

function generateCustomerServiceErrorMessage(): string {
    const messages = [
        "Disculpa, tuve un pequeño inconveniente procesando tu consulta. Como soy una IA, a veces puedo tener dificultades con consultas muy específicas. ¿Podrías intentar reformular tu pregunta de manera diferente?",
        "Me disculpo por el inconveniente. Parece que hubo un problema al ejecutar tu consulta. ¿Podrías intentar hacer la pregunta de otra forma? A veces una ligera variación en las palabras me ayuda a entenderte mejor.",
        "Lo siento, no pude procesar correctamente tu solicitud. Como asistente de IA, ocasionalmente tengo dificultades con ciertas consultas. ¿Te gustaría intentar preguntármelo de manera un poco diferente?",
        "Perdona el inconveniente. Hubo un error al acceder a los datos. Como soy una IA, puedo cometer errores ocasionalmente. ¿Podrías parafrasear tu pregunta o preguntarla de manera similar para obtener un mejor resultado?"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
}

export async function POST(request: NextRequest) {
    console.log('🌐 POST request received')
    console.log('🌐 Request URL:', request.url)
    console.log('🌐 Request method:', request.method)

    try {
        console.log('📥 Parsing request body...')
        const body = await request.json()
        console.log('📥 Request body parsed:', body)

        const { message } = body

        if (!message || typeof message !== 'string') {
            console.log('❌ Invalid message in request:', { message, type: typeof message })
            return NextResponse.json(
                { error: 'Mensaje requerido' },
                { status: 400 }
            )
        }

        console.log('✅ Message validated:', message)

        if (!process.env.GOOGLE_API_KEY) {
            console.log('❌ GOOGLE_API_KEY not configured')
            return NextResponse.json(
                { error: 'GOOGLE_API_KEY no configurado' },
                { status: 500 }
            )
        }

        console.log('✅ Environment variables check passed')

        // Generar consulta Prisma usando Gemini
        console.log('🧠 Generating Prisma query with AI...')
        const queryInfo = await generatePrismaQuery(message)
        console.log('✅ AI query generation completed:', queryInfo)

        if (!queryInfo.query || !queryInfo.explanation || !queryInfo.responseType) {
            console.log('❌ Invalid query info from AI:', queryInfo)
            throw new Error('La IA no pudo generar una consulta válida')
        }

        console.log('✅ Query info validation passed')

        // Ejecutar consulta en Prisma
        console.log('💾 Executing Prisma query...')
        const queryResult = await executePrismaQuery(queryInfo.query)
        console.log('✅ Prisma query execution completed')

        // Formatear respuesta
        console.log('📝 Formatting response...')
        const formattedResponse = formatResponse(
            queryResult,
            queryInfo.responseType,
            queryInfo.explanation
        )
        console.log('✅ Response formatting completed')

        const finalResponse = {
            response: formattedResponse,
            queryUsed: queryInfo.query,
            explanation: queryInfo.explanation,
            resultCount: Array.isArray(queryResult) ? queryResult.length : 1
        }

        console.log('🎉 Sending successful response')
        console.log('🎉 Final response preview:', JSON.stringify(finalResponse, null, 2).substring(0, 300))

        return NextResponse.json(finalResponse)

    } catch (error) {
        console.error('💥 Error in POST handler:', error)

        if (error instanceof Error) {
            console.error('💥 Error message:', error.message)
            console.error('💥 Error stack:', error.stack)
        }

        let errorMessage = generateCustomerServiceErrorMessage();

        if (error instanceof Error) {
            if (error.message.includes('GEMINI_API_KEY') || error.message.includes('GOOGLE_API_KEY')) {
                errorMessage = 'Disculpa, hay un problema de configuración en el sistema. Por favor contacta al administrador.'
                console.error('🔑 API Key error detected')
            } else if (error.message.includes('IA no pudo generar')) {
                errorMessage = 'No logré entender completamente tu consulta. ¿Podrías reformularla usando palabras diferentes? Como IA, a veces necesito que las preguntas sean planteadas de otra manera.'
                console.error('🧠 AI generation error detected')
            }
        }

        const errorResponse = {
            response: errorMessage,
            error: true
        }

        console.log('💥 Sending error response:', errorResponse)

        return NextResponse.json(errorResponse)
    }
}