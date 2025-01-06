// components/DepartmentItem.tsx

import React from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';
import {Department, Hospital} from '@/types/appointment';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {FadeIn} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface DepartmentItemProps {
  department: Department;
  hospital: Hospital;
}

const DepartmentItem: React.FC<DepartmentItemProps> = ({ department, hospital }) => {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to the Department Details screen or Booking screen
    // For now, we'll just log the department ID
    console.log(`Selected Department ID: ${department.department_id}`);
    // Example:
    router.push(`/HospitalDetails/${hospital.hospital_id}/DepartmentDetails/${department.department_id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        // entering={FadeIn.duration(500)}
        className="flex-row bg-white rounded-lg shadow-md p-4 mb-4"
      >
        <Image
          source={{ uri: hospital.hospital_image }}
          className="w-16 h-16 rounded-md"
          resizeMode="cover"
        />
        <View className="flex-1 ml-4">
          <Text className="text-md font-semibold text-gray-800">{department.department_name}</Text>
          <Text className="text-gray-600 mt-1">{department.department_location}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default DepartmentItem;
