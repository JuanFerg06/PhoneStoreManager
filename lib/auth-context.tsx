"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const MOCK_USER = "admin"
const MOCK_PASS = "admin123"
const AUTH_KEY = "phonestore_auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  function login(username: string, password: string): boolean {
    if (username === MOCK_USER && password === MOCK_PASS) {
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_KEY, "true")
      return true
    }
    return false
  }

  function logout() {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_KEY)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
