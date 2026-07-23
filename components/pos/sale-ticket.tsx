import { TicketData } from '@/types'

const methodLabels: Record<string, string> = {
  tarjeta: 'Tarjeta de crédito/débito',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
  credito: 'Crédito del cliente',
}

interface SaleTicketProps {
  data: TicketData
}

export function SaleTicket({ data }: SaleTicketProps) {
  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '12px',
        color: '#111',
        width: '100%',
        lineHeight: '1.65',
      }}
    >
      {/* Store header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '2px' }}>
          {data.store.name.toUpperCase()}
        </div>
        {data.store.address && (
          <div style={{ fontSize: '11px', color: '#555' }}>{data.store.address}</div>
        )}
        {data.store.phone && (
          <div style={{ fontSize: '11px', color: '#555' }}>{data.store.phone}</div>
        )}
        {data.store.email && (
          <div style={{ fontSize: '11px', color: '#555' }}>{data.store.email}</div>
        )}
      </div>

      <Divider />

      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontWeight: 'bold', letterSpacing: '1px' }}>TICKET DE VENTA</div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{data.id}</div>
        <div style={{ fontSize: '11px', color: '#555' }}>
          {data.date} &nbsp; {data.time}
        </div>
      </div>

      {data.customer && (
        <>
          <Divider />
          <div style={{ fontSize: '11px' }}>
            <span style={{ color: '#555' }}>Cliente: </span>
            <span style={{ fontWeight: 'bold' }}>{data.customer.name}</span>
          </div>
        </>
      )}

      <Divider />

      {/* Items */}
      {data.items.map((item, i) => (
        <div key={i} style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{item.name}</div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#555',
            }}
          >
            <span>
              T: {item.selectedSize} · {item.selectedColor}
            </span>
            <span style={{ fontWeight: 'bold', color: '#111' }}>
              ${(item.quantity * item.unitPrice).toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {item.quantity} u × ${item.unitPrice.toFixed(2)}
          </div>
        </div>
      ))}

      <Divider />

      {/* Totals */}
      <Row label="Subtotal" value={`$${data.subtotal.toFixed(2)}`} />
      {data.discount > 0 && (
        <Row label="Descuento" value={`-$${data.discount.toFixed(2)}`} />
      )}
      <Row label={`Impuesto (${data.taxRate}%)`} value={`$${data.tax.toFixed(2)}`} />
      {data.creditApplied > 0 && (
        <Row
          label="Crédito aplicado"
          value={`-$${data.creditApplied.toFixed(2)}`}
          accent
        />
      )}

      <Divider />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          fontSize: '14px',
          marginBottom: '4px',
        }}
      >
        <span>TOTAL</span>
        <span>${data.total.toFixed(2)}</span>
      </div>

      <Divider />

      <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>
        Método de pago:{' '}
        <span style={{ fontWeight: 'bold', color: '#111' }}>
          {methodLabels[data.paymentMethod] ?? data.paymentMethod}
        </span>
      </div>

      <Divider />

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#555' }}>
        <div>¡Gracias por su compra!</div>
        <div style={{ marginTop: '2px' }}>— {data.store.name} —</div>
        <div style={{ marginTop: '2px', fontSize: '10px', color: '#888' }}>Conserve este ticket como comprobante.</div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        borderTop: '1px dashed #bbb',
        margin: '8px 0',
      }}
    />
  )
}

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: accent ? '#4F46E5' : '#555',
        marginBottom: '2px',
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: accent ? 'bold' : 'normal' }}>{value}</span>
    </div>
  )
}
