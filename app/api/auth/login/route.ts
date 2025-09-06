// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }
        console.log('Buscar usuario en la base de datos:', username)

        // Buscar usuario en la base de datos
        const adminUser = await prisma.adminUser.findUnique({
            where: { username: username },
        })
        //  Si no se encuentra un usuario
        if (!adminUser || !adminUser.is_active) {
            console.log('Found user:', adminUser)
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }
        console.log('Se encuentró un usuario:', adminUser)
        // Verificar contraseña
        const isValidPassword = password.toString() == adminUser.password
        console.log('Verificar contraseña (son iguales):', isValidPassword)
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }
        console.log('Actualizar last_login:', {
            where: { id: adminUser.id },
            data: { last_login: new Date() }
        })
        // Actualizar last_login
        await prisma.adminUser.update({
            where: { id: adminUser.id },
            data: { last_login: new Date() }
        })

        // Crear sesión
        const sessionData = {
            id: adminUser.id,
            username: adminUser.username,
            loginTime: new Date().toISOString()
        }
        console.log('Crear sesión:', sessionData)
        // Crear respuesta con cookie
        const response = NextResponse.json(
            {
                success: true,
                user: {
                    id: adminUser.id,
                    username: adminUser.username,
                    first_name: adminUser.first_name,
                    last_name: adminUser.last_name
                }
            },
            { status: 200 }
        )
        console.log('Crear respuesta con cookie:', {
            success: true,
            user: {
                id: adminUser.id,
                username: adminUser.username,
                first_name: adminUser.first_name,
                last_name: adminUser.last_name
            }
        })

        // Establecer cookie httpOnly para mayor seguridad
        response.cookies.set('adminSession', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 // 8 horas
        })
        console.log('Establecer cookie httpOnly para mayor seguridad: ', response)
        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// app/api/auth/logout/route.ts
/*export async function POST() {
    const response = NextResponse.json({success: true})

    // Eliminar cookie
    response.cookies.delete('adminSession')

    return response
}*/