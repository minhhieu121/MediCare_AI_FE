import React, {useState} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, View} from 'react-native';
import HeaderChatbot from '@/components/HeaderChatbot';
import MessageList from '@/components/MessageList';
import InputSection from '@/components/InputSection';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaView} from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {id: '1', text: 'Hello! How can I assist you today?', isUser: false},
  ]);

  const handleSend = (messageText: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Tạm thời không có backend, bạn có thể thêm logic giả lập phản hồi ở đây
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'This is a bot response. I will get back to you shortly. Thank you! 🤖 This is a bot response. I will get back to you shortly. Thank you! 🤖 This is a bot response. I will get back to you shortly. Thank you! 🤖 This is a bot response. I will get back to you shortly. Thank you! 🤖 This is a bot response. I will get back to you shortly. Thank you! 🤖 ',
      isUser: false,
    };
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderChatbot/>
        <View className="border-b border-gray-300 w-auto"></View>
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <MessageList messages={messages}/>
          <InputSection onSend={handleSend}/>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

export default ChatbotScreen;
