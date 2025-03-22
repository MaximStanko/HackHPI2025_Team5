import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, View, TextInput, Button, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { commonStyles } from './styles.js';
import { Colors } from './theme.js';

import { signInWithEmail, signUpWithEmail, signInAsGuest, signOut, getUserSettings } from '@/utils/supabase';
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import Account from '../components/Account'
import { Session } from '@supabase/supabase-js'
import { storage } from '@/utils/storage';

import AsyncStorage from '@react-native-async-storage/async-storage';

import FontAwesome from '@expo/vector-icons/FontAwesome';

type UserSession = {
  user: {
    id: number;
    email: string;
  }
};

type UserSettings = {
  id?: number;
  user_id: number;
  tinnitus_level: number;
  dark_mode: boolean;
  notifications_enabled: boolean;
};

export default function TabLayout() {
  //supabase
  const [session2, setSession2] = useState<Session | null>(null)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession2(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession2(session)
    })
  }, [])
  
  //tab layout

  const colorScheme = useColorScheme();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession({
          user: {
            id: data.session.user.id,
            email: data.session.user.email || ''
          }
        });
      }
    };
    
    checkSession();
  }, []);

  // Load user settings when session changes
  useEffect(() => {
    if (session?.user) {
      getUserSettings(session.user.id)
        .then(settings => {
          setUserSettings(settings);
        })
        .catch(error => {
          console.error('Error loading user settings:', error);
        });
    }
  }, [session]);

  // Load dark mode settings
  useEffect(() => {
    const loadDarkModeSetting = async () => {
      const storedDarkMode = await AsyncStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        setIsDarkMode(JSON.parse(storedDarkMode));
      }
    };
    
    loadDarkModeSetting();
    
    // Set up interval to check for dark mode changes
    const intervalId = setInterval(loadDarkModeSetting, 1);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      
      let response;
      if (isSignUp) {
        // Simple sign up with no validation
        response = await signUpWithEmail(email, password);
      } else {
        // Simple sign in with no validation
        response = await signInWithEmail(email, password);
      }
      
      if (response.error) throw response.error;
      
      if (response.data.session) {
        // Store user session with cross-platform storage
        await storage.setItem('session', JSON.stringify(response.data.session));
        setSession(response.data.session);
      }
    } catch (error: any) {
      setError(error.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await signInAsGuest();
      if (response.error) throw response.error;
      
      if (response.data.session) {
        // Store guest session with cross-platform storage
        await storage.setItem('session', JSON.stringify(response.data.session));
        setSession(response.data.session);
      }
    } catch (error: any) {
      console.error('Guest login error:', error);
      setError(error.message || 'Failed to login as guest');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    await storage.removeItem('session');
    setSession(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.image}
          source={require("./images/logo.png")}
          placeholder='logo'
          contentFit="contain"
          transition={1000}
        />
        <Text style={styles.title}>Tinytus</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: Colors.primary }}>
          {isSignUp ? 'Create Account' : 'Login'}
        </Text>
        
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={commonStyles.input}
        />
        
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={commonStyles.input}
        />
        
        {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
        
        <TouchableOpacity 
          style={commonStyles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={commonStyles.buttonText}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[commonStyles.button, { backgroundColor: '#6c757d', marginTop: 10 }]}
          onPress={handleGuestLogin}
          disabled={loading}
        >
          <Text style={commonStyles.buttonText}>Continue as Guest</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={{ color: Colors.primary }}>
            {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
          </Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDarkMode ? '#999' : '#666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground isDarkMode={isDarkMode} />,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: isDarkMode ? '#1E1E1E' : undefined,
            borderTopColor: isDarkMode ? '#2f2e2e' : '#e1e4e8',
            borderTopWidth: 1,
          },
          default: {
            backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
            borderTopColor: isDarkMode ? '#2f2e2e' : '#e1e4e8',
            borderTopWidth: 1,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Questionnaire',
          tabBarIcon: ({ color }) => <FontAwesome5 name="clipboard-list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <FontAwesome6 name="people-group" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name = "scientific"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <FontAwesome5 name="newspaper" size={24} color={color} />,
        }}
      />
        
      <Tabs.Screen
        name="localhelp"
        options={{
          title: 'LocalHelp',
          tabBarIcon: ({ color }) => <FontAwesome5 name="bed" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings-sharp" size={24} color={color} />,
        }}
        listeners={{
          tabPress: () => {
            // You can add settings-specific logic here
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    paddingLeft: 15,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  sortPickerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    paddingVertical: 8,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  selectedSortOption: {
    backgroundColor: '#f1f3f5',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedSortOptionText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    minHeight: 75,
    maxHeight: 75,
  },
  categoryScrollContainer: {
    paddingLeft: 4,
    paddingRight: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
    marginVertical: 8,
  },
  categoryText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    padding: 12,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 16,
  },
  articleCategory: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 12,
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  articleAuthors: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },
  articleSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingTop: 12,
  },
  articleMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleDate: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  sourceLinkText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  voteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upvotedButton: {
    backgroundColor: '#4caf50',
  },
  downvotedButton: {
    backgroundColor: '#f44336',
  },
  voteScore: {
    fontWeight: 'bold',
    marginHorizontal: 4,
    minWidth: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
