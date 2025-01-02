import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import {SafeAreaView} from "react-native-safe-area-context";

interface InputSectionProps {
  onSend: (message: string) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onSend }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState<number>(48); // Chiều cao mặc định

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      setInputHeight(48); // Reset chiều cao sau khi gửi
    }
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const maxHeight = 120; // Giới hạn chiều cao tối đa
    if (height + 16 < maxHeight) { // Thêm 16 để tính padding
      setInputHeight(height + 16);
    } else {
      setInputHeight(maxHeight);
    }
  };

  return (
    <View className="flex-row mx-auto w-11/12 mb-4 bg-[#f4f4f4] border border-gray-200 rounded-full px-4 py-4 items-center">
      {/* Biểu tượng Emoji hoặc Attachment */}
      <TouchableOpacity className="mr-2">
        <Feather name="smile" size={24} color="gray" />
      </TouchableOpacity>

      {/* Ô Input */}
      <TextInput
        className="w-10/12 pt-0 font-pmedium"
        placeholder="Type a message..."
        placeholderTextColor="gray"
        value={message}
        onChangeText={setMessage}
        onFocus={() => {}}
        onBlur={() => {}}
        multiline
        maxLength={1000}
        numberOfLines={4}
        onContentSizeChange={handleContentSizeChange}
        textAlignVertical={'center'}
      />

      {/* Biểu tượng Gửi Tin Nhắn */}
      <TouchableOpacity
        onPress={handleSend}
        className="ml-2"
        disabled={!message.trim()}
      >
        <Ionicons
          name="send"
          size={24}
          color={message.trim() ? '#1E90FF' : 'gray'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default InputSection;
