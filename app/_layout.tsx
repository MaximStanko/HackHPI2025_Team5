import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, View, TextInput, Button, Text } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { commonStyles } from './styles.js';
import { Colors } from './theme.js';

import { supabase, createOrLoginUser, getUserSettings } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';

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
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

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

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      const { data, error } = await createOrLoginUser(email, password);
      if (error) throw error;
      
      // Store session in localStorage for other components to access
      if (Platform.OS === 'web') {
        localStorage.setItem('session', JSON.stringify(data.session));
      }
      
      setSession(data.session);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Simple guest login
      const timestamp = Date.now();
      const guestEmail = `guest${timestamp}@example.com`;
      const { data, error } = await createOrLoginUser(guestEmail, 'guest');
      
      if (error) throw error;
      
      // Store session in localStorage for other components to access
      if (Platform.OS === 'web') {
        localStorage.setItem('session', JSON.stringify(data.session));
      }
      
      setSession(data.session);
    } catch (error: any) {
      console.error('Guest login error:', error);
      setError(error.message || 'Failed to login as guest');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('session');
    }
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
        <Button title="Login" onPress={handleLogin} />
        <Button title="Continue as Guest" onPress={handleGuestLogin} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
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
        name="betterhelp"
        options={{
          title: 'Betterhelp',
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
