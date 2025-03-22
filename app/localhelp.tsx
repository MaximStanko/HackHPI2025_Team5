import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  ScrollView,
  Linking,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from './theme.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { storage } from '@/utils/storage';

type LocalResource = {
  id: string;
  name: string;
  category: string;
  address: string;
  distance: number;
  rating: number;
  phoneNumber: string;
  website: string;
  description: string;
  image_url: string | null;
};

export default function LocalHelpScreen() {
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<LocalResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState('nearest');
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const categories = ['All', 'Audiologist', 'ENT Specialist', 'Hearing Center', 'Support Group', 'Therapy'];
  const sortOptions = [
    { label: 'Nearest', value: 'nearest' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'A-Z', value: 'alphabetical' }
  ];

  // Sample data for demonstration
  const sampleResources: LocalResource[] = [
    {
      id: '1',
      name: 'Berlin Hearing Center',
      category: 'Hearing Center',
      address: 'Charlottenstraße 74, 10117 Berlin',
      distance: 1.2,
      rating: 4.8,
      phoneNumber: '+49 30 1234567',
      website: 'https://example.com/berlin-hearing',
      description: 'Specialized hearing center offering comprehensive tinnitus assessment and management services. Features tinnitus retraining therapy (TRT) and sound therapy options.',
      image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: '2',
      name: 'Dr. Schmidt ENT Practice',
      category: 'ENT Specialist',
      address: 'Friedrichstraße 128, 10117 Berlin',
      distance: 2.5,
      rating: 4.6,
      phoneNumber: '+49 30 2345678',
      website: 'https://example.com/schmidt-ent',
      description: 'Experienced ENT specialists providing diagnostic evaluations and treatment options for tinnitus, including medication management and counseling.',
      image_url: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=1926&auto=format&fit=crop'
    },
    {
      id: '3',
      name: 'Berlin Tinnitus Support Network',
      category: 'Support Group',
      address: 'Alexanderplatz 7, 10178 Berlin',
      distance: 3.1,
      rating: 4.9,
      phoneNumber: '+49 30 3456789',
      website: 'https://example.com/tinnitus-support',
      description: 'Community-led support group for tinnitus sufferers. Regular meetings provide emotional support, coping strategies, and latest information on tinnitus management.',
      image_url: 'https://images.unsplash.com/photo-1573497491765-55d988dce6bc?q=80&w=1974&auto=format&fit=crop'
    },
    {
      id: '4',
      name: 'Audiological Services Berlin',
      category: 'Audiologist',
      address: 'Potsdamer Platz 1, 10785 Berlin',
      distance: 4.3,
      rating: 4.5,
      phoneNumber: '+49 30 4567890',
      website: 'https://example.com/audiological-berlin',
      description: 'Full-service audiology clinic specializing in tinnitus assessment and hearing aid fitting with tinnitus masking features. Offers personalized sound therapy solutions.',
      image_url: 'https://images.unsplash.com/photo-1595069906974-f8ae7ffc3e7a?q=80&w=2071&auto=format&fit=crop'
    },
    {
      id: '5',
      name: 'Mindful Therapy Center',
      category: 'Therapy',
      address: 'Kastanienallee 82, 10435 Berlin',
      distance: 5.7,
      rating: 4.7,
      phoneNumber: '+49 30 5678901',
      website: 'https://example.com/mindful-therapy',
      description: 'Focuses on psychological approaches to tinnitus management. Offers CBT, mindfulness-based stress reduction, and acceptance and commitment therapy for tinnitus.',
      image_url: 'https://images.unsplash.com/photo-1551834317-9faad1c4c7f6?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: '6',
      name: 'Advanced Hearing Solutions',
      category: 'Hearing Center',
      address: 'Kurfürstendamm 234, 10719 Berlin',
      distance: 6.2,
      rating: 4.4,
      phoneNumber: '+49 30 6789012',
      website: 'https://example.com/advanced-hearing',
      description: 'Modern hearing center offering the latest technology in tinnitus management, including acoustic neural stimulation and customized sound therapies.',
      image_url: 'https://images.unsplash.com/photo-1559131951-ec956fa18w=1974&auto=format&fit=crop'
    }
  ];

  const loadSettings = async () => {
    const storedDarkMode = await AsyncStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setIsDarkMode(JSON.parse(storedDarkMode));
    }
  };

  useEffect(() => {
    loadSettings();
    
    // Load resources (in a real app, this would fetch from an API)
    const loadResources = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResources(sampleResources);
        setFilteredResources(sampleResources);
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
    
    // Refresh dark mode settings periodically
    const intervalId = setInterval(() => {
      loadSettings();
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...resources];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.name.toLowerCase().includes(query) || 
        resource.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sorting === 'nearest') {
      filtered.sort((a, b) => a.distance - b.distance);
    } else if (sorting === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sorting === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredResources(filtered);
  }, [selectedCategory, resources, searchQuery, sorting]);

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  const callPhone = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openWebsite = (url: string) => {
    Linking.openURL(url).catch(err => 
      Alert.alert('Error', 'Could not open the website. Please try again later.')
    );
  };

  const openMapsForDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = Platform.select({
      ios: `maps:?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://maps.google.com/?q=${encodedAddress}`
    });
    
    Linking.openURL(mapsUrl).catch(err => 
      Alert.alert('Error', 'Could not open maps. Please try again later.')
    );
  };

  const renderResource = ({ item }: { item: LocalResource }) => {
    return (
      <View style={themeStyles.resourceCard}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={themeStyles.resourceImage} />
        )}
        
        <View style={themeStyles.resourceContent}>
          <View style={themeStyles.resourceHeader}>
            <Text style={themeStyles.resourceCategory}>{item.category}</Text>
            <View style={themeStyles.ratingContainer}>
              <FontAwesome name="star" size={14} color="#FFD700" />
              <Text style={themeStyles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <Text style={themeStyles.resourceName}>{item.name}</Text>
          <Text style={themeStyles.resourceDistance}>{item.distance} km away</Text>
          <Text style={themeStyles.resourceDescription} numberOfLines={3}>{item.description}</Text>
          
          <View style={themeStyles.resourceActions}>
            <TouchableOpacity 
              style={themeStyles.actionButton}
              onPress={() => callPhone(item.phoneNumber)}
            >
              <FontAwesome name="phone" size={16} color={Colors.primary} />
              <Text style={themeStyles.actionText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={themeStyles.actionButton}
              onPress={() => openWebsite(item.website)}
            >
              <FontAwesome name="globe" size={16} color={Colors.primary} />
              <Text style={themeStyles.actionText}>Website</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={themeStyles.actionButton}
              onPress={() => openMapsForDirections(item.address)}
            >
              <FontAwesome5 name="directions" size={16} color={Colors.primary} />
              <Text style={themeStyles.actionText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={themeStyles.container}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>LocalHelp</Text>
        
        <TouchableOpacity 
          style={themeStyles.sortButton}
          onPress={() => setShowSortPicker(!showSortPicker)}
        >
          <FontAwesome name="sort" size={16} color={isDarkMode ? "#fff" : "#666"} />
          <Text style={themeStyles.sortButtonText}>
            {sortOptions.find(opt => opt.value === sorting)?.label}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showSortPicker && (
        <View style={themeStyles.sortPickerContainer}>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                themeStyles.sortOption,
                sorting === option.value && themeStyles.selectedSortOption
              ]}
              onPress={() => {
                setSorting(option.value);
                setShowSortPicker(false);
              }}
            >
              <Text style={[
                themeStyles.sortOptionText,
                sorting === option.value && themeStyles.selectedSortOptionText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <View style={themeStyles.searchContainer}>
        <View style={themeStyles.searchInputContainer}>
          <FontAwesome name="search" size={16} color={isDarkMode ? "#999" : "#666"} style={themeStyles.searchIcon} />
          <TextInput
            style={themeStyles.searchInput}
            placeholder="Search for resources..."
            placeholderTextColor={isDarkMode ? "#999" : "#999"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times-circle" size={16} color={isDarkMode ? "#999" : "#666"} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={themeStyles.categoryScrollContainer}
        style={themeStyles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              themeStyles.categoryButton,
              selectedCategory === category && themeStyles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text 
              style={[
                themeStyles.categoryText,
                selectedCategory === category && themeStyles.selectedCategoryText
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={themeStyles.loader} />
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={renderResource}
          keyExtractor={(item) => item.id}
          contentContainerStyle={themeStyles.listContainer}
          ListEmptyComponent={
            <View style={themeStyles.emptyContainer}>
              <Text style={themeStyles.emptyText}>No resources found matching your criteria.</Text>
              <TouchableOpacity 
                style={themeStyles.emptyButton}
                onPress={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                <Text style={themeStyles.emptyButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e1e4e8', 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: Colors.primary 
  },
  sortButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16, 
    backgroundColor: '#f1f3f5' 
  },
  sortButtonText: { 
    fontSize: 12, 
    color: '#666', 
    marginLeft: 4 
  },
  sortPickerContainer: { 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e1e4e8', 
    paddingVertical: 8 
  },
  sortOption: { 
    paddingVertical: 10, 
    paddingHorizontal: 16 
  },
  selectedSortOption: { 
    backgroundColor: '#f1f3f5' 
  },
  sortOptionText: { 
    fontSize: 14, 
    color: '#333' 
  },
  selectedSortOptionText: { 
    fontWeight: 'bold', 
    color: Colors.primary 
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  categoryContainer: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    paddingHorizontal: 8, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e1e4e8', 
    minHeight: 60, 
    maxHeight: 60 
  },
  categoryScrollContainer: { 
    paddingLeft: 4, 
    paddingRight: 4
  },
  categoryButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    marginHorizontal: 4, 
    borderRadius: 20, 
    backgroundColor: '#f1f3f5', 
    minWidth: 80, 
    alignItems: 'center' 
  },
  selectedCategoryButton: { 
    backgroundColor: Colors.primary 
  },
  categoryText: { 
    color: '#333', 
    fontWeight: '500' 
  },
  selectedCategoryText: { 
    color: '#fff' 
  },
  loader: { 
    marginTop: 20 
  },
  listContainer: { 
    padding: 12 
  },
  resourceCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 16, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  resourceImage: { 
    width: '100%', 
    height: 150, 
    resizeMode: 'cover' 
  },
  resourceContent: { 
    padding: 16 
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceCategory: { 
    color: Colors.primary, 
    fontWeight: '500', 
    fontSize: 12
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f57c00',
    marginLeft: 4,
  },
  resourceName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 2
  },
  resourceDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  resourceDescription: { 
    fontSize: 14, 
    color: '#666', 
    lineHeight: 20, 
    marginBottom: 16 
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 4,
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 40 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  emptyButton: { 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  emptyButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});

const darkStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1E1E1E' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1E1E1E', 
    backgroundColor: '#1E1E1E' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  sortButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16, 
    backgroundColor: '#474747' 
  },
  sortButtonText: { 
    fontSize: 12, 
    color: '#fff', 
    marginLeft: 4 
  },
  sortPickerContainer: { 
    backgroundColor: '#1E1E1E', 
    borderBottomWidth: 1, 
    borderBottomColor: '#1E1E1E', 
    paddingVertical: 8 
  },
  sortOption: { 
    paddingVertical: 10, 
    paddingHorizontal: 16 
  },
  selectedSortOption: { 
    backgroundColor: '#2f2e2e' 
  },
  sortOptionText: { 
    fontSize: 14, 
    color: '#fff' 
  },
  selectedSortOptionText: { 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#474747',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  categoryContainer: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    paddingHorizontal: 8, 
    backgroundColor: '#1E1E1E', 
    borderBottomWidth: 1, 
    borderBottomColor: '#1E1E1E', 
    minHeight: 60, 
    maxHeight: 60
  },
  categoryScrollContainer: { 
    paddingLeft: 4, 
    paddingRight: 4 
  },
  categoryButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    marginHorizontal: 4, 
    borderRadius: 20, 
    backgroundColor: '#474747', 
    minWidth: 80, 
    alignItems: 'center' 
  },
  selectedCategoryButton: { 
    backgroundColor: '#2f2e2e' 
  },
  categoryText: { 
    color: '#fff', 
    fontWeight: '500' 
  },
  selectedCategoryText: { 
    color: '#fff' 
  },
  loader: { 
    marginTop: 20 
  },
  listContainer: { 
    padding: 12 
  },
  resourceCard: { 
    backgroundColor: '#474747', 
    borderRadius: 12, 
    marginBottom: 16, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  resourceImage: { 
    width: '100%', 
    height: 150, 
    resizeMode: 'cover' 
  },
  resourceContent: { 
    padding: 16 
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceCategory: { 
    color: '#fff', 
    fontWeight: '500', 
    fontSize: 12
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2a1e',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f57c00',
    marginLeft: 4,
  },
  resourceName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 2
  },
  resourceDistance: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 8,
  },
  resourceDescription: { 
    fontSize: 14, 
    color: '#fff', 
    lineHeight: 20, 
    marginBottom: 16 
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2f2e2e',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2f2e2e',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 4,
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 40 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#fff', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  emptyButton: { 
    backgroundColor: '#2f2e2e', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  emptyButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});
