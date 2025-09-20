/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/leads/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const type = searchParams.get('type') || 'all'
        const company = searchParams.get('company') || 'all'
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const format = searchParams.get('format') || 'excel'

        // Construir condiciones de filtrado
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { position: { contains: search, mode: 'insensitive' } },
                { company: { company_name: { contains: search, mode: 'insensitive' } } },
            ]
        }

        if (type !== 'all') {
            where.lead_type = type
        }

        if (company !== 'all') {
            where.company_id = company
        }

        // Obtener todos los leads (sin paginación)
        const leads = await prisma.lead.findMany({
            where,
            include: {
                company: {
                    select: {
                        company_name: true,
                        evaluation_status: true
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder
            }
        })

        // Obtener la fecha actual en formato DD_MM_YYYY
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateStr = `${day}_${month}_${year}`;

        // Crear el nombre del archivo con la fecha
        const fileName = `leads_${dateStr}.${format === 'excel' ? 'csv' : 'pdf'}`;

        if (format === 'excel') {
            // Formatear datos para exportación Excel
            const exportData = leads.map(lead => ({
                'Nombre': lead.name || '',
                'Email': lead.email || '',
                'Teléfono': lead.phone || '',
                'Extensión': lead.extension || '',
                'Posición': lead.position || '',
                'Tipo': lead.lead_type,
                'Empresa': lead.company.company_name,
                'Estado Empresa': lead.company.evaluation_status === 'SUITABLE' ? 'Apto' :
                    lead.company.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto'
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
                    'Content-Disposition': `attachment; filename="${fileName}"`
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
            currentPage.drawText('Lista de Leads', {
                x: margin,
                y: yPosition,
                size: 14,
                font: boldFont,
                color: rgb(0, 0, 0)
            })

            yPosition -= 25

            // Información de filtros aplicados
            if (search || type !== 'all' || company !== 'all') {
                currentPage.drawText('Filtros aplicados:', {
                    x: margin,
                    y: yPosition,
                    size: 9,
                    font: boldFont,
                    color: rgb(0, 0, 0)
                })

                yPosition -= lineHeight

                if (search) {
                    currentPage.drawText(`• Búsqueda: ${search}`, {
                        x: margin + 5,
                        y: yPosition,
                        size: 8,
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                if (type !== 'all') {
                    const typeText = type.charAt(0).toUpperCase() + type.slice(1)
                    currentPage.drawText(`• Tipo: ${typeText}`, {
                        x: margin + 5,
                        y: yPosition,
                        size: 8,
                        font: font,
                        color: rgb(0, 0, 0)
                    })
                    yPosition -= smallLineHeight
                }

                if (company !== 'all') {
                    currentPage.drawText(`• Empresa: ${company}`, {
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

            // Encabezados de tabla simplificados
            const headersPdf = ['Nombre', 'Empresa', 'Correo', 'Teléfono']
            const columnWidths = [100, 120, 180, 100] // Ajuste de anchos
            let xPosition = margin

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
                const nameDisplay = name.length > 30 ? name.substring(0, 30) + '...' : name
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
                const companyDisplay = companyName.length > 30 ? companyName.substring(0, 30) + '...' : companyName
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
                const emailDisplay = email.length > 50 ? email.substring(0, 50) + '...' : email
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
                phoneDisplay = phoneDisplay.length > 40 ? phoneDisplay.substring(0, 40) + '...' : phoneDisplay
                currentPage.drawText(phoneDisplay, {
                    x: xPosition,
                    y: yPosition,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                xPosition += columnWidths[3]

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
                    'Content-Disposition': `attachment; filename="${fileName}"`,
                    'Content-Length': pdfBuffer.length.toString()
                })
            })
        }

    } catch (error) {
        console.error('Error exporting leads:', error)
        return NextResponse.json(
            { message: 'Error exporting leads' },
            { status: 500 }
        )
    }
}