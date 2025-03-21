import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Post from "../components/post";
import { AntDesign } from "@expo/vector-icons"; // Make sure you have expo/vector-icons installed

// Update the type for post items with an optional verified property
type PostItem = {
  id: number;
  headline: string;
  content: string;
  username: string;
  initialScore: number;
  tags: string[];
  date: string; // ISO date string
  verified?: boolean; // Optional verified flag
};

// Sample data for posts (here, "johndoe" is verified)
const POSTS: PostItem[] = [
  {
    id: 1,
    headline: "Welcome to our community!",
    content:
      "This is an example post to demonstrate the Post component. It includes upvote and downvote functionality.",
    username: "johndoe",
    initialScore: 5,
    tags: ["welcome", "introduction", "community"],
    date: "2023-01-01T12:00:00Z",
    verified: true, // Mark this user as verified
  },
  {
    id: 2,
    headline: "Check out this cool feature",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    username: "jane_smith",
    initialScore: 12,
    tags: ["feature", "update", "technology"],
    date: "2023-01-02T12:00:00Z",
  },
  {
    id: 3,
    headline: "Tech meetup next week",
    content:
      "Join us for our monthly tech meetup where we'll discuss the latest trends in web development.",
    username: "tech_guru",
    initialScore: 8,
    tags: ["event", "technology", "meetup"],
    date: "2023-01-03T12:00:00Z",
  },
];

// Extract all unique tags
const ALL_TAGS = Array.from(new Set(POSTS.flatMap((post) => post.tags)));

// Toggle tag function
const toggleTag = (
  tag: string,
  selectedTags: string[],
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
) => {
  if (selectedTags.includes(tag)) {
    // Remove tag if already selected
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  } else {
    // Add tag if not selected
    setSelectedTags([...selectedTags, tag]);
  }
};

// Clear all tags function
const clearAllTags = (
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
) => {
  setSelectedTags([]);
};

export default function Index() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<PostItem[]>(POSTS);

  // New state for post creation
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newPostHeadline, setNewPostHeadline] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [allPosts, setAllPosts] = useState<PostItem[]>(POSTS);
  const [allTags, setAllTags] = useState<string[]>(
    Array.from(new Set(POSTS.flatMap((post) => post.tags)))
  );

  const handleToggleTag = (tag: string) => {
    toggleTag(tag, selectedTags, setSelectedTags);
  };

  const handleClearAllTags = () => {
    clearAllTags(setSelectedTags);
  };

  // Rest of your component remains the same
  const openCreatePostModal = () => {
    setCreateModalVisible(true);
  };

  const closeCreatePostModal = () => {
    setCreateModalVisible(false);
    // Reset form fields
    setNewPostHeadline("");
    setNewPostContent("");
    setNewPostTags("");
  };

  const handleCreatePost = () => {
    // Validate inputs
    if (!newPostHeadline.trim()) {
      Alert.alert("Error", "Please enter a headline for your post");
      return;
    }
    if (!newPostContent.trim()) {
      Alert.alert("Error", "Please enter content for your post");
      return;
    }

    // Process tags
    const tagList = newPostTags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    // Create new post object with the current date
    const newPost: PostItem = {
      id: allPosts.length + 1, // Simple ID generation
      headline: newPostHeadline.trim(),
      content: newPostContent.trim(),
      username: "admin", // Would come from authentication in a real app
      initialScore: 0,
      tags: tagList,
      date: new Date().toISOString(), // Add the current date as ISO string
    };

    // Add to posts list
    const updatedPosts = [newPost, ...allPosts];
    setAllPosts(updatedPosts);

    // Update the available tags
    const uniqueTags = Array.from(
      new Set(updatedPosts.flatMap((post) => post.tags))
    );
    setAllTags(uniqueTags);
    setSelectedTags([]); // Clear selected tags if needed
    setFilteredPosts(updatedPosts); // Update filtered posts

    // Close modal
    closeCreatePostModal();
  };

  // Update the useEffect to use allPosts instead of POSTS
  useEffect(() => {
    let result = allPosts;

    if (selectedTags.length > 0) {
      result = result.filter((post) =>
        selectedTags.every((selectedTag) => post.tags.includes(selectedTag))
      );
    }

    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      result = result.filter(
        (post) =>
          post.headline.toLowerCase().includes(lowerCaseSearch) ||
          post.content.toLowerCase().includes(lowerCaseSearch) ||
          post.tags.some((tag) => tag.toLowerCase().includes(lowerCaseSearch))
      );
    }

    setFilteredPosts(result);
  }, [selectedTags, searchText, allPosts]);

  return (
    <View style={{ flex: 1, justifyContent: "flex-start" }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.tagControlsContainer}>
        <Text style={styles.tagFilterTitle}>Filter by tags:</Text>
        {selectedTags.length > 0 && (
          <TouchableOpacity onPress={handleClearAllTags}>
            <Text style={styles.clearTagsButton}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagFilterContainer}
      >
        {allTags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tagFilter,
              selectedTags.includes(tag) && styles.selectedTagFilter,
            ]}
            onPress={() => handleToggleTag(tag)} // Use handleToggleTag here
          >
            <Text
              style={[
                styles.tagFilterText,
                selectedTags.includes(tag) && styles.selectedTagFilterText,
              ]}
            >
              #{tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 16,
          justifyContent: "flex-start",
        }}
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Post
              key={post.id}
              headline={post.headline}
              content={post.content}
              username={post.username}
              initialScore={post.initialScore}
              tags={post.tags}
              date={post.date}
              verified={post.verified} // Pass verified flag
            />
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No posts found. Try a different search or tag combination.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Post Floating Action Button */}
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={openCreatePostModal}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCreatePostModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={closeCreatePostModal}>
                <AntDesign name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Headline</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter a headline for your post..."
                value={newPostHeadline}
                onChangeText={setNewPostHeadline}
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Content</Text>
              <TextInput
                style={[styles.textInput, styles.contentInput]}
                placeholder="Write your post content here..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline={true}
                numberOfLines={8}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="tag1, tag2, tag3..."
                value={newPostTags}
                onChangeText={setNewPostTags}
              />

              <Text style={styles.tagHint}>
                Add relevant tags to help others find your post
              </Text>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreatePost}
              >
                <Text style={styles.submitButtonText}>Post</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  tagControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tagFilterTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  clearTagsButton: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  tagFilterContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  tagFilter: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    width: 100,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  selectedTagFilter: {
    backgroundColor: "#007AFF",
  },
  tagFilterText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  selectedTagFilterText: {
    color: "white",
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  createPostButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 15,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  contentInput: {
    height: 150,
    textAlignVertical: "top",
  },
  tagHint: {
    color: "#666",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
});
