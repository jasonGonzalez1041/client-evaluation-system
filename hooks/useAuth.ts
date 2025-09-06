// hooks/useAuth.ts
"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
    id: string
    username: string
    loginTime: string
}

export function useAuth() {
    const [user, setUser] = useState<AdminUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = () => {
        try {
            const sessionData = localStorage.getItem('adminSession')
            if (sessionData) {
                const userData = JSON.parse(sessionData)

                // Verificar si la sesión no ha expirado (8 horas)
                const loginTime = new Date(userData.loginTime)
                const now = new Date()
                const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

                if (hoursDiff < 8) {
                    setUser(userData)
                } else {
                    logout()
                }
            }
        } catch (error) {
            console.error('Error checking auth:', error)
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('adminSession')
        document.cookie = 'adminSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        setUser(null)
        router.push('/login')
    }

    const isAuthenticated = !!user

    return {
        user,
        isAuthenticated,
        isLoading,
        logout,
        checkAuth
    }
}