// ============================================================
// mobile/components/ItemForm.tsx
// Shared form used by both AddItemScreen and EditItemScreen.
// Includes calendar date picker for expiry date.
// ============================================================
import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Modal, ActivityIndicator,
} from 'react-native'
import { getCategories, getStorageLocations } from '../lib/api'
import { Category, StorageLocation, Item } from '../types'

export interface ItemFormValues {
  name: string
  quantity: string
  unit: string
  threshold: string
  expiryDate: string   // ISO string YYYY-MM-DD or ''
  notes: string
  categoryId: string | null
  locationId: string | null
}

interface Props {
  initial?: Partial<ItemFormValues>
  onSave: (values: ItemFormValues) => Promise<void>
  onCancel: () => void
  saving: boolean
  title: string
}

// ── Mini calendar picker ─────────────────────────────────────

function CalendarPicker({
  value, onChange, onClose,
}: {
  value: string
  onChange: (date: string) => void
  onClose: () => void
}) {
  const today = new Date()
  const initial = value ? new Date(value) : today
  const [year, setYear]   = useState(initial.getFullYear())
  const [month, setMonth] = useState(initial.getMonth()) // 0-indexed
  const [selected, setSelected] = useState(value)

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

  // Build days grid for current month
  function buildGrid() {
    const first = new Date(year, month, 1).getDay()
    const total = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = Array(first).fill(null)
    for (let d = 1; d <= total; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  function toISO(d: number) {
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const grid = buildGrid()
  const todayISO = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  return (
    <View style={cal.container}>
      {/* Month navigation */}
      <View style={cal.nav}>
        <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
          <Text style={cal.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={cal.monthLabel}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
          <Text style={cal.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={cal.dayHeaders}>
        {DAYS.map(d => (
          <Text key={d} style={cal.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Date grid */}
      <View style={cal.grid}>
        {grid.map((day, i) => {
          if (!day) return <View key={i} style={cal.cell} />
          const iso = toISO(day)
          const isSelected = iso === selected
          const isToday    = iso === todayISO
          return (
            <TouchableOpacity
              key={i}
              style={[
                cal.cell,
                isSelected && cal.cellSelected,
                isToday && !isSelected && cal.cellToday,
              ]}
              onPress={() => setSelected(iso)}
            >
              <Text style={[
                cal.cellText,
                isSelected && cal.cellTextSelected,
                isToday && !isSelected && cal.cellTextToday,
              ]}>{day}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Actions */}
      <View style={cal.actions}>
        <TouchableOpacity onPress={onClose} style={cal.btnCancel}>
          <Text style={cal.btnCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { onChange(selected); onClose() }}
          style={[cal.btnConfirm, !selected && cal.btnDisabled]}
          disabled={!selected}
        >
          <Text style={cal.btnConfirmText}>
            {selected ? `Select ${selected}` : 'Pick a date'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ── Main form ────────────────────────────────────────────────

export default function ItemForm({ initial, onSave, onCancel, saving, title }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations]   = useState<StorageLocation[]>([])
  const [showCal, setShowCal]       = useState(false)

  const [name,       setName]       = useState(initial?.name       ?? '')
  const [quantity,   setQuantity]   = useState(initial?.quantity   ?? '1')
  const [unit,       setUnit]       = useState(initial?.unit       ?? '')
  const [threshold,  setThreshold]  = useState(initial?.threshold  ?? '1')
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ?? '')
  const [notes,      setNotes]      = useState(initial?.notes      ?? '')
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null)
  const [locationId, setLocationId] = useState<string | null>(initial?.locationId ?? null)

  useEffect(() => {
    getCategories().then(setCategories)
    getStorageLocations().then(setLocations)
  }, [])

  function handleSubmit() {
    onSave({ name, quantity, unit, threshold, expiryDate, notes, categoryId, locationId })
  }

  return (
    <ScrollView style={f.container} contentContainerStyle={f.content} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={f.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={f.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={f.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#4A42B0" />
            : <Text style={f.save}>Save</Text>}
        </TouchableOpacity>
      </View>

      {/* Name */}
      <Text style={f.label}>Item name *</Text>
      <TextInput
        style={f.input} placeholder="e.g. Chicken breast"
        value={name} onChangeText={setName}
      />

      {/* Quantity + unit */}
      <View style={f.row}>
        <View style={f.half}>
          <Text style={f.label}>Quantity</Text>
          <TextInput
            style={f.input} keyboardType="numeric"
            value={quantity} onChangeText={setQuantity}
          />
        </View>
        <View style={f.half}>
          <Text style={f.label}>Unit</Text>
          <TextInput
            style={f.input} placeholder="kg / pcs / ml"
            value={unit} onChangeText={setUnit}
          />
        </View>
      </View>

      {/* Low stock threshold */}
      <Text style={f.label}>Alert me when below</Text>
      <TextInput
        style={f.input} keyboardType="numeric"
        placeholder="e.g. 2" value={threshold} onChangeText={setThreshold}
      />

      {/* Expiry date — calendar picker */}
      <Text style={f.label}>Expiry date</Text>
      <TouchableOpacity style={f.datePicker} onPress={() => setShowCal(true)}>
        <Text style={[f.dateText, !expiryDate && f.datePlaceholder]}>
          {expiryDate ? `📅  ${expiryDate}` : '📅  Tap to pick a date'}
        </Text>
        {expiryDate && (
          <TouchableOpacity
            onPress={() => setExpiryDate('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={f.dateClear}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Calendar modal */}
      <Modal visible={showCal} transparent animationType="fade">
        <View style={f.modalOverlay}>
          <CalendarPicker
            value={expiryDate}
            onChange={setExpiryDate}
            onClose={() => setShowCal(false)}
          />
        </View>
      </Modal>

      {/* Category */}
      <Text style={f.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={f.chipRow}>
        {categories.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[f.chip, categoryId === c.id && f.chipActive]}
            onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
          >
            <Text style={f.chipIcon}>{c.icon}</Text>
            <Text style={[f.chipLabel, categoryId === c.id && f.chipLabelActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Storage location */}
      <Text style={f.label}>Storage location</Text>
      <View style={f.locGrid}>
        {locations.map(l => (
          <TouchableOpacity
            key={l.id}
            style={[f.locBtn, locationId === l.id && f.locBtnActive]}
            onPress={() => setLocationId(locationId === l.id ? null : l.id)}
          >
            <Text style={f.locIcon}>{l.icon}</Text>
            <Text style={[f.locLabel, locationId === l.id && f.locLabelActive]}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes */}
      <Text style={f.label}>Notes</Text>
      <TextInput
        style={[f.input, f.textarea]} multiline numberOfLines={3}
        placeholder="Any extra notes..." value={notes} onChangeText={setNotes}
      />
    </ScrollView>
  )
}

// ── Calendar styles ──────────────────────────────────────────
const cal = StyleSheet.create({
  container: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    width: 320, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 20, elevation: 10,
  },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 22, color: '#4A42B0', fontWeight: '600' },
  monthLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#888' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  cellSelected: { backgroundColor: '#4A42B0', borderRadius: 999 },
  cellToday: { backgroundColor: '#EEEDFE', borderRadius: 999 },
  cellText: { fontSize: 14, color: '#1A1A1A' },
  cellTextSelected: { color: '#fff', fontWeight: '700' },
  cellTextToday: { color: '#4A42B0', fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#F4F4F4', alignItems: 'center',
  },
  btnCancelText: { fontSize: 14, color: '#555', fontWeight: '500' },
  btnConfirm: {
    flex: 2, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#4A42B0', alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#C0BDEA' },
  btnConfirmText: { fontSize: 14, color: '#fff', fontWeight: '600' },
})

// ── Form styles ──────────────────────────────────────────────
const f = StyleSheet.create({
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
  row: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  half: { flex: 1 },
  datePicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 0.5, borderColor: '#E4E4E4', marginHorizontal: 16, marginBottom: 16,
  },
  dateText: { fontSize: 15, color: '#1A1A1A' },
  datePlaceholder: { color: '#AAA' },
  dateClear: { fontSize: 14, color: '#AAA', paddingLeft: 8 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
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
