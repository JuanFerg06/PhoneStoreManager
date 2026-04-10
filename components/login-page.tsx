"use client"

import { useState, type FormEvent } from "react"
import { Smartphone, Eye, EyeOff, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginPage() {
  const { login, register } = useAuth()
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Por favor complete todos los campos")
      return
    }

    setIsSubmitting(true)
    const errorMsg = isRegisterMode
      ? await register(email, password)
      : await login(email, password)

    if (errorMsg) {
      setError(errorMsg)
    }
    setIsSubmitting(false)
  }

  function switchMode() {
    setIsRegisterMode((prev) => !prev)
    setError("")
    setEmail("")
    setPassword("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
            <Smartphone className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-balance text-center">PhoneStore Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sistema de Inventario y Ventas</p>
        </div>

        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {isRegisterMode ? "Crear cuenta" : "Iniciar Sesion"}
            </CardTitle>
            <CardDescription>
              {isRegisterMode
                ? "Registra un nuevo administrador"
                : "Ingrese sus credenciales para acceder"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tienda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contrasena</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contrasena"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isRegisterMode ? "new-password" : "current-password"}
                    className="bg-secondary border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : isRegisterMode ? (
                  <>
                    <UserPlus className="mr-2 size-4" />
                    Crear cuenta
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 size-4" />
                    Iniciar Sesion
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isRegisterMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="text-primary hover:underline font-medium"
          >
            {isRegisterMode ? "Inicia sesion" : "Registrate"}
          </button>
        </p>
      </div>
    </div>
  )
}
