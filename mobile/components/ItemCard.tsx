// ============================================================
// mobile/components/ItemCard.tsx
// Reusable card for displaying one inventory item
// ============================================================
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ItemWithStatus } from '../types'
import StockBadge from './StockBadge'
import ExpiryBadge from './ExpiryBadge'

interface Props {
  item: ItemWithStatus
  onPress: () => void
  onQuantityChange?: (id: string, qty: number) => void
}

export default function ItemCard({ item, onPress, onQuantityChange }: Props) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.row}>
        <Text style={s.icon}>{item.categories?.icon ?? '📦'}</Text>
        <View style={s.info}>
          <Text style={s.name} numberOfLines={1}>{item.name}</Text>
          <Text style={s.meta}>
            {item.storage_locations?.icon} {item.storage_locations?.name ?? 'No location'}
            {item.unit
              ? `  ·  ${item.quantity} ${item.unit}`
              : `  ·  Qty: ${item.quantity}`}
          </Text>
        </View>
        <View style={s.badges}>
          <StockBadge status={item.stockStatus} />
          <ExpiryBadge status={item.expiryStatus} expiryDate={item.expiry_date} />
        </View>
      </View>

      {onQuantityChange && (
        <View style={s.qtyRow}>
          <TouchableOpacity
            style={s.qtyBtn}
            onPress={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1))}
          >
            <Text style={s.qtySymbol}>−</Text>
          </TouchableOpacity>
          <Text style={s.qtyNum}>{item.quantity}</Text>
          <TouchableOpacity
            style={s.qtyBtn}
            onPress={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            <Text style={s.qtySymbol}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 0.5, borderColor: '#E4E4E4',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 28, width: 36, textAlign: 'center' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '500', color: '#1A1A1A', marginBottom: 3 },
  meta: { fontSize: 12, color: '#888' },
  badges: { alignItems: 'flex-end' },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', marginTop: 10, gap: 14,
  },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center',
  },
  qtySymbol: { fontSize: 20, color: '#333', lineHeight: 24 },
  qtyNum: { fontSize: 16, fontWeight: '500', color: '#1A1A1A', minWidth: 24, textAlign: 'center' },
})