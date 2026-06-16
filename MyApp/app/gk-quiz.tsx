import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserProfileBadge } from '@/components/UserProfileBadge';
import { XpPopup } from '@/components/XpPopup';
import { awardXpOnce, getCurrentUser, UserProfile } from '@/storage/database';

const quizQuestions = [
  {
    answer: 'Lorem ipsum answer B',
    options: ['Lorem ipsum answer A', 'Lorem ipsum answer B', 'Lorem ipsum answer C'],
    question: 'Lorem ipsum dolor sit amet, which answer is most relevant?',
  },
  {
    answer: 'Suspendisse option C',
    options: ['Suspendisse option A', 'Suspendisse option B', 'Suspendisse option C'],
    question: 'Suspendisse in lacus sit amet dui viverra means what in this filler quiz?',
  },
  {
    answer: 'Mauris response A',
    options: ['Mauris response A', 'Mauris response B', 'Mauris response C'],
    question: 'Mauris viverra pharetra lorem sed maximus points to which idea?',
  },
  {
    answer: 'Cras choice B',
    options: ['Cras choice A', 'Cras choice B', 'Cras choice C'],
    question: 'Cras euismod imperdiet nulla is best matched with which option?',
  },
  {
    answer: 'Final filler answer C',
    options: ['Final filler answer A', 'Final filler answer B', 'Final filler answer C'],
    question: 'Final question: which filler answer completes the GK check?',
  },
];

export default function GeneralKnowledgeQuizScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [xpPopup, setXpPopup] = useState<{ amount: number; message: string } | null>(null);

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

  const handleAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      Alert.alert('Almost there', 'Please answer all 5 questions before submitting.');
      return;
    }

    const score = quizQuestions.reduce((total, question, index) => {
      return selectedAnswers[index] === question.answer ? total + 1 : total;
    }, 0);

    if (!user) {
      return;
    }

    const result = await awardXpOnce(user.uid, 'gk-quiz-historical-dictatorships', 30);

    if (result.user) {
      setUser(result.user);
    }

    if (result.awarded) {
      setXpPopup({
        amount: 30,
        message: `You completed the GK quiz with ${score}/${quizQuestions.length}!`,
      });
    } else {
      Alert.alert('Quiz submitted', `You scored ${score}/${quizQuestions.length}.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={34} color="#cb8ba6" />
          </TouchableOpacity>

          <UserProfileBadge initials={initials} xp={user?.xp ?? 0} />
        </View>

        <View style={styles.quizHeaderCard}>
          <Text style={styles.quizHeaderTitle}>General Knowledge Quiz</Text>
          <View style={styles.quizTopicBox}>
            <Text style={styles.quizTopicText}>Historical Dictatorships</Text>
          </View>
        </View>

        {quizQuestions.map((question, questionIndex) => (
          <View key={question.question} style={styles.questionCard}>
            <Text style={styles.questionTitle}>
              {questionIndex + 1}. {question.question}
            </Text>
            {question.options.map((option) => {
              const isSelected = selectedAnswers[questionIndex] === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.answerButton, isSelected && styles.answerButtonSelected]}
                  activeOpacity={0.85}
                  onPress={() => handleAnswer(questionIndex, option)}
                >
                  <Text style={[styles.answerText, isSelected && styles.answerTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity style={styles.submitQuizButton} activeOpacity={0.85} onPress={handleSubmitQuiz}>
          <Text style={styles.submitQuizText}>Submit Quiz</Text>
          <Ionicons name="arrow-forward" size={18} color="#64385c" />
        </TouchableOpacity>
      </ScrollView>
      <XpPopup
        amount={xpPopup?.amount ?? 0}
        message={xpPopup?.message ?? ''}
        visible={Boolean(xpPopup)}
        onClose={() => setXpPopup(null)}
      />
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
    marginBottom: 24,
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
  quizHeaderCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 22,
    marginBottom: 14,
    padding: 12,
  },
  quizHeaderTitle: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 20,
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
  questionCard: {
    backgroundColor: '#64385c',
    borderRadius: 28,
    marginBottom: 12,
    padding: 16,
  },
  questionTitle: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 21,
    lineHeight: 30,
    marginBottom: 18,
  },
  answerButton: {
    backgroundColor: '#eab8b9',
    borderRadius: 22,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  answerButtonSelected: {
    backgroundColor: '#cb8ba6',
  },
  answerText: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 17,
  },
  answerTextSelected: {
    color: '#3a2b3e',
  },
  submitQuizButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#eab8b9',
    borderRadius: 17,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  submitQuizText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
});
