import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser } from '@/storage/database';

export default function WelcomeScreen() {
  const router = useRouter();
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    async function checkSavedLogin() {
      const savedUser = await getCurrentUser();

      if (savedUser) {
        router.replace('/home');
      } else {
        setCheckingUser(false);
      }
    }

    checkSavedLogin();
  }, [router]);

  if (checkingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator color="#f9eeee" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>YAP</Text>
        </View>

        <Text style={styles.title}>yap collective</Text>
        <Text style={styles.tagline}>learning debate made easy</Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
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
    backgroundColor: '#eab8b9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  logoText: {
    fontSize: 44,
    fontFamily: 'Alata_400Regular',
    color: '#3a2b3e',
  },

  title: {
    fontSize: 36,
    fontFamily: 'Alata_400Regular',
    color: '#f9eeee',
    textTransform: 'lowercase',
    marginBottom: 12,
  },

  tagline: {
    fontSize: 18,
    fontFamily: 'Alata_400Regular',
    color: '#f9eeee',
    textAlign: 'center',
    marginBottom: 70,
  },

  button: {
    width: '100%',
    backgroundColor: '#cb8ba6',
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
    fontFamily: 'Alata_400Regular',
    color: '#3a2b3e',
  },
});
