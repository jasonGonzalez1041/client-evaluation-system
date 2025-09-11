"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import Image from "next/image"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
    teams,
}: {
    teams: {
        name: string
        logo: string  // Cambiado de React.ElementType a string
        plan: string
    }[]
}) {
    const { isMobile } = useSidebar()
    const [activeTeam, setActiveTeam] = React.useState(teams[0])

    if (!activeTeam) {
        return null
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                            <Image
                                src={activeTeam.logo}
                                alt={`${activeTeam.name} logo`}
                                width={120}
                                height={120}
                                className="object-contain"
                            />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{activeTeam.name}</span>
                            <span className="truncate text-xs">{activeTeam.plan}</span>
                        </div>
                    </SidebarMenuButton>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}