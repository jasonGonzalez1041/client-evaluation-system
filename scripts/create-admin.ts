// scripts/create-admin.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdmin() {
    try {
        // Datos del administrador inicial
        const adminData = {
            username: 'admin',
            password: 'admin123', // En producción, usa una contraseña fuerte
            first_name: 'Administrador',
            last_name: 'Sistema',
            email: 'admin@alphalatam.com',
            is_active: true
        }

        // Verificar si ya existe un admin con ese username
        const existingAdmin = await prisma.adminUser.findUnique({
            where: { username: adminData.username }
        })

        if (existingAdmin) {
            console.log('❌ Admin user already exists with username:', adminData.username)
            return
        }

        // Crear el usuario administrador
        const newAdmin = await prisma.adminUser.create({
            data: {
                ...adminData,
            }
        })

        console.log('✅ Admin user created successfully:')
        console.log({
            id: newAdmin.id,
            username: newAdmin.username,
            email: newAdmin.email,
            first_name: newAdmin.first_name,
            last_name: newAdmin.last_name,
            is_active: newAdmin.is_active,
            created_at: newAdmin.created_at
        })

        console.log('\n📝 Login credentials:')
        console.log(`Username: ${adminData.username}`)
        console.log(`Password: ${adminData.password}`)
        console.log('\n⚠️  Remember to change the password after first login!')

    } catch (error) {
        console.error('❌ Error creating admin user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

// Ejecutar el script
createAdmin()
    .catch((error) => {
        console.error('Script failed:', error)
        process.exit(1)
    })