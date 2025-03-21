import React, { useState } from 'react';
import { Text, View, FlatList, StyleSheet, TextInput, Button, Keyboard, ScrollView } from 'react-native';

const berlinDoctors = [
  { id: '1', name: 'Telefonseelsorge Deutschland', phone: '0800 111 0111' },
  { id: '2', name: 'Deutsche Tinnitus-Liga e.V.', phone: '0202 24652-0' },
  { id: '3', name: 'Nummer gegen Kummer (Youth)', phone: '116 111' },
  { id: '3', name: 'Nummer gegen Kummer (Parents)', phone: '0800 111 0550' },

  // Add more doctors as needed
];

const berlinLocations = [
  { id: '1', name: 'https://krisenchat.de/  ' },
  { id: '2', name: 'https://tinnitus-care.berlin/ ' },
  { id: '3', name: 'https://tinnituszentrum.charite.de/ ' },
  // Add more locations as needed
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

export default function BetterHelp() {
  const [city, setCity] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [food, setFood] = useState<Food[]>([]);

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter city name"
            value={city}
            onChangeText={setCity}
          />
          <Button title="Search" onPress={handleSearch} />
        </View>
        <View style={styles.listContainer}>
          {doctors.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Hotlines</Text>
              {doctors.map((doctor) => (
                <View key={doctor.id} style={styles.item}>
                  <Text style={styles.name}>{doctor.name}</Text>
                  <Text style={styles.phone}>{doctor.phone}</Text>
                </View>
              ))}
              {doctors.length === 0 && (
                <Text style={styles.noResults}>No doctors found</Text>
              )}
            </>
          )}
          {doctors.length > 0 && locations.length > 0 && (
            <View style={styles.separator} />
          )}
          {locations.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Websites</Text>
              {locations.map((location) => (
                <View key={location.id} style={styles.item}>
                  <Text style={styles.name}>{location.name}</Text>
                </View>
              ))}
              {locations.length === 0 && (
                <Text style={styles.noResults}>No locations found</Text>
              )}
            </>
          )}
          {locations.length > 0 && food.length > 0 && (
            <View style={styles.separator} />
          )}
          {food.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Food</Text>
              {food.map((foodItem) => (
                <View key={foodItem.id} style={styles.item}>
                  <Text style={styles.name}>{foodItem.name}</Text>
                </View>
              ))}
              {food.length === 0 && (
                <Text style={styles.noResults}>No food items found</Text>
              )}
            </>
          )}
        </View>
        {/* <View style={styles.footer}>
          <Text style={styles.footerText}>Footer content here</Text>
        </View> */}
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
    backgroundColor: '#fff',
  },
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 2,
    paddingHorizontal: 16,
  },
  footer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: '80%',
  },
  item: {
    padding: 16,
    borderBottomWidth: 0, // Remove the border bottom from individual items
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 16,
    color: '#555',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 16,
    color: '#555',
  },
  separator: {
    height: 2, // Make the separator lines more distinct
    backgroundColor: '#888', // Darker color for better visibility
    marginVertical: 16,
  },
});
