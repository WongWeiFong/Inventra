// ============================================================
// mobile/screens/ExpiryScreen.tsx
// Shows items expiring soon or already expired
// ============================================================
import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useExpiringItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import EmptyState from '../components/EmptyState'

const FILTERS = [
  { days: 3,  label: 'Next 3 days' },
  { days: 7,  label: 'Next 7 days' },
  { days: 30, label: 'Next 30 days' },
]

export default function ExpiryScreen() {
  const nav = useNavigation<any>()
  const [days, setDays] = useState(7)
  const { items, loading } = useExpiringItems(days)

  const expired = items.filter(i => i.expiryStatus === 'expired')
  const expiringSoon = items.filter(i => i.expiryStatus === 'expiring_soon')

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Expiry Tracker</Text>
      </View>

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.days}
            style={[s.filter, days === f.days && s.filterActive]}
            onPress={() => setDays(f.days)}
          >
            <Text style={[s.filterLabel, days === f.days && s.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            contentContainerStyle={s.list}
            ListHeaderComponent={
              <>
                {expired.length > 0 && <Text style={[s.sectionLabel, { color: '#A32D2D' }]}>⚠️ Already expired ({expired.length})</Text>}
                {expiringSoon.length > 0 && expired.length > 0 && <Text style={[s.sectionLabel, { color: '#993556', marginTop: 8 }]}>📅 Expiring soon ({expiringSoon.length})</Text>}
              </>
            }
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onPress={() => nav.navigate('ItemDetail', { itemId: item.id })}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="✅"
                title="All good!"
                subtitle={`No items expiring within the next ${days} days`}
              />
            }
          />
        )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  header: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  filterRow: { flexDirection: 'row', padding: 16, gap: 10 },
  filter: {
    flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  filterActive: { backgroundColor: '#4A42B0', borderColor: '#4A42B0' },
  filterLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  filterLabelActive: { color: '#fff' },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
})