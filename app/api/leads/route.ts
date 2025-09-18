/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '10')
        const search = searchParams.get('search') || ''
        const type = searchParams.get('type') || 'all'
        const company = searchParams.get('company') || 'all'
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

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

        // Obtener leads
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
            },
            skip: (page - 1) * pageSize,
            take: pageSize
        })

        // Obtener conteo total
        const totalCount = await prisma.lead.count({ where })

        return NextResponse.json({
            leads,
            totalCount,
            page,
            pageSize
        }, { status: 200 })

    } catch (error) {
        console.error('Error fetching leads:', error)
        return NextResponse.json(
            { message: 'Error fetching leads' },
            { status: 500 }
        )
    }
}