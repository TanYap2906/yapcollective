import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, UserProfile } from '@/storage/database';

const sampleLeaders = [
  { name: 'jimmy123', xp: '767676767 xp' },
  { name: 'john6767', xp: '67676767 xp' },
  { name: 'timmytan67', xp: '7676767 xp' },
  { name: 'john-tan', xp: '676767 xp' },
  { name: 'jimmytuffknuckles', xp: '76767 xp' },
  { name: 'timmythefirst', xp: '6767 xp' },
  { name: 'jimjimbob', xp: '767 xp' },
  { name: 'timmyjimmy', xp: '67 xp' },
  { name: 'jimmythesecond', xp: '7 xp' },
];

export default function LeaderboardScreen() {
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

  const initials = getInitials(user?.fullName);
  const username = user?.fullName.replace(/\s+/g, '').toLowerCase() || 'you';
  const leaders = [{ name: username, xp: '6767676767 xp' }, ...sampleLeaders];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="menu" size={36} color="#cb8ba6" />
          </TouchableOpacity>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>{initials}</Text>
          </View>
        </View>

        <View style={styles.leaderboardCard}>
          <View style={styles.titleRow}>
            <Ionicons name="trophy" size={34} color="#64385c" />
            <Text style={styles.title}>Leaderboard</Text>
          </View>

          {leaders.map((leader, index) => {
            const isHighlight = leader.name === username;

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
                <Text style={styles.xpText}>{leader.xp}</Text>
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
