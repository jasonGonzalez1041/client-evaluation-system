// types/index.ts
export interface Contact {
    id?: number;
    client_id?: number;
    contact_type: string;
    position?: string;
    name?: string;
    extension?: string;
    phone?: string;
    created_at?: string;
}

export interface Client {
    id?: number;
    company_name: string;
    legal_id?: string;
    employees?: number;
    geographic_location?: string;
    website?: string;
    phone?: string;
    email?: string;
    mission?: string;
    vision?: string;
    organizational_values?: string;
    created_at?: string;
    updated_at?: string;
}

export interface BusinessOpportunity {
    id?: number;
    client_id?: number;
    niche?: string;
    services?: string;
    opportunities?: string;
    budget?: string;
    authority?: string;
    buyer?: string;
    needs?: string;
    timeline?: string;
    metrics?: string;
    decision_criteria?: string;
    decision_process?: string;
    pain_points?: string;
    champion?: string;
    objectives?: string;
    consequences?: string;
    created_at?: string;
}

export interface Evaluation {
    id?: number;
    client_id?: number;
    mision_critica: boolean;
    sentido_urgencia: boolean;
    es_fabricante: boolean;
    tiene_distribucion: boolean;
    tiene_bodega: boolean;
    tiene_transporte: boolean;
    mas_15_personas: boolean;
    tiene_flotilla: boolean;
    tiene_pagina_web: boolean;
    tiene_central_telefonica: boolean;
    es_empresa_privada: boolean;
    es_empresa_juridica: boolean;
    presupuesto_tecnologia: boolean;
    compra_tecnologia: boolean;
    interes_competitivo: boolean;
    posicion_economica: boolean;
    en_expansion: boolean;
    reduce_costos_eficiencia: boolean;
    procesos_compra: boolean;
    es_regional: boolean;
    usa_redes_sociales: boolean;
    ubicacion_geografica: boolean;
    total_score: number;
    percentage: number;
    diagnostic: string;
    evaluated_by?: string;
    created_at?: string;
}

export interface AdminUser {
    id: string;
    email: string;
    password: string;
    name: string;
    created_at: string;
    last_login?: string;
}

export interface ClientFormData {
    company_name: string;
    legal_id?: string;
    employees?: number;
    geographic_location?: string;
    website?: string;
    phone?: string;
    email?: string;
    mission?: string;
    vision?: string;
    organizational_values?: string;
    contacts: Contact[];
    niche?: string;
    services?: string;
    opportunities?: string;
    budget?: string;
    authority?: string;
    buyer?: string;
    needs?: string;
    timeline?: string;
    metrics?: string;
    decision_criteria?: string;
    decision_process?: string;
    pain_points?: string;
    champion?: string;
    objectives?: string;
    consequences?: string;
    // Checklist items
    has_website: boolean;
    has_phone: boolean;
    has_email: boolean;
    has_more_than_50_employees: boolean;
    has_established_brand: boolean;
    has_digital_presence: boolean;
    has_growth_potential: boolean;
    has_decision_maker_access: boolean;
    has_budget_authority: boolean;
    has_clear_pain_points: boolean;
    has_defined_needs: boolean;
    has_timeline_urgency: boolean;
    has_previous_tech_investments: boolean;
    has_internal_champion: boolean;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
    error?: string;
}

export interface ClientWithRelations extends Client {
    evaluations: Evaluation[];
    business_opportunities: BusinessOpportunity[];
    contacts: Contact[];
}