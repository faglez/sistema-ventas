'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScanLine, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CheckoutInfo, Customer } from '@/types'

type PaymentType = 'tarjeta' | 'efectivo' | 'transferencia' | 'credito'

interface PaymentSummaryProps {
  subtotal: number
  selectedCustomer: Customer | null
  onCheckout: (info: CheckoutInfo) => void
  taxRate?: number
}

export function PaymentSummary({ subtotal, selectedCustomer, onCheckout, taxRate = 11 }: PaymentSummaryProps) {
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>('tarjeta')
  const [creditToApply, setCreditToApply] = useState(0)

  const tax = subtotal * (taxRate / 100)
  const totalBeforeCredit = subtotal - discount + tax
  const creditApplied = selectedPayment === 'credito'
    ? Math.min(creditToApply, totalBeforeCredit)
    : 0
  const totalFinal = Math.max(totalBeforeCredit - creditApplied, 0)
  const availableCredit = selectedCustomer?.creditBalance ?? 0

  // Reset credit state when customer changes or payment method changes
  useEffect(() => {
    setCreditToApply(availableCredit)
  }, [availableCredit])

  useEffect(() => {
    if (selectedPayment !== 'credito') setCreditToApply(availableCredit)
  }, [selectedPayment, availableCredit])

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'DESCUENTO10' && !promoApplied) {
      setDiscount(subtotal * 0.1)
      setPromoApplied(true)
    }
  }

  const baseMethods: { type: PaymentType; label: string; icon: React.ReactNode }[] = [
    { type: 'tarjeta', label: 'Tarjeta', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { type: 'efectivo', label: 'Efectivo', icon: <Banknote className="w-3.5 h-3.5" /> },
    { type: 'transferencia', label: 'Transferencia', icon: <Smartphone className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="space-y-3 pt-3">
      <Separator />
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
        Detalles de Pago
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-700">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Descuento</span>
          <span className={cn(discount > 0 ? 'text-green-600 font-medium' : 'text-gray-700')}>
            -${discount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Impuesto {taxRate}%</span>
          <span className="text-gray-700">${tax.toFixed(2)}</span>
        </div>

        {creditApplied > 0 && (
          <div className="flex justify-between text-indigo-600">
            <span className="flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              Crédito aplicado
            </span>
            <span className="font-medium">-${creditApplied.toFixed(2)}</span>
          </div>
        )}

        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span className="text-gray-900">TOTAL</span>
          <span className="text-gray-900">${totalFinal.toFixed(2)}</span>
        </div>
      </div>

      {/* Promo code */}
      <div className="flex gap-2">
        <Input
          placeholder="Código promo"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="h-8 text-xs"
          disabled={promoApplied}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={applyPromo}
          className="h-8 text-xs px-3 flex-shrink-0"
          disabled={promoApplied || !promoCode}
        >
          {promoApplied ? '✓' : 'Aplicar'}
        </Button>
      </div>

      {/* Payment methods */}
      <div className={cn('grid gap-1.5', selectedCustomer && availableCredit > 0 ? 'grid-cols-2' : 'grid-cols-3')}>
        {baseMethods.map((pm) => (
          <button
            key={pm.type}
            onClick={() => setSelectedPayment(pm.type)}
            className={cn(
              'flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition-all',
              selectedPayment === pm.type
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            {pm.icon}
            {pm.label}
          </button>
        ))}

        {/* Credit method — only if customer with credit is selected */}
        {selectedCustomer && availableCredit > 0 && (
          <button
            onClick={() => setSelectedPayment('credito')}
            className={cn(
              'flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition-all',
              selectedPayment === 'credito'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            <Wallet className="w-3.5 h-3.5" />
            Crédito
          </button>
        )}
      </div>

      {/* Credit amount slider — only when credit method selected */}
      {selectedPayment === 'credito' && selectedCustomer && availableCredit > 0 && (
        <div className="bg-indigo-50 rounded-lg p-3 space-y-2 border border-indigo-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-indigo-700 font-medium flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              Crédito disponible
            </span>
            <span className="font-bold text-indigo-700">${availableCredit.toFixed(2)}</span>
          </div>
          <div>
            <input
              type="range"
              min={0}
              max={Math.min(availableCredit, totalBeforeCredit)}
              step={0.5}
              value={creditToApply}
              onChange={(e) => setCreditToApply(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-indigo-400 mt-0.5">
              <span>$0</span>
              <span className="font-medium text-indigo-600">Aplicar: ${creditToApply.toFixed(2)}</span>
              <span>${Math.min(availableCredit, totalBeforeCredit).toFixed(2)}</span>
            </div>
          </div>
          {totalFinal === 0 && (
            <p className="text-[10px] text-green-600 font-medium text-center">
              ✓ Pago completo con crédito
            </p>
          )}
          {totalFinal > 0 && creditApplied > 0 && (
            <p className="text-[10px] text-indigo-500 text-center">
              Resto a pagar: ${totalFinal.toFixed(2)} por otro método
            </p>
          )}
        </div>
      )}

      {/* Checkout button */}
      <Button
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        onClick={() => onCheckout({ usedCredit: creditApplied, paymentMethod: selectedPayment, discount })}
        disabled={subtotal === 0}
      >
        <ScanLine className="w-4 h-4 mr-2" />
        Procesar Venta
      </Button>
    </div>
  )
}
