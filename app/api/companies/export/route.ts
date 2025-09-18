import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || 'all'
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const format = searchParams.get('format') || 'excel'

        // Construir condiciones de filtrado
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}

        if (search) {
            where.OR = [
                { company_name: { contains: search, mode: 'insensitive' } },
                { legal_id: { contains: search, mode: 'insensitive' } },
                { geographic_location: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (status !== 'all') {
            where.evaluation_status = status
        }

        // Obtener todas las compañías (sin paginación)
        const companies = await prisma.company.findMany({
            where,
            include: {
                leads: {
                    take: 1,
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder
            }
        })

        if (format === 'excel') {
            // Formatear datos para exportación Excel
            const exportData = companies.map(company => ({
                'Empresa': company.company_name,
                'ID Legal': company.legal_id || '',
                'Ubicación': company.geographic_location || '',
                'Teléfono': company.phone || '',
                'Email': company.email || '',
                'Website': company.website || '',
                'Empleados': company.employees || '',
                'Puntuación (%)': company.percentage,
                'Puntos': company.total_score,
                'Estado': company.evaluation_status === 'SUITABLE' ? 'Apto' :
                    company.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto',
                'Contacto': company.leads[0]?.name || '',
                'Email Contacto': company.leads[0]?.email || '',
                'Fecha Creación': new Date(company.created_at).toLocaleDateString()
            }))

            // Implementar lógica para generar Excel
            const headers = Object.keys(exportData[0] || {}).join(',') + '\n'
            const csvContent = exportData.reduce((acc, row) => {
                const values = Object.values(row).map(value => `"${value}"`).join(',')
                return acc + values + '\n'
            }, headers)

            return new NextResponse(csvContent, {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename=compañías.csv'
                })
            })
        } else {
            // Generar PDF usando pdf-lib
            const pdfDoc = await PDFDocument.create()
            let currentPage = pdfDoc.addPage([595.28, 841.89]) // A4 size
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

            const { width, height } = currentPage.getSize()
            const margin = 20 // Reducir margen para más espacio
            let yPosition = height - margin
            const lineHeight = 12 // Reducir altura de línea
            const smallLineHeight = 10 // Para texto más pequeño

            // Título
            currentPage.drawText('Lista de Compañías', {
                x: margin,
                y: yPosition,
                size: 16, // Tamaño ligeramente menor
                font: boldFont,
                color: rgb(0, 0, 0)
            })

            yPosition -= 25 // Reducir espacio después del título

            // Información de filtros aplicados
            if (search || status !== 'all') {
                currentPage.drawText('Filtros aplicados:', {
                    x: margin,
                    y: yPosition,
                    size: 10, // Texto más pequeño
                    font: boldFont,
                    color: rgb(0, 0, 0)
                })

                yPosition -= lineHeight

                if (search) {
                    // Truncar búsqueda si es muy larga
                    const searchText = search.length > 40 ? search.substring(0, 37) + '...' : search
                    currentPage.drawText(`Búsqueda: ${searchText}`, {
                        x: margin,
                        y: yPosition,
                        size: 9, // Texto más pequeño
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                if (status !== 'all') {
                    const statusText = status === 'SUITABLE' ? 'Apto' :
                        status === 'POTENTIAL' ? 'Potencial' : 'No Apto'
                    currentPage.drawText(`Estado: ${statusText}`, {
                        x: margin,
                        y: yPosition,
                        size: 9, // Texto más pequeño
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                yPosition -= 8 // Espacio adicional reducido
            }

            // Encabezados de tabla con anchos optimizados
            const headersPdf = ['Empresa', 'Ubicación', 'Puntuación', 'Estado', 'Contacto', 'Fecha']
            const columnWidths = [180, 110, 60, 60, 100, 60] // Anchos optimizados
            let xPosition = margin

            // Dibujar encabezados
            headersPdf.forEach((header, i) => {
                currentPage.drawText(header, {
                    x: xPosition,
                    y: yPosition,
                    size: 10,
                    font: boldFont,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[i]
            })

            yPosition -= lineHeight

            // Línea separadora
            currentPage.drawLine({
                start: { x: margin, y: yPosition },
                end: { x: width - margin, y: yPosition },
                thickness: 1,
                color: rgb(0, 0, 0)
            })

            yPosition -= 8 // Reducir espacio después de la línea

            // Datos de compañías
            for (const company of companies) {
                // Verificar si necesitamos una nueva página
                if (yPosition < margin + 40) {
                    currentPage = pdfDoc.addPage([595.28, 841.89])
                    yPosition = height - margin

                    // Dibujar encabezados en la nueva página
                    xPosition = margin
                    headersPdf.forEach((header, i) => {
                        currentPage.drawText(header, {
                            x: xPosition,
                            y: yPosition,
                            size: 10,
                            font: boldFont,
                            color: rgb(0, 0, 0)
                        })
                        xPosition += columnWidths[i]
                    })

                    yPosition -= lineHeight
                    currentPage.drawLine({
                        start: { x: margin, y: yPosition },
                        end: { x: width - margin, y: yPosition },
                        thickness: 1,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= 8
                }

                xPosition = margin

                // Empresa (truncar si es necesario)
                const companyName = company.company_name.length > 40
                    ? company.company_name.substring(0, 40) + '...'
                    : company.company_name
                currentPage.drawText(companyName, {
                    x: xPosition,
                    y: yPosition,
                    size: 9, // Texto más pequeño
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[0]

                // Ubicación (truncar si es necesario)
                const location = company.geographic_location
                    ? (company.geographic_location.length > 30
                        ? company.geographic_location.substring(0, 30) + '...'
                        : company.geographic_location)
                    : 'N/A'
                currentPage.drawText(location, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[1]

                // Puntuación
                currentPage.drawText(`${company.percentage}%`, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[2]

                // Estado
                const statusText = company.evaluation_status === 'SUITABLE' ? 'Apto' :
                    company.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto'
                currentPage.drawText(statusText, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[3]

                // Contacto (truncar si es necesario)
                const contactName = company.leads[0]?.name || 'Sin contacto'
                const contactDisplay = contactName.length > 15
                    ? contactName.substring(0, 12) + '...'
                    : contactName
                currentPage.drawText(contactDisplay, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[4]

                // Fecha (formato más corto)
                const date = new Date(company.created_at)
                const shortDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`
                currentPage.drawText(shortDate, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })

                yPosition -= lineHeight
            }

            // Guardar PDF
            const pdfBytes = await pdfDoc.save()

            // Convertir Uint8Array a Buffer para NextResponse
            const pdfBuffer = Buffer.from(pdfBytes)

            return new NextResponse(pdfBuffer, {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename=compañías.pdf',
                    'Content-Length': pdfBuffer.length.toString()
                })
            })
        }

    } catch (error) {
        console.error('Error exporting companies:', error)
        return NextResponse.json(
            { message: 'Error exporting companies' },
            { status: 500 }
        )
    }
}