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
    BarChart3,
    Calendar,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

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
        total_score: number | null
        employees: number | null
        geographic_location: string | null
    }
}

interface LeadTypeStat {
    lead_type: string
    _count: {
        id: number
    }
}

interface EvaluationStat {
    evaluation_status: string
    _count: {
        id: number
    }
}

interface ReportsResponse {
    leads: Lead[]
    companies: any[]
    stats: {
        totalLeads: number
        avgScore: number
        leadTypeStats: LeadTypeStat[]
        evaluationStats: EvaluationStat[]
    }
    totalCount: number
    page: number
    pageSize: number
}

export default function ReportsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPageChanging, setIsPageChanging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const [stats, setStats] = useState<any>(null)
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [companyStatus, setCompanyStatus] = useState<string>("all")
    const [leadType, setLeadType] = useState<string>("all")
    const [sortField, setSortField] = useState<string>("created_at")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [isExporting, setIsExporting] = useState(false)

    // Función para obtener reportes
    const fetchReports = useCallback(async (isPageChange = false) => {
        try {
            setError(null)
            if (isPageChange) {
                setIsPageChanging(true)
            } else {
                setIsLoading(true)
            }

            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                dateFrom,
                dateTo,
                companyStatus,
                leadType,
                sortBy: sortField,
                sortOrder: sortDirection
            })

            const response = await fetch(`/api/reports?${params}`)

            if (!response.ok) {
                throw new Error('Error al cargar los reportes')
            }

            const data: ReportsResponse = await response.json()
            setLeads(data.leads)
            setTotalCount(data.totalCount)
            setStats(data.stats)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setIsLoading(false)
            if (isPageChange) {
                setIsPageChanging(false)
            }
        }
    }, [page, pageSize, dateFrom, dateTo, companyStatus, leadType, sortField, sortDirection])

    // Efecto principal para cargar reportes
    useEffect(() => {
        if (user && !authLoading) {
            fetchReports()
        }
    }, [user, authLoading, fetchReports])

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
        fetchReports(true);
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchReports();
    };

    const handleClearFilters = () => {
        setDateFrom("");
        setDateTo("");
        setCompanyStatus("all");
        setLeadType("all");
        setPage(1);
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            setIsExporting(true)
            const params = new URLSearchParams({
                dateFrom,
                dateTo,
                companyStatus,
                leadType,
                sortBy: sortField,
                sortOrder: sortDirection,
                format: format
            })

            const response = await fetch(`/api/reports/export?${params}`)

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
            const fileName = `reporte_${dateStr}.${format === 'excel' ? 'csv' : 'pdf'}`;

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
                                <h1 className="text-2xl font-bold">Reportes de Leads</h1>

                                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
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

                            {/* Panel de Filtros */}
                            <Card className="mx-4 lg:mx-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Filter className="h-5 w-5 mr-2" />
                                        Filtros
                                    </CardTitle>
                                    <CardDescription>
                                        Filtra los reportes por fecha, estado de empresa y tipo de lead
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dateFrom">Desde</Label>
                                            <Input
                                                id="dateFrom"
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dateTo">Hasta</Label>
                                            <Input
                                                id="dateTo"
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyStatus">Estado Empresa</Label>
                                            <Select
                                                value={companyStatus}
                                                onValueChange={setCompanyStatus}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos los estados" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos los estados</SelectItem>
                                                    <SelectItem value="SUITABLE">Apto</SelectItem>
                                                    <SelectItem value="POTENTIAL">Potencial</SelectItem>
                                                    <SelectItem value="NOT_SUITABLE">No Apto</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="leadType">Tipo de Lead</Label>
                                            <Select
                                                value={leadType}
                                                onValueChange={setLeadType}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos los tipos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos los tipos</SelectItem>
                                                    <SelectItem value="direcciones">Direcciones</SelectItem>
                                                    <SelectItem value="consejo">Consejo</SelectItem>
                                                    <SelectItem value="comite">Comité</SelectItem>
                                                    <SelectItem value="otros">Otros</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <Button variant="outline" onClick={handleClearFilters}>
                                            Limpiar
                                        </Button>
                                        <Button onClick={handleApplyFilters}>
                                            Aplicar Filtros
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Estadísticas */}
                            {stats && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Total Leads
                                            </CardTitle>
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{stats.totalLeads}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Puntuación Promedio
                                            </CardTitle>
                                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{stats.avgScore}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Empresas Aptas
                                            </CardTitle>
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {stats.evaluationStats.find((s: EvaluationStat) => s.evaluation_status === 'SUITABLE')?._count.id || 0}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Leads Direcciones
                                            </CardTitle>
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {stats.leadTypeStats.find((s: LeadTypeStat) => s.lead_type === 'direcciones')?._count.id || 0}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {error && (
                                <div className="px-4 lg:px-6">
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {error}
                                            <Button
                                                onClick={() => fetchReports()}
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
                                                <TableHead>Puntuación</TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-accent"
                                                    onClick={() => handleSort("created_at")}
                                                >
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
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
                                                            <div className="font-medium">
                                                                {lead.company.total_score || 0}
                                                            </div>
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
                                                        {dateFrom || dateTo || companyStatus !== 'all' || leadType !== 'all'
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