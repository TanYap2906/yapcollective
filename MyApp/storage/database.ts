import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

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
