import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { View, Text } from "react-native";

export default function HomeHeader() {
  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
      <View className="flex-row items-center">
        <Ionicons name="location-sharp" size={32} color="#1A8BFF" />
        <TouchableOpacity className="ml-2 flex-col space-x-1">
          <Text className="text-gray-500 text-sm font-pmedium">
            Xin chào, Vũ Xuân Vinh
          </Text>
          <View className="flex-row items-center">
            <Text className="text-base text-primary font-psemibold">
              Ho Chi Minh City, Vietnam
            </Text>
            <Ionicons name="chevron-down" size={16} color="#4F63AC" />
          </View>
        </TouchableOpacity>
      </View>
      {/* Icon Thông báo */}
      <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
        <Ionicons name="notifications-outline" size={28} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
