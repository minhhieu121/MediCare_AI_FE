import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";

const doctorsData = [
  {
    id: 1,
    name: "Dr. Wesley Cain",
    specialty: "Surgeon, 5 yr",
    rating: 4.5,
    image: "https://via.placeholder.com/80", // Placeholder image
    bgColor: "bg-purple-100",
  },
  {
    id: 2,
    name: "Dr. Betty Mason",
    specialty: "Surgeon, 6 yr",
    rating: 4.2,
    image: "https://via.placeholder.com/80",
    bgColor: "bg-blue-100",
  },
  {
    id: 3,
    name: "Dr. Gravin Gibbs",
    specialty: "Surgeon, 7 yr",
    rating: 4.6,
    image: "https://via.placeholder.com/80",
    bgColor: "bg-yellow-100",
  },
  {
    id: 4,
    name: "Dr. Bidya Balan",
    specialty: "Surgeon, 10 yr",
    rating: 5.0,
    image: "https://via.placeholder.com/80",
    bgColor: "bg-green-100",
  },
];

const SpecialtyDetails = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState(doctorsData);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredDoctors(doctorsData);
    } else {
      const filtered = doctorsData.filter((doctor) =>
        doctor.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <ScrollView className="bg-white flex-1">
        <View className="bg-white pb-6">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Icon name="arrow-back-outline" size={24} color="#000000" />
            </TouchableOpacity>
            <Text className="text-2xl font-psemibold text-black ml-4">
              Back
            </Text>
          </View>

          {/* Search Bar */}
          <View className="px-4 py-2 ">
            <View className="flex-row mx-auto w-[95%] bg-[#f4f4f4] border border-gray-300 rounded-full px-4 py-4 items-center h-fit">
              <Icon name="search-outline" size={20} color="#666" />
              <TextInput
                placeholder="Search doctors..."
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
          <View className="mx-5 mt-4 p-4 bg-sky-100 rounded-2xl flex-row items-center justify-between">
            {/* Text Content */}
            <View>
              <Text className="text-2xl font-psemibold text-gray-800">
                Consultancy For Lungs
              </Text>
              <Text className="text-gray-500 text-md font-pregular mt-1">
                Trusted doctors Specialist
              </Text>
              <Text className="text-gray-500 text-md font-pregular">
                In pulmonologist
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
              Top Doctors From Below
            </Text>
            <Text className="text-sm font-pmedium text-blue-500">View all</Text>
          </View>

          <View className="flex-row flex-wrap justify-between mt-4">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <View
                  key={doctor.id}
                  className={`w-[48%] p-4 py-8 ${doctor.bgColor} rounded-xl mb-4`}
                >
                  <View className="relative items-center flex-col mb-6">
                    <Image
                      source={{ uri: "https://picsum.photos/200/200" }}
                      className="w-24 h-24 rounded-full"
                      resizeMode="cover"
                    />
                    <View className="absolute top-[5.2rem] bg-white rounded-full px-3 py-1 flex-row items-center">
                      <Ionicons name="star" size={16} color="gold" />
                      <Text className="text-black font-psemibold ml-1">
                        {doctor.rating}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-lg font-psemibold text-center text-gray-900 mt-2">
                    {doctor.name}
                  </Text>
                  <Text className="text-gray-500 font-pregular text-center">
                    {doctor.specialty}
                  </Text>
                  <TouchableOpacity
                    className="bg-indigo-900 py-2 rounded-md mt-4"
                    onPress={() =>
                      router.push(
                        `/HospitalDetails/35/DepartmentDetails/35/DoctorDetails/83`
                      )
                    }
                  >
                    <Text className="text-white text-center font-psemibold">
                      Book Consult
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
