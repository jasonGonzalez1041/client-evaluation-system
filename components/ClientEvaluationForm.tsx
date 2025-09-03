'use client'

import { useState, useEffect, ReactElement, ReactPortal, JSXElementConstructor, ReactNode, Key } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { Building, Users, FileText, Target, TrendingUp, CheckCircle, Phone, Mail, User, MapPin, Globe } from 'lucide-react'

interface Contact {
    contact_type: 'direcciones' | 'consejo' | 'comite' | 'otros'
    position?: string
    name?: string
    phone?: string
    extension?: string
}

interface ClientFormData {
    company_name: string
    legal_id?: string
    employees?: number
    geographic_location?: string
    website?: string
    phone?: string
    email?: string
    mission?: string
    vision?: string
    organizational_values?: string
    contacts: Contact[]
    // Checklist items
    has_clear_vision?: boolean
    has_defined_goals?: boolean
    has_innovation_culture?: boolean
    has_strong_leadership?: boolean
    has_market_differentiation?: boolean
    has_financial_stability?: boolean
    has_growth_potential?: boolean
    has_adaptability?: boolean
    has_customer_focus?: boolean
    has_ethical_practices?: boolean
    has_social_responsibility?: boolean
    has_technological_adoption?: boolean
    has_talent_management?: boolean
    has_effective_communication?: boolean
    // Business Opportunities
    niche?: string
    services?: string
    opportunities?: string
    budget?: string
    authority?: string
    buyer?: string
    needs?: string
    timeline?: string
    metrics?: string
    decision_criteria?: string
    decision_process?: string
    pain_points?: string
    champion?: string
    objectives?: string
    consequences?: string
}

const checklistItems = [
    { key: 'has_clear_vision', label: 'Visión clara y definida', points: 10 },
    { key: 'has_defined_goals', label: 'Objetivos estratégicos definidos', points: 10 },
    { key: 'has_innovation_culture', label: 'Cultura de innovación', points: 10 },
    { key: 'has_strong_leadership', label: 'Liderazgo fuerte y comprometido', points: 10 },
    { key: 'has_market_differentiation', label: 'Diferenciación en el mercado', points: 10 },
    { key: 'has_financial_stability', label: 'Estabilidad financiera', points: 10 },
    { key: 'has_growth_potential', label: 'Potencial de crecimiento', points: 10 },
    { key: 'has_adaptability', label: 'Capacidad de adaptación al cambio', points: 10 },
    { key: 'has_customer_focus', label: 'Enfoque en el cliente', points: 10 },
    { key: 'has_ethical_practices', label: 'Prácticas éticas y transparentes', points: 10 },
    { key: 'has_social_responsibility', label: 'Responsabilidad social corporativa', points: 10 },
    { key: 'has_technological_adoption', label: 'Adopción tecnológica', points: 10 },
    { key: 'has_talent_management', label: 'Gestión del talento humano', points: 10 },
    { key: 'has_effective_communication', label: 'Comunicación efectiva interna y externa', points: 10 },
]

// ... (keep your existing interfaces and checklistItems array)

export default function ClientEvaluationForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [totalScore, setTotalScore] = useState(0)
    const [percentage, setPercentage] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<ClientFormData>({
        defaultValues: {
            contacts: [{ contact_type: 'direcciones' }],
            // ... (keep your existing default values)
        }
    })

    const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
        control,
        name: 'contacts'
    })

    // Calcular puntuación en tiempo real
    useEffect(() => {
        const subscription = watch((value: { [x: string]: unknown }) => {
            let score = 0

            checklistItems.forEach(item => {
                if (value[item.key as keyof ClientFormData]) {
                    score += item.points
                }
            })

            setTotalScore(score)
            setPercentage(Math.round((score / 140) * 100))
        })

        return () => subscription.unsubscribe()
    }, [watch])

    const onSubmit = async (data: ClientFormData) => {
        if (percentage < 80) {
            if (!confirm(`La puntuación es de solo ${percentage}%, que está por debajo del mínimo requerido del 80%. ¿Está seguro de que desea continuar con el registro?`)) {
                return
            }
        }

        setIsSubmitting(true)

        // ... (keep your existing onSubmit logic)
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
                                    {...register('company_name', { required: true })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Nombre completo de la empresa"
                                />
                                {errors.company_name && <span className="text-red-500 text-sm">Este campo es requerido</span>}
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
                                    {...register('employees', { valueAsNumber: true })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Ej: 1000"
                                />
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
                                    {...register('website')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="https://www.ejemplo.com"
                                />
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="ejemplo@empresa.com"
                                />
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
                                        {...register(item.key as keyof ClientFormData)}
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
                            <h2 className="text-2xl font-bold text-gray-900">Contactos</h2>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-blue-800">
                                Agregue los contactos clave de la empresa, incluyendo direcciones, jefaturas y comités.
                            </p>
                        </div>

                        {contactFields.map((field, index) => (
                            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Contacto
                                        </label>
                                        <select
                                            {...register(`contacts.${index}.contact_type` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        >
                                            <option value="direcciones">Direcciones/Jefaturas</option>
                                            <option value="consejo">Consejo de Administración</option>
                                            <option value="comite">Comité</option>
                                            <option value="otros">Otros</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cargo/Posición
                                        </label>
                                        <input
                                            {...register(`contacts.${index}.position` as const)}
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
                                            {...register(`contacts.${index}.name` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Nombre completo"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            {...register(`contacts.${index}.phone` as const)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Número de teléfono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Extensión
                                    </label>
                                    <input
                                        {...register(`contacts.${index}.extension` as const)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Número de extensión"
                                    />
                                </div>

                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeContact(index)}
                                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Eliminar Contacto
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => appendContact({ contact_type: 'direcciones' })}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                            + Agregar Contacto
                        </button>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Target className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Oportunidades de Negocio</h2>
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
                                        ⚠️ La puntuación está por debajo del mínimo requerido del 80%.
                                        Puede continuar con el registro, pero este cliente será marcado como no apto.
                                    </p>
                                </div>
                            )}
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
                        <h1 className="text-3xl font-bold">Sistema de Evaluación de Clientes</h1>
                        <p className="text-blue-100">Account Planning & Client Assessment</p>
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