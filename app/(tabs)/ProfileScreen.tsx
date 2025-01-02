import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, {Circle, Line} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import ListHeaderProfile from "@/components/ListHeaderProfile";

export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

const appointments: Appointment[] = [
  {
    id: '1',
    doctor: 'Dr. John Doe',
    specialty: 'Cardiology',
    date: '2024-05-20',
    time: '10:00 AM',
    status: 'Confirmed',
  },
  {
    id: '2',
    doctor: 'Dr. Jane Smith',
    specialty: 'Dermatology',
    date: '2024-06-15',
    time: '2:00 PM',
    status: 'Pending',
  },
  // Thêm các cuộc hẹn khác nếu cần
];

const renderAppointment = ({ item }: { item: Appointment }) => (
  <Animated.View entering={FadeIn.duration(800)} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
    <Text className="text-blue-700 font-psemibold">Bác sĩ: {item.doctor}</Text>
    <Text className="text-blue-700 font-psemibold">Chuyên Khoa: {item.specialty}</Text>
    <Text className="text-blue-700 font-psemibold">Ngày: {item.date}</Text>
    <Text className="text-blue-700 font-psemibold">Giờ: {item.time}</Text>
    <Text className={`text-sm font-pmedium ${item.status === 'Confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>
      {item.status}
    </Text>
  </Animated.View>
);

const ProfileScreen = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={['#e0f7fa', '#000000']}
        className="absolute top-0 left-0 right-0 bottom-0"
      />
      {/* Gradient Background */}

      {/* Blur Overlay */}
      <BlurView intensity={50} className="absolute top-0 left-0 right-0 bottom-0" />

      {/* FlatList chính */}
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeaderProfile}
        ListEmptyComponent={<Text className="text-gray-600 font-psemibold text-center mt-4">Không có cuộc hẹn nào.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="flex-1 bg-transparent p-4"
      />
    </View>
  );
};

export default ProfileScreen;
