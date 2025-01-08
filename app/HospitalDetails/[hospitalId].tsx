// app/HospitalDetails/[hospitalId].tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Department, Hospital } from "@/types/appointment";
import DepartmentItem from "@/components/DepartmentItem";
import { LinearGradient } from "expo-linear-gradient";
import {useAuth} from "@/context/AuthContext";

const HospitalDetails = () => {
  const router = useRouter();
  const {token} = useAuth();
  const { hospitalId } = useLocalSearchParams(); // Extract the hospital ID from the route params
  const [hospital, setHospital] = useState<Hospital>({
    hospital_name: " ",
    hospital_address: " ",
    hospital_phone: " ",
    hospital_email: " ",
    hospital_image: " ",
    hospital_id: -1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchHospitalDetails = async () => {
      try {
        const hospitalUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/hospitals/${hospitalId}`;
        const departmentListUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/departments/search?hospital_id=${hospitalId}`;
        const header = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

        const response = await Promise.all([
          fetch(hospitalUrl, header),
          fetch(departmentListUrl, header),
        ]);
        const hospitalResponse = response[0];
        const foundHospital = await hospitalResponse.json();
        if (foundHospital) {
          setHospital(foundHospital);
        } else {
          setError("Hospital not found.");
        }
        console.log(foundHospital);
        const departmentListResponse = response[1];
        const departmentList = await departmentListResponse.json();
        if (departmentListResponse.status === 200) {
          setDepartments(departmentList);
        } else {
          setError("Departments not found.");
        }
        console.log(departmentList);
      } catch (err) {
        setError("An error occurred while fetching hospital details.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalDetails();
  }, [hospitalId]);

  const handleBookAppointment = () => {
    // Placeholder for booking functionality
    Alert.alert(
      "Booking",
      "Navigate to the booking screen or implement booking functionality.",
    );
    // Example: router.push(`/Booking/${hospital?.id}`);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
      Alert.alert("Error", "Unable to make a call.");
      console.error("Error opening dialer:", err);
    });
  };

  const handleNavigate = (address: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => {
        Alert.alert("Error", "Unable to open maps.");
        console.error("Error opening maps:", err);
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sky-100">
        <ActivityIndicator size="large" color="#1e90ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sky-100 px-4">
        <Text className="text-red-500 text-lg mb-4">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-4 py-2 rounded-md"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={["rgb(26,139,255)", "#cbf7ff", "#ffffff"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Icon name="arrow-back-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-psemibold text-white ml-4">Back</Text>
        </View>
        <ScrollView className="flex-1">
          {/* Hospital Image */}
          <Image
            source={{ uri: hospital?.hospital_image }}
            className="w-full h-80"
            resizeMode="cover"
          />

          {/* Hospital Details */}
          <View className="px-4 py-4">
            {/* Hospital Name */}
            <Text className="text-2xl font-psemibold text-whi">
              {hospital?.hospital_name}
            </Text>

            {/* Phone Number */}
            <TouchableOpacity
              onPress={() => handleCall(hospital?.hospital_phone || "")}
              className="flex-row items-center mt-2"
            >
              <Icon name="call-outline" size={20} color="#1e90ff" />
              <Text className="ml-2 text-blue-500">
                {hospital?.hospital_phone}
              </Text>
            </TouchableOpacity>

            {/* Address */}
            <TouchableOpacity
              onPress={() => handleNavigate(hospital?.hospital_address || "")}
              className="flex-row items-center mt-2"
            >
              <Icon name="location-outline" size={20} color="#1e90ff" />
              <Text className="ml-2 text-blue-500">
                {hospital?.hospital_address}
              </Text>
            </TouchableOpacity>

            {/* Description or Additional Info */}
            <Text className="text-gray-700 mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
              accumsan, metus ultrices eleifend gravida, nulla nunc varius
              lectus, nec rutrum justo nibh eu lectus. Ut vulputate semper dui.
              Fusce erat odio, sollicitudin vel erat vel, interdum mattis neque.
            </Text>

            {/* Departments Section */}
            <View className="mt-8">
              <Text className="text-xl font-semibold text-gray-800 mb-4">
                Departments
              </Text>
              {departments.length === 0 ? (
                <Text className="text-gray-600">No departments available.</Text>
              ) : (
                departments.map((dept) => (
                  <DepartmentItem
                    key={dept.department_id}
                    department={dept}
                    hospital={hospital}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HospitalDetails;
