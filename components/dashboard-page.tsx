"use client"

import { useEffect, useState } from "react"
import { Package, Boxes, ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getProducts, getLowStockProducts } from "@/lib/services/products"
import { getTodaySales, getTodayRevenue, getRecentSales } from "@/lib/services/sales"
import type { Device, Sale } from "@/lib/types"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  accent?: boolean
}

function StatCard({ title, value, icon, description, accent }: StatCardProps) {
  return (
    <Card className="border-border/60 bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`flex size-10 items-center justify-center rounded-lg ${accent ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [lowStock, setLowStock] = useState<Device[]>([])
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [todaySalesCount, setTodaySalesCount] = useState(0)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [totalStock, setTotalStock] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setIsLoading(true)
    try {
      const [allDevices, lowStockDevices, todaySales, revenue, recent] = await Promise.all([
        getProducts(),
        getLowStockProducts(),
        getTodaySales(),
        getTodayRevenue(),
        getRecentSales(5),
      ])
      setDevices(allDevices)
      setLowStock(lowStockDevices)
      setTodaySalesCount(todaySales.length)
      setTodayRevenue(revenue)
      setRecentSales(recent)
      setTotalStock(allDevices.reduce((sum, d) => sum + d.quantity, 0))
    } catch {
      // fail silently — data will show as zeros/empty
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de tu tienda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Productos"
          value={isLoading ? "—" : devices.length}
          icon={<Package className="size-5" />}
          description="Dispositivos registrados"
        />
        <StatCard
          title="Stock Total"
          value={isLoading ? "—" : totalStock}
          icon={<Boxes className="size-5" />}
          description="Unidades en inventario"
        />
        <StatCard
          title="Ventas Hoy"
          value={isLoading ? "—" : todaySalesCount}
          icon={<ShoppingCart className="size-5" />}
          description="Transacciones del dia"
          accent
        />
        <StatCard
          title="Ingresos Hoy"
          value={isLoading ? "—" : `$${todayRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="size-5" />}
          description="Revenue del dia"
          accent
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              <CardTitle className="text-base">Alertas de Stock Bajo</CardTitle>
            </div>
            <CardDescription>Productos con 5 o menos unidades</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="size-5 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : lowStock.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Todos los productos tienen stock suficiente</p>
            ) : (
              <div className="flex flex-col gap-3">
                {lowStock.map((device) => (
                  <div key={device.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{device.brand} {device.model}</p>
                      <p className="text-xs text-muted-foreground">${device.price.toFixed(2)}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        device.quantity === 0
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-warning/30 bg-warning/10 text-warning"
                      }
                    >
                      {device.quantity === 0 ? "Sin Stock" : `${device.quantity} uds`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <CardTitle className="text-base">Ventas Recientes</CardTitle>
            </div>
            <CardDescription>Ultimas 5 transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="size-5 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : recentSales.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No hay ventas registradas</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Dispositivo</TableHead>
                    <TableHead className="text-muted-foreground text-right">Cant.</TableHead>
                    <TableHead className="text-muted-foreground text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id} className="border-border/40">
                      <TableCell>
                        <span className="text-sm text-foreground">{sale.deviceBrand} {sale.deviceModel}</span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{sale.quantity}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-primary">
                        ${sale.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
