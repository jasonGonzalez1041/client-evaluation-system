// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tipos para MiniCRM
interface CompanyWithLeads {
    id: string
    company_name: string
    legal_id: string | null
    geographic_location: string | null
    phone: string | null
    email: string | null
    website: string | null
    employees: number | null
    percentage: number
    total_score: number
    evaluation_status: string
    notes: string | null
    evaluated_by: string | null
    evaluated_at: Date | null
    created_at: Date
    updated_at: Date
    leads: Array<{
        id: string
        lead_type: string
        position: string | null
        name: string | null
        phone: string | null
        extension: string | null
        email: string | null
    }>
}

interface MonthlyCompany {
    created_at: Date
    evaluation_status: string
    total_score: number
}

export async function GET() {
    try {
        // Obtener estadísticas generales de empresas
        const totalCompanies = await prisma.company.count()

        const companiesByStatus = await prisma.company.groupBy({
            by: ['evaluation_status'],
            _count: {
                id: true
            }
        })

        // Obtener empresas recientes con sus leads
        const recentCompanies = await prisma.company.findMany({
            take: 5,
            orderBy: {
                created_at: 'desc'
            },
            include: {
                leads: {
                    select: {
                        id: true,
                        lead_type: true,
                        position: true,
                        name: true,
                        phone: true,
                        extension: true,
                        email: true
                    }
                }
            }
        }) as CompanyWithLeads[]

        // Estadísticas por mes (últimos 6 meses)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        sixMonthsAgo.setDate(1) // Primer día del mes
        sixMonthsAgo.setHours(0, 0, 0, 0)

        const companiesPerMonth = await prisma.company.findMany({
            where: {
                created_at: {
                    gte: sixMonthsAgo
                }
            },
            select: {
                created_at: true,
                evaluation_status: true,
                total_score: true
            }
        })

        // Procesar datos para gráficos
        const monthlyData = processMonthlyData(companiesPerMonth)

        // Estadísticas de scores
        const scoreStats = await prisma.company.aggregate({
            _avg: {
                percentage: true,
                total_score: true
            },
            _max: {
                percentage: true,
                total_score: true
            },
            _min: {
                percentage: true,
                total_score: true
            }
        })

        // Top empresas por puntuación
        const topCompanies = await prisma.company.findMany({
            take: 5,
            orderBy: {
                percentage: 'desc'
            },
            select: {
                id: true,
                company_name: true,
                percentage: true,
                total_score: true,
                evaluation_status: true,
                created_at: true
            }
        })

        // Distribución por ubicación geográfica
        const locationStats = await prisma.company.groupBy({
            by: ['geographic_location'],
            _count: {
                id: true
            },
            where: {
                geographic_location: {
                    not: null
                }
            }
        })

        // Calcular conteos por estado
        const suitableCount = companiesByStatus.find(s => s.evaluation_status === 'SUITABLE')?._count.id || 0
        const potentialCount = companiesByStatus.find(s => s.evaluation_status === 'POTENTIAL')?._count.id || 0
        const notSuitableCount = companiesByStatus.find(s => s.evaluation_status === 'NOT_SUITABLE')?._count.id || 0

        // Preparar respuesta del dashboard
        const dashboardData = {
            stats: {
                totalCompanies,
                suitableCompanies: suitableCount,
                potentialCompanies: potentialCount,
                notSuitableCompanies: notSuitableCount,
                averageScore: Math.round(scoreStats._avg.percentage || 0),
                averagePoints: Math.round(scoreStats._avg.total_score || 0)
            },
            charts: {
                monthlyCompanies: monthlyData,
                statusDistribution: companiesByStatus.map(item => ({
                    status: item.evaluation_status,
                    count: item._count.id,
                    label: getStatusLabel(item.evaluation_status)
                })),
                locationDistribution: locationStats.map(item => ({
                    location: item.geographic_location,
                    count: item._count.id
                }))
            },
            recentCompanies: recentCompanies.map(company => ({
                id: company.id,
                company_name: company.company_name,
                legal_id: company.legal_id,
                geographic_location: company.geographic_location,
                phone: company.phone,
                email: company.email,
                website: company.website,
                employees: company.employees,
                percentage: company.percentage,
                total_score: company.total_score,
                evaluation_status: company.evaluation_status,
                notes: company.notes,
                evaluated_by: company.evaluated_by,
                evaluated_at: company.evaluated_at,
                created_at: company.created_at,
                updated_at: company.updated_at,
                primaryLead: company.leads?.find(l => l.lead_type === 'direcciones') || company.leads?.[0] || null
            })),
            topCompanies
        }

        return NextResponse.json(dashboardData, { status: 200 })

    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return NextResponse.json(
            { message: 'Error fetching dashboard data' },
            { status: 500 }
        )
    }
}

function processMonthlyData(companies: MonthlyCompany[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyStats: { [key: string]: { qualified: number, warm: number, cold: number, total: number } } = {}

    // Inicializar los últimos 6 meses
    const currentDate = new Date()
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate)
        date.setMonth(date.getMonth() - i)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
        monthlyStats[monthKey] = { qualified: 0, warm: 0, cold: 0, total: 0 }
    }

    // Contar empresas por mes y estado
    companies.forEach(company => {
        const date = new Date(company.created_at)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`

        if (monthlyStats[monthKey]) {
            monthlyStats[monthKey].total++

            switch (company.evaluation_status) {
                case 'SUITABLE':
                    monthlyStats[monthKey].qualified++
                    break
                case 'POTENTIAL':
                    monthlyStats[monthKey].warm++
                    break
                case 'NOT_SUITABLE':
                    monthlyStats[monthKey].cold++
                    break
            }
        }
    })

    // Convertir a array y ordenar por fecha
    const result = Object.entries(monthlyStats)
        .map(([month, stats]) => ({
            month,
            qualified: stats.qualified,
            warm: stats.warm,
            cold: stats.cold,
            total: stats.total
        }))
        .sort((a, b) => {
            // Ordenar por fecha (mes y año)
            const [aMonth, aYear] = a.month.split(' ')
            const [bMonth, bYear] = b.month.split(' ')

            const aIndex = months.indexOf(aMonth) + (parseInt(aYear) * 12)
            const bIndex = months.indexOf(bMonth) + (parseInt(bYear) * 12)

            return aIndex - bIndex
        })

    return result
}

// Función auxiliar para obtener etiquetas de estado (terminología CRM)
function getStatusLabel(status: string) {
    switch (status) {
        case 'SUITABLE':
            return 'Lead Calificado'
        case 'POTENTIAL':
            return 'Lead Tibio'
        case 'NOT_SUITABLE':
            return 'Lead Descartado'
        default:
            return status
    }
}