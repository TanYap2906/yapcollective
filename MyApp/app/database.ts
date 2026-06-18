// database.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define structure for a single user profile
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  createdAt: string;
  role: 'user';
}

const DB_KEY = 'YAP_COLLECTIVE_USERS';

/**
 * Fetch all users from AsyncStorage
 */
export const getUsers = async (): Promise<UserProfile[]> => {
  try {
    const rawData = await AsyncStorage.getItem(DB_KEY);
    if (!rawData) {
      return []; // Return empty array if the database hasn't been created yet
    }
    return JSON.parse(rawData) as UserProfile[];
  } catch (error) {
    console.error('Error reading data from AsyncStorage:', error);
    return [];
  }
};

/**
 * Save a new user profile to the AsyncStorage array
 */
export const saveUser = async (newUser: UserProfile): Promise<void> => {
  const currentUsers = await getUsers();

  // Prevent duplicate emails
  const emailExists = currentUsers.some(u => u.email === newUser.email);
  if (emailExists) {
    throw new Error('An account with this email already exists.');
  }

  // Add new user to the existing array list
  const updatedUsers = [...currentUsers, newUser];

  // Save the updated list back as a string string
  await AsyncStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));
};