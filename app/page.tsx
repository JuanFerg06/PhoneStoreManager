"use client"

import { useState } from "react"
import { Toaster } from "sonner"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginPage } from "@/components/login-page"
import { AppSidebar, type Page } from "@/components/app-sidebar"
import { DashboardPage } from "@/components/dashboard-page"
import { InventoryPage } from "@/components/inventory-page"
import { SalesPage } from "@/components/sales-page"

function AppContent() {
  const { isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {currentPage === "dashboard" && <DashboardPage />}
          {currentPage === "inventory" && <InventoryPage />}
          {currentPage === "sales" && <SalesPage />}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.17 0.008 260)",
            border: "1px solid oklch(0.26 0.015 260)",
            color: "oklch(0.95 0.01 260)",
          },
        }}
      />
    </AuthProvider>
  )
}
