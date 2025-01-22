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
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { set } from "lodash";
import { encode as btoa } from 'base-64';

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
  const [AISpeaking, setAISpeaking] = useState<boolean>(false);

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };
  

  const synthesizeSpeech = async (inputText: string) => {
    const apiUrl = 'https://viettelai.vn/tts/speech_synthesis';
    const apiToken = '6bb82a21f1f26e3c024dc68e65c4f868'; // Thay bằng token thực của bạn
  
    const requestBody = {
      text: inputText,
      voice: 'hcm-diemmy',
      speed: 1.0,
      tts_return_option: 3, // 3: mp3
      token: apiToken,
      without_filter: false,
    };
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Nhận phản hồi dưới dạng ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
  
      // Chuyển ArrayBuffer thành base64
      const base64String = arrayBufferToBase64(arrayBuffer);
  
      // Định nghĩa đường dẫn lưu tệp âm thanh
      const fileUri = FileSystem.cacheDirectory + 'tts_audio.mp3';
  
      // Lưu tệp âm thanh vào bộ nhớ cục bộ
      await FileSystem.writeAsStringAsync(fileUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Phát tệp âm thanh đã lưu
      playAudio(fileUri);
    } catch (error) {
      console.error('Error calling TTS API:', error);
      Alert.alert('Error', 'Failed to synthesize speech');
    }
  };
  

  const playAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync(); // Giải phóng tài nguyên sau khi phát xong
          setAISpeaking(false);
        }
      });
      setAISpeaking(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Could not play the audio");
    }
  };

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
            query: messageText || "Hello",
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
        setLoading(false); // End loading
        synthesizeSpeech(data.response);
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
      formData.append("file", {
        uri: audioUri,
        name: "voice_message.m4a",
        type: "audio/m4a",
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_CHATBOT_URL}/speech-to-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        await handleSend(data.text);
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
        <View className="flex-row items-center justify-center mb-6">
          <InputSection
            onSend={handleSend}
            onSendAudio={handleSendAudio}
            AIResponse={!loading}
            AISpeaking={AISpeaking}
          />
        </View>
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
