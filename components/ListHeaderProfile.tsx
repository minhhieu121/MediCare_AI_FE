import {Image, Text, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import React from "react";
import {useRouter} from "expo-router";
import {SignUpData} from "@/context/AuthContext";

const ListHeaderProfile = (userData: SignUpData) => {
  const router = useRouter();
  console.log("userData", userData);

  const dateFormat = (date: string) => {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    return `${day}/${month}/${year}`;
  }
  return (
      <View>
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-12">
          <Image
              source={{uri: "https://picsum.photos/200/200"}}
              className="w-24 h-24 rounded-full mr-4 border-2 border-stone-500"
          />
          <View className="flex-1">
            <Text className="text-2xl font-psemibold text-gray-800">{userData?.fullname || "dfd"}</Text>
            <Text className="text-gray-600 font-pregular">{userData.email}</Text>
          </View>
          <TouchableOpacity
              className="p-2"
              onPress={() => router.push('/EditProfile')}
          >
            <Icon name="create-outline" size={24} color="#3b82f6"/>
          </TouchableOpacity>
        </View>

        {/* Thông Tin Cá Nhân */}
        <View className="bg-white shadow-custom-light rounded-lg p-6 mb-6">
          <Text className="text-xl font-psemibold text-gray-800 mb-4">Thông Tin Cá Nhân</Text>
          <View className="flex-row items-center mb-3">
            <Icon name="calendar-outline" size={20} color="#161D6F" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Ngày Sinh: {dateFormat(userData.date_of_birth)}</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Icon name="male-female-outline" size={20} color="#161D6F" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Giới Tính: {userData.gender === "Male" ? "Nam" : "Nữ"}</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Icon name="location-outline" size={20} color="#161D6F" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Địa Chỉ: {userData.address}</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Icon name="call-outline" size={20} color="#161D6F" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Điện Thoại: {userData.phone}</Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="mail-outline" size={20} color="#161D6F" className="mr-3"/>
            <Text className="text-gray-700 font-pregular">Email: {userData.email}</Text>
          </View>
        </View>

        {/* Thông Tin Cuộc Hẹn Header */}
        <View className="pb-6">
          {/* Header với icon */}
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="flex-row items-center">
              <Icon name="calendar-outline" size={24} color="#3b82f6" className="mr-2"/>
              <Text className="text-xl font-psemibold text-gray-800">Cuộc Hẹn Của Tôi</Text>
            </View>
            <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push('/Appointments')}
            >
              <Text className="text-blue-500 font-pmedium mr-1">Xem tất cả</Text>
              <Icon name="chevron-forward-outline" size={20} color="#3b82f6"/>
            </TouchableOpacity>
          </View>
          <View className="border-b border-gray-300 w-auto"/>
        </View>
      </View>
  )
};

export default ListHeaderProfile;
