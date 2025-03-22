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
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllScientificArticles, populateScientificArticles, voteOnArticle, getUserArticleVote } from '@/utils/supabase';
import { Colors } from './theme.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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

  const categories = ['All', 'Treatment', 'Neuroscience', 'Clinical Trial', 'Molecular Biology'];
  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Most Upvoted', value: 'most_votes' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Controversial', value: 'controversial' },
  ];

  useEffect(() => {
    // Get session user ID from local storage
    const getUserData = async () => {
      try {
        const sessionStr = await localStorage.getItem('session');
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
      const { voted, voteType: newVoteType, upvotes, downvotes } = await voteOnArticle(userId, articleId, voteType);
      
      // Update local state with new vote
      setUserVotes(prev => ({
        ...prev,
        [articleId]: newVoteType
      }));
      
      // Update article vote count with values from the server
      setArticles(articles.map(article => {
        if (article.id !== articleId) return article;
        
        // Use the upvotes and downvotes returned from the server
        return { ...article, upvotes, downvotes };
      }));
    } catch (error) {
      console.error('Error voting on article:', error);
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
      <View style={styles.articleCard}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.articleImage} />
        )}
        
        <View style={styles.articleContent}>
          <Text style={styles.articleCategory}>{item.category}</Text>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.articleAuthors}>{item.authors}</Text>
          <Text style={styles.articleSummary} numberOfLines={3}>{item.content}</Text>
          
          <View style={styles.articleFooter}>
            <View style={styles.articleMetadata}>
              <Text style={styles.articleDate}>{formatDate(item.created_at)}</Text>
              {item.source_url && (
                <TouchableOpacity 
                  style={styles.sourceLink}
                  onPress={() => openSourceUrl(item.source_url)}
                >
                  <FontAwesome name="external-link" size={14} color={Colors.primary} />
                  <Text style={styles.sourceLinkText}>Source</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.voteContainer}>
              <TouchableOpacity 
                style={[
                  styles.voteButton,
                  userVote === 'up' && styles.upvotedButton
                ]} 
                onPress={() => {
                  // Add visual feedback before server response
                  const isAlreadyUpvoted = userVote === 'up';
                  if (!isAlreadyUpvoted) {
                    setUserVotes(prev => ({
                      ...prev,
                      [item.id]: 'up'
                    }));
                  }
                  handleVote(item.id, 'up');
                }}
              >
                <FontAwesome 
                  name="arrow-up" 
                  size={14} 
                  color={userVote === 'up' ? "#fff" : "#666"} 
                />
              </TouchableOpacity>
              
              <Text style={styles.voteScore}>
                {voteScore}
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.voteButton,
                  userVote === 'down' && styles.downvotedButton
                ]} 
                onPress={() => {
                  // Add visual feedback before server response
                  const isAlreadyDownvoted = userVote === 'down';
                  if (!isAlreadyDownvoted) {
                    setUserVotes(prev => ({
                      ...prev,
                      [item.id]: 'down'
                    }));
                  }
                  handleVote(item.id, 'down');
                }}
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scientific Research</Text>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortPicker(!showSortPicker)}
        >
          <FontAwesome name="sort" size={16} color="#666" />
          <Text style={styles.sortButtonText}>
            {sortOptions.find(opt => opt.value === sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showSortPicker && (
        <View style={styles.sortPickerContainer}>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && styles.selectedSortOption
              ]}
              onPress={() => {
                setSortBy(option.value);
                setShowSortPicker(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.value && styles.selectedSortOptionText
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
        contentContainerStyle={styles.categoryScrollContainer}
        style={styles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No articles in this category yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  sortPickerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    paddingVertical: 8,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  selectedSortOption: {
    backgroundColor: '#f1f3f5',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedSortOptionText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    minHeight: 75,
    maxHeight: 75,
  },
  categoryScrollContainer: {
    paddingLeft: 4,
    paddingRight: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
    marginVertical: 8,
  },
  categoryText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    padding: 12,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 16,
  },
  articleCategory: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 12,
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  articleAuthors: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },
  articleSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingTop: 12,
  },
  articleMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleDate: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  sourceLinkText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  voteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upvotedButton: {
    backgroundColor: '#4caf50',
  },
  downvotedButton: {
    backgroundColor: '#f44336',
  },
  voteScore: {
    fontWeight: 'bold',
    marginHorizontal: 4,
    minWidth: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
