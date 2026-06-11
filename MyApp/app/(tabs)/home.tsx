import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, logoutUser, UserProfile } from '@/storage/database';

const courseProgress = 33;

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

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

  const firstName = user.fullName.split(' ')[0] || user.fullName;
  const initials = user.fullName
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Ionicons name="menu" size={36} color="#cb8ba6" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton} activeOpacity={0.8} onPress={handleLogout}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.username}>{firstName}</Text>
        </View>

        <View style={styles.coursesCard}>
          <Text style={styles.sectionTitle}>Courses & Practice</Text>

          <View style={styles.lessonCard}>
            <View style={styles.lessonHeader}>
              <View style={styles.lessonNumber}>
                <Text style={styles.lessonNumberText}>2</Text>
              </View>
              <Text style={styles.lessonTitle}>Rebuttals</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${courseProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{courseProgress}% completed</Text>
          </View>

          <TouchableOpacity style={styles.pillButton} activeOpacity={0.85}>
            <Text style={styles.pillButtonText}>Enter Course</Text>
            <Ionicons name="arrow-forward" size={18} color="#64385c" />
          </TouchableOpacity>
        </View>

        <View style={styles.gkCard}>
          <Text style={styles.smallHeading}>{"This week's general knowledge topic is:"}</Text>
          <View style={styles.topicBox}>
            <Text style={styles.topicText}>Historical Dictatorships</Text>
          </View>
          <TouchableOpacity
            style={styles.smallPillButton}
            activeOpacity={0.85}
            onPress={() => router.push('/gk')}
          >
            <Text style={styles.smallPillText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={15} color="#f9eeee" />
          </TouchableOpacity>
        </View>

        <View style={styles.motionCard}>
          <Text style={styles.motionHeading}>{"This week's practice motion is:"}</Text>
          <View style={styles.motionBox}>
            <Text style={styles.motionText}>THS amnesty for dictators</Text>
          </View>
          <TouchableOpacity style={styles.motionPillButton} activeOpacity={0.85}>
            <Text style={styles.motionPillText}>Info Slide</Text>
            <Ionicons name="arrow-forward" size={15} color="#64385c" />
          </TouchableOpacity>
        </View>

        <Text style={styles.rewardText}>Log in daily for extra rewards!</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a2b3e' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#f9eeee', fontFamily: 'Alata_400Regular', fontSize: 20 },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 430,
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 24,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  iconButton: {
    height: 48,
    justifyContent: 'center',
    width: 52,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: '#eab8b9',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  profileInitials: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
  greetingBlock: { marginBottom: 34 },
  greeting: {
    color: '#eab8b9',
    fontFamily: 'Alata_400Regular',
    fontSize: 27,
    marginBottom: 4,
  },
  username: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 33,
    lineHeight: 42,
  },
  coursesCard: {
    backgroundColor: '#cb8ba6',
    borderRadius: 27,
    marginBottom: 10,
    paddingBottom: 12,
    paddingHorizontal: 11,
    paddingTop: 8,
  },
  sectionTitle: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 27,
    textAlign: 'center',
  },
  lessonCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 15,
    marginTop: 6,
    padding: 12,
  },
  lessonHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    marginBottom: 10,
  },
  lessonNumber: {
    alignItems: 'center',
    backgroundColor: '#64385c',
    borderRadius: 24,
    height: 47,
    justifyContent: 'center',
    width: 47,
  },
  lessonNumberText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 25,
  },
  lessonTitle: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 27,
  },
  progressTrack: {
    backgroundColor: '#cb8ba6',
    borderRadius: 12,
    height: 26,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#64385c',
    borderRadius: 12,
    height: '100%',
  },
  progressText: {
    alignSelf: 'flex-end',
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
    marginTop: 5,
  },
  pillButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#f9eeee',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 9,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  pillButtonText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
  },
  gkCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 22,
    marginBottom: 10,
    padding: 12,
  },
  smallHeading: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  topicBox: {
    alignItems: 'center',
    backgroundColor: '#cb8ba6',
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 10,
  },
  topicText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 25,
    textAlign: 'center',
  },
  smallPillButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#64385c',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 4,
    marginTop: 9,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  smallPillText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
  },
  motionCard: {
    backgroundColor: '#64385c',
    borderRadius: 22,
    marginBottom: 18,
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
    minHeight: 57,
    paddingHorizontal: 10,
  },
  motionText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 23,
    textAlign: 'center',
  },
  motionPillButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#eab8b9',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 4,
    marginTop: 9,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  motionPillText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
  },
  rewardText: {
    color: '#eab8b9',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    textAlign: 'center',
  },
});
