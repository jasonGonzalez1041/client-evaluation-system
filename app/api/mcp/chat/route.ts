/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/mcp/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

REGLAS:
- Usa siempre mode: 'insensitive' para búsquedas de texto
- Para búsquedas por nombre, usa contains en lugar de equals
- Incluye _count cuando necesites contar relaciones
- Usa orderBy apropiado (normalmente por created_at desc)
- Para fechas relativas, calcula desde new Date()
- Siempre incluye las relaciones necesarias con include

Responde SOLO con el JSON, sin texto adicional.
`

async function generatePrismaQuery(userMessage: string) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1000,
            }
        })

        const prompt = `${SYSTEM_PROMPT}\n\nUsuario: "${userMessage}"`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text().trim()

        // Limpiar la respuesta por si tiene markdown
        const cleanText = text.replace(/```json\n?|```\n?/g, '').trim()

        try {
            return JSON.parse(cleanText)
        } catch (parseError) {
            console.error('Error parsing Gemini response:', cleanText)
            throw new Error('Respuesta de IA inválida')
        }
    } catch (error) {
        console.error('Error calling Gemini:', error)
        throw new Error('Error al procesar consulta con IA')
    }
}

async function executePrismaQuery(queryCode: string) {
    try {
        // Evaluar el código Prisma de forma segura
        const query = eval(queryCode)
        const result = await query
        return result
    } catch (error) {
        console.error('Error executing Prisma query:', error)
        throw new Error('Error ejecutando consulta en base de datos')
    }
}

function formatResponse(data: any, responseType: string, explanation: string): string {
    try {
        switch (responseType) {
            case 'count':
                return `${explanation}: ${data} registros encontrados.`

            case 'single':
                if (!data) {
                    return 'No se encontró información para tu consulta.'
                }
                if (data._count?.leads !== undefined) {
                    return `${data.company_name} tiene ${data._count.leads} leads registrados.`
                }
                if (data.company_name) {
                    return `Empresa encontrada: ${data.company_name}\nEstado: ${getStatusText(data.evaluation_status)}\nPuntaje: ${data.percentage}%\nFecha de creación: ${new Date(data.created_at).toLocaleDateString()}`
                }
                return JSON.stringify(data, null, 2)

            case 'list':
                if (!Array.isArray(data) || data.length === 0) {
                    return 'No se encontraron resultados para tu consulta.'
                }

                if (data[0].company_name) {
                    // Lista de empresas
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

                    return `${explanation}:\n${companiesList}${data.length > 10 ? '\n... y más resultados' : ''}\n\nTotal encontrados: ${data.length}`
                } else if (data[0].name || data[0].lead_type) {
                    // Lista de leads
                    const leadsList = data.slice(0, 10).map((lead: any) => {
                        let info = `• ${lead.name || 'Sin nombre'} (${lead.lead_type})`
                        if (lead.position) info += ` - ${lead.position}`
                        if (lead.company?.company_name) info += ` - ${lead.company.company_name}`
                        if (lead.email) info += `\n  Email: ${lead.email}`
                        if (lead.phone) info += `\n  Tel: ${lead.phone}${lead.extension ? ` ext.${lead.extension}` : ''}`
                        return info
                    }).join('\n\n')

                    return `${explanation}:\n${leadsList}${data.length > 10 ? '\n\n... y más resultados' : ''}\n\nTotal encontrados: ${data.length}`
                }

                return `${explanation}: ${data.length} resultados encontrados.\n\n${JSON.stringify(data.slice(0, 3), null, 2)}${data.length > 3 ? '\n... y más resultados' : ''}`

            case 'aggregate':
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

                    return `${explanation}:\n${aggregateList}`
                }
                return `${explanation}: ${JSON.stringify(data, null, 2)}`

            default:
                return `${explanation}\n\n${JSON.stringify(data, null, 2)}`
        }
    } catch (error) {
        console.error('Error formatting response:', error)
        return `${explanation}\n\nDatos obtenidos pero hubo un error al formatear la respuesta.`
    }
}

function getStatusText(status: string): string {
    switch (status) {
        case 'SUITABLE': return 'Apto'
        case 'POTENTIAL': return 'Potencial'
        case 'NOT_SUITABLE': return 'No Apto'
        default: return status
    }
}

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json()

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Mensaje requerido' },
                { status: 400 }
            )
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY no configurado' },
                { status: 500 }
            )
        }

        // Generar consulta Prisma usando Gemini
        const queryInfo = await generatePrismaQuery(message)

        if (!queryInfo.query || !queryInfo.explanation || !queryInfo.responseType) {
            throw new Error('La IA no pudo generar una consulta válida')
        }

        // Ejecutar consulta en Prisma
        const queryResult = await executePrismaQuery(queryInfo.query)

        // Formatear respuesta
        const formattedResponse = formatResponse(
            queryResult,
            queryInfo.responseType,
            queryInfo.explanation
        )

        return NextResponse.json({
            response: formattedResponse,
            queryUsed: queryInfo.query,
            explanation: queryInfo.explanation,
            resultCount: Array.isArray(queryResult) ? queryResult.length : 1
        })

    } catch (error) {
        console.error('Error in MCP chat:', error)

        let errorMessage = 'Lo siento, hubo un error procesando tu consulta.'

        if (error instanceof Error) {
            if (error.message.includes('GEMINI_API_KEY')) {
                errorMessage = 'Error de configuración: API key de Gemini no encontrada.'
            } else if (error.message.includes('IA no pudo generar')) {
                errorMessage = 'No pude entender tu consulta. ¿Podrías reformularla?'
            } else if (error.message.includes('ejecutando consulta')) {
                errorMessage = 'Error accediendo a la base de datos. Intenta con una consulta más simple.'
            }
        }

        return NextResponse.json({
            response: errorMessage,
            error: true
        })
    }
}