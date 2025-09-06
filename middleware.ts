// middleware.ts (en la raíz de tu proyecto)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Rutas que requieren autenticación
    const protectedPaths = ['/dashboard']

    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath) {
        // Verificar si existe sesión en cookies
        const adminSession = request.cookies.get('adminSession')

        if (!adminSession) {
            // Redirigir a login si no hay sesión
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            // Verificar que la sesión sea válida
            const sessionData = JSON.parse(adminSession.value)
            const loginTime = new Date(sessionData.loginTime)
            const now = new Date()
            const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

            // Sesión expira después de 8 horas
            if (hoursDiff > 8) {
                const response = NextResponse.redirect(new URL('/login', request.url))
                response.cookies.delete('adminSession')
                return response
            }
        } catch (error) {
            // Si hay error al parsear, redirigir a login
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*']
}