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
import { UserProfileBadge } from '@/components/UserProfileBadge';
import { getCurrentUser, UserProfile } from '@/storage/database';

const readingLinks = [
  'https://en.wikipedia.org/wiki/Dictatorship',
  'https://en.wikipedia.org/wiki/Totalitarianism',
  'https://en.wikipedia.org/wiki/Authoritarianism',
  'https://en.wikipedia.org/wiki/History_of_democracy',
  'https://en.wikipedia.org/wiki/Political_science',
  'https://en.wikipedia.org/wiki/Civil_liberties',
];

const loremText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse in lacus sit amet dui viverra volutpat quis nec augue. Mauris viverra pharetra lorem sed maximus. Morbi lacinia aliquet augue id interdum. Cras euismod imperdiet nulla at hendrerit. Quisque sed iaculis elit. Fusce pellentesque augue purus, sit amet lacinia nisl semper sed. Nunc viverra fringilla est, sed lacinia turpis egestas vitae. Nulla dictum eros id purus venenatis fringilla. Nunc consequat nisi id nunc vehicula aliquam. Nam id accumsan dui. Praesent vitae libero at orci facilisis dignissim. Integer euismod, augue id suscipit vulputate, ipsum neque cursus lectus, vitae posuere risus ante vel risus.';

export default function GeneralKnowledgeScreen() {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={34} color="#cb8ba6" />
          </TouchableOpacity>

          <UserProfileBadge initials={initials} xp={user?.xp ?? 0} />
        </View>

        <View style={styles.topicCard}>
          <Text style={styles.topicHeading}>{"This week's general knowledge topic is:"}</Text>
          <View style={styles.topicBox}>
            <Text style={styles.topicTitle}>Historical Dictatorships</Text>
          </View>
        </View>

        <ScrollView style={styles.articleCard} nestedScrollEnabled showsVerticalScrollIndicator>
          <Text style={styles.articleText}>{loremText}</Text>
          <Text style={styles.articleText}>{loremText}</Text>
        </ScrollView>

        <View style={styles.linksCard}>
          <Text style={styles.linksHeading}>Other reading materials:</Text>
          <ScrollView style={styles.linksList} nestedScrollEnabled showsVerticalScrollIndicator>
            {readingLinks.map((link) => (
              <View key={link} style={styles.linkRow}>
                <Text style={styles.bullet}>-</Text>
                <Text style={styles.linkText}>{link}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.quizIntroCard}>
          <Text style={styles.quizIntroTitle}>General Knowledge Quiz</Text>
          <View style={styles.quizTopicBox}>
            <Text style={styles.quizTopicText}>Historical Dictatorships</Text>
          </View>
          <TouchableOpacity
            style={styles.enterQuizButton}
            activeOpacity={0.85}
            onPress={() => router.push('/gk-quiz')}
          >
            <Text style={styles.enterQuizText}>Enter Quiz</Text>
            <Ionicons name="arrow-forward" size={22} color="#f9eeee" />
          </TouchableOpacity>
        </View>

        <Text style={styles.rewardText}>Read GK topics for extra rewards!</Text>
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
  topicCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 22,
    marginBottom: 13,
    padding: 12,
  },
  topicHeading: {
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
  topicTitle: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 24,
    textAlign: 'center',
  },
  articleCard: {
    backgroundColor: '#64385c',
    borderRadius: 20,
    marginBottom: 12,
    maxHeight: 358,
    padding: 15,
  },
  articleText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 14,
  },
  linksCard: {
    backgroundColor: '#cb8ba6',
    borderRadius: 16,
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  linksHeading: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  linksList: {
    maxHeight: 96,
  },
  linkRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  bullet: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 17,
    lineHeight: 23,
  },
  linkText: {
    color: '#f9eeee',
    flex: 1,
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  quizIntroCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 22,
    marginBottom: 18,
    padding: 12,
  },
  quizIntroTitle: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  quizTopicBox: {
    alignItems: 'center',
    backgroundColor: '#cb8ba6',
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 10,
  },
  quizTopicText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 24,
    textAlign: 'center',
  },
  enterQuizButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#64385c',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 5,
    marginTop: 9,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  enterQuizText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
  },
  rewardText: {
    color: '#eab8b9',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    textAlign: 'center',
  },
});
