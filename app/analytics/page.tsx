// app/analytics/page.tsx
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BarChart3, Users, Building, TrendingUp, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
// Componentes de gráficos (instalar recharts: npm install recharts)
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts'

interface AnalyticsData {
    summary: {
        totalLeads: number
        timeframe: string
    }
    leadsByType: Array<{ type: string; count: number }>
    leadsByCompany: Array<{ company_id: string; company_name: string; count: number }>
    leadsOverTime: Array<{ date: string; count: number }>
    evaluationStats: Array<{ status: string; count: number }>
    topCompanies: Array<{
        id: string
        company_name: string
        total_score: number
        evaluation_status: string
    }>
    recentLeads: Array<{
        id: string
        name: string | null
        email: string | null
        company: {
            company_name: string
            evaluation_status: string
        }
        created_at: string
    }>
}

const timeframeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: 'ytd', label: 'Este año' },
    { value: 'all', label: 'Todo el tiempo' }
]

const evaluationStatusColors = {
    SUITABLE: '#10b981',
    POTENTIAL: '#f59e0b',
    NOT_SUITABLE: '#ef4444'
}

const leadTypeColors = {
    direcciones: '#3b82f6',
    consejo: '#8b5cf6',
    comite: '#ec4899',
    otros: '#6b7280'
}

export default function AnalyticsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeframe, setTimeframe] = useState('30d')
    const [isExporting, setIsExporting] = useState(false)
    const fetchAnalytics = async () => {
        try {
            setError(null)
            setIsLoading(true)

            const response = await fetch(`/api/analytics?timeframe=${timeframe}`)

            if (!response.ok) {
                throw new Error('Error al cargar los analytics')
            }

            const analyticsData = await response.json()
            setData(analyticsData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (user && !authLoading) {
            fetchAnalytics()
        }
    }, [user, authLoading, timeframe])

    const handleExport = async () => {
        try {
            setIsExporting(true)
            const response = await fetch(`/api/analytics/export?timeframe=${timeframe}`)

            if (!response.ok) {
                throw new Error('Error al exportar el reporte')
            }

            // Obtener la fecha actual para el nombre del archivo
            const now = new Date()
            const day = String(now.getDate()).padStart(2, '0')
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const year = now.getFullYear()
            const dateStr = `${day}_${month}_${year}`
            const fileName = `analytics_report_${dateStr}.pdf`

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al exportar')
        } finally {
            setIsExporting(false)
        }
    }

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
                            {/* Header */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-6">
                                <div>
                                    <h1 className="text-2xl font-bold">Analíticas de Leads</h1>
                                    <p className="text-muted-foreground">
                                        Métricas y estadísticas de tus leads y empresas
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                    <Select value={timeframe} onValueChange={setTimeframe}>
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Período de tiempo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeframeOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button onClick={handleExport} disabled={isExporting}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar PDF
                                        {isExporting && <span className="ml-2 animate-spin">⏳</span>}
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <div className="px-4 lg:px-6">
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {error}
                                            <button
                                                onClick={fetchAnalytics}
                                                className="ml-2 underline"
                                            >
                                                Reintentar
                                            </button>
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            {/* Métricas principales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            <>
                                                <div className="text-2xl font-bold">{data?.summary.totalLeads}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    Período: {timeframeOptions.find(t => t.value === timeframe)?.label}
                                                </p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Empresas Aptas</CardTitle>
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            <>
                                                <div className="text-2xl font-bold">
                                                    {data?.evaluationStats.find(s => s.status === 'SUITABLE')?.count || 0}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    de {data?.evaluationStats.reduce((acc, curr) => acc + curr.count, 0)} empresas
                                                </p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Empresas Potenciales</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            <>
                                                <div className="text-2xl font-bold">
                                                    {data?.evaluationStats.find(s => s.status === 'POTENTIAL')?.count || 0}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    oportunidades identificadas
                                                </p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : data?.leadsOverTime && data.leadsOverTime.length > 1 ? (
                                            <>
                                                <div className="text-2xl font-bold">
                                                    {data.leadsOverTime[data.leadsOverTime.length - 1].count}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    leads en el último día
                                                </p>
                                            </>
                                        ) : (
                                            <div className="text-2xl font-bold">-</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Gráficos y visualizaciones */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
                                {/* Leads por tipo */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Leads por Tipo</CardTitle>
                                        <CardDescription>Distribución de leads según su categoría</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-64 w-full" />
                                        ) : data?.leadsByType && data.leadsByType.length > 0 ? (
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={data.leadsByType}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ type, count, percent }) =>
                                                                `${type}: ${count} (${(percent * 100).toFixed(0)}%)`
                                                            }
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="count"
                                                            nameKey="type"
                                                        >
                                                            {data.leadsByType.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={leadTypeColors[entry.type as keyof typeof leadTypeColors] || '#6b7280'}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                                No hay datos disponibles
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Leads en el tiempo */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Leads en el Tiempo</CardTitle>
                                        <CardDescription>Evolución de leads en el período seleccionado</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-64 w-full" />
                                        ) : data?.leadsOverTime && data.leadsOverTime.length > 0 ? (
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart
                                                        data={data.leadsOverTime}
                                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tickFormatter={(value) => {
                                                                const date = new Date(value)
                                                                return `${date.getDate()}/${date.getMonth() + 1}`
                                                            }}
                                                        />
                                                        <YAxis />
                                                        <Tooltip
                                                            labelFormatter={(value) => {
                                                                const date = new Date(value)
                                                                return date.toLocaleDateString()
                                                            }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="count"
                                                            stroke="#3b82f6"
                                                            activeDot={{ r: 8 }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                                No hay datos disponibles
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Empresas top por leads */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Empresas por Leads</CardTitle>
                                        <CardDescription>Empresas con mayor cantidad de leads</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-64 w-full" />
                                        ) : data?.leadsByCompany && data.leadsByCompany.length > 0 ? (
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={data.leadsByCompany}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis type="number" />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="company_name"
                                                            tick={{ fontSize: 12 }}
                                                            width={90}
                                                        />
                                                        <Tooltip />
                                                        <Bar dataKey="count" fill="#3b82f6" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                                No hay datos disponibles
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Estado de evaluación */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Estado de Evaluación</CardTitle>
                                        <CardDescription>Distribución de empresas por estado de evaluación</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-64 w-full" />
                                        ) : data?.evaluationStats && data.evaluationStats.length > 0 ? (
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={data.evaluationStats}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ status, count, percent }) =>
                                                                `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                                                            }
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="count"
                                                            nameKey="status"
                                                        >
                                                            {data.evaluationStats.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={evaluationStatusColors[entry.status as keyof typeof evaluationStatusColors] || '#6b7280'}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                                No hay datos disponibles
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
                                {/* Top empresas por puntuación */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Empresas por Puntuación</CardTitle>
                                        <CardDescription>Empresas mejor evaluadas en el sistema</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <div className="space-y-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Skeleton key={i} className="h-12 w-full" />
                                                ))}
                                            </div>
                                        ) : data?.topCompanies && data.topCompanies.length > 0 ? (
                                            <div className="space-y-3">
                                                {data.topCompanies.map((company) => (
                                                    <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <Building className="h-5 w-5 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">{company.company_name}</p>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        company.evaluation_status === "SUITABLE"
                                                                            ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                                                                            : company.evaluation_status === "POTENTIAL"
                                                                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs"
                                                                                : "bg-red-100 text-red-800 hover:bg-red-100 text-xs"
                                                                    }
                                                                >
                                                                    {company.evaluation_status === "SUITABLE"
                                                                        ? "Apto"
                                                                        : company.evaluation_status === "POTENTIAL"
                                                                            ? "Potencial"
                                                                            : "No Apto"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-bold">{company.total_score}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground text-center py-8">
                                                No hay empresas evaluadas
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Leads recientes */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Leads Recientes</CardTitle>
                                        <CardDescription>Últimos leads agregados al sistema</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <div className="space-y-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Skeleton key={i} className="h-12 w-full" />
                                                ))}
                                            </div>
                                        ) : data?.recentLeads && data.recentLeads.length > 0 ? (
                                            <div className="space-y-3">
                                                {data.recentLeads.map((lead) => (
                                                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <p className="font-medium">{lead.name || 'Sin nombre'}</p>
                                                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">{lead.company.company_name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(lead.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground text-center py-8">
                                                No hay leads recientes
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}