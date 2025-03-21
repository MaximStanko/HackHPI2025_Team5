import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SettingsScreen() {
  const handleHelpPress = () => {
    // Add help functionality here
  };

  const handleAccountPress = () => {
    // Add account management functionality here
  };

  const handleProfileImagePress = () => {
    // Add profile image functionality here
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleProfileImagePress} style={styles.profileImageButton}>
          <Ionicons name="person-circle" size={100} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.profileText}>Edit Profile Picture</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity onPress={handleAccountPress} style={styles.button}>
          <Ionicons name="person-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Manage Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleHelpPress} style={styles.button}>
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
  optionsContainer: {
    width: '100%',
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
});
