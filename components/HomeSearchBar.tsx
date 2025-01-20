import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
export default function HomeSearchBar() {
  return (
    <View className="px-4 mb-4 mt-3">
      <View className="flex-row items-center bg-slate-100 rounded-full px-3 py-4">
        <Ionicons name="search" size={24} color="#1A8BFF" />
        <TextInput
          placeholder="Search Doctor or Conditions"
          placeholderTextColor="#9CA3AF"
          className="ml-2 flex-1 text-gray-700 font-pregular"
          textAlignVertical="center"
        />
        <TouchableOpacity>
          <Ionicons name="mic" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
