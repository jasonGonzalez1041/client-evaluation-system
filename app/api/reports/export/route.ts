/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/reports/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

enum EvaluationStatus {
    SUITABLE,
    POTENTIAL,
    NOT_SUITABLE
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const dateFrom = searchParams.get('dateFrom') || ''
        const dateTo = searchParams.get('dateTo') || ''
        const companyStatus = searchParams.get('companyStatus') || 'all'
        const leadType = searchParams.get('leadType') || 'all'
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const format = searchParams.get('format') || 'excel'

        // Construir condiciones de filtrado
        const where: any = {}

        // Filtro por fecha
        if (dateFrom || dateTo) {
            where.created_at = {}
            if (dateFrom) {
                where.created_at.gte = new Date(dateFrom)
            }
            if (dateTo) {
                where.created_at.lte = new Date(dateTo)
            }
        }

        // Filtro por estado de empresa
        if (companyStatus !== 'all') {
            if (Object.values(EvaluationStatus).includes(companyStatus)) {
                where.company = {
                    evaluation_status: companyStatus
                }
            }
        }

        // Filtro por tipo de lead
        if (leadType !== 'all') {
            where.lead_type = leadType
        }

        // Obtener todos los leads (sin paginación)
        const leads = await prisma.lead.findMany({
            where,
            include: {
                company: {
                    select: {
                        company_name: true,
                        evaluation_status: true,
                        total_score: true,
                        geographic_location: true,
                        employees: true
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder
            }
        })

        // Obtener estadísticas
        const [leadTypeStats, evaluationStats] = await Promise.all([
            prisma.lead.groupBy({
                by: ['lead_type'],
                where,
                _count: {
                    id: true
                }
            }),
            prisma.company.groupBy({
                by: ['evaluation_status'],
                where: {
                    created_at: dateFrom || dateTo ? {
                        ...(dateFrom && { gte: new Date(dateFrom) }),
                        ...(dateTo && { lte: new Date(dateTo) })
                    } : undefined,
                },
                _count: {
                    id: true
                }
            })
        ])

        // Obtener la fecha actual en formato DD_MM_YYYY
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateStr = `${day}_${month}_${year}`;

        // Crear el nombre del archivo con la fecha
        const fileName = `reporte_${dateStr}.${format === 'excel' ? 'csv' : 'pdf'}`;

        if (format === 'excel') {
            // Cabecera con información del reporte
            let csvContent = `Reporte de Leads - ${dateStr}\n\n`

            // Información de filtros
            if (dateFrom || dateTo || companyStatus !== 'all' || leadType !== 'all') {
                csvContent += "Filtros aplicados:\n"
                if (dateFrom) csvContent += `• Desde: ${dateFrom}\n`
                if (dateTo) csvContent += `• Hasta: ${dateTo}\n`
                if (companyStatus !== 'all') {
                    const statusText = companyStatus === 'SUITABLE' ? 'Apto' :
                        companyStatus === 'POTENTIAL' ? 'Potencial' : 'No Apto'
                    csvContent += `• Estado empresa: ${statusText}\n`
                }
                if (leadType !== 'all') {
                    csvContent += `• Tipo lead: ${leadType}\n`
                }
                csvContent += "\n"
            }

            // Estadísticas
            csvContent += "ESTADÍSTICAS\n"
            csvContent += `Total de leads: ${leads.length}\n`

            // Estadísticas por tipo de lead
            csvContent += "Leads por tipo:\n"
            leadTypeStats.forEach(stat => {
                csvContent += `• ${stat.lead_type}: ${stat._count.id}\n`
            })

            // Estadísticas por estado de evaluación
            csvContent += "Empresas por estado:\n"
            evaluationStats.forEach(stat => {
                const statusText = stat.evaluation_status === 'SUITABLE' ? 'Apto' :
                    stat.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto'
                csvContent += `• ${statusText}: ${stat._count.id}\n`
            })

            csvContent += "\nDETALLE DE LEADS\n"

            // Datos de leads
            const headers = ['Nombre', 'Email', 'Teléfono', 'Extensión', 'Posición', 'Tipo',
                'Empresa', 'Estado Empresa', 'Puntuación', 'Empleados', 'Ubicación', 'Fecha Creación']
            csvContent += headers.join(',') + '\n'

            leads.forEach(lead => {
                const row = [
                    lead.name || '',
                    lead.email || '',
                    lead.phone || '',
                    lead.extension || '',
                    lead.position || '',
                    lead.lead_type,
                    lead.company.company_name,
                    lead.company.evaluation_status === 'SUITABLE' ? 'Apto' :
                        lead.company.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto',
                    lead.company.total_score?.toString() || '0',
                    lead.company.employees?.toString() || '0',
                    lead.company.geographic_location || '',
                    new Date(lead.created_at).toLocaleDateString()
                ].map(field => `"${field}"`).join(',')

                csvContent += row + '\n'
            })

            return new NextResponse(csvContent, {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${fileName}"`
                })
            })

        } else if (format === 'pdf') {
            // Generar PDF
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
            currentPage.drawText(`Reporte de Leads - ${dateStr}`, {
                x: margin,
                y: yPosition,
                size: 14,
                font: boldFont,
                color: rgb(0, 0, 0)
            })

            yPosition -= 25

            // Información de filtros aplicados
            if (dateFrom || dateTo || companyStatus !== 'all' || leadType !== 'all') {
                currentPage.drawText('Filtros aplicados:', {
                    x: margin,
                    y: yPosition,
                    size: 9,
                    font: boldFont,
                    color: rgb(0, 0, 0)
                })

                yPosition -= lineHeight

                if (dateFrom) {
                    currentPage.drawText(`• Desde: ${dateFrom}`, {
                        x: margin + 5,
                        y: yPosition,
                        size: 8,
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                if (dateTo) {
                    currentPage.drawText(`• Hasta: ${dateTo}`, {
                        x: margin + 5,
                        y: yPosition,
                        size: 8,
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                if (companyStatus !== 'all') {
                    const statusText = companyStatus === 'SUITABLE' ? 'Apto' :
                        companyStatus === 'POTENTIAL' ? 'Potencial' : 'No Apto'
                    currentPage.drawText(`• Estado empresa: ${statusText}`, {
                        x: margin + 5,
                        y: yPosition,
                        size: 8,
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                if (leadType !== 'all') {
                    currentPage.drawText(`• Tipo lead: ${leadType}`, {
                        x: margin + 5,
                        y: yPosition,
                        size: 8,
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                yPosition -= 8
            }

            // Estadísticas
            currentPage.drawText('ESTADÍSTICAS', {
                x: margin,
                y: yPosition,
                size: 11,
                font: boldFont,
                color: rgb(0, 0, 0)
            })
            yPosition -= lineHeight

            currentPage.drawText(`Total de leads: ${leads.length}`, {
                x: margin,
                y: yPosition,
                size: 9,
                font: font,
                color: rgb(0, 0, 0)
            })
            yPosition -= smallLineHeight

            // Estadísticas por tipo de lead
            currentPage.drawText('Leads por tipo:', {
                x: margin,
                y: yPosition,
                size: 9,
                font: boldFont,
                color: rgb(0, 0, 0)
            })
            yPosition -= smallLineHeight

            leadTypeStats.forEach(stat => {
                currentPage.drawText(`• ${stat.lead_type}: ${stat._count.id}`, {
                    x: margin + 5,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                yPosition -= smallLineHeight
            })

            // Estadísticas por estado de evaluación
            currentPage.drawText('Empresas por estado:', {
                x: margin,
                y: yPosition,
                size: 9,
                font: boldFont,
                color: rgb(0, 0, 0)
            })
            yPosition -= smallLineHeight

            evaluationStats.forEach(stat => {
                const statusText = stat.evaluation_status === 'SUITABLE' ? 'Apto' :
                    stat.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto'

                currentPage.drawText(`• ${statusText}: ${stat._count.id}`, {
                    x: margin + 5,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                yPosition -= smallLineHeight
            })

            yPosition -= 15

            // Encabezados de tabla
            const headersPdf = ['Nombre', 'Empresa', 'Correo', 'Teléfono', 'Estado', 'Puntuación', 'Fecha']
            const columnWidths = [80, 100, 120, 80, 60, 60, 70]
            let xPosition = margin

            // Verificar si necesitamos nueva página
            if (yPosition < margin + 50) {
                currentPage = pdfDoc.addPage([595.28, 841.89])
                yPosition = height - margin - 20
            }

            // Dibujar encabezados
            headersPdf.forEach((header, i) => {
                currentPage.drawText(header, {
                    x: xPosition,
                    y: yPosition,
                    size: 9,
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

            // Datos de leads
            for (const lead of leads) {
                // Verificar si necesitamos nueva página
                if (yPosition < margin + 50) {
                    currentPage = pdfDoc.addPage([595.28, 841.89])
                    yPosition = height - margin - 20

                    // Redibujar encabezados en nueva página
                    xPosition = margin
                    headersPdf.forEach((header, i) => {
                        currentPage.drawText(header, {
                            x: xPosition,
                            y: yPosition,
                            size: 9,
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

                // Nombre
                const name = lead.name || 'Sin nombre'
                const nameDisplay = name.length > 20 ? name.substring(0, 17) + '...' : name
                currentPage.drawText(nameDisplay, {
                    x: xPosition,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[0]

                // Empresa
                const companyName = lead.company.company_name
                const companyDisplay = companyName.length > 20 ? companyName.substring(0, 17) + '...' : companyName
                currentPage.drawText(companyDisplay, {
                    x: xPosition,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[1]

                // Correo
                const email = lead.email || 'N/A'
                const emailDisplay = email.length > 25 ? email.substring(0, 22) + '...' : email
                currentPage.drawText(emailDisplay, {
                    x: xPosition,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[2]

                // Teléfono
                const phone = lead.phone || 'N/A'
                let phoneDisplay = phone
                if (lead.extension) {
                    phoneDisplay += ` ext.${lead.extension}`
                }
                phoneDisplay = phoneDisplay.length > 15 ? phoneDisplay.substring(0, 12) + '...' : phoneDisplay
                currentPage.drawText(phoneDisplay, {
                    x: xPosition,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[3]

                // Estado de evaluación
                let estado = 'No Apto'
                if (lead.company.evaluation_status === 'SUITABLE') {
                    estado = 'Apto'
                } else if (lead.company.evaluation_status === 'POTENTIAL') {
                    estado = 'Potencial'
                }
                currentPage.drawText(estado, {
                    x: xPosition,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[4]

                // Puntuación
                const score = lead.company.total_score || 0
                currentPage.drawText(score.toString(), {
                    x: xPosition,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[5]

                // Fecha de registro
                const date = new Date(lead.created_at)
                const shortDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                currentPage.drawText(shortDate, {
                    x: xPosition,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })

                yPosition -= lineHeight

                // Línea separadora sutil entre registros
                currentPage.drawLine({
                    start: { x: margin, y: yPosition + 3 },
                    end: { x: width - margin, y: yPosition + 3 },
                    thickness: 0.3,
                    color: rgb(0.8, 0.8, 0.8)
                })

                yPosition -= 4
            }

            // Guardar PDF
            const pdfBytes = await pdfDoc.save()
            const pdfBuffer = Buffer.from(pdfBytes)

            return new NextResponse(pdfBuffer, {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${fileName}"`
                })
            })
        }

        // Si el formato no es válido
        return NextResponse.json(
            { message: 'Formato no válido. Use excel o pdf.' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Error exporting reports:', error)
        return NextResponse.json(
            { message: 'Error exporting reports', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}