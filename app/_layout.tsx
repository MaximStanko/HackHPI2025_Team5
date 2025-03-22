import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, View, TextInput, Button, Text, TouchableOpacity } from 'react-native';

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
        // Store user session
        if (Platform.OS === 'web') {
          localStorage.setItem('session', JSON.stringify(response.data.session));
        }
        
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
        // Store guest session
        if (Platform.OS === 'web') {
          localStorage.setItem('session', JSON.stringify(response.data.session));
        }
        
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
