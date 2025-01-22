// components/InputSection.tsx
import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import LottieView from "lottie-react-native";
import { scale, verticalScale } from "react-native-size-matters";

interface InputSectionProps {
  onSend: (message: string) => void;
  onSendAudio: (audioUri: string) => void; // Thêm prop để gửi audio
  AIResponse: boolean;
  AISpeaking: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({
  onSend,
  onSendAudio,
  AIResponse,
  AISpeaking,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [message, setMessage] = useState("");
  const [inputHeight, setInputHeight] = useState<number>(48); // Chiều cao mặc định
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
      setInputHeight(48); // Reset chiều cao sau khi gửi
    }
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const maxHeight = 120; // Giới hạn chiều cao tối đa
    if (height + 16 < maxHeight) {
      // Thêm 16 để tính padding
      setInputHeight(height + 16);
    } else {
      setInputHeight(maxHeight);
    }
  };

  const handleMicPressIn = async () => {
    try {
      setIsRecording(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Cannot access microphone.");
        setIsRecording(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HighQuality
      );
      setRecording(recording);
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Error", "Failed to start recording.");
      setIsRecording(false);
    }
  };

  const handleMicPressOut = async () => {
    if (!isRecording || !recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        onSendAudio(uri); // Gửi URI âm thanh đến parent component
      }
      setRecording(null);
    } catch (error) {
      console.error("Failed to stop recording", error);
      Alert.alert("Error", "Failed to stop recording.");
      setIsRecording(false);
    }
  };

  const lottieRef = useRef<LottieView>(null);

  return (
    // <View
    //   className="flex-row mx-auto w-11/12 mb-20 bg-[#f4f4f4] border border-gray-200 rounded-full px-4 py-4 items-center h-fit"
    // >
    //   {/* Biểu tượng Microphone */}
    <View style={{ marginBottom: 40, zIndex: 1 }}>
      {!AIResponse ? (
        <TouchableOpacity>
          <LottieView
            source={require("@/assets/animations/loading.json")}
            autoPlay
            loop
            speed={1.3}
            style={{ width: scale(270), height: scale(270) }}
          />
        </TouchableOpacity>
      ) : (
        <>
          {!isRecording ? (
            <>
              {AISpeaking ? (
                <View>
                  <LottieView
                    ref={lottieRef}
                    source={require("@/assets/animations/ai-speaking.json")}
                    autoPlay={false}
                    loop={false}
                    style={{ width: scale(250), height: scale(250) }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    width: scale(60),
                    height: scale(60),
                    backgroundColor: "#fff",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: scale(55), // borderRadius = half of width/height để tạo hình tròn
                    borderWidth: 2, // Thêm độ dày cho viền
                    borderColor: "#2F51D7", // Chọn màu cho viền
                    // Thêm shadow nếu muốn nổi bật hơn (tùy chọn)
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 5, // Dành cho Android để tạo shadow
                    marginBottom: verticalScale(5),
                  }}
                  onPress={handleMicPressIn}
                >
                  <FontAwesome
                    name="microphone"
                    size={scale(30)}
                    color="#2F51D7"
                  />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <TouchableOpacity onPress={handleMicPressOut}>
              <LottieView
                source={require("@/assets/animations/animation.json")}
                autoPlay
                loop
                speed={1.3}
                style={{ width: scale(250), height: scale(250) }}
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>

    //   {/* Ô Input */}
    // {/* <TextInput
    //   className="w-10/12 pt-0 font-pmedium"
    //   placeholder="Type a message..."
    //   placeholderTextColor="gray"
    //   value={message}
    //   onChangeText={setMessage}
    //   onFocus={() => setIsFocused(true)}
    //   onBlur={() => setIsFocused(false)}
    //   multiline
    //   maxLength={1000}
    //   numberOfLines={4}
    //   onContentSizeChange={handleContentSizeChange}
    //   textAlignVertical={'center'}
    // /> */}

    //   {/* Biểu tượng Gửi Tin Nhắn */}
    //   {/* <TouchableOpacity
    //     onPress={handleSend}
    //     className="ml-2"
    //     disabled={!message.trim()}
    //   >
    //     {loading ? (
    //       <ActivityIndicator size="small" color="#1E90FF" />
    //     ) : (
    //       <Ionicons
    //         name="send"
    //         size={24}
    //         color={message.trim() ? '#1E90FF' : 'gray'}
    //       />
    //     )}
    //   </TouchableOpacity> */}
    // </View>
  );
};

export default InputSection;
