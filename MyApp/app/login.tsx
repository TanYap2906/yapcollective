import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getUsers, saveCurrentUser } from '@/storage/database';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const users = await getUsers();
      
      const matchedUser = users.find(
        (user) =>
          user.email === email.trim().toLowerCase() &&
          user.password === password
      );

      if (matchedUser) {
        await saveCurrentUser(matchedUser);
        router.replace('/home');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch {
      Alert.alert('Error', 'Could not read saved users.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.subheading}>Continue your debate journey</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#64385c"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64385c"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Do not have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signup')} disabled={loading}>
            <Text style={styles.signupLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a2b3e' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  heading: { fontSize: 34, fontFamily: 'Alata_400Regular', color: '#f9eeee', textAlign: 'center', marginBottom: 10 },
  subheading: { fontSize: 16, fontFamily: 'Alata_400Regular', color: '#eab8b9', textAlign: 'center', marginBottom: 32 },
  card: { backgroundColor: '#cb8ba6', borderRadius: 28, padding: 22 },
  input: { backgroundColor: '#eab8b9', height: 56, borderRadius: 18, paddingHorizontal: 18, marginBottom: 14, color: '#3a2b3e', fontSize: 16, fontFamily: 'Alata_400Regular' },
  loginButton: { backgroundColor: '#3a2b3e', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#f9eeee', fontSize: 18, fontFamily: 'Alata_400Regular' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  signupText: { color: '#eab8b9', fontSize: 15, fontFamily: 'Alata_400Regular' },
  signupLink: { color: '#f9eeee', fontSize: 15, fontFamily: 'Alata_400Regular' },
});
