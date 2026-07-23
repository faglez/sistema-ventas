'use client'

import { Fragment, useEffect } from 'react'
import { CustomerStatement } from '@/lib/actions/credits'
import { StoreSettings } from '@/lib/actions/settings'
import type { CreditTransactionType } from '@/types'

const TYPE_LABELS: Record<CreditTransactionType, string> = {
  recarga:    'Recarga',
  devolucion: 'Devolución',
  ajuste:     'Ajuste',
  uso:        'Cargo',
}

interface Props {
  statements: CustomerStatement[]
  settings: StoreSettings
  generatedAt: string
}

export function CreditStatementPrint({ statements, settings, generatedAt }: Props) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {/* Print controls — hidden on print */}
      <div className="no-print flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          Imprimir
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          Cerrar
        </button>
        <span className="text-xs text-gray-400 ml-2">
          {statements.length} cliente{statements.length !== 1 ? 's' : ''} · generado {generatedAt}
        </span>
      </div>

      {/* Print content */}
      <div className="print-root">
        {statements.map((stmt, idx) => (
          <div key={stmt.customerId} className={idx > 0 ? 'page-break' : ''}>
            {/* Store header */}
            <div className="store-header">
              <div className="store-name">{settings.storeName.toUpperCase()}</div>
              {settings.storeAddress && <div className="store-detail">{settings.storeAddress}</div>}
              {settings.storePhone && <div className="store-detail">{settings.storePhone}</div>}
              {settings.storeEmail && <div className="store-detail">{settings.storeEmail}</div>}
              <div className="doc-title">ESTADO DE CUENTA — CLIENTE DE CRÉDITO</div>
              <div className="store-detail">Emitido: {generatedAt}</div>
            </div>

            <div className="divider" />

            {/* Customer info */}
            <div className="customer-block">
              <div className="customer-row">
                <div>
                  <div className="customer-name">{stmt.customerName.toUpperCase()}</div>
                  <div className="customer-email">{stmt.customerEmail}</div>
                </div>
                <div className="credit-summary-box">
                  <div className="credit-row">
                    <span className="credit-label">Límite de crédito</span>
                    <span className="credit-value">${stmt.creditLimit.toFixed(2)}</span>
                  </div>
                  <div className="credit-row">
                    <span className="credit-label">Saldo actual</span>
                    <span className="credit-value bold">${stmt.creditBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Movements table */}
            <table className="movements-table">
              <thead>
                <tr>
                  <th className="col-date">Fecha</th>
                  <th className="col-type">Tipo</th>
                  <th className="col-desc">Concepto / Artículos</th>
                  <th className="col-amount right">Cargo</th>
                  <th className="col-amount right">Abono</th>
                  <th className="col-balance right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {stmt.entries.map((entry, i) => (
                  <Fragment key={i}>
                    <tr className={entry.creditType === 'uso' ? 'row-cargo' : 'row-abono'}>
                      <td className="col-date">{entry.date}</td>
                      <td className="col-type">
                        <span className={`type-badge type-${entry.creditType}`}>
                          {TYPE_LABELS[entry.creditType]}
                        </span>
                      </td>
                      <td className="col-desc">{entry.description}</td>
                      <td className="col-amount right">
                        {entry.cargo > 0 ? <span className="amount-cargo">−${entry.cargo.toFixed(2)}</span> : <span className="dash">—</span>}
                      </td>
                      <td className="col-amount right">
                        {entry.abono > 0 ? <span className="amount-abono">+${entry.abono.toFixed(2)}</span> : <span className="dash">—</span>}
                      </td>
                      <td className="col-balance right bold">${entry.balanceAfter.toFixed(2)}</td>
                    </tr>
                    {/* Items sub-rows for purchases */}
                    {entry.items?.map((item, j) => (
                      <tr key={`${i}-item-${j}`} className="row-item">
                        <td />
                        <td />
                        <td className="item-detail">
                          <span className="item-bullet">└</span>
                          {item.name}
                          {item.selectedSize && item.selectedSize !== '—' && (
                            <span className="item-attr"> T:{item.selectedSize}</span>
                          )}
                          {item.selectedColor && item.selectedColor !== '—' && (
                            <span className="item-attr"> · {item.selectedColor}</span>
                          )}
                          <span className="item-qty"> × {item.quantity}</span>
                        </td>
                        <td className="right item-price" colSpan={2}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td />
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>

            <div className="divider" />

            {/* Customer totals */}
            <div className="totals-block">
              <div className="totals-row">
                <span className="totals-label">Total abonos al crédito</span>
                <span className="totals-abono">+${stmt.totalAbonos.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Total cargos utilizados</span>
                <span className="totals-cargo">−${stmt.totalCargos.toFixed(2)}</span>
              </div>
              <div className="totals-row totals-balance">
                <span className="totals-label">Saldo disponible actual</span>
                <span className="totals-value">${stmt.creditBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="footer-note">
              Este documento es un estado de cuenta oficial de {settings.storeName}.
              Conserve este comprobante para sus registros.
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
        }

        .print-root {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 11px;
          color: #111;
          max-width: 760px;
          margin: 0 auto;
          padding: 24px 32px;
        }

        .page-break { page-break-before: always; padding-top: 24px; }

        /* Store header */
        .store-header { text-align: center; margin-bottom: 6px; }
        .store-name { font-size: 18px; font-weight: 900; letter-spacing: 3px; color: #1e1b4b; }
        .store-detail { font-size: 10px; color: #6b7280; margin-top: 1px; }
        .doc-title { font-size: 13px; font-weight: 700; letter-spacing: 1px; color: #374151; margin-top: 10px; }

        /* Divider */
        .divider { border-top: 1px solid #e5e7eb; margin: 10px 0; }

        /* Customer block */
        .customer-block { margin: 10px 0; }
        .customer-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .customer-name { font-size: 14px; font-weight: 800; color: #111827; }
        .customer-email { font-size: 10px; color: #6b7280; margin-top: 2px; }
        .credit-summary-box { background: #f3f4f6; border-radius: 6px; padding: 8px 12px; min-width: 180px; }
        .credit-row { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 3px; }
        .credit-label { font-size: 10px; color: #6b7280; }
        .credit-value { font-size: 11px; color: #111; }
        .bold { font-weight: 700; }

        /* Table */
        .movements-table { width: 100%; border-collapse: collapse; margin: 4px 0; }
        .movements-table thead tr { border-bottom: 2px solid #111827; }
        .movements-table th {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; color: #374151; padding: 5px 4px; text-align: left;
        }
        .movements-table td { padding: 5px 4px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }

        .col-date { width: 80px; font-size: 10px; color: #6b7280; white-space: nowrap; }
        .col-type { width: 76px; }
        .col-desc { font-size: 10px; color: #374151; }
        .col-amount { width: 80px; font-size: 11px; }
        .col-balance { width: 80px; font-size: 11px; }
        .right { text-align: right; }

        /* Type badges */
        .type-badge {
          display: inline-block; font-size: 9px; font-weight: 600;
          padding: 1px 6px; border-radius: 10px; border: 1px solid;
        }
        .type-recarga    { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
        .type-devolucion { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
        .type-ajuste     { background: #f3f4f6; color: #4b5563; border-color: #e5e7eb; }
        .type-uso        { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }

        /* Amount colors */
        .amount-cargo { color: #b91c1c; font-weight: 600; }
        .amount-abono { color: #15803d; font-weight: 600; }
        .dash { color: #d1d5db; }

        /* Item sub-rows */
        .row-item td { padding: 2px 4px; border-bottom: none; }
        .item-detail { font-size: 10px; color: #6b7280; padding-left: 8px !important; }
        .item-bullet { color: #9ca3af; margin-right: 4px; }
        .item-attr { color: #9ca3af; }
        .item-qty { color: #6b7280; font-weight: 500; }
        .item-price { font-size: 10px; color: #374151; }

        /* Totals */
        .totals-block { margin: 10px 0; padding: 10px 12px; background: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb; }
        .totals-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .totals-label { font-size: 10px; color: #6b7280; }
        .totals-cargo { font-size: 11px; font-weight: 600; color: #b91c1c; }
        .totals-abono { font-size: 11px; font-weight: 600; color: #15803d; }
        .totals-balance { border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 4px; }
        .totals-value { font-size: 13px; font-weight: 800; color: #4338ca; }

        /* Footer */
        .footer-note {
          margin-top: 14px; font-size: 9px; color: #9ca3af;
          text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 8px;
        }
      `}</style>
    </>
  )
}
