import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { courses } from '@/data/courses';
import {
  getCourseProgress,
  getCurrentUser,
  logoutUser,
  UserProfile,
} from '@/storage/database';

const FEATURED_COURSE_ID = 'rebuttals';
const drawerWidth = 340;

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courseProgresses, setCourseProgresses] = useState<Record<string, number>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerX = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    async function loadUser() {
      const savedUser = await getCurrentUser();

      if (savedUser) {
        setUser(savedUser);
        await loadCourseProgresses(savedUser.uid);
      } else {
        router.replace('/login');
      }
    }

    loadUser();
  }, [router]);

  useEffect(() => {
    Animated.timing(drawerX, {
      duration: 280,
      toValue: isDrawerOpen ? 0 : -drawerWidth,
      useNativeDriver: true,
    }).start();
  }, [drawerX, isDrawerOpen]);

  const loadCourseProgresses = async (userId: string) => {
    const entries = await Promise.all(
      courses.map(async (course) => [course.id, await getCourseProgress(userId, course.id)] as const)
    );

    setCourseProgresses(Object.fromEntries(entries));
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const openCourse = (courseId: string) => {
    setIsDrawerOpen(false);
    router.push({
      pathname: '/course',
      params: { courseId },
    });
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
  const initials = getInitials(user.fullName);
  const featuredCourse = courses.find((course) => course.id === FEATURED_COURSE_ID) ?? courses[1];
  const featuredProgress = courseProgresses[featuredCourse.id] ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.8}
            onPress={() => setIsDrawerOpen(true)}
          >
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
                <Text style={styles.lessonNumberText}>{featuredCourse.number}</Text>
              </View>
              <Text style={styles.lessonTitle}>{featuredCourse.title}</Text>
            </View>

            <ProgressBar progress={featuredProgress} trackStyle={styles.progressTrack} />
            <Text style={styles.progressText}>{featuredProgress}% completed</Text>
          </View>

          <TouchableOpacity
            style={styles.pillButton}
            activeOpacity={0.85}
            onPress={() => openCourse(featuredCourse.id)}
          >
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
          <TouchableOpacity
            style={styles.motionPillButton}
            activeOpacity={0.85}
            onPress={() => router.push('/motion')}
          >
            <Text style={styles.motionPillText}>Info Slide</Text>
            <Ionicons name="arrow-forward" size={15} color="#64385c" />
          </TouchableOpacity>
        </View>

        <Text style={styles.rewardText}>Log in daily for extra rewards!</Text>
      </ScrollView>

      {isDrawerOpen && (
        <Pressable style={styles.scrim} onPress={() => setIsDrawerOpen(false)} />
      )}

      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerX }] }]}>
        <View style={styles.drawerTopBar}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => setIsDrawerOpen(false)}>
            <Ionicons name="close" size={33} color="#cb8ba6" />
          </TouchableOpacity>
          <View style={styles.profileButton}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.drawerTitle}>Menu</Text>

        <View style={styles.drawerNav}>
          <DrawerNavItem
            icon="book"
            label="Course Dashboard"
            onPress={() => {
              setIsDrawerOpen(false);
              router.push('/course-dashboard');
            }}
          />
          <DrawerNavItem
            icon="podium"
            label="Leaderboard"
            onPress={() => {
              setIsDrawerOpen(false);
              router.push('/leaderboard');
            }}
          />
          <DrawerNavItem
            icon="settings"
            label="Settings"
            onPress={() => {
              setIsDrawerOpen(false);
              router.push('/settings');
            }}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

type ProgressBarProps = {
  progress: number;
  trackStyle: object;
};

function ProgressBar({ progress, trackStyle }: ProgressBarProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      duration: 650,
      toValue: progress,
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, progress]);

  return (
    <View style={trackStyle}>
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
  );
}

type DrawerNavItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function DrawerNavItem({ icon, label, onPress }: DrawerNavItemProps) {
  return (
    <TouchableOpacity style={styles.drawerNavItem} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.drawerNavIcon}>
        <Ionicons name={icon} size={24} color="#f9eeee" />
      </View>
      <Text style={styles.drawerNavText}>{label}</Text>
      <Ionicons name="arrow-forward" size={20} color="#64385c" />
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a2b3e' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#f9eeee', fontFamily: 'Alata_400Regular', fontSize: 20 },
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
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58, 43, 62, 0.52)',
  },
  drawer: {
    backgroundColor: '#3a2b3e',
    bottom: 0,
    left: 0,
    paddingBottom: 24,
    paddingHorizontal: 18,
    paddingTop: 34,
    position: 'absolute',
    top: 0,
    width: drawerWidth,
  },
  drawerTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  drawerTitle: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 33,
    marginBottom: 18,
  },
  drawerNav: {
    gap: 12,
  },
  drawerNavItem: {
    alignItems: 'center',
    backgroundColor: '#eab8b9',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 13,
  },
  drawerNavIcon: {
    alignItems: 'center',
    backgroundColor: '#64385c',
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  drawerNavText: {
    color: '#3a2b3e',
    flex: 1,
    fontFamily: 'Alata_400Regular',
    fontSize: 22,
  },
});
