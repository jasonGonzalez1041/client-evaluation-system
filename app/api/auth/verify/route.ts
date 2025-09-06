// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get('adminSession')

        if (!sessionCookie) {
            return NextResponse.json(
                { error: 'No session found' },
                { status: 401 }
            )
        }

        const sessionData = JSON.parse(sessionCookie.value)

        // Verificar si la sesión no ha expirado (8 horas)
        const loginTime = new Date(sessionData.loginTime)
        const now = new Date()
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

        if (hoursDiff >= 8) {
            // Sesión expirada, eliminar cookie
            const response = NextResponse.json(
                { error: 'Session expired' },
                { status: 401 }
            )
            response.cookies.delete('adminSession')
            return response
        }

        return NextResponse.json({
            success: true,
            user: sessionData
        })

    } catch (error) {
        console.error('Verify error:', error)
        return NextResponse.json(
            { error: 'Invalid session' },
            { status: 401 }
        )
    }
}