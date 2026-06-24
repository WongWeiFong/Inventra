// ============================================================
// mobile/screens/ProfileScreen.tsx
// User profile, stats, and sign out
// ============================================================
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import { getAllItems } from '../lib/api'

export default function ProfileScreen() {
  const [email, setEmail] = useState('')
  const [stats, setStats] = useState({ total: 0, low: 0, expiring: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
    getAllItems().then(items => setStats({
      total: items.length,
      low: items.filter(i => i.stockStatus !== 'ok').length,
      expiring: items.filter(i => i.expiryStatus && i.expiryStatus !== 'fresh').length,
    }))
  }, [])

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ])
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
      </View>

      <View style={s.avatar}>
        <Text style={s.avatarIcon}>🏠</Text>
        <Text style={s.email}>{email}</Text>
      </View>

      <View style={s.statsRow}>
        <StatCard num={stats.total}    label="Total items" />
        <StatCard num={stats.low}      label="Low stock"   color="#BA7517" />
        <StatCard num={stats.expiring} label="Expiring"    color="#993556" />
      </View>

      <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
        <Text style={s.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  )
}

function StatCard({ num, label, color = '#1A1A1A' }: { num: number; label: string; color?: string }) {
  return (
    <View style={sc.card}>
      <Text style={[sc.num, { color }]}>{num}</Text>
      <Text style={sc.label}>{label}</Text>
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
  avatar: { alignItems: 'center', paddingVertical: 32 },
  avatarIcon: { fontSize: 56, marginBottom: 10 },
  email: { fontSize: 15, color: '#555' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 32 },
  signOutBtn: {
    marginHorizontal: 16, padding: 16, backgroundColor: '#FCEBEB',
    borderRadius: 14, alignItems: 'center',
  },
  signOutText: { color: '#A32D2D', fontWeight: '600', fontSize: 15 },
})

const sc = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 0.5, borderColor: '#E4E4E4',
  },
  num: { fontSize: 28, fontWeight: '700' },
  label: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
})