import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import Post from "../components/post";

// Sample data for demonstration
const POSTS = [
  {
    id: 1,
    headline: "Welcome to our community!",
    content:
      "This is an example post to demonstrate the Post component. It includes upvote and downvote functionality.",
    username: "johndoe",
    initialScore: 5,
    tags: [
      "welcome",
      "introduction",
      "community",
      "example",
      "demo",
      "post",
      "upvote",
      "downvote",
    ],
  },
  {
    id: 4,
    headline: "Welcome to our community!",
    content:
      "This is an example post to demonstrate the Post component. It includes upvote and downvote functionality.",
    username: "johndoe",
    initialScore: 5,
    tags: [
      "welcome",
      "introduction",
      "community",
      "example",
      "demo",
      "post",
      "upvote",
      "downvote",
    ],
  },
  {
    id: 5,
    headline: "Welcome to our community!",
    content:
      "This is an example post to demonstrate the Post component. It includes upvote and downvote functionality.",
    username: "johndoe",
    initialScore: 5,
    tags: [
      "welcome",
      "introduction",
      "community",
      "example",
      "demo",
      "post",
      "upvote",
      "downvote",
    ],
  },
  {
    id: 6,
    headline: "Welcome to our community!",
    content:
      "This is an example post to demonstrate the Post component. It includes upvote and downvote functionality.",
    username: "johndoe",
    initialScore: 5,
    tags: [
      "welcome",
      "introduction",
      "community",
      "example",
      "demo",
      "post",
      "upvote",
      "downvote",
    ],
  },
  {
    id: 2,
    headline: "Check out this cool feature",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    username: "jane_smith",
    initialScore: 12,
    tags: ["feature", "update", "technology"],
  },
  {
    id: 3,
    headline: "Tech meetup next week",
    content:
      "Join us for our monthly tech meetup where we'll discuss the latest trends in web development.",
    username: "tech_guru",
    initialScore: 8,
    tags: ["event", "technology", "meetup"],
  },
];

// Extract all unique tags
const ALL_TAGS = Array.from(new Set(POSTS.flatMap((post) => post.tags)));

export default function Index() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(POSTS);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag if already selected
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      // Add tag if not already selected
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  useEffect(() => {
    let result = POSTS;

    // Filter by tags if any are selected
    if (selectedTags.length > 0) {
      result = result.filter((post) =>
        // Changed from "some" to "every" to require ALL selected tags
        selectedTags.every((selectedTag) => post.tags.includes(selectedTag))
      );
    }

    // Filter by search text if entered
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
  }, [selectedTags, searchText]);

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
          <TouchableOpacity onPress={clearAllTags}>
            <Text style={styles.clearTagsButton}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagFilterContainer}
      >
        {ALL_TAGS.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tagFilter,
              selectedTags.includes(tag) && styles.selectedTagFilter,
            ]}
            onPress={() => toggleTag(tag)}
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
          // Remove flexGrow and justifyContent altogether
          paddingBottom: 16, // Move padding here instead
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
    paddingBottom: 16, // Increased bottom padding
  },
  tagFilter: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    width: 100, // Fixed width instead of minWidth
    height: 36, // Fixed height
    justifyContent: "center", // Ensure vertical centering
    alignItems: "center", // Ensure horizontal centering
    overflow: "hidden", // Prevent text from affecting container size
  },
  selectedTagFilter: {
    backgroundColor: "#007AFF",
  },
  tagFilterText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center", // Ensure text is centered
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
});
