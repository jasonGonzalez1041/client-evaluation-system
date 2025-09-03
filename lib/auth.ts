// lib/auth.ts
import jwt from 'jsonwebtoken'
import { supabase } from './supabase'
import { AuthResponse, AdminUser } from '@/types'

const JWT_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'fallback-secret'

// Verificar credenciales de administrador
export const authenticateAdmin = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  // En una aplicación real, deberías usar bcrypt para comparar contraseñas
  // Aquí simplificamos con una comparación directa (no seguro para producción)
  if (data.password !== password) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  // Actualizar último login
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.id)

  // Generar token JWT
  const token = jwt.sign(
    { id: data.id, email: data.email, name: data.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  return { 
    success: true, 
    token, 
    user: { 
      id: data.id, 
      email: data.email, 
      name: data.name 
    } 
  }
}

// Verificar token JWT
export const verifyAuthToken = (token: string): { id: string; email: string; name: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string }
  } catch (error) {
    return null
  }
}