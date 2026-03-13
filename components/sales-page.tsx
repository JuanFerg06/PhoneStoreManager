"use client"

import { useEffect, useState, type FormEvent } from "react"
import { ShoppingCart, Receipt } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDevices, getSales, addSale, type Device, type Sale } from "@/lib/store"

export function SalesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [saleQuantity, setSaleQuantity] = useState("1")
  const [formError, setFormError] = useState("")

  useEffect(() => {
    setDevices(getDevices())
    setSales(getSales().slice().reverse())
  }, [])

  function refresh() {
    setDevices(getDevices())
    setSales(getSales().slice().reverse())
    window.dispatchEvent(new Event("store-updated"))
  }

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) ?? null
  const unitPrice = selectedDevice?.price ?? 0
  const qty = parseInt(saleQuantity, 10) || 0
  const total = unitPrice * qty
  const today = new Date().toISOString().split("T")[0]

  const isOutOfStock = selectedDevice !== null && selectedDevice.quantity === 0
  const exceedsStock = selectedDevice !== null && qty > selectedDevice.quantity
  const canSell = selectedDevice !== null && qty > 0 && !isOutOfStock && !exceedsStock

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError("")

    if (!selectedDeviceId) {
      setFormError("Seleccione un dispositivo")
      return
    }

    if (!saleQuantity || qty <= 0) {
      setFormError("La cantidad debe ser mayor a 0")
      return
    }

    if (!selectedDevice) return

    if (isOutOfStock) {
      setFormError("Este dispositivo no tiene stock disponible")
      return
    }

    if (exceedsStock) {
      setFormError(`Solo hay ${selectedDevice.quantity} unidades disponibles`)
      return
    }

    const result = addSale({
      deviceId: selectedDevice.id,
      deviceBrand: selectedDevice.brand,
      deviceModel: selectedDevice.model,
      quantity: qty,
      unitPrice: selectedDevice.price,
      total,
      date: today,
    })

    if ("error" in result) {
      setFormError(result.error)
      return
    }

    toast.success("Venta registrada exitosamente")
    setSelectedDeviceId("")
    setSaleQuantity("1")
    refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
        <p className="text-sm text-muted-foreground">Registra ventas y consulta el historial</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sale Form */}
        <Card className="border-border/60 bg-card xl:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-primary" />
              <CardTitle className="text-base">Nueva Venta</CardTitle>
            </div>
            <CardDescription>Registra una nueva transaccion</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {formError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label>Dispositivo</Label>
                <Select value={selectedDeviceId} onValueChange={(v) => { setSelectedDeviceId(v); setFormError("") }}>
                  <SelectTrigger className="w-full bg-secondary border-border">
                    <SelectValue placeholder="Seleccionar dispositivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {devices.map((device) => (
                      <SelectItem key={device.id} value={device.id} disabled={device.quantity === 0}>
                        {device.brand} {device.model} {device.quantity === 0 ? "(Sin Stock)" : `(${device.quantity} uds)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sale-qty">Cantidad</Label>
                <Input
                  id="sale-qty"
                  type="number"
                  min="1"
                  max={selectedDevice?.quantity ?? 999}
                  value={saleQuantity}
                  onChange={(e) => { setSaleQuantity(e.target.value); setFormError("") }}
                  className="bg-secondary border-border"
                />
                {selectedDevice && (
                  <p className="text-xs text-muted-foreground">
                    Disponible: {selectedDevice.quantity} unidades
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Fecha</Label>
                <Input value={today} disabled className="bg-secondary/50 border-border text-muted-foreground" />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Precio Unitario</Label>
                <Input
                  value={selectedDevice ? `$${unitPrice.toFixed(2)}` : "-"}
                  disabled
                  className="bg-secondary/50 border-border text-muted-foreground"
                />
              </div>

              <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Total de la venta</p>
                <p className="text-xl font-bold text-primary">
                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <Button
                type="submit"
                disabled={!canSell}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <ShoppingCart className="mr-2 size-4" />
                {isOutOfStock ? "Sin Stock" : "Registrar Venta"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card className="border-border/60 bg-card xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="size-5 text-primary" />
              <CardTitle className="text-base">Historial de Ventas</CardTitle>
            </div>
            <CardDescription>{sales.length} transacciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay ventas registradas aun
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Dispositivo</TableHead>
                    <TableHead className="text-muted-foreground text-right">Cant.</TableHead>
                    <TableHead className="text-muted-foreground text-right">Precio Unit.</TableHead>
                    <TableHead className="text-muted-foreground text-right">Total</TableHead>
                    <TableHead className="text-muted-foreground text-right">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="border-border/40">
                      <TableCell className="font-medium text-foreground">
                        {sale.deviceBrand} {sale.deviceModel}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{sale.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${sale.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        ${sale.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{sale.date}</TableCell>
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
