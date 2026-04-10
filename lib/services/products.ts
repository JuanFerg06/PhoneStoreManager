import { supabase } from "@/lib/supabase"
import type { Device } from "@/lib/types"

// Maps a raw DB row (uses `stock`) to the frontend Device type (uses `quantity`)
function toDevice(row: Record<string, unknown>): Device {
  return {
    id: row.id as string,
    brand: row.brand as string,
    model: row.model as string,
    price: row.price as number,
    quantity: row.stock as number,
  }
}

export async function getProducts(): Promise<Device[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(toDevice)
}

export async function addProduct(device: Omit<Device, "id">): Promise<Device> {
  const { data, error } = await supabase
    .from("products")
    .insert({ brand: device.brand, model: device.model, price: device.price, stock: device.quantity })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toDevice(data)
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Device, "id">>
): Promise<Device> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.brand !== undefined) dbUpdates.brand = updates.brand
  if (updates.model !== undefined) dbUpdates.model = updates.model
  if (updates.price !== undefined) dbUpdates.price = updates.price
  if (updates.quantity !== undefined) dbUpdates.stock = updates.quantity

  const { data, error } = await supabase
    .from("products")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toDevice(data)
}

export async function getLowStockProducts(): Promise<Device[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .lte("stock", 5)
    .order("stock", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(toDevice)
}
