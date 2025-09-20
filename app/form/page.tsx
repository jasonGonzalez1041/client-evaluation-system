/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import {
    Building,
    Users,
    Target,
    TrendingUp,
    CheckCircle,

} from "lucide-react"

import { useForm, useFieldArray } from 'react-hook-form'
import Image from 'next/image'

enum LeadType {
    direcciones = 'direcciones',
    consejo = 'consejo',
    comite = 'comite',
    otros = 'otros'
}

enum EvaluationStatus {
    SUITABLE = 'SUITABLE',
    POTENTIAL = 'POTENTIAL',
    NOT_SUITABLE = 'NOT_SUITABLE'
}

// Interfaces basadas en tu modelo de Prisma
interface Lead {
    lead_type: LeadType
    position?: string | null
    name?: string | null
    phone?: string | null
    extension?: string | null
    email?: string | null
}

interface ClientFormData {
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
    leads: Lead[]

    // Campos de negocio
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

    // Checklist items (todos son boolean con default false según tu schema)
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

    notes?: string | null
    evaluated_by?: string | null
}

// Checklist items con sus puntos
// Checklist items actualizados con todos los puntos especificados
const checklistItems = [
    { key: 'has_critical_mission' as keyof ClientFormData, label: 'Misión Crítica', points: 15 },
    { key: 'has_urgency' as keyof ClientFormData, label: 'Sentido de Urgencia', points: 10 },
    { key: 'is_manufacturer' as keyof ClientFormData, label: 'Es fabricante o manufacturero', points: 10 },
    { key: 'has_distribution' as keyof ClientFormData, label: 'Distribución', points: 10 },
    { key: 'has_warehouse' as keyof ClientFormData, label: 'Tiene Bodega o almacén', points: 10 },
    { key: 'has_transportation' as keyof ClientFormData, label: 'Transporte o distribución', points: 10 },
    { key: 'has_more_than_15_employees' as keyof ClientFormData, label: 'Cantidad de personas más de 15', points: 10 },
    { key: 'has_fleet' as keyof ClientFormData, label: 'Tiene Flotilla', points: 10 },
    { key: 'has_website' as keyof ClientFormData, label: 'Tiene Página WEB', points: 5 },
    { key: 'has_phone_system' as keyof ClientFormData, label: 'Central telefónica', points: 5 },
    { key: 'is_private_company' as keyof ClientFormData, label: 'Empresa Privada', points: 5 },
    { key: 'is_regional' as keyof ClientFormData, label: 'Regional (Es deseable)', points: 5 },
    { key: 'is_legal_entity' as keyof ClientFormData, label: 'Debe ser una empresa Jurídica', points: 10 },
    { key: 'has_tech_budget' as keyof ClientFormData, label: 'Empresa con presupuesto para tecnología', points: 15 },
    { key: 'buys_technology' as keyof ClientFormData, label: 'Compra tecnología', points: 10 },
    { key: 'has_identified_problems' as keyof ClientFormData, label: 'Problemas/necesidades identificados', points: 15 },
    { key: 'has_competitive_interest' as keyof ClientFormData, label: 'Tiene Interés competitivo', points: 10 },
    { key: 'uses_social_media' as keyof ClientFormData, label: 'Usan redes sociales', points: 5 },
    { key: 'has_economic_stability' as keyof ClientFormData, label: 'Buena posición económica', points: 10 },
    { key: 'is_expanding' as keyof ClientFormData, label: 'Está en expansión o crecimiento', points: 10 },
    { key: 'wants_cost_reduction' as keyof ClientFormData, label: 'Quieren reducir costos y mejorar eficiencia', points: 15 },
    { key: 'has_geographic_location' as keyof ClientFormData, label: 'Ubicación Geográfica (accesible)', points: 5 },
    { key: 'has_purchase_process' as keyof ClientFormData, label: 'Tiene procesos de compra establecidos', points: 10 },
]

// Componente del formulario
function ClientEvaluationForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [totalScore, setTotalScore] = useState(0)
    const [percentage, setPercentage] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<ClientFormData>({
        defaultValues: {
            company_name: '',
            legal_id: null,
            employees: null,
            geographic_location: null,
            website: null,
            phone: null,
            email: null,
            mission: null,
            vision: null,
            organizational_values: null,
            leads: [{
                lead_type: LeadType.direcciones,
                position: null,
                name: null,
                phone: null,
                extension: null,
                email: null
            }],
            niche: null,
            services: null,
            opportunities: null,
            budget: null,
            authority: null,
            buyer: null,
            needs: null,
            timeline: null,
            metrics: null,
            decision_criteria: null,
            decision_process: null,
            pain_points: null,
            champion: null,
            objectives: null,
            consequences: null,
            // Todos los checklist items empiezan en false según tu schema
            has_website: false,
            has_phone: false,
            has_email: false,
            has_more_than_50_employees: false,
            has_established_brand: false,
            has_digital_presence: false,
            has_growth_potential: false,
            has_decision_maker_access: false,
            has_budget_authority: false,
            has_clear_pain_points: false,
            has_defined_needs: false,
            has_timeline_urgency: false,
            has_previous_tech_investments: false,
            has_internal_champion: false,
            notes: null,
            evaluated_by: null,
        }
    })

    const { fields: leadFields, append: appendlead, remove: removelead } = useFieldArray({
        control,
        name: 'leads'
    })

    // Calcular puntuación en tiempo real
    useEffect(() => {
        const subscription = watch((value) => {
            let score = 0

            checklistItems.forEach(item => {
                if (value[item.key]) {
                    score += item.points
                }
            })

            setTotalScore(score)
            setPercentage(Math.round((score / 140) * 100))
        })

        return () => subscription.unsubscribe()
    }, [watch])

    // Función para determinar el status de evaluación
    const getEvaluationStatus = (percentage: number): EvaluationStatus => {
        if (percentage >= 80) return EvaluationStatus.SUITABLE
        if (percentage >= 60) return EvaluationStatus.POTENTIAL
        return EvaluationStatus.NOT_SUITABLE
    }

    const onSubmit = async (data: ClientFormData) => {
        const currentPercentage = percentage
        const evaluationStatus = getEvaluationStatus(currentPercentage)

        // Advertencia si está por debajo del mínimo
        if (currentPercentage < 80) {
            const confirmMessage = `La puntuación es de solo ${currentPercentage}%, que está por debajo del mínimo recomendado del 80%. El cliente será marcado como "${evaluationStatus === EvaluationStatus.POTENTIAL ? 'Potencial' : 'No Apto'
                }". ¿Está seguro de que desea continuar con el registro?`

            if (!confirm(confirmMessage)) {
                return
            }
        }

        setIsSubmitting(true)

        try {
            // Preparar los datos para enviar con tipos correctos de Prisma
            const payload = {
                ...data,
                total_score: totalScore,
                percentage: currentPercentage,
                evaluation_status: evaluationStatus,
                // Asegurar que employees sea number o null
                employees: data.employees ? Number(data.employees) : null,
                // Filtrar valores vacíos para campos opcionales
                legal_id: data.legal_id?.trim() || null,
                geographic_location: data.geographic_location?.trim() || null,
                website: data.website?.trim() || null,
                phone: data.phone?.trim() || null,
                email: data.email?.trim() || null,
                mission: data.mission?.trim() || null,
                vision: data.vision?.trim() || null,
                organizational_values: data.organizational_values?.trim() || null,
                niche: data.niche?.trim() || null,
                services: data.services?.trim() || null,
                opportunities: data.opportunities?.trim() || null,
                budget: data.budget?.trim() || null,
                authority: data.authority?.trim() || null,
                buyer: data.buyer?.trim() || null,
                needs: data.needs?.trim() || null,
                timeline: data.timeline?.trim() || null,
                metrics: data.metrics?.trim() || null,
                decision_criteria: data.decision_criteria?.trim() || null,
                decision_process: data.decision_process?.trim() || null,
                pain_points: data.pain_points?.trim() || null,
                champion: data.champion?.trim() || null,
                objectives: data.objectives?.trim() || null,
                consequences: data.consequences?.trim() || null,
                notes: data.notes?.trim() || null,
                evaluated_by: data.evaluated_by?.trim() || null,
                leads: data.leads.map(lead => ({
                    ...lead,
                    position: lead.position?.trim() || null,
                    name: lead.name?.trim() || null,
                    phone: lead.phone?.trim() || null,
                    extension: lead.extension?.trim() || null,
                    email: lead.email?.trim() || null,
                }))
            }

            // Llamar a la API
            const response = await fetch('/api/companies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Error al guardar el cliente')
            }

            const result = await response.json()
            console.log('Cliente creado:', result)

            alert('Evaluación guardada exitosamente!')

            // Opcional: Redirigir o resetear
            window.location.reload()

        } catch (error) {
            console.error('Error saving evaluation:', error)
            alert(`Error al guardar la evaluación: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getDiagnostic = (score: number): string => {
        if (score >= 80) return 'Cliente Apto - Excelente oportunidad'
        if (score >= 60) return 'Cliente Potencial - Requiere análisis adicional'
        return 'Cliente No Apto - No cumple criterios mínimos'
    }

    const getDiagnosticColor = (score: number): string => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Building className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Información General del Cliente</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Empresa *
                                </label>
                                <input
                                    {...register('company_name', { required: 'Este campo es requerido' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Nombre completo de la empresa"
                                />
                                {errors.company_name && <span className="text-red-500 text-sm">{errors.company_name.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cédula Jurídica
                                </label>
                                <input
                                    {...register('legal_id')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: 3-004-045260"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Empleados
                                </label>
                                <input
                                    type="number"
                                    {...register('employees', {
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Debe ser mayor a 0' }
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: 1000"
                                />
                                {errors.employees && <span className="text-red-500 text-sm">{errors.employees.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ubicación Geográfica
                                </label>
                                <input
                                    {...register('geographic_location')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Dirección completa"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sitio Web
                                </label>
                                <input
                                    type="url"
                                    {...register('website', {
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: 'Debe ser una URL válida (http:// o https://)'
                                        }
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="https://www.ejemplo.com"
                                />
                                {errors.website && <span className="text-red-500 text-sm">{errors.website.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    {...register('phone')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: 2546-2525"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    {...register('email', {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Debe ser un email válido'
                                        }
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="ejemplo@empresa.com"
                                />
                                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Misión
                            </label>
                            <textarea
                                {...register('mission')}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Misión de la empresa..."
                            />
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visión
                            </label>
                            <textarea
                                {...register('vision')}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Visión de la empresa..."
                            />
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valores Organizacionales
                            </label>
                            <textarea
                                {...register('organizational_values')}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Valores de la empresa separados por comas..."
                            />
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Evaluación - Checklist</h2>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-800">Puntuación Actual</h3>
                                    <p className="text-3xl font-bold text-blue-600">{totalScore} puntos ({percentage}%)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-blue-700">Mínimo requerido: 80%</p>
                                    <p className={`text-sm font-semibold ${getDiagnosticColor(percentage)}`}>
                                        {getDiagnostic(percentage)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {checklistItems.map((item) => (
                                <div key={item.key} className="flex items-center p-4 bg-white border border-gray-200 rounded-lg">
                                    <input
                                        type="checkbox"
                                        {...register(item.key)}
                                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label className="ml-3 text-sm font-medium text-gray-700 flex-1">
                                        {item.label}
                                    </label>
                                    <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                        {item.points} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Users className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-blue-800">
                                Agregue los leads clave de la empresa, incluyendo direcciones, jefaturas y comités.
                            </p>
                        </div>

                        {leadFields.map((field, index) => (
                            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de leado
                                        </label>
                                        <select
                                            {...register(`leads.${index}.lead_type` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        >
                                            <option value={LeadType.direcciones}>Direcciones/Jefaturas</option>
                                            <option value={LeadType.consejo}>Consejo de Administración</option>
                                            <option value={LeadType.comite}>Comité</option>
                                            <option value={LeadType.otros}>Otros</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cargo/Posición
                                        </label>
                                        <input
                                            {...register(`leads.${index}.position` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Ej: Gerente General"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre
                                        </label>
                                        <input
                                            {...register(`leads.${index}.name` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Nombre completo"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            {...register(`leads.${index}.phone` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Número de teléfono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Extensión
                                        </label>
                                        <input
                                            {...register(`leads.${index}.extension` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Número de extensión"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            {...register(`leads.${index}.email` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Email del leado"
                                        />
                                    </div>
                                </div>

                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removelead(index)}
                                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Eliminar leado
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => appendlead({
                                lead_type: LeadType.direcciones,
                                position: null,
                                name: null,
                                phone: null,
                                extension: null,
                                email: null
                            })}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            + Agregar leado
                        </button>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Target className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">BANT (Presupuesto, Autoridad, Necesito, Línea de tiempo)</h2>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-blue-800">
                                Complete la información sobre las oportunidades de negocio identificadas para este cliente.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nicho de Mercado
                                </label>
                                <input
                                    {...register('niche')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: Aduanas y Consolidadora de Carga Internacional"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Servicios que ofrece
                                </label>
                                <textarea
                                    {...register('services')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: Transporte Aéreo, Marítimo y terrestre, en contenedor completo y carga consolidada..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Oportunidades identificadas
                                </label>
                                <textarea
                                    {...register('opportunities')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: Problemas de facturación en los países (Centroamérica) deficiencia operativa..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Presupuesto
                                </label>
                                <input
                                    {...register('budget')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Presupuesto estimado"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Autoridad de decisión
                                </label>
                                <input
                                    {...register('authority')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: Enrique Moreno Lobo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Comprador
                                </label>
                                <input
                                    {...register('buyer')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: Enrique Moreno Lobo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Necesidades identificadas
                                </label>
                                <textarea
                                    {...register('needs')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: Software de Facturación"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timeline estimado
                                </label>
                                <input
                                    {...register('timeline')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Timeline para la implementación"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Métricas de éxito
                                </label>
                                <textarea
                                    {...register('metrics')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Métricas que se utilizarán para medir el éxito"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Criterios de decisión
                                </label>
                                <input
                                    {...register('decision_criteria')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: PRECIO"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proceso de decisión
                                </label>
                                <textarea
                                    {...register('decision_process')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Describa el proceso de decisión del cliente"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Puntos de dolor (Pain Points)
                                </label>
                                <textarea
                                    {...register('pain_points')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: Facturación"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Champion/Sponsor interno
                                </label>
                                <input
                                    {...register('champion')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Persona que apoya internamente la iniciativa"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Objetivos del negocio
                                </label>
                                <textarea
                                    {...register('objectives')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: Tener una facturación y conexión con el ERP"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Consecuencias e implicaciones
                                </label>
                                <textarea
                                    {...register('consequences')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Consecuencias de no resolver los problemas identificados"
                                />
                            </div>
                        </div>
                    </div>
                )

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Resumen y Confirmación</h2>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-lg mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-800">Puntuación Final</h3>
                                    <p className="text-3xl font-bold text-blue-600">{totalScore} puntos ({percentage}%)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-blue-700">Mínimo requerido: 80%</p>
                                    <p className={`text-lg font-semibold ${getDiagnosticColor(percentage)}`}>
                                        {getDiagnostic(percentage)}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Estado: {getEvaluationStatus(percentage)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de la Evaluación</h3>
                            <p className="text-gray-600 mb-4">
                                Revise la información antes de enviar la evaluación. Una vez enviada, se guardará en la base de datos y podrá ser consultada posteriormente.
                            </p>

                            {percentage < 80 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <p className="text-yellow-800 font-medium">
                                        ⚠️ La puntuación está por debajo del mínimo recomendado del 80%.
                                        El cliente será marcado como {getEvaluationStatus(percentage) === EvaluationStatus.POTENTIAL ? 'Potencial' : 'No Apto'}.
                                    </p>
                                </div>
                            )}

                            {percentage >= 80 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <p className="text-green-800 font-medium">
                                        ✅ Excelente puntuación. Este cliente será marcado como Apto y representa una buena oportunidad de negocio.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas de la Evaluación
                            </label>
                            <textarea
                                {...register('notes')}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Notas adicionales sobre la evaluación..."
                            />
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Evaluado Por
                            </label>
                            <input
                                {...register('evaluated_by')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="ID o nombre del usuario que realizó la evaluación"
                            />
                        </div>
                    </div>
                )

            default:
                return <div>Paso no implementado</div>
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                        <div className="flex items-center gap-4">
                            {/* Logo a la izquierda */}
                            <div className="flex-shrink-0">
                                <Image
                                    src="/AlphaLogo.png" // Ruta a tu logo en la carpeta public
                                    alt="Logo de Alpha Latam"
                                    width={64}
                                    height={64}
                                    className="rounded-full bg-white"
                                />
                            </div>

                            {/* Texto a la derecha */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">Sistema de Evaluación de Clientes</h1>
                                <p className="text-blue-100">Account Planning & Client Assessment</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progreso</span>
                            <span className="text-sm font-medium text-gray-700">{currentStep}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                        {renderStep()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                            >
                                Anterior
                            </button>

                            {currentStep < 5 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Finalizar Evaluación'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Página principal que renderiza el formulario dentro del layout del sistema
export default function FormPage() {
    const { user, isLoading: authLoading } = useAuth()

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>No autorizado</p>
            </div>
        )
    }

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 md:gap-6">
                            <ClientEvaluationForm />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}