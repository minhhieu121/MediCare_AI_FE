import React, { useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Redirect, router, useFocusEffect, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import Svg, { Circle, Line } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeIn } from "react-native-reanimated";
import ListHeaderProfile from "@/components/ListHeaderProfile";
import { AuthContext, SignUpData, useAuth } from "@/context/AuthContext"; // <-- Import useAuth

export type Appointment = {
  hospital_id: number;
  department_id: number;
  room_id: number;
  doctor_id: number;
  patient_id: number;
  appointment_day: string;
  appointment_shift: number;
  reason: string;
  status: string;
  appointment_id: number;
  doctor_fullname: string;
  doctor_specialty: string;
};

enum APPOINTMENT_STATUS {
  SCHEDULED = "Scheduled",
  CANCELLED = "Cancelled",
  COMPLETED = "Completed",
  IN_PROGRESS = "InProgress",
}

const convertShiftToTime = (shift: number) => {
  if (shift >= 0 && shift <= 9) {
    if (shift % 2 === 0) {
      return `0${shift + 6}:00 - 0${shift + 6}:30`;
    }
    return `0${shift + 6}:30 - 0${shift + 7}:00`;
  } else {
    if (shift % 2 === 0) {
      return `${shift + 3}:00 - ${shift + 3}:30`;
    }
    return `${shift + 3}:30 - ${shift + 4}:00`;
  }
};

const convertDate = (date: string) => {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);
  return `${day}/${month}/${year}`;
};

const renderLoading = () => (
  <View className="flex-1 justify-center items-center">
    <ActivityIndicator size="large" color="#0000ff" />
    <Text className="text-blue-700 font-psemibold mt-2">Loading...</Text>
  </View>
);

const renderAppointment = ({ item }: { item: Appointment }) => (
  <TouchableOpacity onPress={() => {
    router.push(`/AppointmentDetails/${item.appointment_id}`);
  }}>
    <Animated.View
      // entering={FadeIn.duration(800)}
      className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4"
    >
      <Text className="text-blue-700 font-psemibold">
        Bác sĩ: {item.doctor_fullname}
      </Text>
      <Text className="text-blue-700 font-psemibold">
        Chuyên Khoa: {item.doctor_specialty}
      </Text>
      <Text className="text-blue-700 font-psemibold">
        Ngày: {convertDate(item.appointment_day)}
      </Text>
      <Text className="text-blue-700 font-psemibold">
        Giờ: {convertShiftToTime(item.appointment_shift)}
      </Text>
      <Text
        className={`text-sm font-pmedium ${
          item.status === APPOINTMENT_STATUS.SCHEDULED
            ? "text-green-500"
            : "text-yellow-500"
        }`}
      >
        {item.status}
      </Text>
    </Animated.View>
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const router = useRouter();
  const { signOut } = useAuth(); // Access signOut
  const { token, isExpired } = useContext(AuthContext);
  const [userData, setUserData] = React.useState<SignUpData>({
    username: "",
    email: "",
    user_type: "", // "Doctor" or "Patient"
    fullname: "",
    date_of_birth: "", // e.g. "1990-01-01"
    gender: "", // "Male", "Female", or "Other"
    address: "",
    phone: "",
    profile_image: "",
    password: "",
    doctor_specialty: "",
    doctor_experience: 0,
  });
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] =
    React.useState<boolean>(false);
  const [errorAppointments, setErrorAppointments] = React.useState<
    string | null
  >(null);
  const [loading, setLoading] = React.useState<boolean>(true);


  // useEffect to check token validity and fetch user data
  useFocusEffect(
    useCallback(() => {
      const fetchProfileAndAppointments = async () => {
        if (!token || isExpired(token)) {
          Alert.alert("Session Expired", "Please log in again.");
          handleLogout();
          return;
        }

        try {
          setLoading(true);
          const userProfile = await getMyProfile();
          if (userProfile && userProfile.user_id) {
            setUserData(userProfile);
            await getUserAppointments(userProfile.user_id);
          } else {
            Alert.alert("Error", "User ID not found.");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfileAndAppointments();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(); // Sign out from the context
      router.replace("/LoginScreen"); // Replace with your actual route
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getMyProfile = async () => {
    try {
      console.log("Token:", token);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const userData = await response.json();
      console.log("User data:", userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch appointments
  const getUserAppointments = async (userId: number) => {
    try {
      setLoadingAppointments(true);
      setErrorAppointments(null);

      const queryParams = new URLSearchParams({
        user_id: userId.toString(),
        // You can add more query parameters here if needed
      });

      const response = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL
        }/api/appointments?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const appointmentsData = await response.json();
      console.log("Appointments data:", appointmentsData);
      setAppointments(appointmentsData);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      setErrorAppointments(error.message || "Failed to fetch appointments.");
      Alert.alert("Error", error.message || "Failed to fetch appointments.");
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Render Loading Indicator
  const renderLoading = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {loadingAppointments && !userData ? (
        renderLoading()
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.appointment_id.toString()}
          ListHeaderComponent={ListHeaderProfile(userData)}
          ListEmptyComponent={
            <Text className="text-gray-600 font-psemibold text-center mt-4">
              Không có cuộc hẹn nào.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          className="flex-1 bg-transparent p-4"
          ListFooterComponent={
            <View className="px-2 pb-6">
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.9}
                className="rounded-3xl"
              >
                <LinearGradient
                  // Gradient colors (from left to right)
                  colors={["#A0A0A0", "#D3D3D3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center rounded-3xl mb-24 shadow-lg"
                  // If you're not using Tailwind, you can do style={{ paddingVertical: 12, ... }}
                >
                  <View className="py-3 px-4 flex-row justify-center rounded-3xl items-center">
                    <Icon
                      name="log-out-outline"
                      size={24}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-psemibold text-lg">
                      Logout
                    </Text>
                  </View>
                </LinearGradient>
                <View className="h-20" />
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Logout Button */}
    </View>
  );
};

export default ProfileScreen;
