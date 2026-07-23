'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Product, ProductSize } from '@/types'
import { cn } from '@/lib/utils'
import { ImageIcon, Plus } from 'lucide-react'

const CLOTHING_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL']

const categoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    men: 'Hombres',
    women: 'Mujeres',
    unisex: 'Unisex',
    kids: 'Niños',
    accessories: 'Accesorios',
  }
  return map[cat] || cat
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, size: ProductSize, color: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0])
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0])

  const displaySizes = product.sizes.some((s) => CLOTHING_SIZES.includes(s))
    ? CLOTHING_SIZES
    : product.sizes

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Image */}
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{categoryLabel(product.category)}</p>

        {/* Sizes */}
        <div className="flex items-center gap-1 mt-2.5 flex-wrap">
          <span className="text-xs text-gray-400 mr-0.5">Talla</span>
          {displaySizes.map((size) => {
            const available = product.sizes.includes(size as ProductSize)
            return (
              <button
                key={size}
                disabled={!available}
                onClick={() => setSelectedSize(size as ProductSize)}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded border transition-all',
                  !available
                    ? 'opacity-25 cursor-not-allowed border-gray-100 text-gray-300'
                    : selectedSize === size
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                )}
              >
                {size}
              </button>
            )
          })}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-gray-400 mr-0.5">Color</span>
          {product.colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              title={color}
              className={cn(
                'w-4 h-4 rounded-full transition-all border-2',
                selectedColor === color
                  ? 'border-gray-800 scale-125'
                  : 'border-gray-200 hover:border-gray-400'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-gray-900 text-sm">${product.price.toFixed(2)}</span>
          <Button
            size="sm"
            onClick={() => onAddToCart(product, selectedSize, selectedColor)}
            className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-3 h-3 mr-1" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}
