import { supabase } from "@/lib/supabase"
import type { Sale } from "@/lib/types"

type SaleRow = {
  id: string
  product_id: string
  quantity: number
  total_price: number
  sale_date: string
  products: { brand: string; model: string } | null
}

function toSale(row: SaleRow): Sale {
  return {
    id: row.id,
    deviceId: row.product_id,
    deviceBrand: row.products?.brand ?? "",
    deviceModel: row.products?.model ?? "",
    quantity: row.quantity,
    unitPrice: row.quantity > 0 ? row.total_price / row.quantity : 0,
    total: row.total_price,
    date: row.sale_date,
  }
}

export async function getSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*, products(brand, model)")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as SaleRow[] ?? []).map(toSale)
}

export async function addSale(
  sale: Omit<Sale, "id">
): Promise<Sale | { error: string }> {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase.rpc("register_sale", {
    p_product_id: sale.deviceId,
    p_quantity: sale.quantity,
    p_total_price: sale.total,
    p_sale_date: today,
  })

  if (error) {
    // Extract the user-facing message from the Postgres exception
    const msg = error.message.includes("Stock insuficiente")
      ? error.message.split("Stock insuficiente")[1]
          ? `Stock insuficiente${error.message.split("Stock insuficiente")[1]}`
          : "Stock insuficiente"
      : error.message.includes("Producto no encontrado")
      ? "Producto no encontrado"
      : "Error al registrar la venta"
    return { error: msg }
  }

  // RPC returns the raw sale row; fetch brand/model via a separate select
  const { data: fullSale, error: fetchError } = await supabase
    .from("sales")
    .select("*, products(brand, model)")
    .eq("id", (data as { id: string }).id)
    .single()

  if (fetchError) throw new Error(fetchError.message)
  return toSale(fullSale as SaleRow)
}

export async function getTodaySales(): Promise<Sale[]> {
  const today = new Date().toISOString().split("T")[0]
  const { data, error } = await supabase
    .from("sales")
    .select("*, products(brand, model)")
    .eq("sale_date", today)

  if (error) throw new Error(error.message)
  return (data as SaleRow[] ?? []).map(toSale)
}

export async function getTodayRevenue(): Promise<number> {
  const sales = await getTodaySales()
  return sales.reduce((sum, s) => sum + s.total, 0)
}

export async function getRecentSales(count = 5): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*, products(brand, model)")
    .order("created_at", { ascending: false })
    .limit(count)

  if (error) throw new Error(error.message)
  return (data as SaleRow[] ?? []).map(toSale)
}
