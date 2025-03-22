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
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllScientificArticles, populateScientificArticles, voteOnArticle, getUserArticleVote } from '@/utils/supabase';
import { Colors } from './theme.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { storage } from '@/utils/storage';

type Article = {
  id: number;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  downvotes: number;
  source_url: string;
  image_url: string | null;
  created_at: string;
  authors: string;
};

export default function ScientificScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userVotes, setUserVotes] = useState<Record<number, 'up' | 'down' | null>>({});
  const [sortBy, setSortBy] = useState('newest');
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const categories = ['All', 'Treatment', 'Neuroscience', 'Clinical Trial', 'Molecular Biology'];
  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Most Upvoted', value: 'most_votes' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Controversial', value: 'controversial' },
  ];

  const loadSettings = async () => {
    const storedDarkMode = await AsyncStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setIsDarkMode(JSON.parse(storedDarkMode));
    }
  };
  useEffect(() => {
    loadSettings();
  }, []);

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  useEffect(() => {
    // Get session user ID from local storage
    const getUserData = async () => {
      try {
        // Use the storage helper instead of direct localStorage access
        const sessionStr = await storage.getItem('session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          setUserId(session?.user?.id);
        }
      } catch (e) {
        console.error('Failed to get user ID:', e);
      }
    };

    const loadArticles = async () => {
      setLoading(true);
      try {
        // Populate example articles if none exist
        await populateScientificArticles();
        
        // Get all articles with current sorting
        const allArticles = await getAllScientificArticles(sortBy);
        setArticles(allArticles);
        setFilteredArticles(allArticles);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    setInterval(() => {
      loadSettings();
    }, 100); 

    getUserData();
    loadArticles();
  }, [sortBy]);

  // Check user votes on articles
  useEffect(() => {
    const checkUserVotes = async () => {
      if (!userId) return;
      
      const votesMap: Record<number, 'up' | 'down' | null> = {};
      for (const article of articles) {
        const voteType = await getUserArticleVote(userId, article.id);
        votesMap[article.id] = voteType as 'up' | 'down' | null;
      }
      
      setUserVotes(votesMap);
    };

    if (articles.length > 0 && userId) {
      checkUserVotes();
    }
  }, [articles, userId]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => article.category === selectedCategory));
    }
  }, [selectedCategory, articles]);

  const handleVote = async (articleId: number, voteType: 'up' | 'down') => {
    if (!userId) return;
    
    try {
      // First update locally for immediate feedback
      const targetArticle = articles.find(article => article.id === articleId);
      if (!targetArticle) return;
      
      // Prepare local update variables
      let newLocalUpvotes = targetArticle.upvotes || 0;
      let newLocalDownvotes = targetArticle.downvotes || 0;
      const currentVote = userVotes[articleId];
      
      // Calculate new local vote state
      if (!currentVote) {
        // No previous vote, adding new vote
        if (voteType === 'up') {
          newLocalUpvotes += 1;
        } else {
          newLocalDownvotes += 1;
        }
      } else if (currentVote === voteType) {
        // Removing same type of vote
        if (voteType === 'up') {
          newLocalUpvotes = Math.max(newLocalUpvotes - 1, 0);
        } else {
          newLocalDownvotes = Math.max(newLocalDownvotes - 1, 0);
        }
      } else {
        // Changing vote type
        if (voteType === 'up') {
          newLocalUpvotes += 1;
          newLocalDownvotes = Math.max(newLocalDownvotes - 1, 0);
        } else {
          newLocalDownvotes += 1;
          newLocalUpvotes = Math.max(newLocalUpvotes - 1, 0);
        }
      }
      
      // Update state immediately for responsive UI
      setArticles(currentArticles => 
        currentArticles.map(article => 
          article.id === articleId 
            ? { ...article, upvotes: newLocalUpvotes, downvotes: newLocalDownvotes } 
            : article
        )
      );
      
      // Update user votes for immediate feedback
      setUserVotes(prev => ({
        ...prev,
        [articleId]: currentVote === voteType ? null : voteType
      }));
      
      // Send the request to the server
      const result = await voteOnArticle(userId, articleId, voteType);
      
      // Update with server data to ensure consistency
      setArticles(currentArticles => 
        currentArticles.map(article => 
          article.id === articleId 
            ? { ...article, upvotes: result.upvotes, downvotes: result.downvotes } 
            : article
        )
      );
      
      // Update user votes with server data
      setUserVotes(prev => ({
        ...prev,
        [articleId]: result.voteType
      }));
    } catch (error) {
      console.error('Error voting on article:', error);
      // Revert to original data if there was an error
      setArticles(prev => [...prev]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const openSourceUrl = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  const renderArticle = ({ item }: { item: Article }) => {
    const userVote = userVotes[item.id];
    const voteScore = (item.upvotes || 0) - (item.downvotes || 0);
    
    return (
      <View style={themeStyles.articleCard}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={themeStyles.articleImage} />
        )}
        
        <View style={themeStyles.articleContent}>
          <Text style={themeStyles.articleCategory}>{item.category}</Text>
          <Text style={themeStyles.articleTitle}>{item.title}</Text>
          <Text style={themeStyles.articleAuthors}>{item.authors}</Text>
          <Text style={themeStyles.articleSummary} numberOfLines={3}>{item.content}</Text>
          
          <View style={themeStyles.articleFooter}>
            <View style={themeStyles.articleMetadata}>
              <Text style={themeStyles.articleDate}>{formatDate(item.created_at)}</Text>
              {item.source_url && (
                <TouchableOpacity 
                  style={themeStyles.sourceLink}
                  onPress={() => openSourceUrl(item.source_url)}
                >
                  <FontAwesome name="external-link" size={14} color={Colors.primary} />
                  <Text style={themeStyles.sourceLinkText}>Source</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={themeStyles.voteContainer}>
              <TouchableOpacity 
                style={[
                  themeStyles.voteButton,
                  userVote === 'up' && themeStyles.upvotedButton
                ]} 
                onPress={() => handleVote(item.id, 'up')}
              >
                <FontAwesome 
                  name="arrow-up" 
                  size={14} 
                  color={userVote === 'up' ? "#fff" : "#666"} 
                />
              </TouchableOpacity>
              
              <Text style={themeStyles.voteScore}>
                {voteScore}
              </Text>
              
              <TouchableOpacity 
                style={[
                  themeStyles.voteButton,
                  userVote === 'down' && themeStyles.downvotedButton
                ]} 
                onPress={() => handleVote(item.id, 'down')}
              >
                <FontAwesome 
                  name="arrow-down" 
                  size={14} 
                  color={userVote === 'down' ? "#fff" : "#666"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={themeStyles.container}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>News</Text>
        
        <TouchableOpacity 
          style={themeStyles.sortButton}
          onPress={() => setShowSortPicker(!showSortPicker)}
        >
          <FontAwesome name="sort" size={16} color="#666" />
          <Text style={themeStyles.sortButtonText}>
            {sortOptions.find(opt => opt.value === sortBy)?.label}
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
                sortBy === option.value && themeStyles.selectedSortOption
              ]}
              onPress={() => {
                setSortBy(option.value);
                setShowSortPicker(false);
              }}
            >
              <Text style={[
                themeStyles.sortOptionText,
                sortBy === option.value && themeStyles.selectedSortOptionText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
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
          data={filteredArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={themeStyles.listContainer}
          ListEmptyComponent={
            <View style={themeStyles.emptyContainer}>
              <Text style={themeStyles.emptyText}>No articles in this category yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa'},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e1e4e8', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f1f3f5' },
  sortButtonText: { fontSize: 12, color: '#666', marginLeft: 4 },
  sortPickerContainer: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e1e4e8', paddingVertical: 8 },
  sortOption: { paddingVertical: 10, paddingHorizontal: 16 },
  selectedSortOption: { backgroundColor: '#f1f3f5' },
  sortOptionText: { fontSize: 14, color: '#333' },
  selectedSortOptionText: { fontWeight: 'bold', color: Colors.primary },
  categoryContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e1e4e8', minHeight: 75, maxHeight: 75 },
  categoryScrollContainer: { paddingLeft: 4, paddingRight: 4 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, marginVertical: 8, borderRadius: 20, backgroundColor: '#f1f3f5', minWidth: 80, alignItems: 'center' },
  selectedCategoryButton: { backgroundColor: Colors.primary, marginVertical: 8 },
  categoryText: { color: '#333', fontWeight: '500' },
  selectedCategoryText: { color: '#fff' },
  loader: { marginTop: 20 },
  listContainer: { padding: 12 },
  articleCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  articleImage: { width: '100%', height: 180, resizeMode: 'cover' },
  articleContent: { padding: 16 },
  articleCategory: { color: Colors.primary, fontWeight: '500', fontSize: 12, marginBottom: 4 },
  articleTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  articleAuthors: { fontSize: 13, fontStyle: 'italic', color: '#666', marginBottom: 8 },
  articleSummary: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },
  articleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 12 },
  articleMetadata: { flexDirection: 'row', alignItems: 'center' },
  articleDate: { fontSize: 12, color: '#999', marginRight: 12 },
  sourceLink: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#f8f9fa', borderRadius: 12 },
  sourceLinkText: { fontSize: 12, color: Colors.primary, fontWeight: '500', marginLeft: 4 },
  voteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 16, paddingHorizontal: 4 },
  voteButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  upvotedButton: { backgroundColor: '#4caf50' },
  downvotedButton: { backgroundColor: '#f44336' },
  voteScore: { fontWeight: 'bold', marginHorizontal: 4, minWidth: 20, textAlign: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
});

const darkStyles = StyleSheet.create({
  container: { flex: 1, color: '#fff', backgroundColor: '#1E1E1E' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E1E1E',backgroundColor: '#1E1E1E' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#474747' },
  sortButtonText: { fontSize: 12, color: '#fff', marginLeft: 4 },
  sortPickerContainer: { backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#1E1E1E', paddingVertical: 8 },
  sortOption: { paddingVertical: 10, paddingHorizontal: 16,backgroundColor: '#1E1E1E' },
  selectedSortOption: { backgroundColor: '#1E1E1E' },
  sortOptionText: { fontSize: 14, color: '#fff',backgroundColor: '#1E1E1E' },
  selectedSortOptionText: { fontWeight: 'bold', color: Colors.primary },
  categoryContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#1E1E1E', minHeight: 75, maxHeight: 75 },
  categoryScrollContainer: { paddingLeft: 4, paddingRight: 4 }, 
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, marginVertical: 8, borderRadius: 20, backgroundColor: '#474747', minWidth: 80, alignItems: 'center' },
  selectedCategoryButton: { backgroundColor: '#2f2e2e', marginVertical: 8 },
  categoryText: { color: '#fff', fontWeight: '500' },
  selectedCategoryText: { color: '#fff' },
  loader: { marginTop: 20 },
  listContainer: { padding: 12 },
  articleCard: { backgroundColor: '#474747', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  articleImage: { width: '100%', height: 180, resizeMode: 'cover' },
  articleContent: { padding: 16 },
  articleCategory: { color: '#fff', fontWeight: '500', fontSize: 12, marginBottom: 4 },
  articleTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#fff' },
  articleAuthors: { fontSize: 13, fontStyle: 'italic', color: '#fff', marginBottom: 8 },
  articleSummary: { fontSize: 14, color: '#fff', lineHeight: 20, marginBottom: 16 },
  articleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 12 },
  articleMetadata: { flexDirection: 'row', alignItems: 'center' },
  articleDate: { fontSize: 12, color: '#999', marginRight: 12 },
  sourceLink: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#f8f9fa', borderRadius: 12 },
  sourceLinkText: { fontSize: 12, color: Colors.primary, fontWeight: '500', marginLeft: 4 },
  voteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 16, paddingHorizontal: 4 },
  voteButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  upvotedButton: { backgroundColor: '#4caf50' },
  downvotedButton: { backgroundColor: '#f44336' },
  voteScore: { fontWeight: 'bold', marginHorizontal: 4, minWidth: 20, textAlign: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#fff', textAlign: 'center' },
});

