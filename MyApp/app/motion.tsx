import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, UserProfile } from '@/storage/database';

const infoSlideText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse in lacus sit amet dui viverra volutpat quis nec augue. Mauris viverra pharetra lorem sed maximus.';

export default function WeeklyMotionScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [proposition, setProposition] = useState('');
  const [opposition, setOpposition] = useState('');

  useEffect(() => {
    async function loadUser() {
      const savedUser = await getCurrentUser();

      if (savedUser) {
        setUser(savedUser);
      } else {
        router.replace('/login');
      }
    }

    loadUser();
  }, [router]);

  const initials = getInitials(user?.fullName);

  const handleSubmit = (side: string, text: string) => {
    if (!text.trim()) {
      Alert.alert('Add an argument', `Please write your ${side} argument first.`);
      return;
    }

    Alert.alert('Saved', `Your ${side} argument was submitted.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={34} color="#cb8ba6" />
            </TouchableOpacity>

            <View style={styles.profileCircle}>
              <Text style={styles.profileText}>{initials}</Text>
            </View>
          </View>

          <View style={styles.motionCard}>
            <Text style={styles.motionHeading}>{"This week's practice motion is:"}</Text>
            <View style={styles.motionBox}>
              <Text style={styles.motionText}>THS amnesty for dictators</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Info Slide:</Text>
            <Text style={styles.infoText}>{infoSlideText}</Text>
          </View>

          <ArgumentInput
            title="Input your Proposition arguments:"
            value={proposition}
            onChangeText={setProposition}
            onSubmit={() => handleSubmit('proposition', proposition)}
          />

          <ArgumentInput
            darker
            title="Input your Opposition arguments:"
            value={opposition}
            onChangeText={setOpposition}
            onSubmit={() => handleSubmit('opposition', opposition)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type ArgumentInputProps = {
  darker?: boolean;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  title: string;
  value: string;
};

function ArgumentInput({ darker, onChangeText, onSubmit, title, value }: ArgumentInputProps) {
  return (
    <View style={[styles.inputCard, darker && styles.inputCardDark]}>
      <Text style={styles.inputTitle}>{title}</Text>
      <TextInput
        multiline
        placeholder="Start brainstorming..."
        placeholderTextColor="#eab8b9"
        style={styles.textInput}
        textAlignVertical="top"
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={onSubmit}>
        <Text style={styles.submitText}>Submit</Text>
        <Ionicons name="arrow-forward" size={15} color="#f9eeee" />
      </TouchableOpacity>
    </View>
  );
}

function getInitials(name?: string) {
  if (!name) {
    return '';
  }

  return name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a2b3e' },
  keyboardView: { flex: 1 },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 430,
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 34,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 44,
  },
  iconButton: {
    height: 48,
    justifyContent: 'center',
    width: 52,
  },
  profileCircle: {
    alignItems: 'center',
    backgroundColor: '#eab8b9',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  profileText: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
  motionCard: {
    backgroundColor: '#64385c',
    borderRadius: 22,
    marginBottom: 13,
    padding: 12,
  },
  motionHeading: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  motionBox: {
    alignItems: 'center',
    backgroundColor: '#cb8ba6',
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 10,
  },
  motionText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 24,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#cb8ba6',
    borderRadius: 16,
    marginBottom: 17,
    padding: 16,
  },
  infoTitle: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 20,
    textAlign: 'center',
  },
  infoText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 22,
    marginBottom: 14,
    padding: 12,
  },
  inputCardDark: {
    backgroundColor: '#cb8ba6',
  },
  inputTitle: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 19,
    marginBottom: 10,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#f9eeee',
    borderRadius: 15,
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
    minHeight: 74,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  submitButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#64385c',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  submitText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
  },
});
