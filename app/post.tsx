import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type PostProps = {
  headline: string;
  content: string;
  username: string;
  initialScore?: number;
};

const Post: React.FC<PostProps> = ({
  headline,
  content,
  username,
  initialScore = 0,
}) => {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const handleUpvote = () => {
    if (userVote === "up") {
      setScore(score - 1);
      setUserVote(null);
    } else {
      setScore(userVote === "down" ? score + 2 : score + 1);
      setUserVote("up");
    }
  };

  const handleDownvote = () => {
    if (userVote === "down") {
      setScore(score + 1);
      setUserVote(null);
    } else {
      setScore(userVote === "up" ? score - 2 : score - 1);
      setUserVote("down");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.content}>{content}</Text>

      <View style={styles.voteContainer}>
        <TouchableOpacity
          onPress={handleUpvote}
          style={[styles.voteButton, userVote === "up" && styles.activeUpvote]}
        >
          <Text
            style={[
              styles.voteText,
              userVote === "up" && styles.activeUpvoteText,
            ]}
          >
            ▲
          </Text>
        </TouchableOpacity>

        <Text style={styles.score}>{score}</Text>

        <TouchableOpacity
          onPress={handleDownvote}
          style={[
            styles.voteButton,
            userVote === "down" && styles.activeDownvote,
          ]}
        >
          <Text
            style={[
              styles.voteText,
              userVote === "down" && styles.activeDownvoteText,
            ]}
          >
            ▼
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  username: {
    fontSize: 14,
    color: "#666",
  },
  headline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  voteButton: {
    padding: 8,
  },
  voteText: {
    fontSize: 16,
    color: "#666",
  },
  score: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 12,
  },
  activeUpvote: {
    backgroundColor: "rgba(0, 150, 0, 0.1)",
    borderRadius: 4,
  },
  activeDownvote: {
    backgroundColor: "rgba(150, 0, 0, 0.1)",
    borderRadius: 4,
  },
  activeUpvoteText: {
    color: "#00aa00",
  },
  activeDownvoteText: {
    color: "#aa0000",
  },
});

export default Post;
