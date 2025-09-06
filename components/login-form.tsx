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

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {
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
                                Inicia sesión con tu cuenta de Google o email
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                <Button variant="outline" className="w-full" >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Iniciar sesión con Google
                                </Button>
                            </div>
                            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  O continúa con
                </span>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <a
                                            href="#"
                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </a>
                                    </div>
                                    <Input id="password" type="password" required />
                                </div>
                                <Button type="submit" className="w-full">
                                    Iniciar sesión
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                ¿No tienes una cuenta?{" "}
                                <a href="#" className="underline underline-offset-4">
                                    Regístrate
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-muted-foreground text-center text-xs text-balance">
                Al hacer clic en continuar, aceptas nuestros{" "}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Términos de Servicio
                </a>{" "}
                y{" "}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Política de Privacidad
                </a>
                .
            </div>
        </div>
    )
}