// ============================================================
// mobile/components/StockBadge.tsx
// Small coloured badge showing In stock / Low / Out
// ============================================================
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { StockStatus } from '../types'

const CONFIG = {
  ok:  { bg: '#EAF3DE', text: '#27500A', label: 'In stock' },
  low: { bg: '#FAEEDA', text: '#633806', label: 'Low' },
  out: { bg: '#FCEBEB', text: '#791F1F', label: 'Out' },
}

export default function StockBadge({ status }: { status: StockStatus }) {
  const c = CONFIG[status]
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      <Text style={[s.text, { color: c.text }]}>{c.label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  text: { fontSize: 11, fontWeight: '500' },
})