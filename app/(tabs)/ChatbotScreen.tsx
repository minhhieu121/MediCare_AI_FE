// screens/ChatbotScreen.tsx
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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: messageText,
          }),
        }
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
          errorData.message || "Failed to get response from chatbot."
        );
      }
    } catch (err) {
      console.error("Error communicating with chatbot:", err);
      Alert.alert(
        "Error",
        "An unexpected error occurred while communicating with the chatbot."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleSendAudio = async (audioUri: string) => {
    if (!patient_id) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        name: 'voice_message.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_CHATBOT_URL}/speech-to-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        await handleSend(data.text)
      } else {
        const errorData = await response.json();
        console.error("Chatbot audio response failed:", errorData);
        Alert.alert(
          "Error",
          errorData.message || "Failed to get response from chatbot."
        );
      }
    } catch (err) {
      console.error("Error communicating with chatbot audio:", err);
      Alert.alert(
        "Error",
        "An unexpected error occurred while communicating with the chatbot audio."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderChatbot />
      {/* <View className="border-b border-gray-300 w-auto"></View> */}
      {/* <GestureHandlerRootView style={{ flex: 1 }}> */}
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? -60 : 0}
          >
            <MessageList messages={messages} />
            <InputSection onSend={handleSend} onSendAudio={handleSendAudio} />
          </KeyboardAvoidingView>
        {/* </TouchableWithoutFeedback> */}
      {/* </GestureHandlerRootView> */}
    </SafeAreaView>
  );
};

export default ChatbotScreen;

/**
 * - **User:** Tôi muốn đặt lịch hẹn với bác sĩ Nguyễn Văn Thành ở bệnh viện Trưng Vương
- **Chatbot:** Bạn có thể cho tôi biết ngày và giờ bạn muốn đặt lịch hẹn không?
- **User:** Tôi muốn khám lúc 8h ngày 22/01/2024
- **Chatbot:** Lịch hẹn của bạn đã được đặt với bác sĩ Nguyễn Văn Thành vào lúc 8h ngày 22/01/2024. Sau đây, để có thể chuẩn đoán sơ bộ, bạn có thể cho tôi biết các triệu chứng của bạn được không?
- **User:** Tôi thấy ngứa và đỏ da ở cổ tay, da hơi khô và tróc vảy.
- **Chatbot:** Triệu chứng này xuất hiện khi nào? Có liên quan đến điều gì không?
- **User:** Vài ngày trước, sau khi tôi đeo một chiếc vòng tay mới.
- **Chatbot:** Cảm ơn bạn đã chia sẻ. Bạn có thấy mụn nước nhỏ hoặc vùng da bị tróc vảy không?
- **User:** Có một vài mụn nước nhỏ, và da hơi khô.
- **Chatbot:** Rất có thể bạn đang gặp phải tình trạng viêm da tiếp xúc dị ứng. Điều này xảy ra khi da của bạn phản ứng với một chất gây dị ứng, ví dụ như kim loại trong chiếc vòng tay.
- **User:** Vậy tôi cần làm gì?
- **Chatbot:** Đây là một số gợi ý bạn có thể thử:\n\n1. Tháo vòng tay ra ngay lập tức để tránh tiếp xúc thêm với chất gây dị ứng.\n2. Rửa vùng da bị ảnh hưởng bằng nước sạch và xà phòng dịu nhẹ.\n3. Bôi kem dưỡng ẩm không hương liệu để làm dịu da.\n4. Nếu ngứa nhiều, bạn có thể sử dụng kem chứa corticosteroid nhẹ (nếu có sẵn, theo chỉ định của dược sĩ).
- **User:** Cảm ơn bạn!
- **Chatbot:** Rất vui vì tôi có thể giúp bạn! Hãy theo dõi tình trạng của mình và chúc bạn sớm khỏe lại!
 */