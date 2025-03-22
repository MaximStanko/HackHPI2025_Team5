import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Check if we're in a browser environment with localStorage available
const isLocalStorageAvailable = () => {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch (e) {
    return false;
  }
};

// Create an in-memory fallback for server-side rendering
const memoryStorage: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    } else if (Platform.OS === 'web') {
      // Server-side rendering fallback
      return memoryStorage[key] || null;
    }
    return AsyncStorage.getItem(key);
  },
  
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else if (Platform.OS === 'web') {
      // Server-side rendering fallback
      memoryStorage[key] = value;
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    } else if (Platform.OS === 'web') {
      // Server-side rendering fallback
      delete memoryStorage[key];
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
};
