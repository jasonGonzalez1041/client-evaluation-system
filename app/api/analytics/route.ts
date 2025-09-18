/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const timeframe = searchParams.get('timeframe') || '30d' // 7d, 30d, 90d, ytd, all
        const companyId = searchParams.get('companyId') || 'all'

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
                startDate = new Date(0) // Fecha muy antigua
                break
            default:
                startDate.setDate(now.getDate() - 30)
        }

        // Construir condiciones de filtrado
        const where: any = {
            created_at: {
                gte: startDate
            }
        }

        if (companyId !== 'all') {
            where.company_id = companyId
        }

        // Obtener datos para analytics
        const [
            totalLeads,
            leadsByType,
            leadsByCompany,
            leadsOverTime,
            evaluationStats,
            topCompanies,
            recentLeads
        ] = await Promise.all([
            // Total de leads
            prisma.lead.count({ where }),

            // Leads por tipo
            prisma.lead.groupBy({
                by: ['lead_type'],
                where,
                _count: {
                    id: true
                }
            }),

            // Leads por empresa (top 10)
            prisma.lead.groupBy({
                by: ['company_id'],
                where,
                _count: {
                    id: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                },
                take: 10
            }),

            // Leads a lo largo del tiempo (últimos 30 días)
            (async () => {
                const dailyLeads = await prisma.lead.groupBy({
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
                })

                // Formatear para gráfico
                return dailyLeads.map(item => ({
                    date: item.created_at.toISOString().split('T')[0],
                    count: item._count.id
                }))
            })(),

            // Estadísticas de evaluación
            prisma.company.groupBy({
                by: ['evaluation_status'],
                _count: {
                    id: true
                }
            }),

            // Top empresas por puntuación
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
            }),

            // Leads recientes
            prisma.lead.findMany({
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
                    created_at: 'desc'
                },
                take: 5
            })
        ])

        // Enriquecer datos de leads por empresa con nombres
        const leadsByCompanyWithNames = await Promise.all(
            leadsByCompany.map(async (item) => {
                const company = await prisma.company.findUnique({
                    where: { id: item.company_id },
                    select: { company_name: true }
                })
                return {
                    company_id: item.company_id,
                    company_name: company?.company_name || 'Unknown',
                    count: item._count.id
                }
            })
        )

        return NextResponse.json({
            summary: {
                totalLeads,
                timeframe
            },
            leadsByType: leadsByType.map(item => ({
                type: item.lead_type,
                count: item._count.id
            })),
            leadsByCompany: leadsByCompanyWithNames,
            leadsOverTime,
            evaluationStats: evaluationStats.map(item => ({
                status: item.evaluation_status,
                count: item._count.id
            })),
            topCompanies,
            recentLeads
        }, { status: 200 })

    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json(
            { message: 'Error fetching analytics' },
            { status: 500 }
        )
    }
}