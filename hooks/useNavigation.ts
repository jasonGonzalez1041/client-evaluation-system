// hooks/useNavigation.ts
"use client"

import { usePathname } from 'next/navigation'

export function useNavigation() {
  const pathname = usePathname()
  
  const isActive = (url: string, items?: { url: string }[]) => {
    if (pathname === url) return true
    if (items) {
      return items.some(item => pathname === item.url)
    }
    return false
  }

  return { isActive, currentPath: pathname }
}