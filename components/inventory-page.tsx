"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Plus, Pencil, Package } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getProducts, addProduct, updateProduct } from "@/lib/services/products"
import type { Device } from "@/lib/types"

export function InventoryPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)

  // Form state
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadDevices()
  }, [])

  async function loadDevices() {
    setIsLoading(true)
    try {
      setDevices(await getProducts())
    } catch (err) {
      toast.error("Error al cargar el inventario")
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setBrand("")
    setModel("")
    setPrice("")
    setQuantity("")
    setFormError("")
    setEditingDevice(null)
  }

  function openAddDialog() {
    resetForm()
    setIsDialogOpen(true)
  }

  function openEditDialog(device: Device) {
    setEditingDevice(device)
    setBrand(device.brand)
    setModel(device.model)
    setPrice(device.price.toString())
    setQuantity(device.quantity.toString())
    setFormError("")
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError("")

    if (!brand.trim() || !model.trim() || !price.trim() || !quantity.trim()) {
      setFormError("Todos los campos son obligatorios")
      return
    }

    const priceNum = parseFloat(price)
    const qtyNum = parseInt(quantity, 10)

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("El precio debe ser un numero positivo")
      return
    }

    if (isNaN(qtyNum) || qtyNum < 0) {
      setFormError("La cantidad debe ser un numero valido")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingDevice) {
        await updateProduct(editingDevice.id, {
          brand: brand.trim(),
          model: model.trim(),
          price: priceNum,
          quantity: qtyNum,
        })
        toast.success("Dispositivo actualizado exitosamente")
      } else {
        await addProduct({
          brand: brand.trim(),
          model: model.trim(),
          price: priceNum,
          quantity: qtyNum,
        })
        toast.success("Dispositivo agregado exitosamente")
      }
      await loadDevices()
      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      setFormError("Error al guardar el dispositivo")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">Gestiona los dispositivos de tu tienda</p>
        </div>
        <Button onClick={openAddDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Agregar Dispositivo
        </Button>
      </div>

      <Card className="border-border/60 bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            <CardTitle className="text-base">Dispositivos Registrados</CardTitle>
          </div>
          <CardDescription>{devices.length} productos en inventario</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="size-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : devices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay dispositivos registrados. Agrega uno para comenzar.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Marca</TableHead>
                  <TableHead className="text-muted-foreground">Modelo</TableHead>
                  <TableHead className="text-muted-foreground text-right">Precio</TableHead>
                  <TableHead className="text-muted-foreground text-right">Cantidad</TableHead>
                  <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id} className="border-border/40">
                    <TableCell className="font-medium text-foreground">{device.brand}</TableCell>
                    <TableCell className="text-muted-foreground">{device.model}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${device.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          device.quantity === 0
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : device.quantity <= 5
                            ? "border-warning/30 bg-warning/10 text-warning"
                            : "border-success/30 bg-success/10 text-success"
                        }
                      >
                        {device.quantity} uds
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(device)}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar {device.brand} {device.model}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="bg-card border-border/60">
          <DialogHeader>
            <DialogTitle>{editingDevice ? "Editar Dispositivo" : "Agregar Dispositivo"}</DialogTitle>
            <DialogDescription>
              {editingDevice ? "Modifica la informacion del dispositivo" : "Completa los campos para registrar un nuevo dispositivo"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ej: Samsung" className="bg-secondary border-border" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ej: Galaxy S24 Ultra" className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Precio ($)</Label>
                <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input id="quantity" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className="bg-secondary border-border" />
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="ghost" onClick={() => { setIsDialogOpen(false); resetForm() }} className="text-muted-foreground">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : editingDevice ? "Guardar Cambios" : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
