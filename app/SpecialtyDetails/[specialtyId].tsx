import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

type Doctor = {
  user_id: number;
  username: string;
  email: string;
  fullname: string;
  doctor_specialty: string;
  doctor_experience: number;
  profile_image: string;
  doctor_rating?: number; // Optional if not provided by API
};
const SpecialtyDetails = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace with your actual API endpoint
  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/doctors/sample`; // Removed '/sample'

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail?.[0]?.msg || `Error ${response.status}`);
      }
  
      // Validate data is array
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
  
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      setError(error.message);
      // Set empty arrays on error
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter((doctor) =>
        doctor.fullname.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchDoctors();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-700">Loading doctors...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <ScrollView className="bg-white flex-1" keyboardShouldPersistTaps="handled">
        <View className="bg-white pb-6">
          {/* Back Button */}
          <View className="flex-row items-center mb-2 px-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Icon name="arrow-back-outline" size={24} color="#000000" />
            </TouchableOpacity>
            <Text className="text-2xl font-psemibold text-black ml-4">
              Trở về
            </Text>
          </View>

          {/* Search Bar */}
          <View className="px-4 py-2 ">
            <View className="flex-row mx-auto w-[95%] bg-[#f4f4f4] border border-gray-300 rounded-full px-4 py-2 items-center">
              <Icon name="search-outline" size={20} color="#666" />
              <TextInput
                placeholder="Tìm kiếm bác sĩ..."
                value={searchQuery}
                onChangeText={handleSearch}
                className="ml-2 flex-1 text-gray-700 font-pmedium"
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => handleSearch("")}>
                  <Icon name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Display Error Message if any */}
          {error && (
            <View className="mx-5 mt-4 p-4 bg-red-100 rounded-2xl">
              <Text className="text-red-700">{error}</Text>
              <TouchableOpacity
                onPress={handleRetry}
                className="mt-2 bg-blue-500 px-4 py-2 rounded"
              >
                <Text className="text-white text-center">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Specialty Details */}
          <View className="mx-5 mt-4 p-4 bg-sky-100 rounded-2xl flex-row items-center justify-between">
            {/* Text Content */}
            <View>
              <Text className="text-2xl font-psemibold text-gray-800">
              Tư vấn sức khỏe tim mạch
              </Text>
              <Text className="text-gray-500 text-md font-pregular mt-1">
              Chuyên gia tim mạch đáng tin cậy
              </Text>
              <Text className="text-gray-500 text-md font-pregular">
              Chuyên sâu về tim mạch
              </Text>
            </View>

            {/* Placeholder for the image */}
            <Image
              source={{ uri: "https://via.placeholder.com/80" }} // Replace with actual image link
              className="w-24 h-24"
              resizeMode="contain"
            />
          </View>
        </View>
        <View className="bg-slate-100 py-1"></View>

        {/* Doctors List Section */}
        <View className="mt-6 mx-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-psemibold text-gray-800">
            Chuyên gia y tế hàng đầu
            </Text>
            <Text className="text-sm font-pmedium text-blue-500">Xem tất cả</Text>
          </View>

          <View className="flex-row flex-wrap justify-between mt-4">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <View
                  key={doctor.user_id}
                  className="w-[48%] p-4 bg-stone-50 border border-gray-100 shadow-custom-light rounded-xl mb-4"
                >
                  {/* Profile Image Section */}
                  <View className="relative items-center flex-col mb-4">
                    <Image
                      source={{ uri: doctor.profile_image }}
                      className="w-24 h-24 rounded-full"
                      resizeMode="cover"
                    />
                    <View className="absolute top-[5.2rem] bg-white rounded-full px-3 py-1 flex-row items-center">
                      <Ionicons name="star" size={16} color="gold" />
                      <Text className="text-black font-psemibold ml-1">
                        {doctor.doctor_rating ?? "4.5"}
                      </Text>
                    </View>
                  </View>

                  {/* Doctor Info Section */}
                  <View className="h-[80px] justify-center">
                    <Text 
                      numberOfLines={2} 
                      ellipsizeMode="tail"
                      className="text-lg font-psemibold text-center text-gray-900 mb-1"
                    >
                      {doctor.fullname}
                    </Text>
                    <Text 
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className="text-gray-500 font-pregular text-center"
                    >
                      {doctor.doctor_specialty}, {doctor.doctor_experience} năm
                    </Text>
                  </View>

                  {/* Button Section */}
                  <TouchableOpacity
                    className="bg-indigo-900 py-2 rounded-md mt-2"
                    onPress={() =>
                      router.push(
                        `/HospitalDetails/35/DepartmentDetails/35/DoctorDetails/${doctor.user_id}`
                      )
                    }
                  >
                    <Text className="text-white text-center font-psemibold">
                      Đặt lịch hẹn
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center w-full mt-4">
                No doctors found
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SpecialtyDetails;
