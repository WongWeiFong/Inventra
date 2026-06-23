import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Inventra</Text>
        <Text style={styles.title}>Your workspace starts here.</Text>
        <Text style={styles.subtitle}>
          This is the first screen of the app. Replace it with your own flows,
          data, and navigation as the product takes shape.
        </Text>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Status</Text>
          <Text style={styles.cardValue}>Ready</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Mode</Text>
          <Text style={styles.cardValue}>Expo Go</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Next step: wire in your first feature screen.</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingTop: 88,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  hero: {
    gap: 12,
  },
  kicker: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 6,
  },
  cardValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingTop: 12,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
