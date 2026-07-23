export type Category = string

export type ProductSize = string

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito'
export type CreditTransactionType = 'recarga' | 'uso' | 'devolucion' | 'ajuste'
export type TransactionStatus = 'completada' | 'pendiente' | 'cancelada'
export type ProductStatus = 'activo' | 'agotado' | 'inactivo'

export interface Product {
  id: string
  name: string
  category: Exclude<Category, 'all'>
  sizes: ProductSize[]
  colors: string[]
  price: number
  image: string
  stock: number
  status: ProductStatus
}

export interface CartItem {
  id: string
  product: Product
  selectedSize: ProductSize
  selectedColor: string
  quantity: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalPurchases: number
  totalSpent: number
  lastPurchase: string
  creditBalance: number
  creditLimit: number
}

export interface CreditTransaction {
  id: string
  customerId: string
  amount: number
  type: CreditTransactionType
  reason: string
  balanceBefore: number
  balanceAfter: number
  date: string
}

export interface TransactionItem {
  productId: string
  productName: string
  quantity: number
  price: number
  selectedSize: string
  selectedColor: string
}

export interface Transaction {
  id: string
  customerId: string
  customerName: string
  items: TransactionItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  status: TransactionStatus
  date: string
}

export interface DashboardMetrics {
  salesTotal: number
  salesChange: number
  transactions: number
  transactionsChange: number
  newCustomers: number
  newCustomersChange: number
  productsSold: number
  productsSoldChange: number
}

export interface SalesDataPoint {
  label: string
  value: number
}

export interface CheckoutInfo {
  usedCredit: number
  paymentMethod: string
  discount: number
}

export interface TicketData {
  id: string
  date: string
  time: string
  customer: { id: string; name: string } | null
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    selectedSize: string
    selectedColor: string
  }>
  subtotal: number
  discount: number
  tax: number
  taxRate: number
  creditApplied: number
  total: number
  paymentMethod: string
  store: {
    name: string
    address: string
    phone: string
    email: string
  }
}
