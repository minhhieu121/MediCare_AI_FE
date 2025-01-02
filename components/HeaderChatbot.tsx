import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import {router} from "expo-router";

const HeaderChatbot: React.FC = () => {
  return (
      <View className="w-full flex-row items-center justify-between p-4 bg-transparent">
        <TouchableOpacity onPress={() => router.back()} className="">
          <Icon name="arrow-back-outline" size={24} color="#000000"/>
        </TouchableOpacity>
        <Text className="text-black text-lg font-pbold">Chatbot</Text>
        <View className="pl-9"></View>
      </View>
  );
};

export default HeaderChatbot;
