/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/evaluations/export/route.ts
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
        const where: any = {}
        
        if (search) {
            where.OR = [
                { client: { company_name: { contains: search, mode: 'insensitive' } } },
                { client: { legal_id: { contains: search, mode: 'insensitive' } } },
                { notes: { contains: search, mode: 'insensitive' } },
            ]
        }
        
        if (status !== 'all') {
            where.status = status
        }

        // Obtener todas las evaluaciones (sin paginación)
        const evaluations = await prisma.evaluation.findMany({
            where,
            include: {
                client: {
                    select: {
                        company_name: true,
                        legal_id: true,
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder
            }
        })

        if (format === 'excel') {
            // Formatear datos para exportación Excel
            const exportData = evaluations.map(evaluation => ({
                'Empresa': evaluation.client.company_name,
                'ID Legal': evaluation.client.legal_id || '',
                'Puntuación': evaluation.score,
                'Porcentaje': `${evaluation.percentage}%`,
                'Estado': evaluation.status === 'SUITABLE' ? 'Apto' :
                    evaluation.status === 'POTENTIAL' ? 'Potencial' : 'No Apto',
                'Notas': evaluation.notes || '',
                'Evaluado por': evaluation.evaluated_by || '',
                'Fecha Evaluación': new Date(evaluation.created_at).toLocaleDateString(),
                'Hora Evaluación': new Date(evaluation.created_at).toLocaleTimeString()
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
                    'Content-Disposition': 'attachment; filename=evaluaciones.csv'
                })
            })
        } else {
            // Generar PDF usando pdf-lib
            const pdfDoc = await PDFDocument.create()
            let currentPage = pdfDoc.addPage([595.28, 841.89]) // A4 size
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

            const { width, height } = currentPage.getSize()
            const margin = 20
            let yPosition = height - margin
            const lineHeight = 12
            const smallLineHeight = 10

            // Título
            currentPage.drawText('Historial de Evaluaciones', {
                x: margin,
                y: yPosition,
                size: 16,
                font: boldFont,
                color: rgb(0, 0, 0)
            })

            yPosition -= 25

            // Información de filtros aplicados
            if (search || status !== 'all') {
                currentPage.drawText('Filtros aplicados:', {
                    x: margin,
                    y: yPosition,
                    size: 10,
                    font: boldFont,
                    color: rgb(0, 0, 0)
                })

                yPosition -= lineHeight

                if (search) {
                    const searchText = search.length > 40 ? search.substring(0, 37) + '...' : search
                    currentPage.drawText(`Búsqueda: ${searchText}`, {
                        x: margin,
                        y: yPosition,
                        size: 9,
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
                        size: 9,
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                yPosition -= 8
            }

            // Encabezados de tabla
            const headersPdf = ['Empresa', 'Puntuación', 'Porcentaje', 'Estado', 'Fecha', 'Hora']
            const columnWidths = [200, 70, 70, 80, 70, 60]
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

            yPosition -= 8

            // Datos de evaluaciones
            for (const evaluation of evaluations) {
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
                const companyName = evaluation.client.company_name.length > 35
                    ? evaluation.client.company_name.substring(0, 35) + '...'
                    : evaluation.client.company_name
                currentPage.drawText(companyName, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[0]

                // Puntuación
                currentPage.drawText(evaluation.score.toString(), {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[1]

                // Porcentaje
                currentPage.drawText(`${evaluation.percentage}%`, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[2]

                // Estado
                const statusText = evaluation.status === 'SUITABLE' ? 'Apto' :
                    evaluation.status === 'POTENTIAL' ? 'Potencial' : 'No Apto'
                currentPage.drawText(statusText, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[3]

                // Fecha
                const date = new Date(evaluation.created_at)
                const shortDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`
                currentPage.drawText(shortDate, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[4]

                // Hora
                const shortTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
                currentPage.drawText(shortTime, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0)
                })

                yPosition -= lineHeight

                // Agregar notas si existen (en una línea adicional)
                if (evaluation.notes) {
                    if (yPosition < margin + 20) {
                        currentPage = pdfDoc.addPage([595.28, 841.89])
                        yPosition = height - margin
                    }

                    const notes = evaluation.notes.length > 80
                        ? evaluation.notes.substring(0, 77) + '...'
                        : evaluation.notes
                    
                    currentPage.drawText(`Notas: ${notes}`, {
                        x: margin + 10,
                        y: yPosition,
                        size: 8,
                        font: font,
                        color: rgb(0.5, 0.5, 0.5)
                    })
                    
                    yPosition -= smallLineHeight
                }

                // Espacio adicional entre evaluaciones
                yPosition -= 5
            }

            // Guardar PDF
            const pdfBytes = await pdfDoc.save()
            const pdfBuffer = Buffer.from(pdfBytes)

            return new NextResponse(pdfBuffer, {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename=evaluaciones.pdf',
                    'Content-Length': pdfBuffer.length.toString()
                })
            })
        }

    } catch (error) {
        console.error('Error exporting evaluations:', error)
        return NextResponse.json(
            { message: 'Error exporting evaluations' },
            { status: 500 }
        )
    }
}