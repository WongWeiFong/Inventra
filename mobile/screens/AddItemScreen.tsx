// ============================================================
// mobile/screens/AddItemScreen.tsx
// Form to add a new inventory item
// ============================================================
import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { addItem, getCategories, getStorageLocations } from '../lib/api'
import { Category, StorageLocation } from '../types'

export default function AddItemScreen() {
  const nav = useNavigation()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<StorageLocation[]>([])

  // Form state
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('')
  const [threshold, setThreshold] = useState('1')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    getCategories().then(setCategories)
    getStorageLocations().then(setLocations)
  }, [])

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter an item name.'); return }
    try {
      setSaving(true)
      await addItem({
        name: name.trim(),
        quantity: parseFloat(quantity) || 1,
        unit: unit.trim() || null,
        low_stock_threshold: parseFloat(threshold) || 1,
        expiry_date: expiryDate.trim() || null,
        notes: notes.trim() || null,
        category_id: categoryId,
        storage_location_id: locationId,
      })
      nav.goBack()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={s.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Add Item</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#4A42B0" />
            : <Text style={s.save}>Save</Text>}
        </TouchableOpacity>
      </View>

      {/* Item name */}
      <Text style={s.label}>Item name *</Text>
      <TextInput style={s.input} placeholder="e.g. Chicken breast" value={name} onChangeText={setName} />

      {/* Quantity + unit */}
      <View style={s.row}>
        <View style={s.half}>
          <Text style={s.label}>Quantity</Text>
          <TextInput style={s.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
        </View>
        <View style={s.half}>
          <Text style={s.label}>Unit</Text>
          <TextInput style={s.input} placeholder="kg / pcs / ml" value={unit} onChangeText={setUnit} />
        </View>
      </View>

      {/* Low stock threshold */}
      <Text style={s.label}>Alert me when below</Text>
      <TextInput
        style={s.input} keyboardType="numeric"
        placeholder="e.g. 2" value={threshold} onChangeText={setThreshold}
      />

      {/* Expiry date */}
      <Text style={s.label}>Expiry date</Text>
      <TextInput
        style={s.input} placeholder="YYYY-MM-DD (e.g. 2025-12-31)"
        value={expiryDate} onChangeText={setExpiryDate}
      />

      {/* Category picker */}
      <Text style={s.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
        {categories.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[s.chip, categoryId === c.id && s.chipActive]}
            onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
          >
            <Text style={s.chipIcon}>{c.icon}</Text>
            <Text style={[s.chipLabel, categoryId === c.id && s.chipLabelActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Storage location picker */}
      <Text style={s.label}>Storage location</Text>
      <View style={s.locGrid}>
        {locations.map(l => (
          <TouchableOpacity
            key={l.id}
            style={[s.locBtn, locationId === l.id && s.locBtnActive]}
            onPress={() => setLocationId(locationId === l.id ? null : l.id)}
          >
            <Text style={s.locIcon}>{l.icon}</Text>
            <Text style={[s.locLabel, locationId === l.id && s.locLabelActive]}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes */}
      <Text style={s.label}>Notes</Text>
      <TextInput
        style={[s.input, s.textarea]} multiline numberOfLines={3}
        placeholder="Any extra notes..." value={notes} onChangeText={setNotes}
      />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  content: { paddingBottom: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8', marginBottom: 20,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1A1A1A' },
  cancel: { fontSize: 16, color: '#888' },
  save: { fontSize: 16, color: '#4A42B0', fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '500', color: '#555', marginLeft: 20, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, borderWidth: 0.5, borderColor: '#E4E4E4',
    marginHorizontal: 16, marginBottom: 16,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 0 },
  half: { flex: 1 },
  chipRow: { paddingHorizontal: 16, marginBottom: 16, flexGrow: 0 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  chipActive: { backgroundColor: '#4A42B0', borderColor: '#4A42B0' },
  chipIcon: { fontSize: 14 },
  chipLabel: { fontSize: 13, color: '#555' },
  chipLabelActive: { color: '#fff' },
  locGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  locBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  locBtnActive: { backgroundColor: '#4A42B0', borderColor: '#4A42B0' },
  locIcon: { fontSize: 16 },
  locLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  locLabelActive: { color: '#fff' },
})