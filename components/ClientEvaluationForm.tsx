'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Building, Users, FileText, Target, TrendingUp, CheckCircle, Phone, Mail, User, MapPin, Globe } from 'lucide-react'

// Define interfaces
interface Contact {
    contact_type: string
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
    // Checklist items
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
}

// Checklist items with their points
const checklistItems = [
    { key: 'has_website', label: 'Tiene sitio web corporativo', points: 10 },
    { key: 'has_phone', label: 'Cuenta con línea telefónica empresarial', points: 5 },
    { key: 'has_email', label: 'Posee correo electrónico corporativo', points: 5 },
    { key: 'has_more_than_50_employees', label: 'Más de 50 empleados', points: 15 },
    { key: 'has_established_brand', label: 'Marca establecida en el mercado', points: 10 },
    { key: 'has_digital_presence', label: 'Presencia digital activa', points: 10 },
    { key: 'has_growth_potential', label: 'Potencial de crecimiento', points: 15 },
    { key: 'has_decision_maker_access', label: 'Acceso a tomadores de decisión', points: 15 },
    { key: 'has_budget_authority', label: 'Autoridad presupuestaria identificada', points: 10 },
    { key: 'has_clear_pain_points', label: 'Puntos de dolor claramente definidos', points: 15 },
    { key: 'has_defined_needs', label: 'Necesidades específicas identificadas', points: 10 },
    { key: 'has_timeline_urgency', label: 'Timeline definido con urgencia', points: 10 },
    { key: 'has_previous_tech_investments', label: 'Historial de inversiones en tecnología', points: 5 },
    { key: 'has_internal_champion', label: 'Champion interno identificado', points: 5 },
]

export default function ClientEvaluationForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [totalScore, setTotalScore] = useState(0)
    const [percentage, setPercentage] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<ClientFormData>({
        defaultValues: {
            company_name: '',
            contacts: [{ contact_type: 'direcciones' }],
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
        }
    })

    const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
        control,
        name: 'contacts'
    })

    // Calculate score in real time
    useEffect(() => {
        const subscription = watch((value) => {
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
        
        try {
            // Simulate API call - replace with actual Supabase integration
            console.log('Form data:', data)
            console.log('Score:', totalScore, 'Percentage:', percentage)
            
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            alert('Evaluación guardada exitosamente!')
            
            // Reset form or redirect
            // You can add navigation logic here
            
        } catch (error) {
            console.error('Error saving evaluation:', error)
            alert('Error al guardar la evaluación. Por favor intente nuevamente.')
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
                                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Eliminar Contacto
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => appendContact({ contact_type: 'direcciones' })}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
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