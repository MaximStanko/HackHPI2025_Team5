import { Text, View, ScrollView } from "react-native";
import Post from "../app/post";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={{ paddingVertical: 16 }}>
          <Post
            headline="Welcome to our community!"
            content="This is an example post to demonstrate the Post component. It includes upvote and downvote functionality."
            username="johndoe"
            initialScore={5}
          />

          <Post
            headline="Check out this cool feature"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            username="jane_smith"
            initialScore={12}
          />
        </View>
      </ScrollView>
    </View>
  );
}
