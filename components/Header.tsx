import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

const Header: React.FC = () => {
  return (
    <View className="flex-row justify-between items-center px-4 py-3 pt-5 bg-white shadow">
      <Text className="text-xl font-bold text-[#1E90FF]">HealthCare</Text>
      <TouchableOpacity>
        <Feather name="user" size={24} color="#1E90FF" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
