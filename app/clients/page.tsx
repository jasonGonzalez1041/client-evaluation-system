/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
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
import { AlertCircle } from "lucide-react"

interface Client {
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
  contacts: any[]
  lastEvaluation?: any
}

interface ClientsResponse {
  clients: Client[]
  totalCount: number
  page: number
  pageSize: number
}

export default function ClientsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isExporting, setIsExporting] = useState(false)

  const fetchClients = async () => {
    try {
      setError(null)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: searchTerm,
        status: statusFilter,
        sortBy: sortField,
        sortOrder: sortDirection
      })

      const response = await fetch(`/api/clients?${params}`)

      if (!response.ok) {
        throw new Error('Error al cargar los clientes')
      }

      const data: ClientsResponse = await response.json()
      setClients(data.clients)
      setTotalCount(data.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && !authLoading) {
      fetchClients()
    }
  }, [user, authLoading, page, pageSize, searchTerm, statusFilter, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        sortBy: sortField,
        sortOrder: sortDirection
      })

      const response = await fetch(`/api/clients/export?${params}&format=${format}`)
      
      if (!response.ok) {
        throw new Error(`Error al exportar ${format}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clientes.${format === 'pdf' ? 'pdf' : 'xlsx'}`
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

  const totalPages = Math.ceil(totalCount / pageSize)

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
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-6">
                <h1 className="text-2xl font-bold">Clientes</h1>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(1)
                      }}
                      className="pl-8"
                    />
                  </div>
                  
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="SUITABLE">Apto</SelectItem>
                      <SelectItem value="POTENTIAL">Potencial</SelectItem>
                      <SelectItem value="NOT_SUITABLE">No Apto</SelectItem>
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

              {/* Error state */}
              {error && (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                      <Button
                        onClick={fetchClients}
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
                          onClick={() => handleSort("company_name")}
                        >
                          <div className="flex items-center">
                            Empresa
                            {sortField === "company_name" && (
                              sortDirection === "asc" ? 
                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSort("percentage")}
                        >
                          <div className="flex items-center">
                            Puntuación
                            {sortField === "percentage" && (
                              sortDirection === "asc" ? 
                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSort("evaluation_status")}
                        >
                          <div className="flex items-center">
                            Estado
                            {sortField === "evaluation_status" && (
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
                          </TableRow>
                        ))
                      ) : clients.length > 0 ? (
                        clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{client.company_name}</div>
                                {client.legal_id && (
                                  <div className="text-sm text-muted-foreground">
                                    {client.legal_id}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{client.geographic_location || "N/A"}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{client.percentage}%</div>
                                <div className="text-sm text-muted-foreground">
                                  {client.total_score} pts
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  client.evaluation_status === "SUITABLE"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : client.evaluation_status === "POTENTIAL"
                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                              >
                                {client.evaluation_status === "SUITABLE"
                                  ? "Apto"
                                  : client.evaluation_status === "POTENTIAL"
                                  ? "Potencial"
                                  : "No Apto"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {client.contacts && client.contacts.length > 0 ? (
                                <div>
                                  <div className="font-medium">
                                    {client.contacts[0].name || "Sin nombre"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {client.contacts[0].email || "Sin email"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Sin contacto</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(client.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No se encontraron clientes.
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
                        {[5, 10, 20].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Página {page} de {totalPages}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
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