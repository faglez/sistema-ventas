import { CartItem, CheckoutInfo, Customer } from '@/types'
import { CartItemRow } from './cart-item'
import { PaymentSummary } from './payment-summary'
import { CustomerSelector } from './customer-selector'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart } from 'lucide-react'

interface CartPanelProps {
  cartItems: CartItem[]
  customers: Customer[]
  onUpdateQuantity: (id: string, delta: number) => void
  onClear: () => void
  onCheckout: (info: CheckoutInfo) => void
  selectedCustomer: Customer | null
  onSelectCustomer: (c: Customer | null) => void
  taxRate?: number
}

export function CartPanel({
  cartItems,
  customers,
  onUpdateQuantity,
  onClear,
  onCheckout,
  selectedCustomer,
  onSelectCustomer,
  taxRate = 11,
}: CartPanelProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="w-[300px] bg-white border-l border-gray-100 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-gray-900">Carrito</h2>
          <ShoppingCart className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
              Detalles del Carrito
            </p>
            {totalItems > 0 && (
              <Badge className="text-[10px] h-4 px-1.5 bg-indigo-600">{totalItems}</Badge>
            )}
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-600 transition-colors font-medium"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Customer selector */}
      <div className="px-5 py-3 border-b border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-2">Cliente</p>
        <CustomerSelector customers={customers} selected={selectedCustomer} onSelect={onSelectCustomer} />
      </div>

      {/* Items */}
      <ScrollArea className="flex-1">
        <div className="px-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium">Carrito vacío</p>
              <p className="text-xs mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItemRow key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Payment summary */}
      <div className="px-5 pb-5">
        <PaymentSummary
          subtotal={subtotal}
          selectedCustomer={selectedCustomer}
          onCheckout={onCheckout}
          taxRate={taxRate}
        />
      </div>
    </div>
  )
}
