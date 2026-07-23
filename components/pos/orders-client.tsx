'use client'

import { useState, useMemo } from 'react'
import { CategoryTabs } from '@/components/pos/category-tabs'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { CheckoutDialog } from '@/components/pos/checkout-dialog'
import { createTransaction } from '@/lib/actions/transactions'
import { CartItem, CheckoutInfo, Customer, Product, ProductSize, TicketData } from '@/types'
import type { CategoryDef } from '@/lib/actions/settings'

interface OrdersClientProps {
  initialProducts: Product[]
  initialCustomers: Customer[]
  taxRate?: number
  categories?: CategoryDef[]
}

export function OrdersClient({ initialProducts, initialCustomers, taxRate = 11, categories }: OrdersClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [processing, setProcessing] = useState(false)

  const filteredProducts = useMemo(() => {
    let products = initialProducts
    if (selectedCategory !== 'all') {
      products = products.filter((p) => p.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      products = products.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (sortOrder === 'price-asc') return [...products].sort((a, b) => a.price - b.price)
    if (sortOrder === 'price-desc') return [...products].sort((a, b) => b.price - a.price)
    return products
  }, [initialProducts, selectedCategory, searchQuery, sortOrder])

  const addToCart = (product: Product, size: ProductSize, color: string) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      )
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 }
        return updated
      }
      return [
        ...prev,
        {
          id: `${product.id}-${size}-${color}-${Date.now()}`,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity: 1,
        },
      ]
    })
  }

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === cartItemId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const handleCheckout = async ({ usedCredit, paymentMethod, discount }: CheckoutInfo) => {
    if (processing) return
    setProcessing(true)
    try {
      const subtotal = Math.round(cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0) * 100) / 100
      const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100
      const total = Math.round(Math.max(subtotal - discount + tax - usedCredit, 0) * 100) / 100

      const ticket = await createTransaction({
        cartItems,
        customer: selectedCustomer,
        checkoutInfo: { usedCredit, paymentMethod, discount },
        subtotal,
        tax,
        total,
      })

      setTicketData(ticket)
      setCartItems([])
      setShowDialog(true)
    } finally {
      setProcessing(false)
    }
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setSelectedCustomer(null)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Product area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-6 pt-5 pb-0 flex-shrink-0">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
            Menú &rsaquo; Órdenes
          </p>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Lista de Productos</h1>
          </div>
          <CategoryTabs selected={selectedCategory} onChange={setSelectedCategory} categories={categories} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ProductGrid
            products={filteredProducts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      {/* Right: Cart panel */}
      <CartPanel
        cartItems={cartItems}
        customers={initialCustomers}
        onUpdateQuantity={updateQuantity}
        onClear={() => setCartItems([])}
        onCheckout={handleCheckout}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        taxRate={taxRate}
      />

      {/* Post-checkout dialog */}
      <CheckoutDialog
        open={showDialog}
        ticketData={ticketData}
        onClose={handleCloseDialog}
      />
    </div>
  )
}
