import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const COURSE_PROGRESS_KEY = 'courseProgress';
const MOTION_ARGUMENTS_KEY = 'motionArguments';

export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
  xp?: number;
  earnedRewardIds?: string[];
  submittedMotionIds?: string[];
  role: 'user';
};

export async function getUsers(): Promise<UserProfile[]> {
  const savedUsers = await AsyncStorage.getItem(USERS_KEY);

  if (!savedUsers) {
    return [];
  }

  return JSON.parse(savedUsers).map(normalizeUser);
}

export async function saveUser(newUser: UserProfile): Promise<void> {
  const users = await getUsers();
  const emailAlreadyExists = users.some((user) => user.email === newUser.email);

  if (emailAlreadyExists) {
    throw new Error('An account with this email already exists.');
  }

  const userWithDefaults = normalizeUser(newUser);

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, userWithDefaults]));
  await saveCurrentUser(userWithDefaults);
}

export async function saveCurrentUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const savedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);

  if (!savedUser) {
    return null;
  }

  return normalizeUser(JSON.parse(savedUser));
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

export async function getCourseProgress(userId: string, courseId: string): Promise<number> {
  const savedProgress = await AsyncStorage.getItem(COURSE_PROGRESS_KEY);

  if (!savedProgress) {
    return 0;
  }

  const progressByUser = JSON.parse(savedProgress);
  return progressByUser[userId]?.[courseId] ?? 0;
}

export async function saveCourseProgress(
  userId: string,
  courseId: string,
  progress: number
): Promise<void> {
  const savedProgress = await AsyncStorage.getItem(COURSE_PROGRESS_KEY);
  const progressByUser = savedProgress ? JSON.parse(savedProgress) : {};
  const userProgress = progressByUser[userId] ?? {};
  const currentProgress = userProgress[courseId] ?? 0;

  progressByUser[userId] = {
    ...userProgress,
    [courseId]: Math.max(currentProgress, progress),
  };

  await AsyncStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progressByUser));
}

export async function awardXpOnce(
  userId: string,
  rewardId: string,
  amount: number
): Promise<{ awarded: boolean; user: UserProfile | null }> {
  const users = await getUsers();
  const user = users.find((savedUser) => savedUser.uid === userId);

  if (!user) {
    return { awarded: false, user: null };
  }

  if (user.earnedRewardIds?.includes(rewardId)) {
    return { awarded: false, user };
  }

  const updatedUser: UserProfile = {
    ...user,
    earnedRewardIds: [...(user.earnedRewardIds ?? []), rewardId],
    xp: (user.xp ?? 0) + amount,
  };

  await saveUpdatedUser(updatedUser);
  return { awarded: true, user: updatedUser };
}

export async function hasSubmittedMotion(userId: string, motionId: string): Promise<boolean> {
  const users = await getUsers();
  const user = users.find((savedUser) => savedUser.uid === userId);
  return user?.submittedMotionIds?.includes(motionId) ?? false;
}

export async function markMotionSubmitted(userId: string, motionId: string): Promise<UserProfile | null> {
  const users = await getUsers();
  const user = users.find((savedUser) => savedUser.uid === userId);

  if (!user) {
    return null;
  }

  const updatedUser: UserProfile = {
    ...user,
    submittedMotionIds: Array.from(new Set([...(user.submittedMotionIds ?? []), motionId])),
  };

  await saveUpdatedUser(updatedUser);
  return updatedUser;
}

export async function getMotionArgument(userId: string, submissionId: string): Promise<string> {
  const savedArguments = await AsyncStorage.getItem(MOTION_ARGUMENTS_KEY);

  if (!savedArguments) {
    return '';
  }

  const argumentsByUser = JSON.parse(savedArguments);
  return argumentsByUser[userId]?.[submissionId] ?? '';
}

export async function saveMotionArgument(
  userId: string,
  submissionId: string,
  text: string
): Promise<void> {
  const savedArguments = await AsyncStorage.getItem(MOTION_ARGUMENTS_KEY);
  const argumentsByUser = savedArguments ? JSON.parse(savedArguments) : {};
  const userArguments = argumentsByUser[userId] ?? {};

  argumentsByUser[userId] = {
    ...userArguments,
    [submissionId]: text,
  };

  await AsyncStorage.setItem(MOTION_ARGUMENTS_KEY, JSON.stringify(argumentsByUser));
}

async function saveUpdatedUser(updatedUser: UserProfile): Promise<void> {
  const users = await getUsers();
  const updatedUsers = users.map((user) => (user.uid === updatedUser.uid ? updatedUser : user));
  const currentUser = await getCurrentUser();

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

  if (currentUser?.uid === updatedUser.uid) {
    await saveCurrentUser(updatedUser);
  }
}

function normalizeUser(user: UserProfile): UserProfile {
  return {
    ...user,
    earnedRewardIds: user.earnedRewardIds ?? [],
    submittedMotionIds: user.submittedMotionIds ?? [],
    xp: user.xp ?? 0,
  };
}
