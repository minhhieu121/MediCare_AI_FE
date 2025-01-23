import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
export default function HomeDateAndAppointment() {
  return (
    <>
      <View className="flex-row px-4 space-x-2 pb-4">
        {/* Lịch ngày */}
        <View className="bg-blue-900/90 w-24 h-28 rounded-xl items-center justify-center pt-3 mr-4">
          <Text className="text-white text-sm mb-1 font-psemibold">Thursday</Text>
          <Text className="text-white font-bold text-3xl font-psemibold">
            23
          </Text>
          <Text className="text-white text-sm mt-1 font-psemibold">Jan</Text>
        </View>

        <View className="flex-1 bg-[#E8F3FF] rounded-xl p-4">
          {/* Tiêu đề */}
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-gray-800">
              Cuộc hẹn sắp tới
            </Text>
            {/* Nút xem chi tiết (tuỳ chọn) */}
            <TouchableOpacity className="rounded-full self-start" onPress={() => {router.push("/AppointmentDetails/1")}}>
              <Text className="text-sm text-blue-700 font-pmedium">
                Xem chi tiết
              </Text>
            </TouchableOpacity>
          </View>

          {/* Khối hiển thị ảnh/avatar bác sĩ + nút gọi */}
          <View className="flex-row items-center mt-1">
            {/* Ảnh avatar bác sĩ (chẳng hạn) */}
            <Image
              source={{ uri: "https://picsum.photos/50" }}
              className="w-12 h-12 rounded-full mr-3"
              resizeMode="cover"
            />
            {/* Tên bác sĩ + chức danh */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-800">
                Bs. Nguyễn Thị Lan
              </Text>
              <Text className="text-xs text-gray-500">Khoa da liễu</Text>
              <Text className="text-xs text-gray-500">8:00 - 8:30</Text>
            </View>

            {/* Nút gọi (tuỳ chọn) */}
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
              <Feather name="phone-call" size={20} color="#1A8BFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="bg-slate-100 py-1"></View>

      <View className="mt-4 px-4 pb-2">
        <LinearGradient
          colors={["#71C4FF", "#A28FEB"]}
          // Thay bằng gam màu bạn thích
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            flex: 1,
            flexDirection: "row",
            padding: 20,
            alignItems: "center",
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 10,
            position: "relative",
          }}
        >
          {/* Vòng tròn trang trí (decor circle) bên phải, bán trong suốt */}
          <View className="absolute w-48 h-48 bg-white/20 rounded-full -top-10 -right-16" />

          {/* Cột bên trái: Nội dung CTA */}
          <View className="flex-1 pl-4 pr-2">
            {/* Tiêu đề */}
            <Text
              className="text-white text-lg font-psemibold"
              numberOfLines={2}
            >
              Trò chuyện với Chatbot AI 24/7
            </Text>
            {/* Mô tả */}
            <Text className="text-white text-sm font-pregular mt-1 pr-2">
              Đặt lịch nhanh, tư vấn triệu chứng, hỏi đáp sức khỏe tức thì!
            </Text>

            {/* Nút CTA */}
            <TouchableOpacity
              onPress={() => {
                router.push("/ChatbotScreen");
              }}
              className="bg-white flex-row items-center self-start px-4 py-2 rounded-full mt-3"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 2 },
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chatbubbles"
                size={18}
                color="#6C63FF"
                style={{ marginRight: 6 }}
              />
              <Text className="text-[#6C63FF] font-psemibold text-sm">
                Dùng thử ngay
              </Text>
            </TouchableOpacity>
            <View className="flex-col items-center w-full ml-16 mt-6">
              <Text className="text-white font-pbold text-xl">
                Ask any thing with
              </Text>
              <Text className="text-white font-pbold text-2xl">
                Medicare AI!
              </Text>
            </View>
          </View>

          {/* Cột bên phải: Hình chatbot minh hoạ */}
          <View className="w-32 h-32 mr-4">
            <Image
              source={{
                uri: "https://i.ibb.co/nP6bztC/chatbot-illustration.png",
              }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
