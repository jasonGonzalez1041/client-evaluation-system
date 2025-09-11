/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardData {
  stats: {
    totalClients: number
    suitableClients: number
    potentialClients: number
    notSuitableClients: number
    averageScore: number
    averagePoints: number
  }
  charts: {
    monthlyClients: Array<{
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
  recentClients: Array<{
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
    primaryContact: any | null
    lastEvaluation: any | null
  }>
  topClients: Array<{
    id: string
    company_name: string
    percentage: number
    total_score: number
    evaluation_status: string
    created_at: string
  }>
}

export default function Page() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Estado no autorizado
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

              {/* Header con botón de refresh */}
              <div className="flex justify-between items-center px-4 lg:px-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>

              {/* Error state */}
              {error && (
                <div className="px-4 lg:px-6">
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
                </div>
              )}

              {/* Loading skeletons */}
              {isLoading ? (
                <>
                  <div className="px-4 lg:px-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-lg border p-4">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 lg:px-6">
                    <Skeleton className="h-80 w-full rounded-lg" />
                  </div>

                  <div className="px-4 lg:px-6">
                    <Skeleton className="h-96 w-full rounded-lg" />
                  </div>
                </>
              ) : dashboardData ? (
                <>
                  {/* Cards de estadísticas  */}
                  <SectionCards dashboardData={dashboardData} />

                  {/* Estadísticas personalizadas */}
                  <div className="px-4 lg:px-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total no aptos</h3>
                        <div className="text-2xl font-bold">{dashboardData.stats.notSuitableClients}</div>
                      </div>
                      {/* <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Leads</h3>
                        <div className="text-2xl font-bold text-green-600">{dashboardData.stats.suitableClients}</div>
                        <p className="text-xs text-muted-foreground">≥80% puntuación</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Potenciales</h3>
                        <div className="text-2xl font-bold text-yellow-600">{dashboardData.stats.potentialClients}</div>
                        <p className="text-xs text-muted-foreground">60-79% puntuación</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Promedio Score</h3>
                        <div className="text-2xl font-bold">{dashboardData.stats.averageScore}%</div>
                        <p className="text-xs text-muted-foreground">{dashboardData.stats.averagePoints} puntos</p>
                      </div> */}
                    </div>
                  </div>

                  {/* Gráfico interactivo - mantenemos el original */}
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive dashboardData={dashboardData} />
                  </div>

                  {/* Gráfico personalizado con datos de la API */}
                  <div className="px-4 lg:px-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-medium mb-4">Distribución por Estado</h3>
                      <div className="space-y-2">
                        {dashboardData.charts.statusDistribution.map((item) => (
                          <div key={item.status} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${item.status === 'SUITABLE' ? 'bg-green-500' :
                                    item.status === 'POTENTIAL' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${(item.count / dashboardData.stats.totalClients) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Clientes */}
                  <div className="px-4 lg:px-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-medium mb-4">Top 5 Clientes por Puntuación</h3>
                      <div className="space-y-3">
                        {dashboardData.topClients.map((client, index) => (
                          <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{client.company_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Creado: {new Date(client.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{client.percentage}%</div>
                              <div className={`text-xs px-2 py-1 rounded-full ${client.evaluation_status === 'SUITABLE' ? 'bg-green-100 text-green-800' :
                                client.evaluation_status === 'POTENTIAL' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {client.evaluation_status === 'SUITABLE' ? 'Apto' :
                                  client.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tabla de datos - mantenemos el original o creamos una tabla personalizada */}
                  <div className="px-4 lg:px-6">
                    <div className="rounded-lg border">
                      <div className="p-4 border-b">
                        <h3 className="text-lg font-medium">Clientes Recientes</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Empresa</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ubicación</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Puntuación</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Estado</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Contacto</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentClients.map((client) => (
                              <tr key={client.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="font-medium">{client.company_name}</p>
                                    {client.legal_id && (
                                      <p className="text-sm text-gray-500">{client.legal_id}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {client.geographic_location || 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm">
                                    <div className="font-medium">{client.percentage}%</div>
                                    <div className="text-gray-500">{client.total_score} pts</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${client.evaluation_status === 'SUITABLE' ? 'bg-green-100 text-green-800' :
                                    client.evaluation_status === 'POTENTIAL' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                    {client.evaluation_status === 'SUITABLE' ? 'Apto' :
                                      client.evaluation_status === 'POTENTIAL' ? 'Potencial' : 'No Apto'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {client.primaryContact ? (
                                    <div>
                                      {client.primaryContact.name && (
                                        <p className="font-medium">{client.primaryContact.name}</p>
                                      )}
                                      {client.primaryContact.email && (
                                        <p className="text-gray-500">{client.primaryContact.email}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Sin contacto</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {new Date(client.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}