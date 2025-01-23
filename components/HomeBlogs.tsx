import { Ionicons } from "@expo/vector-icons";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
export default function HomeBlogs() {
  // Dữ liệu blog với placeholder
  const BLOGS = [
    {
      id: "1",
      category: "Nutrition",
      categoryColor: "#34D399", // Xanh lá
      title: "5 phương pháp ăn uống lành mạnh...",
      description: "Bác sĩ John chia sẻ bí quyết kết hợp thực phẩm...",
      // Placeholder ảnh 200x120, chữ 'Blog 1'
      imageUrl: "https://picsum.photos/200/120",
      doctorName: "Dr. John",
      doctorAvatar: "https://picsum.photos/50/50",
    },
    {
      id: "2",
      category: "Mental Health",
      categoryColor: "#F472B6", // Hồng
      title: "Giảm stress tại nhà với 4 bài tập thư giãn ngắn",
      description: "Hít thở, thiền, kéo giãn cơ giúp giảm căng thẳng nhanh...",
      // Placeholder ảnh 200x120, chữ 'Blog 2'
      imageUrl: "https://picsum.photos/200/120",
      doctorName: "Dr. Alice",
      doctorAvatar: "https://picsum.photos/50/50",
    },
    {
      id: "3",
      category: "Fitness",
      categoryColor: "#F59E0B", // Cam
      title: "Tập thể dục tại nhà hiệu quả với 5 động tác cơ bản",
      description: "Không cần phòng gym, bạn vẫn nâng cao sức khoẻ...",
      // Placeholder ảnh 200x120, chữ 'Blog 3'
      imageUrl: "https://picsum.photos/200/120",
      doctorName: "Dr. Mike",
      doctorAvatar: "https://picsum.photos/50/50",
    },
  ];
  return (
    <>
      <View className="px-4 mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="newspaper-outline" size={20} color="#DF9755" />
          <Text className="text-lg ml-1 font-psemibold text-gray-800"> Bài Viết Nổi Bật</Text>
        </View>
        <TouchableOpacity>
          <Text className="text-sm font-pmedium text-blue-500"> Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách blog (scroll ngang) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 px-4 pb-6"
      >
        {BLOGS.map((blog) => (
          <TouchableOpacity
            key={blog.id}
            style={{
              borderLeftWidth: 4,
              borderLeftColor: "#1A8BFF",
            }}
            className="w-52 h-60 mr-4 bg-white rounded-xl shadow-gray-700 shadow-xl overflow-hidden border border-gray-50"
            onPress={() => console.log("Xem chi tiết blog:", blog.title)}
          >
            {/* Ảnh minh hoạ */}
            <Image
              source={{ uri: blog.imageUrl }}
              className="w-full h-24"
              resizeMode="cover"
            />
            {/* Nội dung */}
            <View className="p-3 flex-1">
              {/* Dòng Category + Badge */}
              <View className="flex-row items-center mb-1">
                {/* Badge category */}
                <View
                  className="px-2 py-1 rounded-full"
                  // style={{ backgroundColor: "#1A8BFF" }}
                >
                  <Text className="text-[#1A8BFF] text-[10px] font-pmedium">
                    {blog.category}
                  </Text>
                </View>
                {/* (Tuỳ chọn) Thêm "New" hay icon */}
                {/* <View className="ml-auto">
            <Ionicons name="flame" size={14} color="#F97316" />
          </View> */}
              </View>

              {/* Tiêu đề */}
              <Text
                className="text-sm font-psemibold text-gray-800 leading-5 mb-1"
                numberOfLines={2}
              >
                {blog.title}
              </Text>

              {/* Mô tả ngắn */}
              <Text
                numberOfLines={1}
                className="text-xs text-gray-600 font-pregular"
              >
                {blog.description}
              </Text>

              {/* Tác giả */}
              <View className="flex-row items-center mt-1">
                <Image
                  source={{ uri: blog.doctorAvatar }}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <Text className="text-[11px] font-pmedium text-gray-700">
                  {blog.doctorName}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View className="bg-slate-100 py-1"></View>
    </>
  );
}
