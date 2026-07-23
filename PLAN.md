# Plan: Sistema POS — Ropa, Calzado y Accesorios

## Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, lucide-react
- **Backend** (fase 2): MySQL, Prisma ORM
- **Fase actual**: UI completa con datos mock — sin lógica de backend

## Pantallas
| Ruta | Descripción |
|------|-------------|
| `/orders` | POS principal: grid de productos + panel de carrito |
| `/dashboard` | Métricas generales, gráfico de ventas, ventas recientes |
| `/products` | Tabla de productos con filtros |
| `/customers` | Tabla de clientes |
| `/transactions` | Historial de transacciones |
| `/invoice` | Vista previa de factura |
| `/analytics` | KPIs, ventas por categoría, top productos |
| `/settings` | Configuración de tienda, moneda, impuesto |

## Decisiones
- UI en **español**
- Imágenes de **picsum.photos** (seeds consistentes)
- Color primario: **Indigo #4F46E5**
- Estado del carrito: React `useState` local en `/orders`

## Estructura
```
app/
  layout.tsx
  page.tsx                → redirect /orders
  (pos)/
    layout.tsx            ← sidebar + main
    orders/page.tsx       ← POS principal
    dashboard/page.tsx
    products/page.tsx
    customers/page.tsx
    transactions/page.tsx
    invoice/page.tsx
    analytics/page.tsx
    settings/page.tsx
components/
  layout/sidebar.tsx
  pos/  product-card, category-tabs, product-grid, cart-item, payment-summary, cart-panel
  dashboard/  metric-card, sales-chart, recent-sales-table
  products/   product-table, product-filters
  customers/  customer-table
  transactions/ transaction-table
  invoice/    invoice-preview
  analytics/  analytics-overview
  settings/   settings-form
lib/mock-data.ts
types/index.ts
```
