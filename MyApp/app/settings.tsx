import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={34} color="#cb8ba6" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>Settings options will go here.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a2b3e' },
  content: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 430,
    paddingHorizontal: 22,
    paddingTop: 34,
    width: '100%',
  },
  iconButton: {
    height: 48,
    justifyContent: 'center',
    marginBottom: 24,
    width: 52,
  },
  title: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 35,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#eab8b9',
    borderRadius: 18,
    padding: 16,
  },
  cardText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
});
