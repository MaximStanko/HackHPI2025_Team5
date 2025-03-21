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

// Update the type for study posts with an optional verified flag for authenticity
type StudyPost = {
  id: number;
  headline: string;
  content: string;
  username: string;
  initialScore: number;
  tags: string[];
  date: string; // ISO date string
  verified?: boolean; // Indicates that this post is by an approved scientist/doctor
};

// Sample study posts data (only posts from approved users should appear)
const STUDY_POSTS: StudyPost[] = [
  {
    id: 1,
    headline: "New Research on Tinnitus Treatments",
    content:
      "Our recent study shows promising results with a new treatment for tinnitus involving targeted sound therapy. In a double-blind controlled trial with 120 participants, we observed a 37% reduction in perceived tinnitus intensity among the treatment group compared to 8% in the control group. Further research is needed, but these findings suggest a promising avenue for clinical applications.",
    username: "Dr. Smith",
    initialScore: 42,
    tags: ["research", "tinnitus", "sound therapy"],
    date: "2025-03-15T12:00:00Z",
    verified: true,
  },
  {
    id: 2,
    headline: "Clinical Trials for Novel Hearing Aid Technology",
    content:
      "We're currently recruiting participants for Phase II clinical trials of our next-generation hearing aid technology. This innovative device uses AI to dynamically adapt to the user's environment, significantly improving speech recognition in noisy settings. Preliminary results from Phase I showed a 28% improvement in word recognition scores compared to conventional hearing aids.",
    username: "Prof. Johnson",
    initialScore: 35,
    tags: ["clinical trials", "hearing aids", "AI"],
    date: "2025-03-10T09:30:00Z",
    verified: true,
  },
  {
    id: 3,
    headline: "Breakthrough in Understanding Auditory Processing Disorders",
    content:
      "Our research team has identified a previously unknown neural pathway involved in auditory processing disorders. Using advanced neuroimaging techniques, we mapped specific brain regions that show altered connectivity in patients with APD. This discovery opens new possibilities for targeted interventions and may lead to more effective diagnostic tools.",
    username: "Dr. Garcia",
    initialScore: 27,
    tags: ["APD", "neuroscience", "diagnosis"],
    date: "2025-02-28T15:45:00Z",
    verified: true,
  },
];

export default function Scientific() {
  // Determine if current user is a scientist (in a real app, this would come from authentication)
  const isScientist = false; // Most users would see this as false

  const [searchText, setSearchText] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<StudyPost[]>(STUDY_POSTS);
  const [allPosts, setAllPosts] = useState<StudyPost[]>(STUDY_POSTS);
  const [allTags, setAllTags] = useState<string[]>(
    Array.from(new Set(STUDY_POSTS.flatMap((post) => post.tags)))
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

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
    <View
      style={{ flex: 1, justifyContent: "flex-start", backgroundColor: "#fff" }}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search medical studies..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.tagControlsContainer}>
        <Text style={styles.tagFilterTitle}>Filter by medical fields:</Text>
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
        {allTags.map((tag, index) => (
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
              verified={post.verified}
              doctorIcon={post.verified}
              serious={true}
            />
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No medical studies found matching your criteria.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* The create post button is only shown to scientists */}
      {isScientist && (
        <TouchableOpacity style={styles.createPostButton} onPress={() => {}}>
          <Text style={styles.createPostButtonText}>+</Text>
        </TouchableOpacity>
      )}
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
  postsContainer: {
    paddingBottom: 16,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0969da",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createPostButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
