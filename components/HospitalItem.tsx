// components/HospitalItem.tsx

import React from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';
import { Hospital } from '@/types/appointment';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useRouter} from "expo-router";

interface HospitalItemProps {
  hospital: Hospital;
}

const HospitalItem: React.FC<HospitalItemProps> = ({ hospital }) => {
  const router = useRouter();


  const handlePress = () => {
    // Navigate to the HospitalDetails screen with the hospital ID
    router.push(`/HospitalDetails/${hospital.hospital_id}`);
  };
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        // entering={FadeIn.duration(500)}
        className="flex-row bg-white rounded-lg shadow-sm p-4 mb-4"
      >
        <Image
          source={{ uri: hospital.hospital_image }}
          className="w-20 h-20 rounded-md"
          resizeMode="cover"
        />
        <View className="flex-1 ml-4">
          <Text className="text-lg font-psemibold text-gray-800">{hospital.hospital_name}</Text>
          <View className="flex-row items-center mt-1">
            <Icon name="call-outline" size={18} color="#1e90ff" />
            <Text className="ml-1 font-pregular text-gray-600">{hospital.hospital_phone}</Text>
          </View>
          <View className="flex-row items-start mt-1">
            <Icon name="location-outline" size={18} color="#1e90ff" />
            <Text className="ml-1 text-gray-600 font-pregular flex-1">{hospital.hospital_address}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default HospitalItem;
