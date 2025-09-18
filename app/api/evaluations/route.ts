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
    const sortBy = searchParams.get('sortBy') || 'evaluated_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construir condiciones de filtrado - solo empresas evaluadas
    const where: any = {}

    if (search) {
      where.OR = [
        { company_name: { contains: search, mode: 'insensitive' } },
        { legal_id: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.evaluation_status = status
    }

    // Obtener empresas evaluadas (que funcionan como evaluaciones)
    const companies = await prisma.company.findMany({
      where,
      select: {
        id: true,
        company_name: true,
        legal_id: true,
        total_score: true,
        percentage: true,
        evaluation_status: true,
        notes: true,
        evaluated_by: true,
        evaluated_at: true,
        created_at: true
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    // Obtener conteo total
    const totalCount = await prisma.company.count({ where })

    return NextResponse.json({
      evaluations: companies, // Ahora las evaluaciones son las empresas evaluadas
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