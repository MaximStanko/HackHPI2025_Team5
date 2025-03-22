import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPosts, createPost, populateExamplePosts, votePost, getUserVote } from '@/utils/supabase';
import { commonStyles } from './styles.js';
import { Colors } from './theme.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';

type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  downvotes: number;
  image_url: string | null;
  created_at: string;
  users: {
    id: number;
    email: string;
  };
};

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<number, 'up' | 'down' | null>>({});
  const [sortBy, setSortBy] = useState('newest');
  const [showSortPicker, setShowSortPicker] = useState(false);

  const categories = ['All', 'General', 'Tips', 'Questions', 'Experiences', 'Research'];
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

    const loadPosts = async () => {
      setLoading(true);
      try {
        // Populate example posts if none exist
        await populateExamplePosts();
        
        // Get all posts with current sorting
        const allPosts = await getAllPosts(sortBy);
        setPosts(allPosts);
        setFilteredPosts(allPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
    loadPosts();
  }, [sortBy]); // Add sortBy as dependency to reload when sorting changes

  // Check user votes on posts
  useEffect(() => {
    const checkUserVotes = async () => {
      if (!userId) return;
      
      const votesMap: Record<number, 'up' | 'down' | null> = {};
      for (const post of posts) {
        const voteType = await getUserVote(userId, post.id);
        votesMap[post.id] = voteType as 'up' | 'down' | null;
      }
      
      setUserVotes(votesMap);
    };

    if (posts.length > 0 && userId) {
      checkUserVotes();
    }
  }, [posts, userId]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.category === selectedCategory));
    }
  }, [selectedCategory, posts]);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !userId) return;
    
    setSubmitting(true);
    try {
      await createPost(userId, {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        category: newPostCategory
      });
      
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('General');
      setModalVisible(false);
      
      // Refresh posts
      const allPosts = await getAllPosts(sortBy);
      setPosts(allPosts);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (postId: number, voteType: 'up' | 'down') => {
    if (!userId) return;
    
    try {
      const { voted, voteType: newVoteType, upvotes, downvotes } = await votePost(userId, postId, voteType);
      
      // Update local state with new vote
      setUserVotes(prev => ({
        ...prev,
        [postId]: newVoteType
      }));
      
      // Update post vote count with values from the server
      setPosts(posts.map(post => {
        if (post.id !== postId) return post;
        
        // Use the upvotes and downvotes returned from the server
        return { ...post, upvotes, downvotes };
      }));
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isCurrentUser = userId === item.users?.id;
    const authorName = isCurrentUser 
      ? 'You' 
      : (item.users?.email?.split('@')[0] || 'Anonymous');
    const userVote = userVotes[item.id];
    const voteScore = (item.upvotes || 0) - (item.downvotes || 0);
    
    return (
      <View style={styles.postCard}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.postImage} />
        )}
        
        <View style={styles.postContent}>
          <Text style={styles.postCategory}>{item.category || 'General'}</Text>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postSummary} numberOfLines={3}>{item.content}</Text>
          
          <View style={styles.postFooter}>
            <View style={styles.postAuthorSection}>
              <Text style={styles.postAuthor}>{authorName}</Text>
              <Text style={styles.postDate}>{formatDate(item.created_at)}</Text>
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
        <Text style={styles.title}>Tinnitus Community</Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortPicker(!showSortPicker)}
          >
            <FontAwesome name="sort" size={16} color="#666" />
            <Text style={styles.sortButtonText}>
              {sortOptions.find(opt => opt.value === sortBy)?.label}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.newPostButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.newPostButtonText}>+ New Post</Text>
          </TouchableOpacity>
        </View>
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
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts in this category yet.</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.emptyButtonText}>Create the first post</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {/* New Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.categoryScrollContainer}
                style={styles.modalCategoryContainer}
              >
                {categories.slice(1).map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      newPostCategory === category && styles.selectedCategoryButton
                    ]}
                    onPress={() => setNewPostCategory(category)}
                  >
                    <Text 
                      style={[
                        styles.categoryText,
                        newPostCategory === category && styles.selectedCategoryText
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Enter a descriptive title..."
                value={newPostTitle}
                onChangeText={setNewPostTitle}
                maxLength={100}
              />
              
              <Text style={styles.inputLabel}>Content</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Share your thoughts, experience or question..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                textAlignVertical="top"
              />
              
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  (!newPostTitle.trim() || !newPostContent.trim()) && styles.disabledButton
                ]}
                onPress={handleCreatePost}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  newPostButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  newPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    maxHeight: 60,
    minHeight: 60,
  },
  categoryScrollContainer: {
    paddingLeft: 4,
    paddingRight: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
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
  postCard: {
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
  postImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  postContent: {
    padding: 16,
  },
  postCategory: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 12,
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  postSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingTop: 12,
  },
  postAuthorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
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
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  likedButton: {
    backgroundColor: Colors.primary,
  },
  likeCount: {
    marginLeft: 4,
    color: Colors.primary,
    fontWeight: '500',
  },
  likedButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalBody: {
    padding: 16,
  },
  modalCategoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  titleInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  contentInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
