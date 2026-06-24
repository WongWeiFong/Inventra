// ============================================================
// mobile/components/ExpiryBadge.tsx
// Badge showing expiry status + days remaining
// ============================================================
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ExpiryStatus } from '../types'
import { daysUntilExpiry } from '../lib/helpers'

const CONFIG = {
  fresh:         null,
  expiring_soon: { bg: '#FBEAF0', text: '#993556' },
  expired:       { bg: '#FCEBEB', text: '#791F1F' },
}

interface Props { status: ExpiryStatus | null; expiryDate: string | null }

export default function ExpiryBadge({ status, expiryDate }: Props) {
  if (!status || status === 'fresh') return null
  const c = CONFIG[status]!
  const days = daysUntilExpiry(expiryDate)
  const label = status === 'expired'
    ? `Expired ${Math.abs(days!)}d ago`
    : `Expires in ${days}d`
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      <Text style={[s.text, { color: c.text }]}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  text: { fontSize: 11, fontWeight: '500' },
})