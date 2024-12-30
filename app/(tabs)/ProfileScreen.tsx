import React from "react";
import {View, Text, Image, TouchableOpacity, ScrollView, FlatList} from "react-native";
import {useRouter} from 'expo-router'; // Hoặc router bạn đang sử dụng
import Icon from 'react-native-vector-icons/Ionicons'; // Nếu bạn sử dụng icon

export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

const appointments = [
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

const ProfileScreen = () => {
  const router = useRouter();

  const renderAppointment = ({item}: { item: Appointment }) => (
      <View className="bg-white shadow-sm rounded-lg p-4 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-psemibold text-gray-800">{item.doctor}</Text>
          <Text className={`text-sm font-pmedium ${item.status === 'Confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>
            {item.status}
          </Text>
        </View>
        <Text className="text-gray-600 font-pregular">Specialty: {item.specialty}</Text>
        <Text className="text-gray-600 font-pregular">Date: {item.date}</Text>
        <Text className="text-gray-600 font-pregular">Time: {item.time}</Text>
      </View>
  );

  return (
      <ScrollView className="flex-1 bg-sky-100 p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-10">
          <Image
              source={{uri: "https://via.placeholder.com/150"}}
              className="w-24 h-24 rounded-full mr-4 border-2 border-stone-200"
          />
          <View className="flex-1">
            <Text className="text-2xl font-psemibold text-gray-800">Nguyễn Văn A</Text>
            <Text className="text-gray-600 font-pregular">nguyenvana@example.com</Text>
          </View>
          <TouchableOpacity
              className="p-2"
              onPress={() => {

              }}
          >
            <Icon name="create-outline" size={24} color="#3b82f6"/>
          </TouchableOpacity>
        </View>

        {/* Thông Tin Cá Nhân */}
        <View className="bg-white shadow-md rounded-lg p-6 mb-6">
          <Text className="text-xl font-psemibold text-gray-800 mb-4">Thông Tin Cá Nhân</Text>
          <View className="flex-row items-center mb-3">
            <Icon name="calendar-outline" size={20} color="#6B7280" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Ngày Sinh: 01/01/1990</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Icon name="male-female-outline" size={20} color="#6B7280" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Giới Tính: Nam</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Icon name="location-outline" size={20} color="#6B7280" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Địa Chỉ: 123 Đường ABC, Quận 1, TP.HCM</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Icon name="call-outline" size={20} color="#6B7280" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Điện Thoại: 0123 456 789</Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="mail-outline" size={20} color="#6B7280" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Email: nguyenvana@example.com</Text>
          </View>
        </View>

        {/* Thông Tin Cuộc Hẹn */}
        <View className="bg-white shadow-md rounded-lg p-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-psemibold text-gray-800">Cuộc Hẹn Của Tôi</Text>
            <TouchableOpacity onPress={() => {

            }}>
              <Text className="text-blue-500 font-pmedium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
              data={appointments}
              renderItem={renderAppointment}
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text className="text-gray-600 font-psemibold">Không có cuộc hẹn nào.</Text>}
          />
        </View>

        {/* Thêm phần footer hoặc các thông tin bổ sung nếu cần */}
      </ScrollView>
  );
};

export default ProfileScreen;
