// ============================================================
// mobile/lib/helpers.ts
// Pure utility functions — no Supabase calls here
// ============================================================
import { StockStatus, ExpiryStatus } from '../types'

export function getStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return 'out'
  if (quantity <= threshold) return 'low'
  return 'ok'
}

export function getExpiryStatus(expiryDate: string | null): ExpiryStatus | null {
  if (!expiryDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays <= 3) return 'expiring_soon'
  return 'fresh'
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function daysUntilExpiry(dateStr: string | null): number | null {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}