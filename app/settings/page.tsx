"use client"
import { useToastContext } from '@/context/ToastContext';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Key, Save, Eye, EyeOff } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Esquemas de validación
const profileFormSchema = z.object({
    username: z.string().min(3, {
        message: "El nombre de usuario debe tener al menos 3 caracteres.",
    }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email({
        message: "Por favor, introduce un correo electrónico válido.",
    }).optional(),
})

const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, {
        message: "Por favor, introduce tu contraseña actual.",
    }),
    newPassword: z.string().min(8, {
        message: "La nueva contraseña debe tener al menos 8 caracteres.",
    }),
    confirmPassword: z.string().min(8, {
        message: "Por favor, confirma tu nueva contraseña.",
    }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

export default function SettingsPage() {
    const { showSuccess, showError, showWarning, showInfo } = useToastContext();
    const { user, isLoading: authLoading, updateSession } = useAuth()
    const [isSaving, setIsSaving] = useState(false)

    // Estados para mostrar/ocultar contraseñas
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Formulario del perfil
    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            username: "",
            firstName: "",
            lastName: "",
            email: "",
        },
    })

    // Formulario de la contraseña
    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    // Cargar datos del usuario desde la sesión al formulario
    useEffect(() => {
        if (user && !authLoading) {

            profileForm.reset({
                username: user.username || "",
                firstName: user.first_name || "",
                lastName: user.last_name || "",
                email: user.email || "",
            })
        }
    }, [user, authLoading, profileForm])

    // Manejar envío del formulario de perfil
    const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
        try {
            setIsSaving(true)

            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    userId: (user) ? user.id : null,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                showError('Error al guardar los cambios');
                throw new Error(errorData.message || 'Error al guardar los cambios')
            }

            updateSession({
                username: values.username,
                first_name: values.firstName || null,
                last_name: values.lastName || null,
                email: values.email || null
            })

            showSuccess('Perfil actualizado correctamente');

            // Desplazar la ventana al mensaje de notificación
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)

        } catch (err) {
            showError('Error al guardar los cambios');
        } finally {
            setIsSaving(false)
        }
    }

    // Manejar envío del formulario de contraseña
    const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
        try {
            setIsSaving(true)

            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: (user) ? user.id : null,
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al cambiar la contraseña')
            }

            showSuccess('Contraseña actualizada correctamente');

            // Resetear el formulario
            passwordForm.reset()

            // Desplazar la ventana al mensaje de notificación
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)

        } catch (err) {
            showError('Error al guardar los cambios');
        } finally {
            setIsSaving(false)
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
                    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        {/* Encabezado */}
                        <div className="flex flex-col space-y-1">
                            <h1 className="text-2xl font-bold">Configuración</h1>
                            <p className="text-muted-foreground">
                                Administra tu cuenta y preferencias
                            </p>
                        </div>

                        {/* Contenido principal */}
                        <Tabs defaultValue="profile" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="profile">Perfil</TabsTrigger>
                                <TabsTrigger value="password">Contraseña</TabsTrigger>
                            </TabsList>

                            {/* Pestaña de perfil */}
                            <TabsContent value="profile" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Información de perfil</CardTitle>
                                        <CardDescription>
                                            Actualiza tu información personal y datos de contacto
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...profileForm}>
                                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                                <FormField
                                                    control={profileForm.control}
                                                    name="username"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nombre de usuario</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="tu_usuario"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <FormField
                                                        control={profileForm.control}
                                                        name="firstName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Nombre</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Tu nombre" {...field} value={field.value || ''} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={profileForm.control}
                                                        name="lastName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Apellido</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Tu apellido" {...field} value={field.value || ''} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <FormField
                                                    control={profileForm.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Correo electrónico</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="tu@ejemplo.com"
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Este correo se usará para notificaciones y recuperación de cuenta
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex justify-end">
                                                    <Button type="submit" disabled={isSaving}>
                                                        {isSaving ? (
                                                            <span className="flex items-center gap-2">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-foreground"></div>
                                                                Guardando...
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-2">
                                                                <Save className="h-4 w-4" />
                                                                Guardar cambios
                                                            </span>
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                    {user && (
                                        <CardFooter className="flex flex-col items-start border-t px-6 py-4">
                                            <p className="text-sm text-muted-foreground">
                                                Cuenta creada el: {new Date(user.loginTime).toLocaleString()}
                                            </p>
                                        </CardFooter>
                                    )}
                                </Card>
                            </TabsContent>

                            {/* Pestaña de contraseña */}
                            <TabsContent value="password" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Cambiar contraseña</CardTitle>
                                        <CardDescription>
                                            Actualiza tu contraseña para mantener segura tu cuenta
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...passwordForm}>
                                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                                <FormField
                                                    control={passwordForm.control}
                                                    name="currentPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Contraseña actual</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type={showCurrentPassword ? "text" : "password"}
                                                                        placeholder="Ingresa tu contraseña actual"
                                                                        {...field}
                                                                        className="pr-10"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                    >
                                                                        {showCurrentPassword ? (
                                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Separator />

                                                <FormField
                                                    control={passwordForm.control}
                                                    name="newPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nueva contraseña</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type={showNewPassword ? "text" : "password"}
                                                                        placeholder="Ingresa tu nueva contraseña"
                                                                        {...field}
                                                                        className="pr-10"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                                    >
                                                                        {showNewPassword ? (
                                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </FormControl>
                                                            <FormDescription>
                                                                La contraseña debe tener al menos 8 caracteres
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={passwordForm.control}
                                                    name="confirmPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Confirmar contraseña</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type={showConfirmPassword ? "text" : "password"}
                                                                        placeholder="Confirma tu nueva contraseña"
                                                                        {...field}
                                                                        className="pr-10"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    >
                                                                        {showConfirmPassword ? (
                                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex justify-end">
                                                    <Button type="submit" disabled={isSaving}>
                                                        {isSaving ? (
                                                            <span className="flex items-center gap-2">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-foreground"></div>
                                                                Actualizando...
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-2">
                                                                <Key className="h-4 w-4" />
                                                                Cambiar contraseña
                                                            </span>
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}