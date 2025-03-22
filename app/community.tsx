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
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPosts, createPost, populateExamplePosts, votePost, getUserVote } from '@/utils/supabase';
import { commonStyles } from './styles.js';
import { Colors } from './theme.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '@/utils/storage';

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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const categories = ['All', 'General', 'Tips', 'Questions', 'Experiences', 'Research'];
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
          console.log("Session loaded:", session);
          setUserId(session?.user?.id);
        }
      } catch (e) {
        console.error('Failed to get user ID:', e);
      }
    };

    setInterval(() => {
      loadSettings();
    }, 100); 

    const loadPosts = async () => {
      setLoading(true);
      try {
        console.log("Starting to load posts...");
        
        // Populate example posts if none exist
        try {
          await populateExamplePosts();
          console.log("Example posts populated (if needed)");
        } catch (populateError) {
          console.error("Error populating example posts:", populateError);
          // Continue anyway to try loading existing posts
        }
        
        // Get all posts with current sorting
        console.log("Fetching posts with sort:", sortBy);
        const allPosts = await getAllPosts(sortBy);
        console.log("Posts fetched successfully:", allPosts.length);
        setPosts(allPosts);
        setFilteredPosts(allPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
        // Set empty arrays to avoid null reference errors
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
    loadPosts();
  }, [sortBy]);

  // Check user votes on posts - improve error handling
  useEffect(() => {
    const checkUserVotes = async () => {
      if (!userId) return;
      
      console.log("Checking user votes for user ID:", userId);
      const votesMap: Record<number, 'up' | 'down' | null> = {};
      
      try {
        for (const post of posts) {
          try {
            const voteType = await getUserVote(userId, post.id);
            votesMap[post.id] = voteType as 'up' | 'down' | null;
          } catch (voteError) {
            console.error(`Error getting vote for post ${post.id}:`, voteError);
            // Skip this post and continue with others
            votesMap[post.id] = null;
          }
        }
        
        setUserVotes(votesMap);
      } catch (error) {
        console.error("Error checking user votes:", error);
      }
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
    if (!userId) {
      console.log("Cannot vote - no user ID");
      return;
    }
    
    try {
      // First update locally for immediate feedback
      const targetPost = posts.find(post => post.id === postId);
      if (!targetPost) return;
      
      // Prepare local update variables
      let newLocalUpvotes = targetPost.upvotes || 0;
      let newLocalDownvotes = targetPost.downvotes || 0;
      const currentVote = userVotes[postId];
      
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
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === postId 
            ? { ...post, upvotes: newLocalUpvotes, downvotes: newLocalDownvotes } 
            : post
        )
      );
      
      // Update user votes for immediate feedback
      setUserVotes(prev => ({
        ...prev,
        [postId]: currentVote === voteType ? null : voteType
      }));
      
      // Send the request to the server
      console.log(`Voting ${voteType} on post ${postId} by user ${userId}`);
      const result = await votePost(userId, postId, voteType);
      console.log("Vote result:", result);
      
      // Update with server data to ensure consistency
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === postId 
            ? { ...post, upvotes: result.upvotes, downvotes: result.downvotes } 
            : post
        )
      );
      
      // Update user votes with server data
      setUserVotes(prev => ({
        ...prev,
        [postId]: result.voteType
      }));
    } catch (error) {
      console.error('Error voting on post:', error);
      // Show user feedback that vote failed
      Alert.alert('Vote Error', 'Failed to register your vote. Please try again.');
      
      // Revert to original data if there was an error
      setPosts(prev => [...prev]);
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
      <View style={themeStyles.postCard}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={themeStyles.postImage} />
        )}
        
        <View style={themeStyles.postContent}>
          <Text style={themeStyles.postCategory}>{item.category || 'General'}</Text>
          <Text style={themeStyles.postTitle}>{item.title}</Text>
          <Text style={themeStyles.postSummary} numberOfLines={3}>{item.content}</Text>
          
          <View style={themeStyles.postFooter}>
            <View style={themeStyles.postAuthorSection}>
              <Text style={themeStyles.postAuthor}>{authorName}</Text>
              <Text style={themeStyles.postDate}>{formatDate(item.created_at)}</Text>
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
        <Text style={themeStyles.title} numberOfLines={1} ellipsizeMode="tail">Tinnitus Community</Text>
        
        <View style={themeStyles.headerButtons}>
          <TouchableOpacity 
            style={themeStyles.sortButton}
            onPress={() => setShowSortPicker(!showSortPicker)}
          >
            <FontAwesome name="sort" size={16} color="#666" />
            <Text style={themeStyles.sortButtonText}>
              {sortOptions.find(opt => opt.value === sortBy)?.label}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={themeStyles.newPostButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={themeStyles.newPostButtonText}>+ New Post</Text>
          </TouchableOpacity>
        </View>
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
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={themeStyles.listContainer}
          ListEmptyComponent={
            <View style={themeStyles.emptyContainer}>
              <Text style={themeStyles.emptyText}>No posts in this category yet.</Text>
              <TouchableOpacity 
                style={themeStyles.emptyButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={themeStyles.emptyButtonText}>Create the first post</Text>
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
        <View style={themeStyles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={themeStyles.modalContainer}
          >
            <View style={themeStyles.modalHeader}>
              <Text style={themeStyles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={themeStyles.modalBody}>
              <Text style={themeStyles.inputLabel}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={themeStyles.categoryScrollContainer}
                style={themeStyles.modalCategoryContainer}
              >
                {categories.slice(1).map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      themeStyles.categoryButton,
                      newPostCategory === category && themeStyles.selectedCategoryButton
                    ]}
                    onPress={() => setNewPostCategory(category)}
                  >
                    <Text 
                      style={[
                        themeStyles.categoryText,
                        newPostCategory === category && themeStyles.selectedCategoryText
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Text style={themeStyles.inputLabel}>Title</Text>
              <TextInput
                style={themeStyles.titleInput}
                placeholder="Enter a descriptive title..."
                value={newPostTitle}
                onChangeText={setNewPostTitle}
                maxLength={100}
              />
              
              <Text style={themeStyles.inputLabel}>Content</Text>
              <TextInput
                style={themeStyles.contentInput}
                placeholder="Share your thoughts, experience or question..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                textAlignVertical="top"
              />
              
              <TouchableOpacity 
                style={[
                  themeStyles.submitButton, 
                  (!newPostTitle.trim() || !newPostContent.trim()) && themeStyles.disabledButton
                ]}
                onPress={handleCreatePost}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={themeStyles.submitButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e1e4e8', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, flexShrink: 1 },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  sortButton: { flexDirection: 'row', alignItems: 'center', marginRight: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, backgroundColor: '#f1f3f5' },
  sortButtonText: { fontSize: 12, color: '#666', marginLeft: 4 },
  newPostButton: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  newPostButtonText: { color: '#fff', fontWeight: 'bold' },
  sortPickerContainer: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e1e4e8', paddingVertical: 8 },
  sortOption: { paddingVertical: 10, paddingHorizontal: 16 },
  selectedSortOption: { backgroundColor: '#f1f3f5' },
  sortOptionText: { fontSize: 14, color: '#333' },
  selectedSortOptionText: { fontWeight: 'bold', color: Colors.primary },
  categoryContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e1e4e8', maxHeight: 60, minHeight: 60 },
  categoryScrollContainer: { paddingLeft: 4, paddingRight: 4 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, borderRadius: 20, backgroundColor: '#f1f3f5', minWidth: 80, alignItems: 'center' },
  selectedCategoryButton: { backgroundColor: Colors.primary },
  categoryText: { color: '#333', fontWeight: '500' },
  selectedCategoryText: { color: '#fff' },
  loader: { marginTop: 20 },
  listContainer: { padding: 12 },
  postCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  postImage: { width: '100%', height: 150, resizeMode: 'cover' },
  postContent: { padding: 16 },
  postCategory: { color: Colors.primary, fontWeight: '500', fontSize: 12, marginBottom: 4 },
  postTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  postSummary: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 12 },
  postAuthorSection: { flexDirection: 'row', alignItems: 'center' },
  postAuthor: { fontSize: 14, fontWeight: '500', color: '#333', marginRight: 8 },
  postDate: { fontSize: 12, color: '#999' },
  voteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 16, paddingHorizontal: 4 },
  voteButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  upvotedButton: { backgroundColor: '#4caf50' },
  downvotedButton: { backgroundColor: '#f44336' },
  voteScore: { fontWeight: 'bold', marginHorizontal: 4, minWidth: 20, textAlign: 'center' },
  likeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  likedButton: { backgroundColor: Colors.primary },
  likeCount: { marginLeft: 4, color: Colors.primary, fontWeight: '500' },
  likedButtonText: { color: '#fff' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  emptyButton: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  emptyButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e1e4e8' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  modalBody: { padding: 16 },
  modalCategoryContainer: { flexDirection: 'row', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
  titleInput: { backgroundColor: '#f1f3f5', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  contentInput: { backgroundColor: '#f1f3f5', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 120, marginBottom: 16 },
  submitButton: { backgroundColor: Colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  disabledButton: { backgroundColor: '#a0a0a0' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});


const darkStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E1E1E', backgroundColor: '#1E1E1E' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  sortButton: { flexDirection: 'row', alignItems: 'center', marginRight: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, backgroundColor: '#1E1E1E' },
  sortButtonText: { fontSize: 12, color: '#fff', marginLeft: 4 },
  newPostButton: { backgroundColor: '#1E1E1E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  newPostButtonText: { color: '#fff', fontWeight: 'bold' },
  sortPickerContainer: { backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#1E1E1E', paddingVertical: 8 },
  sortOption: { paddingVertical: 10, paddingHorizontal: 16 },
  selectedSortOption: { backgroundColor: '#1E1E1E' },
  sortOptionText: { fontSize: 14, color: '#fff' },
  selectedSortOptionText: { fontWeight: 'bold', color: '#fff' },
  categoryContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#1E1E1E', maxHeight: 60, minHeight: 60 },
  categoryScrollContainer: { paddingLeft: 4, paddingRight: 4 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, borderRadius: 20, backgroundColor: '#1E1E1E', minWidth: 80, alignItems: 'center' },
  selectedCategoryButton: { backgroundColor: '#1E1E1E' },
  categoryText: { color: '#fff', fontWeight: '500' },
  selectedCategoryText: { color: '#fff' },
  loader: { marginTop: 20 },
  listContainer: { padding: 12 },
  postCard: { backgroundColor: '#474747', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  postImage: { width: '100%', height: 150, resizeMode: 'cover' },
  postContent: { padding: 16 },
  postCategory: { color: '#fff', fontWeight: '500', fontSize: 12, marginBottom: 4 },
  postTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#fff' },
  postSummary: { fontSize: 14, color: '#fff', lineHeight: 20, marginBottom: 16 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 12 },
  postAuthorSection: { flexDirection: 'row', alignItems: 'center' },
  postAuthor: { fontSize: 14, fontWeight: '500', color: '#fff', marginRight: 8 },
  postDate: { fontSize: 12, color: '#999' },
  voteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 4 },
  voteButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  upvotedButton: { backgroundColor: '#4caf50' },
  downvotedButton: { backgroundColor: '#f44336' },
  voteScore: { fontWeight: 'bold', marginHorizontal: 4, minWidth: 20, textAlign: 'center' },
  likeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  likedButton: { backgroundColor: '#1E1E1E' },
  likeCount: { marginLeft: 4, color: Colors.primary, fontWeight: '500' },
  likedButtonText: { color: '#fff' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#fff', marginBottom: 20, textAlign: 'center' },
  emptyButton: { backgroundColor: '#1E1E1E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  emptyButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: '1E1E1E', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e1e4e8' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  modalBody: { padding: 16 },
  modalCategoryContainer: { flexDirection: 'row', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
  titleInput: { backgroundColor: '#f1f3f5', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  contentInput: { backgroundColor: '#f1f3f5', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 120, marginBottom: 16 },
  submitButton: { backgroundColor: '1E1E1E', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  disabledButton: { backgroundColor: '#1E1E1E' },
  submitButtonText: { color: '#1E1E1E', fontWeight: 'bold', fontSize: 16 }
});
