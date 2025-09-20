/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import bcrypt from 'bcryptjs' // ← DESCOMENTAR cuando vayas a usar bcrypt

/**
 * PUT - Actualiza el perfil del usuario actual o cambia su contraseña
 * Solo puede modificar su propia información
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, username, firstName, lastName, email, currentPassword, newPassword } = body

        console.log('=== INICIO DEBUG SETTINGS API ===')
        console.log('Request body completo:', body)
        console.log('userId recibido:', userId)
        console.log('currentPassword recibido:', currentPassword ? 'SÍ (oculto)' : 'NO')
        console.log('newPassword recibido:', newPassword ? 'SÍ (oculto)' : 'NO')
        console.log('username recibido:', username)
        console.log('firstName recibido:', firstName)
        console.log('lastName recibido:', lastName)
        console.log('email recibido:', email)

        // Validar que se envíe el userId
        if (!userId) {
            console.log('❌ ERROR: userId no proporcionado')
            return NextResponse.json(
                { message: 'ID de usuario requerido' },
                { status: 400 }
            )
        }

        // Obtener usuario actual de la base de datos
        console.log('🔍 Buscando usuario en la base de datos...')
        const currentUser = await prisma.adminUser.findUnique({
            where: { id: userId }
        })

        if (!currentUser) {
            console.log('❌ ERROR: Usuario no encontrado en la base de datos')
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        console.log('✅ Usuario encontrado:', {
            id: currentUser.id,
            username: currentUser.username,
            passwordExists: currentUser.password ? 'SÍ' : 'NO',
            passwordLength: currentUser.password ? currentUser.password.length : 0
        })

        // Si se está cambiando la contraseña
        if (currentPassword && newPassword) {
            console.log('🔑 ENTRANDO EN LÓGICA DE CAMBIO DE CONTRASEÑA')
            console.log('currentPassword recibida:', currentPassword ? 'Longitud: ' + currentPassword.length : 'VACÍA')
            console.log('newPassword recibida:', newPassword ? 'Longitud: ' + newPassword.length : 'VACÍA')
            console.log('Contraseña actual en BD:', currentUser.password ? 'Longitud: ' + currentUser.password.length : 'VACÍA')

            // Verificar contraseña actual
            const isCurrentPasswordValid = currentPassword === currentUser.password
            console.log('¿Contraseña actual es válida?', isCurrentPasswordValid)
            console.log('Comparación:', {
                enviada: currentPassword,
                enBD: currentUser.password,
                sonIguales: currentPassword === currentUser.password
            })

            if (!isCurrentPasswordValid) {
                console.log('❌ ERROR: Contraseña actual incorrecta')
                return NextResponse.json(
                    { message: 'La contraseña actual es incorrecta' },
                    { status: 400 }
                )
            }

            if (newPassword.length < 8) {
                console.log('❌ ERROR: Nueva contraseña muy corta:', newPassword.length)
                return NextResponse.json(
                    { message: 'La nueva contraseña debe tener al menos 8 caracteres' },
                    { status: 400 }
                )
            }

            console.log('✅ Validaciones de contraseña pasadas, actualizando en BD...')

            // Actualizar solo la contraseña
            const updateResult = await prisma.adminUser.update({
                where: { id: userId },
                data: {
                    password: newPassword,
                    updated_at: new Date()
                }
            })

            console.log('✅ Contraseña actualizada exitosamente:', {
                userId: updateResult.id,
                newPasswordLength: updateResult.password.length,
                updatedAt: updateResult.updated_at
            })

            return NextResponse.json(
                { message: 'Contraseña actualizada correctamente' },
                { status: 200 }
            )
        }

        // Si se está actualizando el perfil
        if (username || firstName !== undefined || lastName !== undefined || email !== undefined) {
            console.log('👤 ENTRANDO EN LÓGICA DE ACTUALIZACIÓN DE PERFIL')

            // Validaciones
            if (username && username.length < 3) {
                console.log('❌ ERROR: Username muy corto')
                return NextResponse.json(
                    { message: 'El nombre de usuario debe tener al menos 3 caracteres' },
                    { status: 400 }
                )
            }

            // Validar formato de email si se proporciona
            if (email && email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                console.log('❌ ERROR: Formato de email inválido')
                return NextResponse.json(
                    { message: 'Formato de email inválido' },
                    { status: 400 }
                )
            }

            // Verificar si username ya existe (solo si es diferente al actual)
            if (username && username !== currentUser.username) {
                console.log('🔍 Verificando si username existe...')
                const existingUser = await prisma.adminUser.findUnique({
                    where: { username }
                })

                if (existingUser) {
                    console.log('❌ ERROR: Username ya existe')
                    return NextResponse.json(
                        { message: 'El nombre de usuario ya existe' },
                        { status: 409 }
                    )
                }
            }

            // Verificar si email ya existe (solo si es diferente al actual)
            if (email && email.trim() !== '' && email !== currentUser.email) {
                console.log('🔍 Verificando si email existe...')
                const existingEmail = await prisma.adminUser.findUnique({
                    where: { email }
                })

                if (existingEmail) {
                    console.log('❌ ERROR: Email ya existe')
                    return NextResponse.json(
                        { message: 'El email ya está registrado' },
                        { status: 409 }
                    )
                }
            }

            // Preparar datos para actualizar
            const updateData: any = {
                updated_at: new Date()
            }

            if (username) updateData.username = username
            if (firstName !== undefined) updateData.first_name = firstName || null
            if (lastName !== undefined) updateData.last_name = lastName || null
            if (email !== undefined) updateData.email = email.trim() !== '' ? email : null

            console.log('📝 Datos a actualizar:', updateData)

            // Actualizar usuario
            const updatedUser = await prisma.adminUser.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    is_active: true,
                    last_login: true,
                    created_at: true,
                    updated_at: true,
                }
            })

            console.log('✅ Perfil actualizado exitosamente:', updatedUser)
            return NextResponse.json(updatedUser, { status: 200 })
        }

        console.log('❌ ERROR: No se proporcionaron datos para actualizar')
        return NextResponse.json(
            { message: 'No se proporcionaron datos para actualizar' },
            { status: 400 }
        )

    } catch (error) {
        console.error('💥 ERROR CRÍTICO en settings API:', error)
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
        return NextResponse.json(
            { message: 'Error al actualizar la configuración' },
            { status: 500 }
        )
    } finally {
        console.log('=== FIN DEBUG SETTINGS API ===\n')
    }
}