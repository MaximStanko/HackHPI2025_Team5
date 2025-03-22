import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, FlatList, StyleSheet, TextInput, Button, Keyboard, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Text, View, FlatList, StyleSheet, TextInput, Button, Keyboard, ScrollView, SafeAreaView } from 'react-native';
import { Colors } from './theme.js';

const berlinDoctors = [
  { id: '1', name: 'Telefonseelsorge Deutschland', phone: '0800 111 0111' },
  { id: '2', name: 'Deutsche Tinnitus-Liga e.V.', phone: '0202 24652-0' },
  { id: '3', name: 'Nummer gegen Kummer (Youth)', phone: '116 111' },
  { id: '4', name: 'Nummer gegen Kummer (Parents)', phone: '0800 111 0550' },
];

const berlinLocations = [
  { id: '1', name: 'https://krisenchat.de/' },
  { id: '2', name: 'https://tinnitus-care.berlin/' },
  { id: '3', name: 'https://tinnituszentrum.charite.de/' },
];

const berlinFood = [
  { id: '1', name: 'Currywurst' },
  { id: '2', name: 'Berliner' },
  { id: '3', name: 'Pretzel' },
  // Add more food items as needed
];

type Doctor = {
  id: string;
  name: string;
  phone: string;
};

type Location = {
  id: string;
  name: string;
};

type Food = {
  id: string;
  name: string;
};

export default function LocalHelp() {
  const [city, setCity] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [food, setFood] = useState<Food[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSearch = () => {
    Keyboard.dismiss(); // Dismiss the keyboard
    if (city.toLowerCase() === 'berlin') {
      setDoctors(berlinDoctors);
      setLocations(berlinLocations);
      setFood(berlinFood);
    } else {
      setDoctors([]);
      setLocations([]);
      setFood([]);
    }
  };

  const loadSettings = async () => {
    const storedDarkMode = await AsyncStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setIsDarkMode(JSON.parse(storedDarkMode));
    }
  };
  useEffect(() => {
    loadSettings();
  }, []);
  
  useEffect(() => {
    setInterval(() => {
      loadSettings();
    }, 100);  // 1000 Millisekunden = 1 Sekunde
  },);

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={themeStyles.mainContainer}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>LocalHelp</Text>
      </View>
      <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
        <View style={themeStyles.container}>
          <View style={themeStyles.searchContainer}>
            <Text style={themeStyles.explanationText}>
              Enter the name of a city to find relevant hotlines, websites, and food items.
            </Text>
            <TextInput
              style={themeStyles.input}
              placeholder="Enter city name"
              value={city}
              onChangeText={setCity}
            />
            <Button title="Search" onPress={handleSearch} />
          </View>
          <View style={themeStyles.listContainer}>
            {doctors.length > 0 && (
              <>
                <Text style={themeStyles.sectionTitle}>Hotlines</Text>
                {doctors.map((doctor) => (
                  <View key={doctor.id} style={themeStyles.item}>
                    <Text style={themeStyles.name}>{doctor.name}</Text>
                    <Text style={themeStyles.phone}>{doctor.phone}</Text>
                  </View>
                ))}
                {doctors.length === 0 && (
                  <Text style={themeStyles.noResults}>No hotlines found</Text>
                )}
              </>
            )}
            {doctors.length > 0 && locations.length > 0 && (
              <View style={themeStyles.separator} />
            )}
            {locations.length > 0 && (
              <>
                <Text style={themeStyles.sectionTitle}>Websites</Text>
                {locations.map((location) => (
                  <View key={location.id} style={themeStyles.item}>
                    <Text style={themeStyles.name}>{location.name}</Text>
                  </View>
                ))}
                {locations.length === 0 && (
                  <Text style={themeStyles.noResults}>No websites found</Text>
                )}
              </>
            )}
            {locations.length > 0 && food.length > 0 && (
              <View style={themeStyles.separator} />
            )}
            {food.length > 0 && (
              <>
                <Text style={themeStyles.sectionTitle}>Food</Text>
                {food.map((foodItem) => (
                  <View key={foodItem.id} style={themeStyles.item}>
                    <Text style={themeStyles.name}>{foodItem.name}</Text>
                  </View>
                ))}
                {food.length === 0 && (
                  <Text style={themeStyles.noResults}>No food items found</Text>
                )}
              </>
            )}
            {(doctors.length > 0 || locations.length > 0 || food.length > 0) && (
              <View style={themeStyles.separator} />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { flex: 2, paddingHorizontal: 16 },
  footer: { flex: 0.5, justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ccc' },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 16, paddingHorizontal: 8, width: '80%' },
  item: { padding: 16, borderBottomWidth: 0, flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  phone: { fontSize: 16, color: '#555' },
  noResults: { textAlign: 'center', marginTop: 16, fontSize: 16, color: '#555' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  footerText: { fontSize: 16, color: '#555' },
  separator: { height: 2, backgroundColor: '#888', marginVertical: 16 }
});

const darkStyles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  searchContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { flex: 2, paddingHorizontal: 16 },
  footer: { flex: 0.5, justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1E1E1E' },
  input: { height: 40, borderColor: '#1E1E1E', borderWidth: 1, marginBottom: 16, paddingHorizontal: 8, width: '80%' },
  item: { padding: 16, borderBottomWidth: 0, flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  phone: { fontSize: 16, color: '#fff' },
  noResults: { textAlign: 'center', marginTop: 16, fontSize: 16, color: '#fff' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  footerText: { fontSize: 16, color: '#fff' },
  separator: { height: 2, backgroundColor: '#1E1E1E', marginVertical: 16 }