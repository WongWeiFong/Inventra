// ============================================================
// mobile/screens/LoginScreen.tsx
// Email + password login and signup, plus Google sign-in
// ============================================================
import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

const redirectUri = makeRedirectUri({
  scheme: 'com.inventra.app',
})

function extractAuthCode(url: string) {
  const match = url.match(/[?&]code=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        Alert.alert('Account created!', 'You can now log in.')
        setIsLogin(true)
      }
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      })

      if (error) throw error
      if (!data.url) throw new Error('Unable to start Google sign-in')

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)

      if (result.type === 'success' && result.url) {
        const authCode = extractAuthCode(result.url)
        if (!authCode) {
          throw new Error('Google sign-in did not return an auth code')
        }

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode)
        if (exchangeError) throw exchangeError
      }
    } catch (e: any) {
      Alert.alert('Google sign-in error', e.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <Text style={s.logo}>🏠</Text>
        <Text style={s.appName}>Inventra</Text>
        <Text style={s.tagline}>Your household, always stocked</Text>

        <View style={s.form}>
          <TouchableOpacity style={s.googleBtn} onPress={handleGoogleLogin} disabled={googleLoading || loading}>
            {googleLoading
              ? <ActivityIndicator color="#1A1A1A" />
              : <Text style={s.googleBtnText}>Continue with Google</Text>}
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <TextInput
            style={s.input}
            placeholder="Email address"
            placeholderTextColor="#AAA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor="#AAA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading || googleLoading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>{isLogin ? 'Sign in' : 'Create account'}</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading || googleLoading}>
          <Text style={s.toggle}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Text style={s.toggleLink}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  tagline: { fontSize: 15, color: '#888', marginBottom: 40 },
  form: { width: '100%', gap: 12, marginBottom: 24 },
  googleBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E4E4E4',
  },
  googleBtnText: { color: '#1A1A1A', fontWeight: '700', fontSize: 16 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E4E4',
  },
  dividerText: {
    color: '#999',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 0.5,
    borderColor: '#E4E4E4',
    width: '100%',
  },
  btn: {
    backgroundColor: '#4A42B0',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggle: { fontSize: 14, color: '#888' },
  toggleLink: { color: '#4A42B0', fontWeight: '600' },
})