// ============================================================
// mobile/App.tsx
// Entry point — handles auth state, shows Login or main app
// ============================================================
import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import AppNavigator from './navigation/AppNavigator'
import LoginScreen  from './screens/LoginScreen'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

supabase.from('categories').select('*').then(({ data, error }) => {
  if (error) console.error('❌ DB Error:', error.message)
  else console.log('✅ DB connected! Categories:', data?.length)
})

  useEffect(() => {
    // Check existing session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A42B0" />
      </View>
    )
  }

  return session ? <AppNavigator /> : <LoginScreen />
}
