import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Add authentication logic here
    console.log('Login pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Welcome Back</Text>

        <Text style={styles.subheading}>
          Continue your debate journey
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#7f6873"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#7f6873"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>
              Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>
            Don't have an account?
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.signupLink}>
              {' '}Sign Up
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
  },

  heading: {
    fontSize: 34,
    fontWeight: '700',
    color: '#f9eeee',
    textAlign: 'center',
    marginBottom: 10,
  },

  subheading: {
    fontSize: 16,
    color: '#dcbbbc',
    textAlign: 'center',
    marginBottom: 32,
  },

  card: {
    backgroundColor: '#af8a9a',
    borderRadius: 28,
    padding: 22,
  },

  input: {
    backgroundColor: '#dcbbbc',
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    color: '#3a2b3e',
    fontSize: 16,
  },

  loginButton: {
    backgroundColor: '#3a2b3e',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  loginButtonText: {
    color: '#f9eeee',
    fontSize: 18,
    fontWeight: '700',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },

  signupText: {
    color: '#dcbbbc',
    fontSize: 15,
  },

  signupLink: {
    color: '#f9eeee',
    fontSize: 15,
    fontWeight: '700',
  },
});