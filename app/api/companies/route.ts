import { NextRequest, NextResponse } from 'next/server'
import { LeadType, EvaluationStatus, prisma } from '@/lib/prisma'

interface CompanyPayload {
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
    has_critical_mission: boolean
    has_urgency: boolean
    is_manufacturer: boolean
    has_distribution: boolean
    has_warehouse: boolean
    has_transportation: boolean
    has_more_than_15_employees: boolean
    has_fleet: boolean
    has_website_check: boolean
    has_phone_system: boolean
    is_private_company: boolean
    is_regional: boolean
    is_legal_entity: boolean
    has_tech_budget: boolean
    buys_technology: boolean
    has_identified_problems: boolean
    has_competitive_interest: boolean
    uses_social_media: boolean
    has_economic_stability: boolean
    is_expanding: boolean
    wants_cost_reduction: boolean
    has_geographic_location_acc: boolean
    has_purchase_process: boolean
    total_score: number
    percentage: number
    evaluation_status: EvaluationStatus
    leads: {
        lead_type: LeadType
        position?: string | null
        name?: string | null
        phone?: string | null
        extension?: string | null
        email?: string | null
    }[]
    notes?: string | null
    evaluated_by?: string | null
}

export async function POST(request: NextRequest) {
    try {
        const data: CompanyPayload = await request.json()

        if (!data.company_name) {
            return NextResponse.json(
                { message: 'Company name is required' },
                { status: 400 }
            )
        }

        const company = await prisma.company.create({
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
                has_critical_mission: data.has_critical_mission,
                has_urgency: data.has_urgency,
                is_manufacturer: data.is_manufacturer,
                has_distribution: data.has_distribution,
                has_warehouse: data.has_warehouse,
                has_transportation: data.has_transportation,
                has_more_than_15_employees: data.has_more_than_15_employees,
                has_fleet: data.has_fleet,
                has_website_check: data.has_website_check,
                has_phone_system: data.has_phone_system,
                is_private_company: data.is_private_company,
                is_regional: data.is_regional,
                is_legal_entity: data.is_legal_entity,
                has_tech_budget: data.has_tech_budget,
                buys_technology: data.buys_technology,
                has_identified_problems: data.has_identified_problems,
                has_competitive_interest: data.has_competitive_interest,
                uses_social_media: data.uses_social_media,
                has_economic_stability: data.has_economic_stability,
                is_expanding: data.is_expanding,
                wants_cost_reduction: data.wants_cost_reduction,
                has_geographic_location_acc: data.has_geographic_location_acc,
                has_purchase_process: data.has_purchase_process,
                total_score: data.total_score,
                percentage: data.percentage,
                evaluation_status: data.evaluation_status,
                notes: data.notes,
                evaluated_by: data.evaluated_by,
                evaluated_at: data.evaluated_by ? new Date() : null,
                leads: {
                    create: data.leads.map(lead => ({
                        lead_type: lead.lead_type,
                        position: lead.position,
                        name: lead.name,
                        phone: lead.phone,
                        extension: lead.extension,
                        email: lead.email,
                    })),
                },
            },
            include: {
                leads: true,
            },
        })

        return NextResponse.json(
            { message: 'Company created successfully', company },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating company:', error)
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

        // Obtener companies
        const companies = await prisma.company.findMany({
            where,
            include: {
                leads: {
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
        const totalCount = await prisma.company.count({ where })

        return NextResponse.json({
            companies,
            totalCount,
            page,
            pageSize
        }, { status: 200 })

    } catch (error) {
        console.error('Error fetching companies:', error)
        return NextResponse.json(
            { message: 'Error fetching companies' },
            { status: 500 }
        )
    }
}