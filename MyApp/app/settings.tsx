import { Ionicons } from '@expo/vector-icons';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getCurrentUser,
  logoutUser,
  updateCurrentUserProfile,
  UserProfile,
} from '@/storage/database';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const savedUser = await getCurrentUser();

      if (!savedUser) {
        router.replace('/login');
        return;
      }

      setUser(savedUser);
      setFullName(savedUser.fullName);
      setPassword(savedUser.password);
      setProfileImageUri(savedUser.profileImageUri);
    }

    loadUser();
  }, [router]);

  const initials = getInitials(fullName);

  const pickProfilePicture = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Photo permission', 'Please allow photo access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.75,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0]?.uri;

      if (selectedUri) {
        try {
          setIsSavingPhoto(true);
          const savedImageUri = saveProfilePictureLocally(selectedUri);
          setProfileImageUri(savedImageUri);

          const updatedUser = await updateCurrentUserProfile({
            profileImageUri: savedImageUri,
          });

          if (updatedUser) {
            setUser(updatedUser);
            Alert.alert('Profile picture saved', 'Your new profile picture has been updated.');
          }
        } catch {
          Alert.alert('Photo error', 'Could not save that profile picture. Please try another image.');
        } finally {
          setIsSavingPhoto(false);
        }
      }
    }
  };

  const saveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter a username.');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Password too short', 'Please use at least 4 characters.');
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await updateCurrentUserProfile({
        fullName: fullName.trim(),
        password,
        profileImageUri,
      });

      if (updatedUser) {
        setUser(updatedUser);
        Alert.alert('Profile saved', 'Your profile has been updated.');
      }
    } catch {
      Alert.alert('Profile error', 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={34} color="#cb8ba6" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.85}
            disabled={isSavingPhoto}
            onPress={pickProfilePicture}
          >
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={17} color="#f9eeee" />
            </View>
          </TouchableOpacity>

          <Text style={styles.namePreview}>{fullName || 'Your username'}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
          <Text style={styles.xpText}>{user.xp ?? 0} xp earned</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#64385c"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput editable={false} style={[styles.input, styles.disabledInput]} value={user.email} />

          <Text style={styles.label}>Password</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64385c"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            activeOpacity={0.85}
            disabled={isSaving}
            onPress={saveProfile}
          >
            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Username & Password'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#f9eeee" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function saveProfilePictureLocally(uri: string) {
  const sourceFile = new File(uri);
  const profileDirectory = new Directory(Paths.document, 'profile-pictures');

  profileDirectory.create({ idempotent: true, intermediates: true });

  const fileExtension = sourceFile.extension || '.jpg';
  const savedFile = new File(profileDirectory, `profile-${Date.now()}${fileExtension}`);

  sourceFile.copy(savedFile);
  return savedFile.uri;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a2b3e' },
  centerContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  loadingText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 20,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 430,
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 34,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  iconButton: {
    height: 48,
    justifyContent: 'center',
    width: 52,
  },
  title: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 35,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarButton: {
    alignItems: 'center',
    backgroundColor: '#eab8b9',
    borderRadius: 49,
    height: 98,
    justifyContent: 'center',
    marginBottom: 12,
    width: 98,
  },
  avatarImage: {
    borderRadius: 49,
    height: 98,
    width: 98,
  },
  avatarInitials: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 34,
  },
  editIcon: {
    alignItems: 'center',
    backgroundColor: '#64385c',
    borderRadius: 15,
    bottom: 0,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 30,
  },
  namePreview: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 27,
    textAlign: 'center',
  },
  emailText: {
    color: '#eab8b9',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
    marginTop: 2,
  },
  xpText: {
    color: '#cb8ba6',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#cb8ba6',
    borderRadius: 24,
    marginBottom: 16,
    padding: 18,
  },
  sectionTitle: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 25,
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#eab8b9',
    borderRadius: 16,
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    minHeight: 53,
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  disabledInput: {
    color: '#64385c',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#64385c',
    borderRadius: 17,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 52,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 17,
  },
  logoutButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#64385c',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 26,
  },
  logoutText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
});
