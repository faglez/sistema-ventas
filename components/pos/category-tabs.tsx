import { cn } from '@/lib/utils'
import type { CategoryDef } from '@/lib/actions/settings'

interface CategoryTabsProps {
  selected: string
  onChange: (category: string) => void
  categories?: CategoryDef[]
}

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { value: 'men', label: 'Hombres' },
  { value: 'women', label: 'Mujeres' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Niños' },
  { value: 'accessories', label: 'Accesorios' },
]

export function CategoryTabs({ selected, onChange, categories }: CategoryTabsProps) {
  const tabs = [{ value: 'all', label: 'Todos' }, ...(categories ?? DEFAULT_CATEGORIES)]
  return (
    <div className="flex gap-0 border-b border-gray-200">
      {tabs.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
            selected === cat.value
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
