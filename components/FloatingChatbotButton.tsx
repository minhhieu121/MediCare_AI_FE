// components/FloatingChatbotButton.tsx

import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";

const FloatingChatbotButton: React.FC<{ chatbotId: number }> = ({
  chatbotId,
}) => {
  const openChatbot = () => {
    router.push(`/Chatbot/${chatbotId}`);
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={openChatbot}>
        <Icon name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#1e90ff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // For Android
    shadowColor: "#000", // For iOS
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.3, // For iOS
    shadowRadius: 4, // For iOS
    zIndex: 1000, // Ensure it's above other components
  },
});

export default FloatingChatbotButton;
