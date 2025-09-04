'use client'

import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const menuItems = [
        { name: 'Inicio', icon: '🏠', href: '/dashboard', active: true },
        { name: 'Clientes', icon: '👥', href: '/dashboard/clients' },
        { name: 'Evaluaciones', icon: '📊', href: '/dashboard/evaluations' },
        { name: 'Contactos', icon: '📞', href: '/dashboard/contacts' },
        { name: 'Reportes', icon: '📈', href: '/dashboard/reports' },
        { name: 'Configuración', icon: '⚙️', href: '/dashboard/settings' },
    ];

    const stats = [
        { title: 'Total Clientes', value: '156', change: '+12%', color: 'text-blue-600' },
        { title: 'Clientes Aptos', value: '89', change: '+8%', color: 'text-green-600' },
        { title: 'En Evaluación', value: '23', change: '+5%', color: 'text-yellow-600' },
        { title: 'No Aptos', value: '44', change: '-3%', color: 'text-red-600' },
    ];

    const recentEvaluations = [
        { company: 'TechCorp SA', score: 85, status: 'SUITABLE', date: '2024-03-15' },
        { company: 'Innovate Ltd', score: 72, status: 'POTENTIAL', date: '2024-03-14' },
        { company: 'StartupXYZ', score: 45, status: 'NOT_SUITABLE', date: '2024-03-13' },
        { company: 'GlobalTech', score: 91, status: 'SUITABLE', date: '2024-03-12' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUITABLE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'POTENTIAL': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'NOT_SUITABLE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'SUITABLE': return 'Apto';
            case 'POTENTIAL': return 'Potencial';
            case 'NOT_SUITABLE': return 'No Apto';
            default: return status;
        }
    };

    return (
        <div className={`${darkMode ? 'dark' : ''}`}>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out`}>
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <h1 className={`font-bold text-xl text-gray-800 dark:text-white ${!sidebarOpen && 'hidden'}`}>
                            EvalClient
                        </h1>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <nav className="mt-6">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                                    item.active 
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className={`ml-3 font-medium ${!sidebarOpen && 'hidden'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    {/* Toggle Dark Mode */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="flex items-center w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
                            <span className={`ml-3 font-medium ${!sidebarOpen && 'hidden'}`}>
                                {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                                <p className="text-gray-600 dark:text-gray-300">Bienvenido al sistema de evaluación de clientes</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                                    + Nuevo Cliente
                                </button>
                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                        </div>
                                        <div className={`text-sm font-medium ${stat.color}`}>
                                            {stat.change}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Evaluations */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                            <div className="px-6 py-4 border-b dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evaluaciones Recientes</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Empresa
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Puntuación
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Fecha
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {recentEvaluations.map((evaluation, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {evaluation.company}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {evaluation.score}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(evaluation.status)}`}>
                                                        {getStatusText(evaluation.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {evaluation.date}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}