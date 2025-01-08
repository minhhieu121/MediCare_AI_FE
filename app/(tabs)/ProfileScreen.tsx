import React, {useContext, useEffect} from "react";
import {View, Text, Image, TouchableOpacity, FlatList, Alert} from "react-native";
import {Redirect, router, useRouter} from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, {Circle, Line} from 'react-native-svg';
import {LinearGradient} from 'expo-linear-gradient';
import {BlurView} from 'expo-blur';
import Animated, {FadeIn} from 'react-native-reanimated';
import ListHeaderProfile from "@/components/ListHeaderProfile";
import {AuthContext, SignUpData, useAuth} from "@/context/AuthContext"; // <-- Import useAuth

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
];

const renderAppointment = ({ item }: { item: Appointment }) => (
  <Animated.View
    // entering={FadeIn.duration(800)}
    className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4"
  >
    <Text className="text-blue-700 font-psemibold">Bác sĩ: {item.doctor}</Text>
    <Text className="text-blue-700 font-psemibold">
      Chuyên Khoa: {item.specialty}
    </Text>
    <Text className="text-blue-700 font-psemibold">Ngày: {item.date}</Text>
    <Text className="text-blue-700 font-psemibold">Giờ: {item.time}</Text>
    <Text
      className={`text-sm font-pmedium ${
        item.status === "Confirmed" ? "text-green-500" : "text-yellow-500"
      }`}
    >
      {item.status}
    </Text>
  </Animated.View>
);

const ProfileScreen = () => {
  const router = useRouter();
  const {signOut} = useAuth(); // Access signOut
  const {token, isExpired} = useContext(AuthContext);
  const [userData, setUserData] = React.useState<SignUpData>({
    username: "",
    email: "",
    user_type: "",           // "Doctor" or "Patient"
    fullname: "",
    date_of_birth: "",       // e.g. "1990-01-01"
    gender: "",              // "Male", "Female", or "Other"
    address: "",
    phone: "",
    profile_image: "",
    password: "",
    doctor_specialty: "",
    doctor_experience: 0,
  });

  useEffect(() => {
    if (!token || isExpired(token)) {
      Alert.alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      handleLogout();
    }
  }, [token]);
  const handleLogout = async () => {
    try {
      await signOut();        // Sign out from the context
      router.replace("/LoginScreen"); // Replace with your actual route
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getMyProfile = async () => {
    try {
      console.log("Token:", token);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const userData = await response.json();
      console.log("User data:", userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getMyProfile();
      setUserData(data);
    };

    fetchUserData();
  }, []);

  return (
      <View className="flex-1 bg-white">
        <FlatList
            data={appointments}
            renderItem={renderAppointment}
            keyExtractor={item => item.id}
            ListHeaderComponent={ListHeaderProfile(userData)}
            ListEmptyComponent={
              <Text className="text-gray-600 font-psemibold text-center mt-4">
                Không có cuộc hẹn nào.
              </Text>
            }
            contentContainerStyle={{paddingBottom: 20}}
            className="flex-1 bg-transparent p-4"
        />

        {/* Logout Button */}
        <View className="px-4 pb-6 mb-24">
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.9} className="rounded-3xl">
            <LinearGradient
                // Gradient colors (from left to right)
                colors={['#ff6f61', '#ff914d']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                className="flex-row items-center justify-center rounded-3xl mb-24 shadow-lg"
                // If you're not using Tailwind, you can do style={{ paddingVertical: 12, ... }}
            >
              <View className="py-3 px-4 flex-row justify-center rounded-3xl items-center">
                <Icon
                    name="log-out-outline"
                    size={24}
                    color="#fff"
                    style={{marginRight: 8}}
                />
                <Text className="text-white font-psemibold text-lg">Logout</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </View>
  );
};

export default ProfileScreen;
