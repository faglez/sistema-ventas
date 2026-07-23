import { CartItem } from '@/types'
import { ImageIcon, Minus, Plus } from 'lucide-react'

const categoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    men: 'Hombres', women: 'Mujeres', unisex: 'Unisex', kids: 'Niños', accessories: 'Accesorios',
  }
  return map[cat] || cat
}

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (id: string, delta: number) => void
}

export function CartItemRow({ item, onUpdateQuantity }: CartItemRowProps) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      {item.product.image ? (
        <img
          src={item.product.image}
          alt={item.product.name}
          className="w-14 h-16 object-cover rounded-lg bg-gray-50 flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-16 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-gray-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 leading-tight truncate">{item.product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{categoryLabel(item.product.category)}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            T: {item.selectedSize}
          </span>
          <span
            className="w-3 h-3 rounded-full border border-gray-300 inline-block flex-shrink-0"
            style={{ backgroundColor: item.selectedColor }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-gray-900">
            ${(item.product.price * item.quantity).toFixed(2)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-3 h-3 text-gray-600" />
            </button>
            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
