"use client"
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SessionData } from '@/lib/auth'

export interface User extends SessionData {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = useCallback(() => {
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
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Error checking auth:', error)
            logout()
        } finally {
            setIsLoading(false)
        }
    }, [])

    const updateSession = useCallback((updatedData: Partial<User>) => {
        try {
            const sessionData = localStorage.getItem('adminSession')
            if (sessionData) {
                const userData = JSON.parse(sessionData)
                const updatedUser = { ...userData, ...updatedData }

                // Actualizar localStorage
                localStorage.setItem('adminSession', JSON.stringify(updatedUser))

                // Actualizar estado
                setUser(updatedUser)

                return true
            }
            return false
        } catch (error) {
            console.error('Error updating session:', error)
            return false
        }
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('adminSession')
        document.cookie = 'adminSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        setUser(null)
        router.push('/login')
    }, [router])

    const isAuthenticated = !!user

    return {
        user,
        isAuthenticated,
        isLoading,
        logout,
        checkAuth,
        updateSession
    }
}