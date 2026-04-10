export interface Device {
  id: string
  brand: string
  model: string
  price: number
  quantity: number // maps to DB column `stock`
}

export interface Sale {
  id: string
  deviceId: string    // maps to DB column `product_id`
  deviceBrand: string // from join: products.brand
  deviceModel: string // from join: products.model
  quantity: number
  unitPrice: number   // derived: total_price / quantity
  total: number       // maps to DB column `total_price`
  date: string        // maps to DB column `sale_date`
}
