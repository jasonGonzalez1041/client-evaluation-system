// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json()
        console.log('Request body:', { username, password: password ? '***' : undefined })
        // Validación de entrada
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        // Validación de tipos y longitud
        if (typeof username !== 'string' || typeof password !== 'string') {
            return NextResponse.json(
                { error: 'Invalid input format' },
                { status: 400 }
            )
        }

        if (username.length > 50 || password.length > 100) {
            return NextResponse.json(
                { error: 'Input too long' },
                { status: 400 }
            )
        }

        console.log('Attempting login for username:', username)

        // Buscar usuario en la base de datos
        const adminUser = await prisma.adminUser.findUnique({
            where: { username: username.toLowerCase().trim() },
            select: {
                id: true,
                username: true,
                password: true,
                first_name: true,
                last_name: true,
                email: true,
                is_active: true,
                last_login: true
            }
        })

        // Verificar si el usuario existe y está activo
        if (!adminUser) {
            console.log('User not found:', username)
            // Usar el mismo mensaje de error para evitar enumeration attacks
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        if (!adminUser.is_active) {
            console.log('User account is inactive:', username)
            return NextResponse.json(
                { error: 'Account is inactive' },
                { status: 401 }
            )
        }

        console.log('User found and active:', adminUser.username)

        // Verificar contraseña
        // NOTA: En producción, usa bcrypt.compare() para contraseñas hasheadas
        const isValidPassword = password === adminUser.password
        // Para contraseñas hasheadas:
        // const isValidPassword = await bcrypt.compare(password, adminUser.password)

        if (!isValidPassword) {
            console.log('Invalid password for user:', username)
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        console.log('Password verified for user:', username)

        // Actualizar last_login
        try {
            await prisma.adminUser.update({
                where: { id: adminUser.id },
                data: { last_login: new Date() }
            })
            console.log('Updated last_login for user:', username)
        } catch (updateError) {
            console.error('Error updating last_login:', updateError)
            // Continuar con el login aunque falle la actualización
        }

        // Crear datos de sesión con información ampliada
        const sessionData = {
            id: adminUser.id,
            username: adminUser.username,
            first_name: adminUser.first_name,
            last_name: adminUser.last_name,
            email: adminUser.email,
            loginTime: new Date().toISOString()
        }

        // Crear respuesta exitosa
        const response = NextResponse.json({
            success: true,
            user: {
                id: adminUser.id,
                username: adminUser.username,
                first_name: adminUser.first_name,
                last_name: adminUser.last_name,
                email: adminUser.email
            }
        }, { status: 200 })

        // Establecer cookie httpOnly para mayor seguridad
        response.cookies.set('adminSession', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60, // 8 horas
            path: '/'
        })

        console.log('Login successful for user:', username)
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