import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

interface FeatureCardProps {
  title: string;
  icon: JSX.Element;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white p-4 rounded-lg shadow mb-4"
    >
      <View className="bg-[#1E90FF] p-3 rounded-full mr-4">
        {icon}
      </View>
      <Text className="text-lg font-medium">{title}</Text>
    </TouchableOpacity>
  );
};

export default FeatureCard;
