import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const COURSE_PROGRESS_KEY = 'courseProgress';

export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
  role: 'user';
};

export async function getUsers(): Promise<UserProfile[]> {
  const savedUsers = await AsyncStorage.getItem(USERS_KEY);

  if (!savedUsers) {
    return [];
  }

  return JSON.parse(savedUsers);
}

export async function saveUser(newUser: UserProfile): Promise<void> {
  const users = await getUsers();
  const emailAlreadyExists = users.some((user) => user.email === newUser.email);

  if (emailAlreadyExists) {
    throw new Error('An account with this email already exists.');
  }

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  await saveCurrentUser(newUser);
}

export async function saveCurrentUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const savedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);

  if (!savedUser) {
    return null;
  }

  return JSON.parse(savedUser);
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
