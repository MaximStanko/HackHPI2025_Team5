import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

type TabBarBackgroundProps = {
  isDarkMode?: boolean;
};

export default function TabBarBackground({ isDarkMode = false }: TabBarBackgroundProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint={isDarkMode ? 'dark' : 'light'}
        intensity={isDarkMode ? 50 : 80}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
