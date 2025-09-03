// app/admin/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyAuthToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
// import AdminLayout from '@/components/AdminLayout'
import { Users, TrendingUp, CheckCircle, XCircle, Eye, Download } from 'lucide-react'
import { ClientWithRelations } from '@/types'

interface DashboardStats {
    total: number;
    aptos: number;
    potenciales: number;
    noAptos: number;
}

export default function AdminDashboard() {
    const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null)
    const [clients, setClients] = useState<ClientWithRelations[]>([])
    const [stats, setStats] = useState<DashboardStats>({ total: 0, aptos: 0, potenciales: 0, noAptos: 0 })
    const [loading, setLoading] = useState<boolean>(true)
    const router = useRouter()

    useEffect(() => {
        // Verificar autenticación
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)adminToken\s*=\s*([^;]*).*$)|^.*$/, '$1')
        const decoded = verifyAuthToken(token)

        if (!decoded) {
            router.push('/admin/login')
            return
        }

        setUser(decoded)
        fetchData()
    }, [router])

    const fetchData = async (): Promise<void> => {
        try {
            // Obtener clientes con sus evaluaciones
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select(`
          *,
          evaluations (*),
          business_opportunities (*),
          contacts (*)
        `)
                .order('created_at', { ascending: false })

            if (clientsError) throw clientsError

            setClients(clientsData || [])

            // Calcular estadísticas
            const total = clientsData.length
            const aptos = clientsData.filter(c => c.evaluations && c.evaluations[0]?.percentage >= 80).length
            const potenciales = clientsData.filter(c => c.evaluations && c.evaluations[0]?.percentage >= 60 && c.evaluations[0]?.percentage < 80).length
            const noAptos = clientsData.filter(c => !c.evaluations || c.evaluations[0]?.percentage < 60).length

            setStats({ total, aptos, potenciales, noAptos })
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = (): void => {
        // Crear CSV con los datos
        const headers = 'Empresa,Email,Contacto,Evaluación,Estado,Fecha\n'
        const csvData = clients.map(client => {
            const evaluation = client.evaluations && client.evaluations[0]
            const status = evaluation ?
                (evaluation.percentage >= 80 ? 'Apto' :
                    evaluation.percentage >= 60 ? 'Potencial' : 'No Apto') : 'Sin evaluar'
            const contact = client.contacts && client.contacts[0] ? client.contacts[0].name : 'N/A'

            return `"${client.company_name}","${client.email}","${contact}",${evaluation?.percentage || 'N/A'}%,${status},${new Date(client.created_at).toLocaleDateString()}\n`
        }).join('')

        const blob = new Blob([headers + csvData], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const handleLogout = (): void => {
        document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        router.push('/admin/login')
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout user={user} onLogout={handleLogout}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard de Clientes</h1>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                    </button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow flex items-center">
                        <Users className="text-blue-500 mr-4 h-8 w-8" />
                        <div>
                            <p className="text-sm text-gray-500">Total Clientes</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow flex items-center">
                        <CheckCircle className="text-green-500 mr-4 h-8 w-8" />
                        <div>
                            <p className="text-sm text-gray-500">Clientes Aptos</p>
                            <p className="text-2xl font-bold">{stats.aptos}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow flex items-center">
                        <TrendingUp className="text-yellow-500 mr-4 h-8 w-8" />
                        <div>
                            <p className="text-sm text-gray-500">Clientes Potenciales</p>
                            <p className="text-2xl font-bold">{stats.potenciales}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow flex items-center">
                        <XCircle className="text-red-500 mr-4 h-8 w-8" />
                        <div>
                            <p className="text-sm text-gray-500">Clientes No Aptos</p>
                            <p className="text-2xl font-bold">{stats.noAptos}</p>
                        </div>
                    </div>
                </div>

                {/* Lista de clientes */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Lista de Clientes Evaluados</h2>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Empresa
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Evaluación
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clients.map((client) => (
                                        <ClientRow key={client.id} client={client} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function ClientRow({ client }: { client: ClientWithRelations }) {
    const router = useRouter()
    const evaluation = client.evaluations && client.evaluations[0]

    const getStatusBadge = (percentage: number) => {
        if (percentage >= 80) {
            return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Apto</span>
        } else if (percentage >= 60) {
            return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Potencial</span>
        } else {
            return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">No Apto</span>
        }
    }

    const viewDetails = (): void => {
        router.push(`/admin/client/${client.id}`)
    }

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{client.company_name}</div>
                <div className="text-sm text-gray-500">{client.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {client.contacts && client.contacts[0]?.name || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                    {client.contacts && client.contacts[0]?.position || 'N/A'}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {evaluation ? `${evaluation.percentage}%` : 'No evaluado'}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {evaluation ? getStatusBadge(evaluation.percentage) : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(client.created_at!).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                    onClick={viewDetails}
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver detalles
                </button>
            </td>
        </tr>
    )
}