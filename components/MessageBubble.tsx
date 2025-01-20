import React from 'react';
import { View, Text, Image } from 'react-native';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  return (
    <View className={`flex-row items-start ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>

      {/* Avatar bên trái cho chatbot */}
      {!isUser && (
        <Image
          source={{
            uri: 'https://picsum.photos/200',
          }}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}

      {/* Nội dung tin nhắn */}
      <View
        className={`max-w-[75%] p-3 rounded-3xl ${
          isUser ? 'bg-blue-500' : 'bg-gray-200'
        }`}
      >
        <Text className={`text-${isUser ? 'white' : 'black'} font-pregular text-lg`}>{message}</Text>
      </View>
    </View>
  );
};

export default MessageBubble;
