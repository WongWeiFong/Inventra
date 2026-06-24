// ============================================================
// mobile/screens/ItemDetailScreen.tsx
// View full details of one item + quick actions
// ============================================================
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { getItemById, deleteItem } from '../lib/api'
import { ItemWithStatus } from '../types'
import StockBadge from '../components/StockBadge'
import ExpiryBadge from '../components/ExpiryBadge'
import { formatDate } from '../lib/helpers'

export default function ItemDetailScreen() {
  const nav = useNavigation<any>()
  const { itemId } = useRoute<any>().params
  const [item, setItem] = useState<ItemWithStatus | null>(null)

  useEffect(() => { getItemById(itemId).then(setItem) }, [itemId])

  async function handleDelete() {
    Alert.alert('Delete item', `Remove "${item?.name}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteItem(itemId)
          nav.goBack()
        }
      },
    ])
  }

  if (!item) return <ActivityIndicator style={{ flex: 1 }} />

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('EditItem', { itemId })}><Text style={s.edit}>Edit</Text></TouchableOpacity>
      </View>

      <View style={s.hero}>
        <Text style={s.heroIcon}>{item.categories?.icon ?? '📦'}</Text>
        <Text style={s.heroName}>{item.name}</Text>
        <View style={s.heroBadges}>
          <StockBadge status={item.stockStatus} />
          <ExpiryBadge status={item.expiryStatus} expiryDate={item.expiry_date} />
        </View>
      </View>

      <View style={s.card}>
        <Row label="Category"    value={`${item.categories?.icon} ${item.categories?.name ?? '—'}`} />
        <Row label="Location"    value={`${item.storage_locations?.icon} ${item.storage_locations?.name ?? '—'}`} />
        <Row label="Quantity"    value={`${item.quantity}${item.unit ? ' ' + item.unit : ''}`} />
        <Row label="Low stock alert" value={`Below ${item.low_stock_threshold}${item.unit ? ' ' + item.unit : ''}`} />
        <Row label="Expiry date" value={formatDate(item.expiry_date)} />
        <Row label="Notes"       value={item.notes ?? '—'} last />
      </View>

      <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
        <Text style={s.deleteBtnText}>Delete item</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.row, last && { borderBottomWidth: 0 }]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  back: { fontSize: 16, color: '#4A42B0' },
  edit: { fontSize: 16, color: '#4A42B0', fontWeight: '600' },
  hero: { alignItems: 'center', paddingVertical: 32, gap: 10, backgroundColor: '#fff', marginBottom: 16 },
  heroIcon: { fontSize: 56 },
  heroName: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  heroBadges: { flexDirection: 'row', gap: 8 },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14,
    borderWidth: 0.5, borderColor: '#E4E4E4', marginBottom: 16,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0',
  },
  rowLabel: { fontSize: 14, color: '#888', fontWeight: '500' },
  rowValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 16 },
  deleteBtn: {
    marginHorizontal: 16, marginBottom: 40, paddingVertical: 14,
    backgroundColor: '#FCEBEB', borderRadius: 14, alignItems: 'center',
  },
  deleteBtnText: { color: '#A32D2D', fontWeight: '600', fontSize: 15 },
})