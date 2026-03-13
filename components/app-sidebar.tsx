"use client"

import { useState } from "react"
import { LayoutDashboard, Package, ShoppingCart, LogOut, Smartphone, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type Page = "dashboard" | "inventory" | "sales"

interface AppSidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory" as const, label: "Inventario", icon: Package },
  { id: "sales" as const, label: "Ventas", icon: ShoppingCart },
]

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center")}>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="size-5 text-primary" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">PhoneStore</span>
                <span className="text-[11px] text-muted-foreground">Manager</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <span className={cn("mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground", collapsed && "sr-only")}>
            Menu
          </span>
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            const content = (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="size-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return content
          })}
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col gap-2 border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed ? "w-full justify-center" : "w-full justify-start"
            )}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4 mr-2" /><span>Colapsar</span></>}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className={cn(
                  "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                  collapsed ? "w-full justify-center" : "w-full justify-start"
                )}
              >
                <LogOut className="size-4" />
                {!collapsed && <span className="ml-2">Cerrar Sesion</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right" className="bg-popover text-popover-foreground">Cerrar Sesion</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
