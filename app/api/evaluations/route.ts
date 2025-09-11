/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/evaluations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

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

    // Obtener evaluaciones
    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            company_name: true,
            legal_id: true,
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
    const totalCount = await prisma.evaluation.count({ where })

    return NextResponse.json({
      evaluations,
      totalCount,
      page,
      pageSize
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json(
      { message: 'Error fetching evaluations' },
      { status: 500 }
    )
  }
}