import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveUser, UserProfile } from '@/storage/database';

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignup = async (): Promise<void> => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Simulate unique ID generation for user assignment matching
      const mockUid = Math.random().toString(36).substring(2, 15);

      const newUser: UserProfile = {
        uid: mockUid,
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
        earnedRewardIds: [],
        submittedMotionIds: [],
        xp: 0,
        role: 'user',
      };

      await saveUser(newUser);

      Alert.alert('Success', 'Account created. Welcome to Yap Collective.');
      router.replace('/home');

    } catch (error: any) {
      Alert.alert('Signup Error', error.message || 'Could not save user data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subheading}>Join Yap Collective and start debating</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#64385c"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
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
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#64385c"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.signupButton, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/login')} disabled={loading}>
            <Text style={styles.loginLink}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a2b3e' },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  heading: { fontSize: 34, fontFamily: 'Alata_400Regular', color: '#f9eeee', textAlign: 'center', marginBottom: 10 },
  subheading: { fontSize: 16, fontFamily: 'Alata_400Regular', color: '#eab8b9', textAlign: 'center', marginBottom: 32 },
  card: { backgroundColor: '#cb8ba6', borderRadius: 28, padding: 22 },
  input: { backgroundColor: '#eab8b9', height: 56, borderRadius: 18, paddingHorizontal: 18, marginBottom: 14, color: '#3a2b3e', fontSize: 16, fontFamily: 'Alata_400Regular' },
  signupButton: { backgroundColor: '#3a2b3e', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  signupButtonText: { color: '#f9eeee', fontSize: 18, fontFamily: 'Alata_400Regular' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  loginText: { color: '#eab8b9', fontSize: 15, fontFamily: 'Alata_400Regular' },
  loginLink: { color: '#f9eeee', fontSize: 15, fontFamily: 'Alata_400Regular' },
});
