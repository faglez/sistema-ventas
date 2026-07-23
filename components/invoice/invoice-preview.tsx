'use client'

import { Transaction } from '@/types'
import { StoreSettings } from '@/lib/actions/settings'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Printer, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusStyle = (status: string) => {
  if (status === 'completada') return 'bg-green-50 text-green-700 border-green-200'
  if (status === 'pendiente') return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

interface InvoicePreviewProps {
  transaction: Transaction
  settings: StoreSettings
}

export function InvoicePreview({ transaction, settings }: InvoicePreviewProps) {
  const taxRate = transaction.subtotal > 0
    ? Math.round((transaction.tax / transaction.subtotal) * 100)
    : settings.taxRate

  return (
    <div className="max-w-xl mx-auto">
      {/* Action bar */}
      <div className="flex gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Nota de Venta card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">{settings.storeName}</span>
            </div>
            {settings.storeAddress && <p className="text-xs text-gray-400">{settings.storeAddress}</p>}
            {settings.storePhone && <p className="text-xs text-gray-400">{settings.storePhone}</p>}
            {settings.storeEmail && <p className="text-xs text-gray-400">{settings.storeEmail}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-gray-200 uppercase">Nota de Venta</p>
            <p className="text-base font-mono font-semibold text-indigo-600 mt-1">{transaction.id}</p>
            <p className="text-xs text-gray-400 mt-1">Fecha: {transaction.date}</p>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize mt-2 inline-block', statusStyle(transaction.status))}>
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Bill to */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Cliente</p>
          <p className="text-sm font-semibold text-gray-900">{transaction.customerName}</p>
          {transaction.customerId && (
            <p className="text-xs text-gray-400">ID: {transaction.customerId}</p>
          )}
        </div>

        {/* Items table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase">Producto</th>
              <th className="text-center pb-3 text-xs font-semibold text-gray-400 uppercase">Cant.</th>
              <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase">P. Unit.</th>
              <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-3 text-gray-700 font-medium">{item.productName}</td>
                <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 text-right text-gray-600">${item.price.toFixed(2)}</td>
                <td className="py-3 text-right font-bold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-56 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-700">${transaction.subtotal.toFixed(2)}</span>
          </div>
          {transaction.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Descuento</span>
              <span className="text-green-600 font-medium">-${transaction.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Impuesto ({taxRate}%)</span>
            <span className="text-gray-700">${transaction.tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span className="text-gray-900">Total</span>
            <span className="text-indigo-600">${transaction.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">¡Gracias por su compra! — {settings.storeName}</p>
          <p className="text-xs text-gray-300 mt-1">Este documento es válido como comprobante de pago.</p>
        </div>
      </div>
    </div>
  )
}
