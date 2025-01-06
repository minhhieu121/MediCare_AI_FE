// components/DoctorItem.tsx

import React from 'react';
import {TouchableOpacity, Image, Text, View, Linking, Alert} from 'react-native';
import {Department, Doctor, Hospital} from '@/types/appointment';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useRouter} from 'expo-router';

interface DoctorItemProps {
  hospital: Hospital;
  department: Department;
  doctor: Doctor;
}

const DoctorItem: React.FC<DoctorItemProps> = ({hospital, department, doctor}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/HospitalDetails/${hospital.hospital_id}/DepartmentDetails/${department.department_id}/DoctorDetails/${doctor.user_id}`);
  };

  const handleCall = () => {
    // Open the phone dialer with the doctor's phone number
    Linking.openURL(`tel:${doctor.phone}`).catch((err) => {
      Alert.alert('Error', 'Unable to make a call.');
      console.error('Error opening dialer:', err);
    });
  };

  return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View
            // entering={FadeIn.duration(500)}
            className="flex-row bg-white rounded-lg shadow-md p-4 mb-4"
        >
          <Image
              source={{uri: doctor.profile_image}}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
          />
          <View className="flex-1 ml-4">
            <Text className="text-md font-semibold text-gray-800">{doctor.fullname}</Text>
            <Text className="text-gray-600">{doctor.doctor_specialty}</Text>
            <View className="flex-row items-center mt-2">
              <Icon name="call-outline" size={16} color="#1e90ff"/>
              <Text className="ml-1 text-gray-600">{doctor.phone}</Text>
            </View>
            <TouchableOpacity onPress={handleCall} className="mt-2">
              <Text className="text-blue-500">Call Doctor</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
  );
};

export default DoctorItem;
