/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface LeadType {
    direcciones: "direcciones";
    consejo: "consejo";
    comite: "comite";
    otros: "otros";
}
enum EvaluationStatus {
    SUITABLE,
    POTENTIAL,
    NOT_SUITABLE
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '10')
        const dateFrom = searchParams.get('dateFrom') || ''
        const dateTo = searchParams.get('dateTo') || ''
        const companyStatus = searchParams.get('companyStatus') || 'all'
        const leadType = searchParams.get('leadType') || 'all'
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

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

        // Filtro por estado de empresa - convertir string a enum si es necesario
        if (companyStatus !== 'all') {
            // Verificar que el valor es un EvaluationStatus válido
            if (Object.values(EvaluationStatus).includes(companyStatus)) {
                where.company = {
                    evaluation_status: companyStatus
                }
            }
        }

        // Filtro por tipo de lead - convertir string a enum si es necesario
        if (leadType !== 'all') {
            where.lead_type = leadType
        }

        // Obtener datos para el reporte
        const [leads, companies, totalCount, leadTypeStats, evaluationStats] = await Promise.all([
            // Leads con paginación
            prisma.lead.findMany({
                where,
                include: {
                    company: {
                        select: {
                            company_name: true,
                            evaluation_status: true,
                            total_score: true
                        }
                    }
                },
                orderBy: {
                    [sortBy]: sortOrder
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),

            // Todas las compañías para estadísticas
            prisma.company.findMany({
                where: {
                    created_at: dateFrom || dateTo ? {
                        ...(dateFrom && { gte: new Date(dateFrom) }),
                        ...(dateTo && { lte: new Date(dateTo) })
                    } : undefined,
                },
                select: {
                    id: true,
                    company_name: true,
                    evaluation_status: true,
                    created_at: true,
                    total_score: true,
                    leads: {
                        select: {
                            lead_type: true
                        }
                    }
                }
            }),

            // Conteo total
            prisma.lead.count({ where }),

            // Estadísticas por tipo de lead
            prisma.lead.groupBy({
                by: ['lead_type'],
                where,
                _count: {
                    id: true
                }
            }),

            // Estadísticas por estado de evaluación
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

        // Calcular puntuación promedio manualmente ya que _avg no funciona con relaciones
        const totalScore = companies.reduce((sum, company) => sum + (company.total_score || 0), 0)
        const avgScore = companies.length > 0 ? Math.round(totalScore / companies.length) : 0

        return NextResponse.json({
            leads,
            companies,
            stats: {
                totalLeads: totalCount,
                avgScore,
                leadTypeStats,
                evaluationStats
            },
            totalCount,
            page,
            pageSize
        }, { status: 200 })

    } catch (error) {
        console.error('Error fetching reports:', error)
        return NextResponse.json(
            { message: 'Error fetching reports' },
            { status: 500 }
        )
    }
}