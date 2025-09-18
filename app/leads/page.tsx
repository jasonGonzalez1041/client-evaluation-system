/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Search,
    ChevronDown,
    ChevronUp,
    Eye,
    Mail,
    Phone,
    Building,
    User,
    AlertCircle,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Lead {
    id: string
    company_id: string
    lead_type: string
    position: string | null
    name: string | null
    phone: string | null
    extension: string | null
    email: string | null
    created_at: string
    company: {
        company_name: string
        evaluation_status: string
    }
}

interface LeadsResponse {
    leads: Lead[]
    totalCount: number
    page: number
    pageSize: number
}

export default function LeadsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPageChanging, setIsPageChanging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [companyFilter, setCompanyFilter] = useState<string>("all")
    const [sortField, setSortField] = useState<string>("created_at")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [isExporting, setIsExporting] = useState(false)

    // Función para obtener leads
    const fetchLeads = useCallback(async (isPageChange = false) => {
        try {
            setError(null)
            if (isPageChange) {
                setIsPageChanging(true)
            }

            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                search: debouncedSearchTerm,
                type: typeFilter,
                company: companyFilter,
                sortBy: sortField,
                sortOrder: sortDirection
            })

            const response = await fetch(`/api/leads?${params}`)

            if (!response.ok) {
                throw new Error('Error al cargar los leads')
            }

            const data: LeadsResponse = await response.json()
            setLeads(data.leads)
            setTotalCount(data.totalCount)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setIsLoading(false)
            if (isPageChange) {
                setIsPageChanging(false)
            }
        }
    }, [page, pageSize, debouncedSearchTerm, typeFilter, companyFilter, sortField, sortDirection])

    // Efecto para el debounce de búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
            setPage(1)
        }, 500)

        return () => {
            clearTimeout(handler)
        }
    }, [searchTerm])

    // Efecto principal para cargar leads
    useEffect(() => {
        if (user && !authLoading) {
            fetchLeads()
        }
    }, [user, authLoading, fetchLeads])

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchLeads(true);
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            setIsExporting(true)
            const params = new URLSearchParams({
                search: debouncedSearchTerm,
                type: typeFilter,
                company: companyFilter,
                sortBy: sortField,
                sortOrder: sortDirection,
                format: format
            })

            const response = await fetch(`/api/leads/export?${params}`)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Error al exportar ${format}`)
            }

            // Obtener la fecha actual en formato DD_MM_YYYY
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const dateStr = `${day}_${month}_${year}`;

            // Crear el nombre del archivo con la fecha
            const fileName = `leads_${dateStr}.${format === 'excel' ? 'csv' : 'pdf'}`;

            if (format === 'excel') {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = fileName
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = fileName
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al exportar')
        } finally {
            setIsExporting(false)
        }
    }

    const totalPages = Math.ceil(totalCount / pageSize)

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
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-6">
                                <h1 className="text-2xl font-bold">Gestión de Leads</h1>

                                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar leads..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>

                                    <Select
                                        value={typeFilter}
                                        onValueChange={(value) => {
                                            setTypeFilter(value)
                                            setPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Filtrar por tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los tipos</SelectItem>
                                            <SelectItem value="direcciones">Direcciones</SelectItem>
                                            <SelectItem value="consejo">Consejo</SelectItem>
                                            <SelectItem value="comite">Comité</SelectItem>
                                            <SelectItem value="otros">Otros</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" disabled={isExporting}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Exportar
                                                {isExporting && <span className="ml-2 animate-spin">⏳</span>}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleExport('excel')}>
                                                Exportar a Excel
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                                Exportar a PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {error && (
                                <div className="px-4 lg:px-6">
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {error}
                                            <Button
                                                onClick={() => fetchLeads()}
                                                variant="outline"
                                                size="sm"
                                                className="ml-2"
                                            >
                                                Reintentar
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            <div className="px-4 lg:px-6">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-accent"
                                                    onClick={() => handleSort("name")}
                                                >
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-1" />
                                                        Contacto
                                                        {sortField === "name" && (
                                                            sortDirection === "asc" ?
                                                                <ChevronUp className="h-4 w-4 ml-1" /> :
                                                                <ChevronDown className="h-4 w-4 ml-1" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-accent"
                                                    onClick={() => handleSort("company_name")}
                                                >
                                                    <div className="flex items-center">
                                                        <Building className="h-4 w-4 mr-1" />
                                                        Empresa
                                                        {sortField === "company_name" && (
                                                            sortDirection === "asc" ?
                                                                <ChevronUp className="h-4 w-4 ml-1" /> :
                                                                <ChevronDown className="h-4 w-4 ml-1" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Posición</TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-accent"
                                                    onClick={() => handleSort("lead_type")}
                                                >
                                                    <div className="flex items-center">
                                                        Tipo
                                                        {sortField === "lead_type" && (
                                                            sortDirection === "asc" ?
                                                                <ChevronUp className="h-4 w-4 ml-1" /> :
                                                                <ChevronDown className="h-4 w-4 ml-1" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Contacto</TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-accent"
                                                    onClick={() => handleSort("created_at")}
                                                >
                                                    <div className="flex items-center">
                                                        Fecha Creación
                                                        {sortField === "created_at" && (
                                                            sortDirection === "asc" ?
                                                                <ChevronUp className="h-4 w-4 ml-1" /> :
                                                                <ChevronDown className="h-4 w-4 ml-1" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                Array.from({ length: pageSize }).map((_, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                    </TableRow>
                                                ))
                                            ) : leads.length > 0 ? (
                                                leads.map((lead) => (
                                                    <TableRow key={lead.id}>
                                                        <TableCell className="font-medium">
                                                            <div>
                                                                <div>{lead.name || "Sin nombre"}</div>
                                                                {lead.email && (
                                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                                        <Mail className="h-3 w-3 mr-1" />
                                                                        {lead.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{lead.company.company_name}</div>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    lead.company.evaluation_status === "SUITABLE"
                                                                        ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                                                                        : lead.company.evaluation_status === "POTENTIAL"
                                                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs"
                                                                            : "bg-red-100 text-red-800 hover:bg-red-100 text-xs"
                                                                }
                                                            >
                                                                {lead.company.evaluation_status === "SUITABLE"
                                                                    ? "Apto"
                                                                    : lead.company.evaluation_status === "POTENTIAL"
                                                                        ? "Potencial"
                                                                        : "No Apto"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {lead.position || "No especificado"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="capitalize">
                                                                {lead.lead_type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {lead.phone && (
                                                                <div className="flex items-center text-sm">
                                                                    <Phone className="h-3 w-3 mr-1" />
                                                                    {lead.phone}
                                                                    {lead.extension && ` ext. ${lead.extension}`}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(lead.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Link href={`/clients/${lead.company_id}`} title="Ver empresa">
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">
                                                        {debouncedSearchTerm || typeFilter !== 'all'
                                                            ? "No se encontraron leads con los filtros aplicados."
                                                            : "No se encontraron leads."
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Paginación */}
                                <div className="flex items-center justify-between space-x-6 lg:space-x-8 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium">Filas por página</p>
                                        <Select
                                            value={pageSize.toString()}
                                            onValueChange={(value) => {
                                                setPageSize(Number(value))
                                                setPage(1)
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue placeholder={pageSize.toString()} />
                                            </SelectTrigger>
                                            <SelectContent side="top">
                                                {[5, 10, 20, 50].map((size) => (
                                                    <SelectItem key={size} value={size.toString()}>
                                                        {size}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-center text-sm font-medium">
                                        <span>Página {page} de {totalPages}</span>
                                        {isPageChanging && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 ml-2"></div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1 || isPageChanging}
                                        >
                                            {isPageChanging ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                            ) : (
                                                <ChevronLeft className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages || totalPages === 0 || isPageChanging}
                                        >
                                            {isPageChanging ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}