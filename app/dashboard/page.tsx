/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/dashboard-improved.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, TrendingUp, Users, Target, BarChart3, MapPin, Calendar, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

interface DashboardData {
  stats: {
    totalCompanies: number
    suitableCompanies: number
    potentialCompanies: number
    notSuitableCompanies: number
    averageScore: number
    averagePoints: number
  }
  charts: {
    monthlyCompanies: Array<{
      month: string
      suitable: number
      potential: number
      not_suitable: number
      total: number
    }>
    statusDistribution: Array<{
      status: string
      count: number
      label: string
    }>
    locationDistribution: Array<{
      location: string
      count: number
    }>
  }
  recentCompanies: Array<{
    id: string
    company_name: string
    legal_id: string | null
    geographic_location: string | null
    phone: string | null
    email: string | null
    website: string | null
    employees: number | null
    percentage: number
    total_score: number
    evaluation_status: string
    created_at: string
    updated_at: string
    primaryLead: any | null
    lastEvaluation: any | null
  }>
  topCompanies: Array<{
    id: string
    company_name: string
    percentage: number
    total_score: number
    evaluation_status: string
    created_at: string
  }>
}

// Colores para gráficos (compatibles con modo claro/oscuro)
const CHART_COLORS = {
  qualified: '#10b981',    // verde
  warm: '#f59e0b',        // amarillo
  cold: '#ef4444',        // rojo
  total: '#3b82f6',       // azul
}

const STATUS_COLORS = {
  SUITABLE: { light: '#10b981', dark: '#059669' },
  POTENTIAL: { light: '#f59e0b', dark: '#d97706' },
  NOT_SUITABLE: { light: '#ef4444', dark: '#dc2626' },
}

export default function ImprovedDashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/dashboard')

      if (!response.ok) {
        throw new Error('Error al cargar los datos del dashboard')
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDashboardData()
  }

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  // Loading state para autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Estado no autorizado - ahora con redirección automática
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4">Redirigiendo al login...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  // Función para obtener la etiqueta del estado en español
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUITABLE':
        return 'Apto'
      case 'POTENTIAL':
        return 'Potencial'
      case 'NOT_SUITABLE':
        return 'No Apto'
      default:
        return status
    }
  }

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUITABLE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'POTENTIAL':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'NOT_SUITABLE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  // Preparar datos para gráficos
  const statusChartData = dashboardData?.charts.statusDistribution || []
  const locationChartData = dashboardData?.charts.locationDistribution.slice(0, 5) || []

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "280px",
        "--header-height": "64px",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-muted/20">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {/* Header con título y botón de refresh */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Resumen de rendimiento y métricas</p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>

            {/* Error state */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading skeletons */}
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-60 w-full" />
                    </CardContent>
                  </Card>
                  <Card className="col-span-1">
                    <CardHeader>
                      <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-60 w-full" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-80 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : dashboardData ? (
              <>
                {/* Cards de estadísticas principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.stats.totalCompanies}
                      </div>
                      <p className="text-xs text-muted-foreground">Empresas evaluadas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Leads Calificados</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{dashboardData.stats.suitableCompanies}</div>
                      <p className="text-xs text-muted-foreground">≥80% puntuación</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Leads Tibios</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{dashboardData.stats.potentialCompanies}</div>
                      <p className="text-xs text-muted-foreground">60-79% puntuación</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Leads Fríos</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{dashboardData.stats.notSuitableCompanies}</div>
                      <p className="text-xs text-muted-foreground">&lt;60% puntuación</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Cards de promedios */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Promedio Score</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.stats.averageScore}%</div>
                      <p className="text-xs text-muted-foreground">{dashboardData.stats.averagePoints} puntos promedio</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.stats.totalCompanies > 0
                          ? Math.round((dashboardData.stats.suitableCompanies / dashboardData.stats.totalCompanies) * 100)
                          : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Empresas calificadas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráficos principales */}
                <Tabs defaultValue="monthly" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="monthly">Tendencia Mensual</TabsTrigger>
                    <TabsTrigger value="status">Distribución por Estado</TabsTrigger>
                    <TabsTrigger value="location">Distribución por Ubicación</TabsTrigger>
                  </TabsList>

                  <TabsContent value="monthly" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Empresas por Mes</CardTitle>
                        <CardDescription>Evolución de empresas evaluadas en los últimos 6 meses</CardDescription>
                      </CardHeader>
                      <CardContent className="pl-2">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData.charts.monthlyCompanies}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Area type="monotone" dataKey="qualified" stackId="1" stroke={CHART_COLORS.qualified} fill={CHART_COLORS.qualified} fillOpacity={0.3} name="Calificados" />
                              <Area type="monotone" dataKey="warm" stackId="1" stroke={CHART_COLORS.warm} fill={CHART_COLORS.warm} fillOpacity={0.3} name="Tibios" />
                              <Area type="monotone" dataKey="cold" stackId="1" stroke={CHART_COLORS.cold} fill={CHART_COLORS.cold} fillOpacity={0.3} name="Fríos" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="status">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Distribución por Estado</CardTitle>
                          <CardDescription>Proporción de empresas por estado de evaluación</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={statusChartData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="count"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {statusChartData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        entry.status === 'SUITABLE' ? CHART_COLORS.qualified :
                                          entry.status === 'POTENTIAL' ? CHART_COLORS.warm : CHART_COLORS.cold
                                      }
                                    />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Detalle por Estado</CardTitle>
                          <CardDescription>Distribución porcentual de estados</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {statusChartData.map((item) => (
                              <div key={item.status} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{item.label}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {item.count} ({dashboardData.stats.totalCompanies > 0
                                      ? Math.round((item.count / dashboardData.stats.totalCompanies) * 100)
                                      : 0}%)
                                  </span>
                                </div>
                                <Progress
                                  value={dashboardData.stats.totalCompanies > 0
                                    ? (item.count / dashboardData.stats.totalCompanies) * 100
                                    : 0}
                                  className="h-2"
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="location">
                    <Card>
                      <CardHeader>
                        <CardTitle>Distribución por Ubicación</CardTitle>
                        <CardDescription>Top 5 ubicaciones geográficas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={locationChartData}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="location" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill={CHART_COLORS.total} name="Empresas" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Sección de empresas */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Top Empresas por Puntuación */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top 5 Empresas</CardTitle>
                      <CardDescription>Empresas con mayor puntuación</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.topCompanies.map((company, index) => (
                          <div key={company.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{company.company_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(company.created_at).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{company.percentage}%</div>
                              <Badge className={getStatusColor(company.evaluation_status)}>
                                {getStatusLabel(company.evaluation_status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Empresas Recientes (versión compacta) */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Empresas Recientes</CardTitle>
                      <CardDescription>Últimas empresas añadidas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.recentCompanies.slice(0, 5).map((company) => (
                          <div key={company.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{company.company_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {company.geographic_location || 'Sin ubicación'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm">{company.percentage}%</div>
                              <Badge
                                variant="outline"
                                className={getStatusColor(company.evaluation_status)}
                              >
                                {getStatusLabel(company.evaluation_status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabla completa de empresas recientes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lista Completa de Empresas Recientes</CardTitle>
                    <CardDescription>Últimas 5 empresas evaluadas con detalles completos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="p-3 text-left font-medium">Empresa</th>
                              <th className="p-3 text-left font-medium">Ubicación</th>
                              <th className="p-3 text-left font-medium">Puntuación</th>
                              <th className="p-3 text-left font-medium">Estado</th>
                              <th className="p-3 text-left font-medium">Contacto</th>
                              <th className="p-3 text-left font-medium">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentCompanies.map((company) => (
                              <tr key={company.id} className="border-b hover:bg-muted/30">
                                <td className="p-3">
                                  <div>
                                    <p className="font-medium">{company.company_name}</p>
                                    {company.legal_id && (
                                      <p className="text-xs text-muted-foreground">{company.legal_id}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  {company.geographic_location || 'N/A'}
                                </td>
                                <td className="p-3">
                                  <div>
                                    <div className="font-medium">{company.percentage}%</div>
                                    <div className="text-xs text-muted-foreground">{company.total_score} pts</div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge className={getStatusColor(company.evaluation_status)}>
                                    {getStatusLabel(company.evaluation_status)}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  {company.primaryLead ? (
                                    <div>
                                      {company.primaryLead.name && (
                                        <p className="text-xs font-medium">{company.primaryLead.name}</p>
                                      )}
                                      {company.primaryLead.email && (
                                        <p className="text-xs text-muted-foreground">{company.primaryLead.email}</p>
                                      )}
                                    </div>
                                  ) : company.email ? (
                                    <p className="text-xs text-muted-foreground">{company.email}</p>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Sin contacto</span>
                                  )}
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {new Date(company.created_at).toLocaleDateString('es-ES')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}