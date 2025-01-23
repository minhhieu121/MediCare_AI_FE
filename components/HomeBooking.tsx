import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { ChildCognition, Eye, Kidneys, Lungs } from "healthicons-react-native";
import { router } from "expo-router";
export default function HomeBooking() {
  return (
    <>
      <View className="mt-6 px-4 pb-6">
        {/* Card bên trong */}
        <View className="bg-pink-50 rounded-xl p-4">
          {/* Tiêu đề */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-psemibold text-gray-800 w-[80%]">
            Đặt lịch hẹn với bác sĩ chuyên khoa
            </Text>
            {/* Icon mũi tên điều hướng bên phải (theo design) */}
            <TouchableOpacity
              onPress={() => {
                router.push("/AppointmentScreen");
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chevron-forward-circle"
                size={28}
                color="#4F63AC"
              />
            </TouchableOpacity>
          </View>

          {/* Phụ đề */}
          <Text className="text-gray-500 text-sm mb-3 font-pmedium">
          Điều trị các triệu chứng phổ biến với bác sĩ chuyên khoa
          </Text>

          {/* 4 - 5 icon cơ quan */}
          <View className="flex-row items-center justify-between mt-2 space-x-3">
            {/* 1. Kidneys */}
            <TouchableOpacity className="items-center">
              {/* Vòng tròn xung quanh icon (tuỳ chọn) */}
              <View className="w-14 h-14 rounded-full bg-white border border-pink-200 items-center justify-center">
                <Kidneys width={32} height={32} color="#2F51D7" />
              </View>
              <Text className="text-xs mt-1 font-semibold text-gray-700">
                Thận
              </Text>
            </TouchableOpacity>

            {/* 2. Eye */}
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 rounded-full bg-white border border-pink-200 items-center justify-center">
                <Eye width={32} height={32} color="#2F51D7" />
              </View>
              <Text className="text-xs mt-1 font-pregular text-gray-700">
                Mắt
              </Text>
            </TouchableOpacity>

            {/* 3. Brain */}
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 rounded-full bg-white border border-pink-200 items-center justify-center">
                <ChildCognition width={32} height={32} color="#2F51D7" />
              </View>
              <Text className="text-xs mt-1 font-pregular text-gray-700">
                Não bộ
              </Text>
            </TouchableOpacity>

            {/* 4. Lungs */}
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 rounded-full bg-white border border-pink-200 items-center justify-center">
                <Lungs width={32} height={32} color="#2F51D7" />
              </View>
              <Text className="text-xs font-pregular mt-1 text-gray-700">
                Phổi
              </Text>
            </TouchableOpacity>

            {/* 5. More */}
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 rounded-full bg-white border border-pink-200 items-center justify-center">
                <Ionicons
                  name="ellipsis-horizontal"
                  size={32}
                  color="#2F51D7"
                />
              </View>
              <Text className="text-xs font-pregular mt-1 text-gray-700">
                Khác
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="bg-slate-100 py-1"></View>
    </>
  );
}
