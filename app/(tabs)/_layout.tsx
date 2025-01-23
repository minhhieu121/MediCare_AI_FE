import { Tabs } from "expo-router";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { FontAwesome, FontAwesome5, FontAwesome6, Fontisto, Ionicons } from "@expo/vector-icons"; 
import { useColorScheme } from "@/hooks/useColorScheme";

// Bỏ hoặc giữ nếu bạn dùng custom haptic
// import { HapticTab } from "@/components/HapticTab"; 
// Bỏ hoặc giữ nếu bạn dùng background custom
// import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Màu chủ đạo khi tab active
  const activeColor = "#2F51D7"; 
  // Màu xám khi tab inactive
  const inactiveColor = "#9CA3AF";

  return (
    <Tabs
      screenOptions={{
        // Tắt header
        headerShown: false,
        // Màu icon/label khi chọn
        tabBarActiveTintColor: activeColor,
        // Màu icon/label khi không chọn
        tabBarInactiveTintColor: inactiveColor,
        
        // Ẩn label tùy ý, mình cho hiển thị label (true)
        tabBarShowLabel: true,

        // Cỡ chữ label
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 4,
        },

        // Style của thanh tab bar
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#fff",
          height: 70,
          left: 16,
          right: 16,
          borderRadius: 16,
          // Bóng đổ
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
          elevation: 4, // Android
        },
      }}
    >
      {/* ======= TAB 1: HOME ======= */}
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* ======= TAB 2: BOOKING ======= */}
      <Tabs.Screen
        name="MapScreen"
        options={{
          title: "Bản đồ",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="map" size={size} color={color} />
          ),
        }}
      />

      {/* 
        ======= TAB 3 (CENTER): CHAT =======
        Nút giữa: to, vòng tròn xanh đậm, icon trắng
      */}
      <Tabs.Screen
        name="ChatbotScreen"
        options={{
          title: "Chat", 
          // Gọi là "Chat" thay vì "Chatbot" để giống mockup
          tabBarIcon: ({ focused }) => (
            // Nếu muốn thay đổi icon khi focus, cta có thể check
            <Ionicons
              name="chatbubble"
              size={26}
              color="#fff" // icon luôn trắng
            />
          ),
          // Tùy chỉnh hoàn toàn nút tab
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={{
                top: -12, // đẩy nút nhô lên
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: activeColor, // Xanh đậm
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                {/* Icon Chat trắng */}
                <Ionicons name="chatbubble" size={26} color="#fff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* ======= TAB 4: REPORTS ======= */}
      <Tabs.Screen
        name="AppointmentScreen"
        options={{
          title: "Đặt lịch",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* ======= TAB 5: PROFILE ======= */}
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
