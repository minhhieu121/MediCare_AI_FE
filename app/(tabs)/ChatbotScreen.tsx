import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import HeaderChatbot from "@/components/HeaderChatbot";
import MessageList from "@/components/MessageList";
import InputSection from "@/components/InputSection";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatbotScreen: React.FC = () => {
  const { token, user } = useAuth();
  // const chatbotId = useLocalSearchParams().chatbotId;
  const patient_id = user?.user_id;
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello! How can I assist you today?", isUser: false },
  ]);
  const [loading, setLoading] = useState<boolean>(false); // To manage loading states
  const [error, setError] = useState<string | null>(null); // To handle errors

  const handleSend = async (messageText: string) => {
    if (!patient_id) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
    };

    // Add user's message to the chat
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setLoading(true); // Start loading
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_CHATBOT_URL}/chat/agent/2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if required
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: messageText,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response, // Assuming the API returns a 'response' field
          isUser: false,
        };
        // Add bot's message to the chat
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        const errorData = await response.json();
        console.error("Chatbot response failed:", errorData);
        Alert.alert(
          "Error",
          errorData.message || "Failed to get response from chatbot.",
        );
      }
    } catch (err) {
      console.error("Error communicating with chatbot:", err);
      Alert.alert(
        "Error",
        "An unexpected error occurred while communicating with the chatbot.",
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderChatbot />
      <View className="border-b border-gray-300 w-auto"></View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <MessageList messages={messages} />
        <InputSection onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatbotScreen;
