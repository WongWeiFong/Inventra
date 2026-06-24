// ============================================================
// mobile/components/EmptyState.tsx
// Shown when a list has no items
// ============================================================
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Props { icon?: string; title: string; subtitle?: string }

export default function EmptyState({ icon = '📦', title, subtitle }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.sub}>{subtitle}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 64, paddingHorizontal: 32 },
  icon: { fontSize: 52, marginBottom: 14 },
  title: { fontSize: 17, fontWeight: '600', color: '#222', textAlign: 'center' },
  sub: { fontSize: 14, color: '#888', marginTop: 6, textAlign: 'center', lineHeight: 20 },
})