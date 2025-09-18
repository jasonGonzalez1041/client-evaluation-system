/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Send,
    Bot,
    User,
    MessageCircle,
    Trash2,
    Copy,
    CheckCircle,
    AlertCircle,
    Lightbulb,
    BarChart3,
    Users,
    Building
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    queryUsed?: string
    explanation?: string
    resultCount?: number
    error?: boolean
}

interface SuggestedQuestion {
    question: string
    icon: any
    category: string
}

const suggestedQuestions: SuggestedQuestion[] = [
    {
        question: "¿Cuántos leads tengo en total?",
        icon: Users,
        category: "Conteo"
    },
    {
        question: "Mostrar las 5 empresas con más leads",
        icon: BarChart3,
        category: "Ranking"
    },
    {
        question: "¿Cuáles empresas están marcadas como aptas?",
        icon: Building,
        category: "Estado"
    },
    {
        question: "Leads creados en los últimos 7 días",
        icon: AlertCircle,
        category: "Tiempo"
    },
    {
        question: "¿Cuántas empresas hay por cada estado de evaluación?",
        icon: BarChart3,
        category: "Estadísticas"
    },
    {
        question: "Mostrar leads de tipo direcciones con información de contacto",
        icon: Users,
        category: "Contactos"
    },
    {
        question: "Empresas con puntaje de evaluación mayor a 70%",
        icon: Building,
        category: "Calificación"
    },
    {
        question: "¿Cuántos leads tiene la empresa [nombre]?",
        icon: Users,
        category: "Específico"
    }
]

export default function MCPPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Mensaje de bienvenida
        if (user && messages.length === 0) {
            setMessages([{
                id: '1',
                role: 'assistant',
                content: '¡Hola! Soy tu asistente de CRM. Puedo ayudarte a consultar información sobre tus leads y empresas. Pregúntame cualquier cosa sobre tus datos.',
                timestamp: new Date()
            }])
        }
    }, [user, messages.length])

    const sendMessage = async (messageText?: string) => {
        const messageToSend = messageText || inputMessage.trim()

        if (!messageToSend || isLoading) return

        setError(null)
        setInputMessage("")
        setIsLoading(true)

        // Agregar mensaje del usuario
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: messageToSend,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])

        try {
            const response = await fetch('/api/mcp/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Error en la respuesta')
            }

            const data = await response.json()

            // Agregar respuesta del asistente
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                queryUsed: data.queryUsed,
                explanation: data.explanation,
                resultCount: data.resultCount,
                error: data.error
            }

            setMessages(prev => [...prev, assistantMessage])

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')

            // Agregar mensaje de error
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo.',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const clearChat = () => {
        setMessages([{
            id: '1',
            role: 'assistant',
            content: '¡Hola! Soy tu asistente de CRM. Puedo ayudarte a consultar información sobre tus leads y empresas. Pregúntame cualquier cosa sobre tus datos.',
            timestamp: new Date()
        }])
        setError(null)
    }

    const copyMessage = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content)
            setCopiedMessageId(messageId)
            setTimeout(() => setCopiedMessageId(null), 2000)
        } catch (err) {
            console.error('Error copying message:', err)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
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
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 h-[calc(100vh-var(--header-height)-2rem)]">

                            {/* Header */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-6">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-6 w-6" />
                                    <h1 className="text-2xl font-bold">Asistente CRM</h1>
                                </div>
                                <Button
                                    onClick={clearChat}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Limpiar Chat
                                </Button>
                            </div>

                            {error && (
                                <div className="px-4 lg:px-6">
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            <div className="flex flex-col lg:flex-row gap-4 px-4 lg:px-6 flex-1 min-h-0">

                                {/* Chat Area */}
                                <Card className="flex-1 flex flex-col min-h-0">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg">Chat</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col min-h-0 p-0">

                                        {/* Messages */}
                                        <ScrollArea className="flex-1 px-6">
                                            <div className="space-y-4 pb-4">
                                                {messages.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        {message.role === 'assistant' && (
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <Bot className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                        )}

                                                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                                                            <div className={`rounded-lg px-4 py-2 ${message.role === 'user'
                                                                    ? 'bg-blue-500 text-white ml-auto'
                                                                    : 'bg-gray-100 text-gray-900'
                                                                }`}>
                                                                <div className="whitespace-pre-wrap break-words">
                                                                    {message.content}
                                                                </div>
                                                            </div>

                                                            <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                                                }`}>
                                                                <span>
                                                                    {message.timestamp.toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>

                                                                {message.role === 'assistant' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-auto p-1 hover:bg-gray-200"
                                                                        onClick={() => copyMessage(message.content, message.id)}
                                                                    >
                                                                        {copiedMessageId === message.id ? (
                                                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                                                        ) : (
                                                                            <Copy className="h-3 w-3" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            {/* Query info (en modo desarrollo o cuando hay error) */}
                                                            {message.role === 'assistant' && (message.queryUsed || message.error) && (
                                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                                    {message.error && (
                                                                        <div className="text-red-600 mb-1">
                                                                            ⚠️ Error en la consulta
                                                                        </div>
                                                                    )}
                                                                    {message.explanation && (
                                                                        <div className="text-gray-600 mb-1">
                                                                            <strong>Explicación:</strong> {message.explanation}
                                                                        </div>
                                                                    )}
                                                                    {message.resultCount !== undefined && (
                                                                        <div className="text-gray-600 mb-1">
                                                                            <strong>Resultados:</strong> {message.resultCount} encontrados
                                                                        </div>
                                                                    )}
                                                                    {message.queryUsed && process.env.NODE_ENV === 'development' && (
                                                                        <details>
                                                                            <summary className="cursor-pointer text-gray-500">
                                                                                Ver consulta Prisma
                                                                            </summary>
                                                                            <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                                                                                {message.queryUsed}
                                                                            </pre>
                                                                        </details>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {message.role === 'user' && (
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-green-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {isLoading && (
                                                    <div className="flex gap-3 justify-start">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <Bot className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                                                            <div className="flex space-x-1">
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div ref={messagesEndRef} />
                                            </div>
                                        </ScrollArea>

                                        {/* Input Area */}
                                        <div className="border-t p-4">
                                            <div className="flex gap-2">
                                                <Input
                                                    ref={inputRef}
                                                    placeholder="Pregúntame sobre tus leads y empresas..."
                                                    value={inputMessage}
                                                    onChange={(e) => setInputMessage(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    disabled={isLoading}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    onClick={() => sendMessage()}
                                                    disabled={!inputMessage.trim() || isLoading}
                                                    size="sm"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Suggestions Sidebar */}
                                <Card className="w-full lg:w-80 flex-shrink-0">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Lightbulb className="h-5 w-5" />
                                            Preguntas Sugeridas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {suggestedQuestions.map((suggestion, index) => {
                                            const IconComponent = suggestion.icon
                                            return (
                                                <div key={index}>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left h-auto py-3 px-3"
                                                        onClick={() => sendMessage(suggestion.question)}
                                                        disabled={isLoading}
                                                    >
                                                        <div className="flex items-start gap-2 w-full">
                                                            <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium break-words">
                                                                    {suggestion.question}
                                                                </div>
                                                                <Badge variant="secondary" className="text-xs mt-1">
                                                                    {suggestion.category}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                    {index < suggestedQuestions.length - 1 && (
                                                        <Separator className="mt-3" />
                                                    )}
                                                </div>
                                            )
                                        })}
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