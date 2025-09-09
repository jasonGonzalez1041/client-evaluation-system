"use client"

import * as React from "react"
import {
    Users,
    TrendingUp,
    Contact,
    BarChart3,
    Settings2,
    Target,
    FileText,
    Calendar,
    DollarSign,
    Filter,
    PieChart,
    Activity,
    Brain,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

// Datos actualizados para el CRM
const data = {
    user: {
        name: "Admin User",
        email: "admin@alphalatam.com",
        avatar: "/avatars/admin.jpg",
    },
    teams: [
        {
            name: "Alpha Latam",
            logo: "/AlphaLogo.png",
            plan: "Enterprise",
        },
        {
            name: "Equipo de Ventas",
            logo: "/AlphaLogo.png",
            plan: "Professional",
        },
        {
            name: "Gerencia",
            logo: "/AlphaLogo.png",
            plan: "Executive",
        },
    ],
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: BarChart3,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: "/dashboard/overview",
                },
                {
                    title: "KPIs",
                    url: "/dashboard/kpis",
                },
                {
                    title: "Pipeline",
                    url: "/dashboard/pipeline",
                },
            ],
        },
        {
            title: "Clientes",
            url: "/clients",
            icon: Users,
            items: [
                {
                    title: "Todos los Clientes",
                    url: "/clients/all",
                },
                {
                    title: "Aptos (≥80%)",
                    url: "/clients/suitable",
                },
                {
                    title: "Potencial (60-79%)",
                    url: "/clients/potential",
                },
                {
                    title: "No Aptos (<60%)",
                    url: "/clients/not-suitable",
                },
                {
                    title: "Agregar Cliente",
                    url: "/clients/new",
                },
            ],
        },
        {
            title: "Evaluaciones",
            url: "/evaluations",
            icon: Target,
            items: [
                {
                    title: "Scoring Actual",
                    url: "/evaluations/current",
                },
                {
                    title: "Historial",
                    url: "/evaluations/history",
                },
                {
                    title: "BANT Analysis",
                    url: "/evaluations/bant",
                },
                {
                    title: "Pain Points",
                    url: "/evaluations/pain-points",
                },
            ],
        },
        {
            title: "Contactos",
            url: "/contacts",
            icon: Contact,
            items: [
                {
                    title: "Todos los Contactos",
                    url: "/contacts/all",
                },
                {
                    title: "Direcciones",
                    url: "/contacts/direcciones",
                },
                {
                    title: "Consejo",
                    url: "/contacts/consejo",
                },
                {
                    title: "Comité",
                    url: "/contacts/comite",
                },
                {
                    title: "Otros",
                    url: "/contacts/otros",
                },
            ],
        },
        {
            title: "Analytics",
            url: "/analytics",
            icon: TrendingUp,
            items: [
                {
                    title: "Conversión",
                    url: "/analytics/conversion",
                },
                {
                    title: "Revenue Pipeline",
                    url: "/analytics/revenue",
                },
                {
                    title: "Client Distribution",
                    url: "/analytics/distribution",
                },
                {
                    title: "Performance",
                    url: "/analytics/performance",
                },
            ],
        },
        {
            title: "Reportes",
            url: "/reports",
            icon: FileText,
            items: [
                {
                    title: "Reporte Mensual",
                    url: "/reports/monthly",
                },
                {
                    title: "Análisis Sectorial",
                    url: "/reports/sector",
                },
                {
                    title: "ROI Analysis",
                    url: "/reports/roi",
                },
                {
                    title: "Exportar Datos",
                    url: "/reports/export",
                },
            ],
        },
        {
            title: "MCP",
            url: "/mcp",
            icon: Brain,
            items: [
                {
                    title: "AI Assistant",
                    url: "/mcp/assistant",
                },
                {
                    title: "Query Builder",
                    url: "/mcp/query-builder",
                },
                {
                    title: "Data Insights",
                    url: "/mcp/insights",
                },
                {
                    title: "Natural Language",
                    url: "/mcp/natural-language",
                },
            ],
        },
        {
            title: "Configuración",
            url: "/settings",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "/settings/general",
                },
                {
                    title: "Usuarios",
                    url: "/settings/users",
                },
                {
                    title: "Scoring Rules",
                    url: "/settings/scoring",
                },
                {
                    title: "Integrations",
                    url: "/settings/integrations",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}