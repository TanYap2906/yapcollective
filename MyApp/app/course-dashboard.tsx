import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { courses, getCompletedUnits } from '@/data/courses';
import { getCourseProgress, getCurrentUser, UserProfile } from '@/storage/database';

export default function CourseDashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courseProgresses, setCourseProgresses] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadDashboard() {
      const savedUser = await getCurrentUser();

      if (!savedUser) {
        router.replace('/login');
        return;
      }

      setUser(savedUser);

      const entries = await Promise.all(
        courses.map(async (course) => [course.id, await getCourseProgress(savedUser.uid, course.id)] as const)
      );
      setCourseProgresses(Object.fromEntries(entries));
    }

    loadDashboard();
  }, [router]);

  const initials = getInitials(user?.fullName);

  const openCourse = (courseId: string) => {
    router.push({
      pathname: '/course',
      params: { courseId },
    });
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

        <Text style={styles.title}>Course Dashboard</Text>

        {courses.map((course, index) => {
          const progress = courseProgresses[course.id] ?? 0;
          const completedUnits = getCompletedUnits(progress, course.totalUnits);

          return (
            <CourseCard
              completedUnits={completedUnits}
              course={course}
              key={course.id}
              onPress={() => openCourse(course.id)}
              progress={progress}
              variant={index % 3}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

type CourseCardProps = {
  completedUnits: number;
  course: (typeof courses)[number];
  onPress: () => void;
  progress: number;
  variant: number;
};

function CourseCard({ completedUnits, course, onPress, progress, variant }: CourseCardProps) {
  return (
    <View style={[styles.courseCard, variant === 1 && styles.courseCardMid, variant === 2 && styles.courseCardDark]}>
      <View style={styles.courseHeader}>
        <View style={[styles.courseNumber, variant === 2 && styles.courseNumberLight]}>
          <Text style={[styles.courseNumberText, variant === 2 && styles.courseNumberTextDark]}>
            {course.number}
          </Text>
        </View>
        <Text style={[styles.courseTitle, variant === 2 && styles.courseTitleLight]}>
          {course.title}
        </Text>
      </View>

      <ProgressBar progress={progress} variant={variant} />

      <View style={styles.courseFooter}>
        <TouchableOpacity
          style={[styles.enterButton, variant === 1 && styles.enterButtonDark]}
          activeOpacity={0.85}
          onPress={onPress}
        >
          <Text style={[styles.enterButtonText, variant === 1 && styles.enterButtonTextLight]}>
            Enter Course
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={variant === 1 ? '#f9eeee' : '#64385c'}
          />
        </TouchableOpacity>

        <Text style={[styles.unitText, variant === 2 && styles.unitTextLight]}>
          {completedUnits}/{course.totalUnits} completed
        </Text>
      </View>
    </View>
  );
}

function ProgressBar({ progress, variant }: { progress: number; variant: number }) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const trackColor = variant === 0 ? '#cb8ba6' : '#eab8b9';
  const fillColor = variant === 0 ? '#64385c' : '#f9eeee';

  useEffect(() => {
    Animated.timing(animatedProgress, {
      duration: 650,
      toValue: progress,
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, progress]);

  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: fillColor,
            width: animatedProgress.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
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
  title: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 35,
    marginBottom: 18,
  },
  courseCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 18,
    marginBottom: 12,
    padding: 13,
  },
  courseCardMid: {
    backgroundColor: '#cb8ba6',
  },
  courseCardDark: {
    backgroundColor: '#64385c',
  },
  courseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 9,
  },
  courseNumber: {
    alignItems: 'center',
    backgroundColor: '#64385c',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  courseNumberLight: {
    backgroundColor: '#eab8b9',
  },
  courseNumberText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 24,
  },
  courseNumberTextDark: {
    color: '#64385c',
  },
  courseTitle: {
    color: '#3a2b3e',
    flex: 1,
    fontFamily: 'Alata_400Regular',
    fontSize: 25,
  },
  courseTitleLight: {
    color: '#f9eeee',
  },
  progressTrack: {
    borderRadius: 12,
    height: 26,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 12,
    height: '100%',
  },
  courseFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  enterButton: {
    alignItems: 'center',
    backgroundColor: '#f9eeee',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  enterButtonDark: {
    backgroundColor: '#64385c',
  },
  enterButtonText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
  },
  enterButtonTextLight: {
    color: '#f9eeee',
  },
  unitText: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
  },
  unitTextLight: {
    color: '#f9eeee',
  },
});
