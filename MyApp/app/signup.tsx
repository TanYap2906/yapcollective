import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    // Add signup logic here
    console.log('Sign Up pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Create Account</Text>

        <Text style={styles.subheading}>
          Join Yap Collective and start debating
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#7f6873"
            value={name}
            onChangeText={setName}
          />

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

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#7f6873"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
          >
            <Text style={styles.signupButtonText}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginLink}>
              {' '}Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a2b3e',
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
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

  signupButton: {
    backgroundColor: '#3a2b3e',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  signupButtonText: {
    color: '#f9eeee',
    fontSize: 18,
    fontWeight: '700',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },

  loginText: {
    color: '#dcbbbc',
    fontSize: 15,
  },

  loginLink: {
    color: '#f9eeee',
    fontSize: 15,
    fontWeight: '700',
  },
});