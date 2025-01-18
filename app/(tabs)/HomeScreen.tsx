// frontend/TestVoiceChat.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useLocation } from "@/hooks/useLocation";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const HomeScreen: React.FC = () => {
  const { startLocation, errorMsg } = useLocation(); // Sử dụng hook để lấy vị trí
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

  useEffect(() => {
    // Kiểm tra và hiển thị lỗi vị trí nếu có
    if (errorMsg) {
      Alert.alert("Lỗi Vị Trí", errorMsg);
    }

    // Kết nối WebSocket// Thay đổi với địa chỉ IP thực tế của bạn
    ws.current = new WebSocket(`ws://${wsUrl}/ws/chat`);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    ws.current.onmessage = async (e) => {
      const data = e.data;
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === "traffic_alert") {
          Alert.alert("Cảnh báo giao thông", parsedData.message);
        } else {
          setMessages((prev) => [...prev, { sender: "bot", text: data }]);
          // Sử dụng expo-speech để đọc tin nhắn của bot
          Speech.speak(data, { language: "vi" });
        }
      } catch (error) {
        setMessages((prev) => [...prev, { sender: "bot", text: data }]);
        // Sử dụng expo-speech để đọc tin nhắn của bot
        Speech.speak(data, { language: "vi" });
      }
    };

    ws.current.onerror = (e) => {
      console.log(`WebSocket Error occurred ${e.message}`);
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    // Cleanup khi component unmount
    return () => {
      ws.current?.close();
      // Dọn dẹp sound nếu có
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [errorMsg]); // Thêm errorMsg vào dependency array để hiển thị cảnh báo khi có lỗi

  // Gửi vị trí khi có sự thay đổi
  const sendLocation = () => {
    if (
      startLocation &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      const locationData = JSON.stringify({
        type: "location",
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
      });
      try {
        ws.current.send(locationData);
        console.log(
          `Gửi vị trí: ${startLocation.latitude}, ${startLocation.longitude}`,
        );
      } catch (error) {
        console.error("Error sending location", error);
      }
    }
  };

  useEffect(() => {
    // Yêu cầu quyền truy cập vị trí
    const requestLocationPermission = async () => {
      // Gửi vị trí ngay lập tức khi có quyền
      sendLocation();

      // Thiết lập interval để gửi vị trí mỗi 5 giây
      const intervalId = setInterval(() => {
        sendLocation();
      }, 5000); // 5000ms = 5 giây

      // Dọn dẹp interval khi component unmount
      return () => clearInterval(intervalId);
    };

    requestLocationPermission();
  }, []);


  // Ghi âm giọng nói
  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Không có quyền truy cập microphone");
        return;
      }

      console.log("Starting recording..");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopping recording..");
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      console.log("Recording stopped and stored at", uri);
      setRecordedUri(uri);

      if (uri) {
        // Gửi file audio đến API Speech-to-Text
        console.log("Sending audio to Speech-to-Text API...");
        const text = await sendAudioToSpeechToText(uri);
        if (text) {
          setInput(text);
          sendMessage(text);
        }
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  // Hàm gửi audio đến API Speech-to-Text và nhận lại văn bản
  const sendAudioToSpeechToText = async (
    uri: string,
  ): Promise<string | null> => {
    try {
      // Bạn cần thay đổi URL API và cách gửi dữ liệu tùy theo dịch vụ bạn sử dụng
      // Ví dụ sử dụng backend proxy để gửi audio đến dịch vụ Speech-to-Text
      const apiUrl = `https://${wsUrl}/speech-to-text`; // Thay đổi URL cho phù hợp

      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: "recording.wav",
        type: "audio/wav",
      } as any); // Ép kiểu thành 'any' để tránh lỗi TypeScript

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          // Thêm các headers cần thiết như Authorization nếu cần
        },
        body: formData,
      });

      const result = await response.json();
      console.log("Result from Speech-to-Text API:", result);
      // Giả sử API trả về { text: "văn bản nhận diện được" }
      return result.text || null;
    } catch (error) {
      console.error("Error in Speech-to-Text API: ", error);
      return null;
    }
  };

  const sendMessage = (text?: string) => {
    const messageText = text || input;
    if (messageText.trim() !== "") {
      const messageData = JSON.stringify({ type: "text", text: messageText });
      ws.current?.send(messageData);
      setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
      setInput("");
    }
  };
  // Hàm phát lại âm thanh đã ghi
  const playRecording = async () => {
    if (!recordedUri) {
      Alert.alert("Không có ghi âm nào để phát");
      return;
    }

    try {
      console.log("Loading Sound");
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true },
      );
      soundRef.current = sound;
      setIsPlaying(true);
      console.log("Playing Sound");

      sound.setOnPlaybackStatusUpdate((status) => {
        if ("isLoaded" in status && !status.isLoaded) return;
        if (
          status.isLoaded &&
          status.durationMillis === status.positionMillis
        ) {
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error in playing sound", error);
    }
  };

  // Hàm dừng phát lại âm thanh
  const stopPlaying = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error("Error in stopping sound", error);
      }
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            className={
              item.sender === "user"
                ? "self-end bg-green-200 p-3 rounded-lg m-1"
                : "self-start bg-gray-200 p-3 rounded-lg m-1"
            }
          >
            <Text className="text-base">{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      />
      <View className="flex-row items-center mt-2 mb-28">
        <TextInput
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2"
          value={input}
          onChangeText={setInput}
          placeholder="Nhập tin nhắn..."
        />
        <Button title="Gửi" onPress={() => sendMessage()} />
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          className="ml-2 bg-blue-500 p-3 rounded-full"
        >
          <Text className="text-white">{isRecording ? "Dừng" : "Ghi"}</Text>
        </TouchableOpacity>
        {recordedUri && (
          <TouchableOpacity
            onPress={isPlaying ? stopPlaying : playRecording}
            className="ml-2 bg-purple-500 p-3 rounded-full"
          >
            <Text className="text-white">{isPlaying ? "Dừng" : "Phát"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HomeScreen;
