import React from "react";
import { StyleSheet, View, Text, Image, Button } from "react-native";
import { ThemedView } from "@/components/ThemedView";

const ProfileScreen: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/150" }}
        style={styles.profileImage}
      />
      <Text style={styles.name}>Nguyễn Văn A</Text>
      <Text style={styles.email}>nguyenvana@example.com</Text>
      <Button
        title="Edit Profile"
        onPress={() => {
          /* Xử lý sửa profile */
        }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    fontSize: 18,
    color: "gray",
    marginBottom: 20,
  },
});

export default ProfileScreen;
