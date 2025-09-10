// components/app-sidebar.tsx
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
import { useNavigation } from "@/hooks/useNavigation"

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
        },
        {
            title: "Clientes",
            url: "/clients",
            icon: Users,
        },
        {
            title: "Evaluaciones",
            url: "/evaluations",
            icon: Target,
        },
        {
            title: "Contactos",
            url: "/contacts",
            icon: Contact,
        },
        {
            title: "Analytics",
            url: "/analytics",
            icon: TrendingUp,
        },
        {
            title: "Reportes",
            url: "/reports",
            icon: FileText,
        },
        {
            title: "MCP",
            url: "/mcp",
            icon: Brain,
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
    const { isActive } = useNavigation()

    // Aplicar estado activo basado en la ruta actual
    const navItems = data.navMain.map(item => ({
        ...item,
        isActive: isActive(item.url, item.items)
    }))

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}