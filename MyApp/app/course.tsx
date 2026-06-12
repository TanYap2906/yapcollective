import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutAnimation,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCourseById } from '@/data/courses';
import {
  getCourseProgress,
  getCurrentUser,
  saveCourseProgress,
  UserProfile,
} from '@/storage/database';

const totalSteps = 3;

const orderingItems = [
  'State the argument you are answering.',
  'Explain why the argument is weak.',
  'Compare why your side still wins the debate.',
];

export default function CourseScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const course = getCourseById(courseId);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [orderedItems, setOrderedItems] = useState(orderingItems);
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadCourse() {
      const savedUser = await getCurrentUser();

      if (!savedUser) {
        router.replace('/login');
        return;
      }

      setUser(savedUser);
      setProgress(await getCourseProgress(savedUser.uid, course.id));
    }

    loadCourse();
  }, [course.id, router]);

  const initials = getInitials(user?.fullName);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      duration: 650,
      toValue: progress,
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, progress]);

  const saveProgressForStep = async (nextStep: number) => {
    if (!user) {
      return;
    }

    const nextProgress = Math.round((nextStep / totalSteps) * 100);
    await saveCourseProgress(user.uid, course.id, nextProgress);
    setProgress(Math.max(progress, nextProgress));
  };

  const goNext = async () => {
    const nextStep = Math.min(step + 1, totalSteps);
    await saveProgressForStep(nextStep);

    if (nextStep === totalSteps) {
      Alert.alert('Course complete', `Nice work. Your ${course.title} progress is now complete.`);
      router.replace('/home');
      return;
    }

    setStep(nextStep);
  };

  const submitQuiz = async () => {
    if (!selectedAnswer) {
      Alert.alert('Choose an answer', 'Pick one quiz answer before moving on.');
      return;
    }

    await goNext();
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;

    if (nextIndex < 0 || nextIndex >= orderedItems.length) {
      return;
    }

    const nextItems = [...orderedItems];
    const currentItem = nextItems[index];
    nextItems[index] = nextItems[nextIndex];
    nextItems[nextIndex] = currentItem;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOrderedItems(nextItems);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={34} color="#cb8ba6" />
          </TouchableOpacity>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.unitLabel}>UNIT {course.number}.1</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: animatedProgress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {step === 0 && <LessonContent courseTitle={course.title} onNext={goNext} />}
        {step === 1 && (
          <QuizContent
            courseTitle={course.title}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            onSubmit={submitQuiz}
          />
        )}
        {step === 2 && (
          <OrderingContent
            courseTitle={course.title}
            orderedItems={orderedItems}
            moveItem={moveItem}
            onSubmit={goNext}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonContent({ courseTitle, onNext }: { courseTitle: string; onNext: () => void }) {
  return (
    <View>
      <Text style={styles.pageTitle}>What is {courseTitle.toLowerCase()}?</Text>
      <View style={styles.lightCard}>
        <Text style={styles.bodyText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse in lacus sit
          amet dui viverra volutpat quis nec augue. Mauris viverra pharetra lorem sed
          maximus. Morbi lacinia aliquet augue id interdum. Cras euismod imperdiet nulla at
          hendrerit. Quisque sed iaculis elit. Fusce pellentesque augue purus, sit amet
          lacinia nisl semper sed.
        </Text>
      </View>

      <Text style={styles.exampleTitle}>For example:</Text>
      <View style={styles.darkCard}>
        <Text style={styles.exampleText}>
          - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
        <Text style={styles.exampleText}>
          - Etiam pretium nisl id sapien mollis sollicitudin.
        </Text>
      </View>

      <NextButton label="Next" onPress={onNext} />
    </View>
  );
}

type QuizContentProps = {
  courseTitle: string;
  onSubmit: () => void;
  selectedAnswer: string;
  setSelectedAnswer: (answer: string) => void;
};

function QuizContent({ courseTitle, onSubmit, selectedAnswer, setSelectedAnswer }: QuizContentProps) {
  const answers = [
    'Ignore the other team and repeat your speech.',
    'Answer an opposing argument and explain why yours is stronger.',
    'Only ask a question during crossfire.',
  ];

  return (
    <View>
      <Text style={styles.pageTitle}>Quick quiz</Text>
      <View style={styles.lightCard}>
        <Text style={styles.questionText}>Which option best describes {courseTitle.toLowerCase()}?</Text>
        {answers.map((answer) => {
          const isSelected = selectedAnswer === answer;

          return (
            <TouchableOpacity
              key={answer}
              style={[styles.answerButton, isSelected && styles.answerButtonSelected]}
              activeOpacity={0.85}
              onPress={() => setSelectedAnswer(answer)}
            >
              <Text style={[styles.answerText, isSelected && styles.answerTextSelected]}>
                {answer}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <NextButton label="Submit" onPress={onSubmit} />
    </View>
  );
}

type OrderingContentProps = {
  courseTitle: string;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  onSubmit: () => void;
  orderedItems: string[];
};

function OrderingContent({ courseTitle, moveItem, onSubmit, orderedItems }: OrderingContentProps) {
  return (
    <View>
      <Text style={styles.pageTitle}>Order {courseTitle.toLowerCase()}</Text>
      <View style={styles.lightCard}>
        <Text style={styles.questionText}>Put these rebuttal steps in a strong order.</Text>
        {orderedItems.map((item, index) => (
          <DraggableOrderRow
            index={index}
            item={item}
            key={item}
            moveItem={moveItem}
            totalItems={orderedItems.length}
          />
        ))}
      </View>

      <NextButton label="Finish" onPress={onSubmit} />
    </View>
  );
}

type DraggableOrderRowProps = {
  index: number;
  item: string;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  totalItems: number;
};

function DraggableOrderRow({ index, item, moveItem, totalItems }: DraggableOrderRowProps) {
  const dragY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 8,
      onPanResponderMove: Animated.event([null, { dy: dragY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        const shouldMove = Math.abs(gestureState.dy) > 34;
        const direction = gestureState.dy < 0 ? 'up' : 'down';

        Animated.spring(dragY, {
          friction: 7,
          tension: 80,
          toValue: 0,
          useNativeDriver: false,
        }).start();

        if (shouldMove) {
          moveItem(index, direction);
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, {
          friction: 7,
          tension: 80,
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.orderRow, { transform: [{ translateY: dragY }] }]}
    >
      <View style={styles.dragHandle}>
        <Ionicons name="reorder-three" size={23} color="#64385c" />
      </View>
      <Text style={styles.orderNumber}>{index + 1}</Text>
      <Text style={styles.orderText}>{item}</Text>
      <View style={styles.orderButtons}>
        <TouchableOpacity disabled={index === 0} onPress={() => moveItem(index, 'up')}>
          <Ionicons
            name="chevron-up"
            size={22}
            color={index === 0 ? '#cb8ba6' : '#64385c'}
          />
        </TouchableOpacity>
        <TouchableOpacity disabled={index === totalItems - 1} onPress={() => moveItem(index, 'down')}>
          <Ionicons
            name="chevron-down"
            size={22}
            color={index === totalItems - 1 ? '#cb8ba6' : '#64385c'}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function NextButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.nextButton} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.nextButtonText}>{label}</Text>
      <Ionicons name="arrow-forward" size={20} color="#64385c" />
    </TouchableOpacity>
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
  unitLabel: {
    backgroundColor: '#cb8ba6',
    borderRadius: 13,
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 20,
    marginBottom: 7,
    paddingVertical: 4,
    textAlign: 'center',
  },
  progressTrack: {
    backgroundColor: '#eab8b9',
    borderRadius: 12,
    height: 20,
    marginBottom: 25,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#f9eeee',
    borderRadius: 12,
    height: '100%',
  },
  pageTitle: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 27,
    marginBottom: 9,
  },
  lightCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 21,
    marginBottom: 12,
    padding: 15,
  },
  bodyText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  exampleTitle: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 20,
    marginBottom: 6,
  },
  darkCard: {
    backgroundColor: '#cb8ba6',
    borderRadius: 13,
    marginBottom: 14,
    padding: 15,
  },
  exampleText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  questionText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
    marginBottom: 12,
  },
  answerButton: {
    backgroundColor: '#f9eeee',
    borderRadius: 14,
    marginBottom: 10,
    padding: 12,
  },
  answerButtonSelected: {
    backgroundColor: '#64385c',
  },
  answerText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
  },
  answerTextSelected: {
    color: '#f9eeee',
  },
  orderRow: {
    alignItems: 'center',
    backgroundColor: '#f9eeee',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 10,
  },
  dragHandle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
  },
  orderNumber: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 19,
    width: 22,
  },
  orderText: {
    color: '#3a2b3e',
    flex: 1,
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  orderButtons: {
    gap: 4,
  },
  nextButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#eab8b9',
    borderRadius: 17,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  nextButtonText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 21,
  },
});
