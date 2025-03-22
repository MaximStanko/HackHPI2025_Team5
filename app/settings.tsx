import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SettingsScreen() {
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  const [notificationType, setNotificationType] = useState('all');
  const [notificationTime, setNotificationTime] = useState('morning');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const storedDarkMode = await AsyncStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        setIsDarkMode(JSON.parse(storedDarkMode));
      }
    };
    loadSettings();
  }, []);

  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('darkMode', JSON.stringify(value));
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  const handleHelpPress = () => {
    // Add help functionality here
  };

  const handleAccountPress = () => {
    // Add account management functionality here
  };

  const handleProfileImagePress = () => {
    // Add profile image functionality here
  };

  const handleFeedbackPress = () => {
    // Add feedback functionality here
  };

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
      <View style={themeStyles.container}>
        <View style={themeStyles.sectionContainer}>
          <Text style={themeStyles.sectionTitle}>Profile</Text>
          <View style={themeStyles.profileContainer}>
            <TouchableOpacity onPress={handleProfileImagePress} style={themeStyles.profileImageButton}>
              <Ionicons name="person-circle" size={100} color="#4A90E2" />
            </TouchableOpacity>
            <Text style={themeStyles.profileText}>Edit Profile Picture</Text>
          </View>
          <TouchableOpacity onPress={handleAccountPress} style={themeStyles.button}>
            <Ionicons name="person-outline" size={24} color="#fff" />
            <Text style={themeStyles.buttonText}>Manage Account</Text>
          </TouchableOpacity>
        </View>

        <View style={themeStyles.sectionContainer}>
          <Text style={themeStyles.sectionTitle}>Notifications</Text>
          <View style={themeStyles.dropdownContainer}>
            <Text style={themeStyles.dropdownLabel}>Notification Frequency</Text>
            <Picker
              selectedValue={notificationFrequency}
              style={themeStyles.picker}
              onValueChange={(itemValue) => setNotificationFrequency(itemValue)}
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Only on Weekends" value="weekends" />
              <Picker.Item label="Weekly" value="weekly" />
            </Picker>
          </View>
          <View style={themeStyles.dropdownContainer}>
            <Text style={themeStyles.dropdownLabel}>Notification Type</Text>
            <Picker
              selectedValue={notificationType}
              style={themeStyles.picker}
              onValueChange={(itemValue) => setNotificationType(itemValue)}
            >
              <Picker.Item label="Everywhere" value="all" />
              <Picker.Item label="Email" value="email" />
              <Picker.Item label="Pop-up" value="pop_up" />
              <Picker.Item label="Push Notification" value="push_notification" />
              <Picker.Item label="SMS" value="sms" />
              <Picker.Item label="In-App" value="in_app" />
            </Picker>
          </View>
          <View style={themeStyles.dropdownContainer}>
            <Text style={themeStyles.dropdownLabel}>Notification Time</Text>
            <Picker
              selectedValue={notificationTime}
              style={themeStyles.picker}
              onValueChange={(itemValue) => setNotificationTime(itemValue)}
            >
              <Picker.Item label="Morning (8:00-11:00am)" value="morning" />
              <Picker.Item label="Afternoon (3:00-5:00pm)" value="afternoon" />
              <Picker.Item label="Evening (6:00-8:00pm)" value="evening" />
              <Picker.Item label="Night (8:00-11:00pm)" value="night" />
            </Picker>
          </View>
        </View>

        <View style={themeStyles.sectionContainer}>
          <Text style={themeStyles.sectionTitle}>Privacy</Text>
          <View style={themeStyles.switchContainer}>
            <Text style={themeStyles.switchLabel}>Anonymous</Text>
            <Switch
              value={isAnonymous}
              onValueChange={(value) => setIsAnonymous(value)}
              style={themeStyles.switch}
            />
          </View>
          <View style={themeStyles.switchContainer}>
            <Text style={themeStyles.switchLabel}>Dark Mode</Text>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleDarkMode} 
              style={themeStyles.switch}
            />
          </View>
        </View>

        <View style={themeStyles.sectionContainer}>
          <Text style={themeStyles.sectionTitle}>Support</Text>
          <TouchableOpacity onPress={handleHelpPress} style={themeStyles.button}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
            <Text style={themeStyles.buttonText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFeedbackPress} style={themeStyles.button}>
            <MaterialIcons name="feedback" size={24} color="#fff" />
            <Text style={themeStyles.buttonText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}


const lightStyles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 , backgroundColor: '#F7F9FC'},
  container: { flex: 1, alignItems: 'center', padding: 20 },
  sectionContainer: { width: '100%', marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#4A90E2', marginBottom: 10 },
  profileContainer: { alignItems: 'center', marginBottom: 20 },
  profileImageButton: { alignItems: 'center', justifyContent: 'center' },
  profileText: { fontSize: 16, color: '#4A90E2', marginTop: 10, fontWeight: '500' },
  dropdownContainer: { marginVertical: 10, width: '100%' },
  dropdownLabel: { fontSize: 16, color: '#4A90E2', marginBottom: 5 },
  picker: { height: 50, width: '100%', backgroundColor: '#fff', borderRadius: 10, },
  switchContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  switchLabel: { fontSize: 16, color: '#4A90E2', marginRight: 10 },
  iconColor: { color: '#4A90E2' },
  buttonText: { fontSize: 16, color: '#4A90E2', fontWeight: '500' }
});


const darkStyles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, color: '#fff', backgroundColor: '#1E1E1E' },
  container: { flex: 1, color: '#fff', alignItems: 'center', padding: 20 },
  sectionContainer: { width: '100%', color: '#fff', marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 10 },
  profileContainer: { alignItems: 'center', color: '#fff', marginBottom: 20 },
  profileImageButton: { alignItems: 'center', justifyContent: 'center' },
  profileText: { fontSize: 16, color: '#fff', marginTop: 10, fontWeight: '500' },
  dropdownContainer: { marginVertical: 10, color: '#fff', width: '100%' },
  dropdownLabel: { fontSize: 16, color: '#fff', marginBottom: 5 },
  picker: { height: 50, width: '100%', backgroundColor: '#2f2e2e',color: '#fff', borderRadius: 10, },
  switchContainer: { flexDirection: 'row', justifyContent: 'center',color: '#fff', alignItems: 'center', marginVertical: 10 },
  switchLabel: { fontSize: 16, color: '#fff', marginRight: 10 },
  iconColor: { color: '#fff' },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: '500' }
});