import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { hashPassword } from '../lib/password'

const url = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username || 'root',
  password: url.password || undefined,
  database: url.pathname.slice(1),
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data (order matters due to FK constraints)
  await prisma.creditTransaction.deleteMany()
  await prisma.transactionItem.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // Users
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: hashPassword('admin123'), name: 'Administrador', role: 'admin' },
      { username: 'cajero', password: hashPassword('cajero123'), name: 'Cajero', role: 'cajero' },
    ],
  })
  console.log('  ✓ Users (2)')

  // Products
  await prisma.product.createMany({
    data: [
      { id: '1', name: 'Camisa Casual Manga Larga', category: 'men', sizes: JSON.stringify(['S','M','L','XL']), colors: JSON.stringify(['#8B4513','#4169E1','#2F4F4F']), price: 38.56, image: 'https://picsum.photos/seed/shirt-brown/300/350', stock: 24, status: 'activo' },
      { id: '2', name: 'Crewneck Terkonrk', category: 'men', sizes: JSON.stringify(['XS','S','M','L','XL']), colors: JSON.stringify(['#D2B48C','#808080']), price: 45.89, image: 'https://picsum.photos/seed/crewneck/300/350', stock: 18, status: 'activo' },
      { id: '3', name: 'Blazer Ejecutivo Slim', category: 'men', sizes: JSON.stringify(['S','M','L','XL']), colors: JSON.stringify(['#1C1C1C','#36454F']), price: 89.99, image: 'https://picsum.photos/seed/blazer-men/300/350', stock: 10, status: 'activo' },
      { id: '4', name: 'Tempest Blazer', category: 'men', sizes: JSON.stringify(['S','M','L','XL']), colors: JSON.stringify(['#556B2F','#6B6B6B']), price: 20.00, image: 'https://picsum.photos/seed/tempest/300/350', stock: 14, status: 'activo' },
      { id: '5', name: 'Vestido Floral Verano', category: 'women', sizes: JSON.stringify(['XS','S','M','L']), colors: JSON.stringify(['#FFB6C1','#98FB98','#87CEEB']), price: 52.00, image: 'https://picsum.photos/seed/floral-dress/300/350', stock: 15, status: 'activo' },
      { id: '6', name: 'Falda Midi Plisada', category: 'women', sizes: JSON.stringify(['XS','S','M','L','XL']), colors: JSON.stringify(['#708090','#556B2F']), price: 34.78, image: 'https://picsum.photos/seed/skirt-midi/300/350', stock: 22, status: 'activo' },
      { id: '7', name: 'Blusa Elegante Gasa', category: 'women', sizes: JSON.stringify(['XS','S','M']), colors: JSON.stringify(['#FFFFFF','#F5DEB3','#FFB6C1']), price: 29.50, image: 'https://picsum.photos/seed/blouse-white/300/350', stock: 8, status: 'activo' },
      { id: '8', name: 'Falda Skirt Dresses', category: 'women', sizes: JSON.stringify(['XS','S','M','L']), colors: JSON.stringify(['#90EE90','#F0E68C']), price: 17.34, image: 'https://picsum.photos/seed/skirt-dress/300/350', stock: 20, status: 'activo' },
      { id: '9', name: 'Sudadera Hoodie Oversize', category: 'unisex', sizes: JSON.stringify(['S','M','L','XL']), colors: JSON.stringify(['#696969','#F5F5DC','#000000']), price: 55.00, image: 'https://picsum.photos/seed/hoodie-grey/300/350', stock: 30, status: 'activo' },
      { id: '10', name: 'Jeans Straight Fit', category: 'unisex', sizes: JSON.stringify(['S','M','L','XL']), colors: JSON.stringify(['#000080','#4682B4']), price: 67.99, image: 'https://picsum.photos/seed/jeans-blue/300/350', stock: 20, status: 'activo' },
      { id: '11', name: 'Conjunto Deportivo Niño', category: 'kids', sizes: JSON.stringify(['XS','S','M']), colors: JSON.stringify(['#FF6347','#4169E1']), price: 28.00, image: 'https://picsum.photos/seed/kids-sport/300/350', stock: 12, status: 'activo' },
      { id: '12', name: 'Vestido Niña Fiesta', category: 'kids', sizes: JSON.stringify(['XS','S','M']), colors: JSON.stringify(['#FF69B4','#9370DB']), price: 22.50, image: 'https://picsum.photos/seed/kids-dress/300/350', stock: 9, status: 'activo' },
      { id: '13', name: 'Bolso de Cuero Premium', category: 'accessories', sizes: JSON.stringify(['XS']), colors: JSON.stringify(['#8B4513','#000000','#F5DEB3']), price: 120.00, image: 'https://picsum.photos/seed/handbag-brown/300/350', stock: 5, status: 'activo' },
      { id: '14', name: 'Gafas de Sol UV400', category: 'accessories', sizes: JSON.stringify(['XS']), colors: JSON.stringify(['#000000','#8B4513','#FFD700']), price: 35.00, image: 'https://picsum.photos/seed/sunglasses/300/350', stock: 25, status: 'activo' },
      { id: '15', name: 'Zapatillas Running Pro', category: 'accessories', sizes: JSON.stringify(['38','39','40','41','42']), colors: JSON.stringify(['#FFFFFF','#000000','#FF6347']), price: 95.00, image: 'https://picsum.photos/seed/sneakers/300/350', stock: 18, status: 'activo' },
    ],
  })
  console.log('  ✓ Products (15)')

  // Customers
  await prisma.customer.createMany({
    data: [
      { id: 'C001', name: 'María García', email: 'maria.garcia@email.com', phone: '+51 999 111 222', totalPurchases: 12, totalSpent: 567.89, lastPurchase: '2025-07-15', creditBalance: 85.00, creditLimit: 200.00 },
      { id: 'C002', name: 'Carlos López', email: 'carlos.lopez@email.com', phone: '+51 999 333 444', totalPurchases: 5, totalSpent: 234.50, lastPurchase: '2025-07-12', creditBalance: 0.00, creditLimit: 100.00 },
      { id: 'C003', name: 'Ana Martínez', email: 'ana.martinez@email.com', phone: '+51 999 555 666', totalPurchases: 20, totalSpent: 1240.00, lastPurchase: '2025-07-18', creditBalance: 150.00, creditLimit: 500.00 },
      { id: 'C004', name: 'Luis Rodríguez', email: 'luis.rod@email.com', phone: '+51 999 777 888', totalPurchases: 3, totalSpent: 98.50, lastPurchase: '2025-07-10', creditBalance: 28.00, creditLimit: 100.00 },
      { id: 'C005', name: 'Sofía Hernández', email: 'sofia.h@email.com', phone: '+51 999 999 000', totalPurchases: 8, totalSpent: 445.00, lastPurchase: '2025-07-20', creditBalance: 45.50, creditLimit: 200.00 },
      { id: 'C006', name: 'Diego Flores', email: 'diego.flores@email.com', phone: '+51 999 112 233', totalPurchases: 15, totalSpent: 890.00, lastPurchase: '2025-07-19', creditBalance: 200.00, creditLimit: 300.00 },
      { id: 'C007', name: 'Valentina Cruz', email: 'val.cruz@email.com', phone: '+51 999 445 566', totalPurchases: 6, totalSpent: 310.75, lastPurchase: '2025-07-17', creditBalance: 10.00, creditLimit: 150.00 },
      { id: 'C008', name: 'Andrés Torres', email: 'andres.t@email.com', phone: '+51 999 778 899', totalPurchases: 2, totalSpent: 65.00, lastPurchase: '2025-07-08', creditBalance: 0.00, creditLimit: 50.00 },
    ],
  })
  console.log('  ✓ Customers (8)')

  // Transactions with items
  const transactions = [
    { id: 'TXN-001', customerId: 'C001', customerName: 'María García', subtotal: 111.90, discount: 0, tax: 12.31, total: 124.21, paymentMethod: 'tarjeta', status: 'completada', date: '2025-07-20', items: [{ productId: '1', productName: 'Camisa Casual Manga Larga', quantity: 2, price: 38.56 },{ productId: '6', productName: 'Falda Midi Plisada', quantity: 1, price: 34.78 }] },
    { id: 'TXN-002', customerId: 'C003', customerName: 'Ana Martínez', subtotal: 87.00, discount: 8.70, tax: 8.62, total: 86.92, paymentMethod: 'efectivo', status: 'completada', date: '2025-07-20', items: [{ productId: '5', productName: 'Vestido Floral Verano', quantity: 1, price: 52.00 },{ productId: '14', productName: 'Gafas de Sol UV400', quantity: 1, price: 35.00 }] },
    { id: 'TXN-003', customerId: 'C002', customerName: 'Carlos López', subtotal: 55.00, discount: 0, tax: 6.05, total: 61.05, paymentMethod: 'tarjeta', status: 'pendiente', date: '2025-07-19', items: [{ productId: '9', productName: 'Sudadera Hoodie Oversize', quantity: 1, price: 55.00 }] },
    { id: 'TXN-004', customerId: 'C005', customerName: 'Sofía Hernández', subtotal: 179.00, discount: 17.90, tax: 17.72, total: 178.82, paymentMethod: 'transferencia', status: 'completada', date: '2025-07-19', items: [{ productId: '13', productName: 'Bolso de Cuero Premium', quantity: 1, price: 120.00 },{ productId: '7', productName: 'Blusa Elegante Gasa', quantity: 2, price: 29.50 }] },
    { id: 'TXN-005', customerId: 'C006', customerName: 'Diego Flores', subtotal: 162.99, discount: 0, tax: 17.93, total: 180.92, paymentMethod: 'tarjeta', status: 'completada', date: '2025-07-18', items: [{ productId: '15', productName: 'Zapatillas Running Pro', quantity: 1, price: 95.00 },{ productId: '10', productName: 'Jeans Straight Fit', quantity: 1, price: 67.99 }] },
    { id: 'TXN-006', customerId: 'C004', customerName: 'Luis Rodríguez', subtotal: 28.00, discount: 0, tax: 3.08, total: 31.08, paymentMethod: 'efectivo', status: 'cancelada', date: '2025-07-17', items: [{ productId: '11', productName: 'Conjunto Deportivo Niño', quantity: 1, price: 28.00 }] },
    { id: 'TXN-007', customerId: 'C007', customerName: 'Valentina Cruz', subtotal: 89.99, discount: 9.00, tax: 8.90, total: 89.89, paymentMethod: 'tarjeta', status: 'completada', date: '2025-07-16', items: [{ productId: '3', productName: 'Blazer Ejecutivo Slim', quantity: 1, price: 89.99 }] },
  ]

  for (const { items, ...txData } of transactions) {
    await prisma.transaction.create({
      data: {
        ...txData,
        items: {
          create: items.map(i => ({ ...i, selectedSize: '', selectedColor: '' }))
        }
      }
    })
  }
  console.log('  ✓ Transactions (7) with items')

  // Credit transactions
  await prisma.creditTransaction.createMany({
    data: [
      { id: 'CR001', customerId: 'C001', amount: 50.00, type: 'recarga', reason: 'Premio fidelidad julio', balanceBefore: 35.00, balanceAfter: 85.00, date: '2025-07-18' },
      { id: 'CR002', customerId: 'C001', amount: 35.00, type: 'devolucion', reason: 'Devolución camisa talla incorrecta', balanceBefore: 0.00, balanceAfter: 35.00, date: '2025-07-10' },
      { id: 'CR003', customerId: 'C003', amount: 100.00, type: 'recarga', reason: 'Recarga manual — cliente VIP', balanceBefore: 50.00, balanceAfter: 150.00, date: '2025-07-15' },
      { id: 'CR004', customerId: 'C003', amount: 50.00, type: 'recarga', reason: 'Bono por compra mayor a $200', balanceBefore: 0.00, balanceAfter: 50.00, date: '2025-07-01' },
      { id: 'CR005', customerId: 'C003', amount: 45.00, type: 'uso', reason: 'Pago con crédito — TXN-002', balanceBefore: 95.00, balanceAfter: 50.00, date: '2025-07-12' },
      { id: 'CR006', customerId: 'C005', amount: 45.50, type: 'devolucion', reason: 'Devolución bolso color incorrecto', balanceBefore: 0.00, balanceAfter: 45.50, date: '2025-07-19' },
      { id: 'CR007', customerId: 'C006', amount: 200.00, type: 'recarga', reason: 'Recarga cuenta crédito — pago adelantado', balanceBefore: 0.00, balanceAfter: 200.00, date: '2025-07-05' },
      { id: 'CR008', customerId: 'C004', amount: 28.00, type: 'devolucion', reason: 'Devolución conjunto deportivo — cancelación', balanceBefore: 0.00, balanceAfter: 28.00, date: '2025-07-17' },
      { id: 'CR009', customerId: 'C007', amount: 89.89, type: 'uso', reason: 'Pago con crédito — TXN-007', balanceBefore: 99.89, balanceAfter: 10.00, date: '2025-07-16' },
      { id: 'CR010', customerId: 'C007', amount: 99.89, type: 'recarga', reason: 'Recarga crédito — bono aniversario', balanceBefore: 0.00, balanceAfter: 99.89, date: '2025-07-14' },
    ],
  })
  console.log('  ✓ Credit transactions (10)')

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
