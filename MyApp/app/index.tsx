import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>YAP</Text>
        </View>

        {/* App Name */}
        <Text style={styles.title}>yap collective</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          learning debate made easy
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>
            Get Started →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a2b3e',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 35,
    backgroundColor: '#dcbbbc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  logoText: {
    fontSize: 44,
    fontWeight: '700',
    color: '#3a2b3e',
  },

  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f9eeee',
    textTransform: 'lowercase',
    marginBottom: 12,
  },

  tagline: {
    fontSize: 18,
    color: '#f9eeee',
    textAlign: 'center',
    marginBottom: 70,
  },

  button: {
    width: '100%',
    backgroundColor: '#af8a9a',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3a2b3e',
  },
});