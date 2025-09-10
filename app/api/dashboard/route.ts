import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Obtener estadísticas generales
        const totalClients = await prisma.client.count()

        const clientsByStatus = await prisma.client.groupBy({
            by: ['evaluation_status'],
            _count: {
                id: true
            }
        })

        // Obtener clientes recientes con sus contactos
        const recentClients = await prisma.client.findMany({
            take: 10,
            orderBy: {
                created_at: 'desc'
            },
            include: {
                contacts: true,
                evaluations: {
                    take: 1,
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        })

        // Estadísticas por mes (últimos 6 meses)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const clientsPerMonth = await prisma.client.findMany({
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
        const monthlyData = processMonthlyData(clientsPerMonth)

        // Estadísticas de scores
        const scoreStats = await prisma.client.aggregate({
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

        // Top clientes por puntuación
        const topClients = await prisma.client.findMany({
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
        const locationStats = await prisma.client.groupBy({
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

        // Preparar respuesta del dashboard
        const dashboardData = {
            stats: {
                totalClients,
                suitableClients: clientsByStatus.find(s => s.evaluation_status === 'SUITABLE')?._count.id || 0,
                potentialClients: clientsByStatus.find(s => s.evaluation_status === 'POTENTIAL')?._count.id || 0,
                notSuitableClients: clientsByStatus.find(s => s.evaluation_status === 'NOT_SUITABLE')?._count.id || 0,
                averageScore: Math.round(scoreStats._avg.percentage || 0),
                averagePoints: Math.round(scoreStats._avg.total_score || 0)
            },
            charts: {
                monthlyClients: monthlyData,
                statusDistribution: clientsByStatus.map(item => ({
                    status: item.evaluation_status,
                    count: item._count.id,
                    label: getStatusLabel(item.evaluation_status)
                })),
                locationDistribution: locationStats.map(item => ({
                    location: item.geographic_location,
                    count: item._count.id
                }))
            },
            recentClients: recentClients.map(client => ({
                id: client.id,
                company_name: client.company_name,
                legal_id: client.legal_id,
                geographic_location: client.geographic_location,
                phone: client.phone,
                email: client.email,
                website: client.website,
                employees: client.employees,
                percentage: client.percentage,
                total_score: client.total_score,
                evaluation_status: client.evaluation_status,
                created_at: client.created_at,
                updated_at: client.updated_at,
                primaryContact: client.contacts.find(c => c.contact_type === 'direcciones') || client.contacts[0] || null,
                lastEvaluation: client.evaluations[0] || null
            })),
            topClients
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

// Función auxiliar para procesar datos mensuales
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processMonthlyData(clients: any[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyStats: { [key: string]: { suitable: number, potential: number, not_suitable: number, total: number } } = {}

    // Inicializar los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
        monthlyStats[monthKey] = { suitable: 0, potential: 0, not_suitable: 0, total: 0 }
    }

    // Contar clientes por mes y estado
    clients.forEach(client => {
        const date = new Date(client.created_at)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`

        if (monthlyStats[monthKey]) {
            monthlyStats[monthKey].total++

            switch (client.evaluation_status) {
                case 'SUITABLE':
                    monthlyStats[monthKey].suitable++
                    break
                case 'POTENTIAL':
                    monthlyStats[monthKey].potential++
                    break
                case 'NOT_SUITABLE':
                    monthlyStats[monthKey].not_suitable++
                    break
            }
        }
    })

    // Convertir a array y ordenar por fecha
    const result = Object.entries(monthlyStats)
        .map(([month, stats]) => ({
            month,
            suitable: stats.suitable,
            potential: stats.potential,
            not_suitable: stats.not_suitable,
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

// Función auxiliar para obtener etiquetas de estado
function getStatusLabel(status: string) {
    switch (status) {
        case 'SUITABLE':
            return 'Apto'
        case 'POTENTIAL':
            return 'Potencial'
        case 'NOT_SUITABLE':
            return 'No Apto'
        default:
            return status
    }
}