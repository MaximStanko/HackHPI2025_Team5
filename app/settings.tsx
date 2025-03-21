import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Picker from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SettingsScreen() {
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  const [notificationType, setNotificationType] = useState('all');
  const [notificationTime, setNotificationTime] = useState('morning');

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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={handleProfileImagePress} style={styles.profileImageButton}>
              <Ionicons name="person-circle" size={100} color="#4A90E2" />
            </TouchableOpacity>
            <Text style={styles.profileText}>Edit Profile Picture</Text>
          </View>
          <TouchableOpacity onPress={handleAccountPress} style={styles.button}>
            <Ionicons name="person-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Manage Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Notification Frequency</Text>
            <Picker
              selectedValue={notificationFrequency}
              style={styles.picker}
              onValueChange={(itemValue) => setNotificationFrequency(itemValue)}
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Only on Weekends" value="weekends" />
              <Picker.Item label="Weekly" value="weekly" />
            </Picker>
          </View>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Notification Type</Text>
            <Picker
              selectedValue={notificationType}
              style={styles.picker}
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
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Notification Time</Text>
            <Picker
              selectedValue={notificationTime}
              style={styles.picker}
              onValueChange={(itemValue) => setNotificationTime(itemValue)}
            >
              <Picker.Item label="Morning (8:00-11:00am)" value="morning" />
              <Picker.Item label="Afternoon (3:00-5:00pm)" value="afternoon" />
              <Picker.Item label="Evening (6:00-8:00pm)" value="evening" />
              <Picker.Item label="Night (8:00-11:00pm)" value="night" />
            </Picker>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity onPress={handleHelpPress} style={styles.button}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFeedbackPress} style={styles.button}>
            <MaterialIcons name="feedback" size={24} color="#fff" />
            <Text style={styles.buttonText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    padding: 20,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 16,
    color: '#4A90E2',
    marginTop: 10,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '500',
  },
  dropdownContainer: {
    marginVertical: 10,
    width: '100%',
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});
