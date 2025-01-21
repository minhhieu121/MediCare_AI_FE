import React, {useEffect, useRef} from 'react';
import {FlatList, ScrollView, View} from 'react-native';
import MessageBubble from './MessageBubble';
import {className} from "postcss-selector-parser";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({messages}) => {
  const scrollViewRef = useRef<ScrollView | null>(null)
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({animated: true})
  }, [messages])
  return (
      <ScrollView ref={scrollViewRef} contentContainerStyle={{padding: 10}}>
        {messages.map((item) => (
            <MessageBubble key={item.id} message={item.text} isUser={item.isUser}/>
        ))}
      </ScrollView>
  );
};

export default MessageList;
