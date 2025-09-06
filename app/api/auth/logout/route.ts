// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ success: true })

    // Eliminar cookie
    response.cookies.set('adminSession', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expira inmediatamente
        path: '/'
    })

    return response
}