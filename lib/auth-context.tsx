"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<string | null>
  register: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    })

    // Keep state in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return "Credenciales incorrectas"
      }
      return error.message
    }
    return null
  }

  async function register(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      if (error.message.includes("already registered")) {
        return "Este correo ya está registrado"
      }
      return error.message
    }
    return null
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut()
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
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
