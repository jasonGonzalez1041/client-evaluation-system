/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auth.ts
import { NextRequest } from 'next/server';

export interface SessionData {
    id: string;
    username: string;
    loginTime: string;
    [key: string]: any; // Para propiedades adicionales que puedas necesitar
}

/**
 * Obtiene los datos de la sesión de un usuario a partir de las cookies
 * @param request - Objeto de la solicitud de Next.js
 * @returns Los datos de la sesión o null si no existe
 */
export function getSessionData(request: NextRequest): SessionData | null {
    try {
        const sessionCookie = request.cookies.get('adminSession');

        if (!sessionCookie || !sessionCookie.value) {
            return null;
        }

        const sessionData = JSON.parse(sessionCookie.value);

        // Verificar si la sesión ha expirado (8 horas)
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        if (hoursDiff >= 8) {
            return null; // Sesión expirada
        }

        return sessionData;
    } catch (error) {
        console.error('Error parsing session data:', error);
        return null;
    }
}