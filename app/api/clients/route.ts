import { NextRequest, NextResponse } from 'next/server'
import { ContactType, EvaluationStatus, prisma } from '@/lib/prisma'


interface ClientPayload {
    company_name: string
    legal_id?: string | null
    employees?: number | null
    geographic_location?: string | null
    website?: string | null
    phone?: string | null
    email?: string | null
    mission?: string | null
    vision?: string | null
    organizational_values?: string | null
    niche?: string | null
    services?: string | null
    opportunities?: string | null
    budget?: string | null
    authority?: string | null
    buyer?: string | null
    needs?: string | null
    timeline?: string | null
    metrics?: string | null
    decision_criteria?: string | null
    decision_process?: string | null
    pain_points?: string | null
    champion?: string | null
    objectives?: string | null
    consequences?: string | null
    has_website: boolean
    has_phone: boolean
    has_email: boolean
    has_more_than_50_employees: boolean
    has_established_brand: boolean
    has_digital_presence: boolean
    has_growth_potential: boolean
    has_decision_maker_access: boolean
    has_budget_authority: boolean
    has_clear_pain_points: boolean
    has_defined_needs: boolean
    has_timeline_urgency: boolean
    has_previous_tech_investments: boolean
    has_internal_champion: boolean
    total_score: number
    percentage: number
    evaluation_status: EvaluationStatus
    contacts: {
        contact_type: ContactType
        position?: string | null
        name?: string | null
        phone?: string | null
        extension?: string | null
        email?: string | null
    }[]
    notes?: string | null // Optional notes for the evaluation
    evaluated_by?: string | null // Optional user ID who performed the evaluation
}

export async function POST(request: NextRequest) {
    try {
        const data: ClientPayload = await request.json()

        if (!data.company_name) {
            return NextResponse.json(
                { message: 'Company name is required' },
                { status: 400 }
            )
        }

        const client = await prisma.client.create({
            data: {
                company_name: data.company_name,
                legal_id: data.legal_id,
                employees: data.employees,
                geographic_location: data.geographic_location,
                website: data.website,
                phone: data.phone,
                email: data.email,
                mission: data.mission,
                vision: data.vision,
                organizational_values: data.organizational_values,
                niche: data.niche,
                services: data.services,
                opportunities: data.opportunities,
                budget: data.budget,
                authority: data.authority,
                buyer: data.buyer,
                needs: data.needs,
                timeline: data.timeline,
                metrics: data.metrics,
                decision_criteria: data.decision_criteria,
                decision_process: data.decision_process,
                pain_points: data.pain_points,
                champion: data.champion,
                objectives: data.objectives,
                consequences: data.consequences,
                has_website: data.has_website,
                has_phone: data.has_phone,
                has_email: data.has_email,
                has_more_than_50_employees: data.has_more_than_50_employees,
                has_established_brand: data.has_established_brand,
                has_digital_presence: data.has_digital_presence,
                has_growth_potential: data.has_growth_potential,
                has_decision_maker_access: data.has_decision_maker_access,
                has_budget_authority: data.has_budget_authority,
                has_clear_pain_points: data.has_clear_pain_points,
                has_defined_needs: data.has_defined_needs,
                has_timeline_urgency: data.has_timeline_urgency,
                has_previous_tech_investments: data.has_previous_tech_investments,
                has_internal_champion: data.has_internal_champion,
                total_score: data.total_score,
                percentage: data.percentage,
                evaluation_status: data.evaluation_status,
                contacts: {
                    create: data.contacts.map(contact => ({
                        contact_type: contact.contact_type,
                        position: contact.position,
                        name: contact.name,
                        phone: contact.phone,
                        extension: contact.extension,
                        email: contact.email,
                    })),
                },
                evaluations: {
                    create: {
                        score: data.total_score,
                        percentage: data.percentage,
                        status: data.evaluation_status,
                        notes: data.notes || null,
                        evaluated_by: data.evaluated_by || null,
                    },
                },
            },
            include: {
                contacts: true,
                evaluations: true,
            },
        })

        return NextResponse.json(
            { message: 'Client and evaluation created successfully', client },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating client and evaluation:', error)
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '5')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construir condiciones de filtrado
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

    // Obtener clientes
    const clients = await prisma.client.findMany({
      where,
      include: {
        contacts: {
          take: 1,
          orderBy: {
            created_at: 'desc'
          }
        },
        evaluations: {
          take: 1,
          orderBy: {
            created_at: 'desc'
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
    const totalCount = await prisma.client.count({ where })

    return NextResponse.json({
      clients,
      totalCount,
      page,
      pageSize
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { message: 'Error fetching clients' },
      { status: 500 }
    )
  }
}