import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { UserProfileBadge } from '@/components/UserProfileBadge';
import { getCurrentUser, getUsers, UserProfile } from '@/storage/database';

const sampleLeaders = [
  { id: 'sample-1', name: 'jimmy123', xp: 760 },
  { id: 'sample-2', name: 'john6767', xp: 670 },
  { id: 'sample-3', name: 'timmytan67', xp: 540 },
  { id: 'sample-4', name: 'john-tan', xp: 420 },
  { id: 'sample-5', name: 'jimmytuffknuckles', xp: 360 },
  { id: 'sample-6', name: 'timmythefirst', xp: 280 },
  { id: 'sample-7', name: 'jimjimbob', xp: 190 },
  { id: 'sample-8', name: 'timmyjimmy', xp: 90 },
  { id: 'sample-9', name: 'jimmythesecond', xp: 10 },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [leaders, setLeaders] = useState(sampleLeaders);

  useEffect(() => {
    async function loadUser() {
      const savedUser = await getCurrentUser();

      if (savedUser) {
        setUser(savedUser);
        const savedUsers = await getUsers();
        const userLeaders = savedUsers.map((savedAppUser) => ({
          id: savedAppUser.uid,
          name: savedAppUser.fullName.replace(/\s+/g, '').toLowerCase(),
          xp: savedAppUser.xp ?? 0,
        }));
        setLeaders([...userLeaders, ...sampleLeaders].sort((a, b) => b.xp - a.xp));
      } else {
        router.replace('/login');
      }
    }

    loadUser();
  }, [router]);

  const initials = getInitials(user?.fullName);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="menu" size={36} color="#cb8ba6" />
          </TouchableOpacity>

          <UserProfileBadge initials={initials} profileImageUri={user?.profileImageUri} xp={user?.xp ?? 0} />
        </View>

        <View style={styles.leaderboardCard}>
          <View style={styles.titleRow}>
            <Ionicons name="trophy" size={34} color="#64385c" />
            <Text style={styles.title}>Leaderboard</Text>
          </View>

          {leaders.map((leader, index) => {
            const isHighlight = leader.id === user?.uid;

            return (
              <View key={`${leader.name}-${index}`} style={[styles.rankRow, isHighlight && styles.rankRowHighlight]}>
                <View style={[styles.rankCircle, isHighlight && styles.rankCircleLight]}>
                  <Text style={[styles.rankNumber, isHighlight && styles.rankNumberDark]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.leaderName, isHighlight && styles.leaderNameLight]} numberOfLines={1}>
                  {leader.name}
                </Text>
                <Text style={styles.xpText}>{leader.xp} xp</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.footerText}>
          Complete courses, read general knowledge pages, and submit cases for practice motions to gain xp!
        </Text>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 430,
    paddingBottom: 36,
    paddingHorizontal: 22,
    paddingTop: 58,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 46,
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
  leaderboardCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 24,
    padding: 10,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  title: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 24,
  },
  rankRow: {
    alignItems: 'center',
    backgroundColor: '#cb8ba6',
    borderRadius: 17,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    minHeight: 42,
    paddingHorizontal: 8,
  },
  rankRowHighlight: {
    backgroundColor: '#64385c',
  },
  rankCircle: {
    alignItems: 'center',
    backgroundColor: '#3a2b3e',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  rankCircleLight: {
    backgroundColor: '#eab8b9',
  },
  rankNumber: {
    color: '#eab8b9',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
  rankNumberDark: {
    color: '#64385c',
  },
  leaderName: {
    color: '#3a2b3e',
    flex: 1,
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
  leaderNameLight: {
    color: '#f9eeee',
  },
  xpText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
  footerText: {
    color: '#eab8b9',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
    lineHeight: 26,
    marginTop: 40,
    textAlign: 'center',
  },
});
