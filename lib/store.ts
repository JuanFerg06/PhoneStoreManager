export interface Device {
  id: string
  brand: string
  model: string
  price: number
  quantity: number
}

export interface Sale {
  id: string
  deviceId: string
  deviceBrand: string
  deviceModel: string
  quantity: number
  unitPrice: number
  total: number
  date: string
}

const DEVICES_KEY = "phonestore_devices"
const SALES_KEY = "phonestore_sales"

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Devices
export function getDevices(): Device[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(DEVICES_KEY)
  if (!data) {
    const defaults: Device[] = [
      { id: generateId(), brand: "Samsung", model: "Galaxy S24 Ultra", price: 1299.99, quantity: 12 },
      { id: generateId(), brand: "Apple", model: "iPhone 15 Pro Max", price: 1199.99, quantity: 8 },
      { id: generateId(), brand: "Google", model: "Pixel 8 Pro", price: 999.99, quantity: 15 },
      { id: generateId(), brand: "Xiaomi", model: "14 Ultra", price: 899.99, quantity: 3 },
      { id: generateId(), brand: "OnePlus", model: "12", price: 799.99, quantity: 2 },
      { id: generateId(), brand: "Motorola", model: "Edge 40 Pro", price: 699.99, quantity: 20 },
    ]
    localStorage.setItem(DEVICES_KEY, JSON.stringify(defaults))
    return defaults
  }
  return JSON.parse(data)
}

export function addDevice(device: Omit<Device, "id">): Device {
  const devices = getDevices()
  const newDevice: Device = { ...device, id: generateId() }
  devices.push(newDevice)
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices))
  return newDevice
}

export function updateDevice(id: string, updates: Partial<Omit<Device, "id">>): Device | null {
  const devices = getDevices()
  const index = devices.findIndex((d) => d.id === id)
  if (index === -1) return null
  devices[index] = { ...devices[index], ...updates }
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices))
  return devices[index]
}

// Sales
export function getSales(): Sale[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(SALES_KEY)
  if (!data) {
    // Seed some default sales
    const devices = getDevices()
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const defaults: Sale[] = [
      {
        id: generateId(),
        deviceId: devices[0]?.id ?? "",
        deviceBrand: devices[0]?.brand ?? "Samsung",
        deviceModel: devices[0]?.model ?? "Galaxy S24 Ultra",
        quantity: 2,
        unitPrice: 1299.99,
        total: 2599.98,
        date: today,
      },
      {
        id: generateId(),
        deviceId: devices[1]?.id ?? "",
        deviceBrand: devices[1]?.brand ?? "Apple",
        deviceModel: devices[1]?.model ?? "iPhone 15 Pro Max",
        quantity: 1,
        unitPrice: 1199.99,
        total: 1199.99,
        date: today,
      },
      {
        id: generateId(),
        deviceId: devices[2]?.id ?? "",
        deviceBrand: devices[2]?.brand ?? "Google",
        deviceModel: devices[2]?.model ?? "Pixel 8 Pro",
        quantity: 3,
        unitPrice: 999.99,
        total: 2999.97,
        date: yesterday,
      },
    ]
    localStorage.setItem(SALES_KEY, JSON.stringify(defaults))
    return defaults
  }
  return JSON.parse(data)
}

export function addSale(sale: Omit<Sale, "id">): Sale | { error: string } {
  const devices = getDevices()
  const device = devices.find((d) => d.id === sale.deviceId)
  if (!device) return { error: "Dispositivo no encontrado" }
  if (device.quantity === 0) return { error: "Sin stock disponible" }
  if (sale.quantity > device.quantity) return { error: `Solo hay ${device.quantity} unidades disponibles` }

  // Deduct stock
  updateDevice(device.id, { quantity: device.quantity - sale.quantity })

  const newSale: Sale = { ...sale, id: generateId() }
  const sales = getSales()
  sales.push(newSale)
  localStorage.setItem(SALES_KEY, JSON.stringify(sales))
  return newSale
}

export function getTodaySales(): Sale[] {
  const today = new Date().toISOString().split("T")[0]
  return getSales().filter((s) => s.date === today)
}

export function getTodayRevenue(): number {
  return getTodaySales().reduce((sum, s) => sum + s.total, 0)
}

export function getLowStockDevices(): Device[] {
  return getDevices().filter((d) => d.quantity <= 5)
}

export function getRecentSales(count: number = 5): Sale[] {
  return getSales().slice(-count).reverse()
}
