"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { toast } from "sonner"

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Llamar a tu API route en lugar de Supabase directamente
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || "Error al iniciar sesión")
                return
            }

            if (data.success) {
                // Guardar también en localStorage para compatibilidad con useAuth
                localStorage.setItem('adminSession', JSON.stringify({
                    id: data.user.id,
                    username: data.user.username,
                    loginTime: new Date().toISOString()
                }))

                toast.success("Inicio de sesión exitoso")
                router.push('/dashboard')
            }

        } catch (error) {
            console.error('Error en login:', error)
            toast.error("Error al iniciar sesión")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <Image
                            src="/AlphaLogo.png"
                            alt="Alpha Latam"
                            width={120}
                            height={120}
                            className="h-30 w-auto"
                        />
                        <div>
                            <CardTitle className="text-xl">Bienvenido de vuelta</CardTitle>
                            <CardDescription>
                                Inicia sesión con tu cuenta de administrador
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="username">Usuario</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="tu_usuario"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Contraseña</Label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}