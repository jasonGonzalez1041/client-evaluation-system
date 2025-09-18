/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const timeframe = searchParams.get('timeframe') || '30d'

        // Calcular fechas según el timeframe
        const now = new Date()
        let startDate = new Date()

        switch (timeframe) {
            case '7d':
                startDate.setDate(now.getDate() - 7)
                break
            case '30d':
                startDate.setDate(now.getDate() - 30)
                break
            case '90d':
                startDate.setDate(now.getDate() - 90)
                break
            case 'ytd':
                startDate = new Date(now.getFullYear(), 0, 1)
                break
            case 'all':
                startDate = new Date(0)
                break
            default:
                startDate.setDate(now.getDate() - 30)
        }

        // Obtener datos para analytics
        const where: any = {
            created_at: {
                gte: startDate
            }
        }

        const [
            totalLeads,
            leadsByType,
            evaluationStats,
            leadsOverTime,
            topCompanies
        ] = await Promise.all([
            prisma.lead.count({ where }),

            prisma.lead.groupBy({
                by: ['lead_type'],
                where,
                _count: {
                    id: true
                }
            }),

            prisma.company.groupBy({
                by: ['evaluation_status'],
                _count: {
                    id: true
                }
            }),

            prisma.lead.groupBy({
                by: ['created_at'],
                where: {
                    created_at: {
                        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                _count: {
                    id: true
                },
                orderBy: {
                    created_at: 'asc'
                }
            }),

            prisma.company.findMany({
                where: {
                    total_score: {
                        gt: 0
                    }
                },
                orderBy: {
                    total_score: 'desc'
                },
                take: 5,
                select: {
                    id: true,
                    company_name: true,
                    total_score: true,
                    evaluation_status: true
                }
            })
        ])

        // Formatear datos para el PDF
        const formattedLeadsOverTime = leadsOverTime.map(item => ({
            date: item.created_at.toISOString().split('T')[0],
            count: item._count.id
        }))

        // Obtener la fecha actual para el nombre del archivo
        const day = String(now.getDate()).padStart(2, '0')
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const year = now.getFullYear()
        const dateStr = `${day}_${month}_${year}`
        const fileName = `analytics_report_${dateStr}.pdf`

        // Crear PDF
        const pdfDoc = await PDFDocument.create()
        let currentPage = pdfDoc.addPage([595.28, 841.89]) // A4 size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

        const { width, height } = currentPage.getSize()
        const margin = 50
        let yPosition = height - margin
        const lineHeight = 14
        const sectionSpacing = 20

        // Título
        currentPage.drawText('Reporte de Analytics - Sistema de Leads', {
            x: margin,
            y: yPosition,
            size: 16,
            font: titleFont,
            color: rgb(0, 0, 0)
        })

        yPosition -= 30

        // Información del reporte
        const timeframeLabels: Record<string, string> = {
            '7d': 'Últimos 7 días',
            '30d': 'Últimos 30 días',
            '90d': 'Últimos 90 días',
            'ytd': 'Este año',
            'all': 'Todo el tiempo'
        }

        currentPage.drawText(`Período: ${timeframeLabels[timeframe] || 'Últimos 30 días'}`, {
            x: margin,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: rgb(0, 0, 0)
        })

        currentPage.drawText(`Fecha de generación: ${new Date().toLocaleDateString()}`, {
            x: margin,
            y: yPosition - 15,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
        })

        yPosition -= 40

        // Métricas principales
        currentPage.drawText('Métricas Principales', {
            x: margin,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0)
        })

        yPosition -= lineHeight

        currentPage.drawText(`Total de Leads: ${totalLeads}`, {
            x: margin,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0)
        })

        yPosition -= lineHeight

        // CORRECCIÓN: Asegurarse de acceder a _count.id
        const suitableCompanies = evaluationStats.find(s => s.evaluation_status === 'SUITABLE')?._count.id || 0
        const potentialCompanies = evaluationStats.find(s => s.evaluation_status === 'POTENTIAL')?._count.id || 0
        const totalCompanies = evaluationStats.reduce((acc, curr) => acc + curr._count.id, 0)

        currentPage.drawText(`Empresas Aptas: ${suitableCompanies}`, {
            x: margin,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0)
        })

        yPosition -= lineHeight

        currentPage.drawText(`Empresas Potenciales: ${potentialCompanies}`, {
            x: margin,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0)
        })

        yPosition -= lineHeight

        const lastDayLeads = formattedLeadsOverTime.length > 0
            ? formattedLeadsOverTime[formattedLeadsOverTime.length - 1].count
            : 0

        currentPage.drawText(`Leads último día: ${lastDayLeads}`, {
            x: margin,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0)
        })

        yPosition -= sectionSpacing

        // Distribución por tipo de lead
        if (leadsByType.length > 0) {
            currentPage.drawText('Distribución por Tipo de Lead', {
                x: margin,
                y: yPosition,
                size: 14,
                font: boldFont,
                color: rgb(0, 0, 0)
            })

            yPosition -= lineHeight

            leadsByType.forEach((item) => {
                // CORRECCIÓN: Usar item._count.id en lugar de item._count
                const percentage = totalLeads > 0 ? (item._count.id / totalLeads * 100).toFixed(1) : '0'
                const leadType = item.lead_type || 'Sin tipo'

                currentPage.drawText(`${leadType}: ${item._count.id} (${percentage}%)`, {
                    x: margin,
                    y: yPosition,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                yPosition -= lineHeight
            })

            yPosition -= sectionSpacing / 2
        }

        // Estado de evaluación
        if (evaluationStats.length > 0) {
            // Verificar si necesitamos nueva página
            if (yPosition < margin + 100) {
                currentPage = pdfDoc.addPage([595.28, 841.89])
                yPosition = height - margin
            }

            currentPage.drawText('Estado de Evaluación de Empresas', {
                x: margin,
                y: yPosition,
                size: 14,
                font: boldFont,
                color: rgb(0, 0, 0)
            })

            yPosition -= lineHeight

            evaluationStats.forEach((item) => {
                const percentage = totalCompanies > 0 ? (item._count.id / totalCompanies * 100).toFixed(1) : '0'
                const statusText = item.evaluation_status === 'SUITABLE' ? 'Aptas' :
                    item.evaluation_status === 'POTENTIAL' ? 'Potenciales' : 'No Aptas'

                // CORRECCIÓN: Usar item._count.id en lugar de item._count
                currentPage.drawText(`${statusText}: ${item._count.id} (${percentage}%)`, {
                    x: margin,
                    y: yPosition,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                yPosition -= lineHeight
            })

            yPosition -= sectionSpacing / 2
        }

        // Top empresas por puntuación
        if (topCompanies.length > 0) {
            // Verificar si necesitamos nueva página
            if (yPosition < margin + 150) {
                currentPage = pdfDoc.addPage([595.28, 841.89])
                yPosition = height - margin
            }

            currentPage.drawText('Top Empresas por Puntuación', {
                x: margin,
                y: yPosition,
                size: 14,
                font: boldFont,
                color: rgb(0, 0, 0)
            })

            yPosition -= lineHeight

            topCompanies.forEach((company, index) => {
                const statusText = company.evaluation_status === 'SUITABLE' ? 'Apta' :
                    company.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apta'

                // Truncar nombre de empresa si es muy largo
                const companyName = company.company_name.length > 30
                    ? company.company_name.substring(0, 27) + '...'
                    : company.company_name

                currentPage.drawText(`${index + 1}. ${companyName} - Puntuación: ${company.total_score} (${statusText})`, {
                    x: margin,
                    y: yPosition,
                    size: 10,
                    font: font,
                    color: rgb(0, 0, 0)
                })
                yPosition -= lineHeight
            })
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

    } catch (error) {
        console.error('Error exporting analytics:', error)
        return NextResponse.json(
            { message: 'Error exporting analytics' },
            { status: 500 }
        )
    }
}