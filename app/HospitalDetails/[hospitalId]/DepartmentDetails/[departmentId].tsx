// app/DepartmentDetails/[hospitalId].tsx

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
import { Department, Doctor, Hospital } from "@/types/appointment";
import DoctorItem from "@/components/DoctorItem";
import { LinearGradient } from "expo-linear-gradient";

const DepartmentDetails = () => {
  const router = useRouter();
  const { hospitalId, departmentId } = useLocalSearchParams(); // Extract the department ID from the route params
  const [hospital, setHospital] = useState<Hospital>({
    hospital_name: " ",
    hospital_address: " ",
    hospital_phone: " ",
    hospital_email: " ",
    hospital_image: " ",
    hospital_id: -1,
  });
  const [department, setDepartment] = useState<Department>({
    department_name: " ",
    department_location: " ",
    hospital_id: -1,
    department_id: -1,
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        const hospitalUrl = `${process.env.REACT_APP_BASE_API}/api/hospital/${hospitalId}`;
        const departmentUrl = `${process.env.REACT_APP_BASE_API}/api/department/${departmentId}`;
        const doctorsListUrl = `${process.env.REACT_APP_BASE_API}/api/doctor/search/${hospitalId}/${departmentId}`;

        const response = await Promise.all([
          fetch(hospitalUrl),
          fetch(departmentUrl),
          fetch(doctorsListUrl),
        ]);

        const foundHospital = await response[0].json();
        if (foundHospital) {
          setHospital(foundHospital);
        } else {
          setError("Hospital not found.");
        }
        const foundDepartment = await response[1].json();

        if (foundDepartment) {
          setDepartment(foundDepartment);
        } else {
          setError("Department not found.");
        }

        const doctorsList = await response[2].json();
        if (response[1].status === 200) {
          setDoctors(doctorsList);
        } else {
          setError("Doctors not found");
        }
        console.log(doctorsList);
      } catch (err) {
        setError("An error occurred while fetching department details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentDetails();
  }, [departmentId]);

  const handleBookAppointment = () => {
    // Placeholder for booking functionality specific to the department
    Alert.alert(
      "Booking",
      "Navigate to the booking screen for this department.",
    );
    // Example: router.push(`/Booking/${department?.id}`);
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
          <View className="flex-1">
            {/* Department Image */}
            <Image
              source={{ uri: hospital.hospital_image }}
              className="w-full h-52"
              resizeMode="cover"
            />

            {/* Department Details */}
            <View className="px-4 py-4">
              {/* Department Name */}
              <Text className="text-2xl font-semibold text-gray-800">
                {department?.department_name}
              </Text>

              {/* Description */}
              <Text className="text-gray-700 mt-4">
                {department?.department_location ||
                  "No description available for this department."}
              </Text>

              {/* Doctors Section */}
              <View className="mt-8">
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Doctors in this Department
                </Text>
                {doctors.length === 0 ? (
                  <Text className="text-gray-600">
                    No doctors available in this department.
                  </Text>
                ) : (
                  doctors.map((doctor) => (
                    <DoctorItem
                      key={doctor.user_id}
                      hospital={hospital}
                      department={department}
                      doctor={doctor}
                    />
                  ))
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DepartmentDetails;
