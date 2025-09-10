import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || 'all'
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const format = searchParams.get('format') || 'excel'

        // Construir condiciones de filtrado (igual que en la ruta principal)
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

        // Obtener todos los clientes (sin paginación)
        const clients = await prisma.client.findMany({
            where,
            include: {
                contacts: {
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

        // Formatear datos para exportación
        const exportData = clients.map(client => ({
            'Empresa': client.company_name,
            'ID Legal': client.legal_id || '',
            'Ubicación': client.geographic_location || '',
            'Teléfono': client.phone || '',
            'Email': client.email || '',
            'Website': client.website || '',
            'Empleados': client.employees || '',
            'Puntuación (%)': client.percentage,
            'Puntos': client.total_score,
            'Estado': client.evaluation_status === 'SUITABLE' ? 'Apto' :
                client.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto',
            'Contacto': client.contacts[0]?.name || '',
            'Email Contacto': client.contacts[0]?.email || '',
            'Fecha Creación': new Date(client.created_at).toLocaleDateString()
        }))

        if (format === 'excel') {
            // Implementar lógica para generar Excel (usando una librería como xlsx)
            // Esta es una implementación simplificada
            const headers = Object.keys(exportData[0] || {}).join(',') + '\n'
            const csvContent = exportData.reduce((acc, row) => {
                const values = Object.values(row).map(value => `"${value}"`).join(',')
                return acc + values + '\n'
            }, headers)

            return new NextResponse(csvContent, {
                status: 200,
                headers: new Headers({
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename=clientes.csv'
                })
            })
        } else {
            // Implementar lógica para generar PDF (usando una librería como pdfkit)
            // Esta es una implementación simplificada que devuelve JSON como placeholder
            return NextResponse.json(
                { message: 'PDF export not implemented yet', data: exportData },
                { status: 200 }
            )
        }

    } catch (error) {
        console.error('Error exporting clients:', error)
        return NextResponse.json(
            { message: 'Error exporting clients' },
            { status: 500 }
        )
    }
}