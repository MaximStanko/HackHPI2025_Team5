import React, { useState } from 'react';
import { Text, View, FlatList, StyleSheet, TextInput, Button, Keyboard } from 'react-native';

const berlinDoctors = [
  { id: '1', name: 'Telefonseelsorge Deutschland', phone: '0800 111 0111' },
  { id: '2', name: 'Deutsche Tinnitus-Liga e.V.', phone: '0202 24652-0' },
  { id: '3', name: 'Nummer gegen Kummer (Youth)', phone: '116 111' },
  { id: '3', name: 'Nummer gegen Kummer (Parents)', phone: '0800 111 0550' },

  // Add more doctors as needed
];

const berlinLocations = [
  { id: '1', name: 'Brandenburg Gate' },
  { id: '2', name: 'Berlin Wall' },
  { id: '3', name: 'Museum Island' },
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
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.phone}>{item.phone}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.noResults}>No doctors found</Text>}
            />
          </>
        )}
        {locations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Locations</Text>
            <FlatList
              data={locations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.name}>{item.name}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.noResults}>No locations found</Text>}
            />
          </>
        )}
        {food.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Food</Text>
            <FlatList
              data={food}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.name}>{item.name}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.noResults}>No food items found</Text>}
            />
          </>
        )}
      </View>
      {/* <View style={styles.footer}>
        <Text style={styles.footerText}>Footer content here</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
});
