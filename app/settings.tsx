import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { getUserSettings, updateUserSettings } from '@/utils/supabase';
import { Colors } from './theme.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { storage } from '@/utils/storage';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    tinnitus_level: 0,
    dark_mode: false,
    notifications_enabled: true
  });
  
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const getUserData = async () => {
      try {
        const sessionStr = await storage.getItem('session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          setUserId(session?.user?.id);
          
          if (session?.user?.id) {
            const userSettings = await getUserSettings(session.user.id);
            if (userSettings) {
              setSettings({
                tinnitus_level: userSettings.tinnitus_level || 0,
                dark_mode: userSettings.dark_mode || false,
                notifications_enabled: userSettings.notifications_enabled !== false
              });
            }
          }
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoading(false);
      }
    };
    
    getUserData();
  }, []);
  
  const handleSaveSettings = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      await updateUserSettings(userId, settings);
      Alert.alert('Success', 'Your settings have been saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const getTinnitusLevelLabel = (level: number) => {
    if (level <= 2) return 'Mild';
    if (level <= 5) return 'Moderate';
    if (level <= 8) return 'Severe';
    return 'Extreme';
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your settings...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.settingsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tinnitus Profile</Text>
          
          <View style={styles.setting}>
            <View style={styles.settingHeader}>
              <FontAwesome5 name="volume-up" size={20} color={Colors.primary} />
              <Text style={styles.settingTitle}>Current Tinnitus Level</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={settings.tinnitus_level}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, tinnitus_level: value }))
                }
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor={Colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderValue}>
                  {settings.tinnitus_level} - {getTinnitusLevelLabel(settings.tinnitus_level)}
                </Text>
                <View style={styles.sliderMinMax}>
                  <Text style={styles.sliderMinMaxText}>Mild</Text>
                  <Text style={styles.sliderMinMaxText}>Extreme</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.setting}>
            <View style={styles.settingHeader}>
              <FontAwesome name="moon-o" size={20} color={Colors.primary} />
              <Text style={styles.settingTitle}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: '#d3d3d3', true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
              ios_backgroundColor="#d3d3d3"
              onValueChange={(value) => 
                setSettings(prev => ({ ...prev, dark_mode: value }))
              }
              value={settings.dark_mode}
            />
          </View>
          
          <View style={styles.setting}>
            <View style={styles.settingHeader}>
              <FontAwesome name="bell" size={20} color={Colors.primary} />
              <Text style={styles.settingTitle}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: '#d3d3d3', true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
              ios_backgroundColor="#d3d3d3"
              onValueChange={(value) => 
                setSettings(prev => ({ ...prev, notifications_enabled: value }))
              }
              value={settings.notifications_enabled}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.setting}>
            <View style={styles.settingHeader}>
              <FontAwesome name="user" size={20} color={Colors.primary} />
              <Text style={styles.settingTitle}>Profile Information</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.setting}>
            <View style={styles.settingHeader}>
              <FontAwesome name="lock" size={20} color={Colors.primary} />
              <Text style={styles.settingTitle}>Change Password</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  settingsContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e4e8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  sliderContainer: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    marginTop: 8,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: Colors.primary,
  },
  sliderMinMax: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderMinMaxText: {
    fontSize: 12,
    color: '#888',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
