import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";

// Mảng dữ liệu giả lập
const RECENT_REPORTS = [
  {
    report_id: 101,
    appointment_id: 501,
    patient_id: 1001,
    chat_content: "Triệu chứng: Ho khan, sốt nhẹ, mệt mỏi kéo dài...",
    prediction_results: [
      { disease: "Covid-19", percentage: 40 },
      { disease: "Cảm cúm", percentage: 30 },
      { disease: "Viêm họng", percentage: 15 },
      { disease: "Khác", percentage: 15 },
    ],
  },
  {
    report_id: 102,
    appointment_id: 502,
    patient_id: 1002,
    chat_content:
      "Triệu chứng: Đau họng, sưng amidan, nhức đầu, đau cơ...",
    prediction_results: [
      { disease: "Viêm họng", percentage: 50 },
      { disease: "Cảm cúm", percentage: 20 },
      { disease: "Covid-19", percentage: 10 },
      { disease: "Khác", percentage: 20 },
    ],
  },
];

// Component chính
export default function RecentReportsView() {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View className="px-4 mt-6 mb-6">
      {/* Tiêu đề */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Ionicons name="document-text-outline" size={20} color="#FEA5AD" />
          <Text className="text-lg ml-1 font-psemibold text-gray-800">
          Báo Cáo Sức Khỏe Gần Đây
          </Text>
        </View>
        <TouchableOpacity>
          <Text className="text-sm font-pmedium text-blue-500">
            Xem tất cả
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách report (scroll ngang) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {RECENT_REPORTS.map((report) => (
          <ReportCard
            key={report.report_id}
            report={report}
            screenWidth={screenWidth}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Tạo component con để styling card cho gọn
function ReportCard({ report, screenWidth }: { report: any; screenWidth: number }) {
  // Tạo data cho PieChart
  const pieData = report.prediction_results.map((item: any) => {
    const randomColor = `hsl(${Math.random() * 360}, 60%, 60%)`;
    return {
      name: item.disease,
      population: item.percentage,
      color: randomColor,
      legendFontColor: "#333",
      legendFontSize: 10,
    };
  });

  return (
    <TouchableOpacity
      onPress={() => console.log("Xem chi tiết report:", report.report_id)}
      className="mr-4 w-64 h-80 rounded-xl overflow-hidden shadow-md border border-gray-100"
      activeOpacity={0.9}
    >
      {/* Header (gradient ~ 35% chiều cao) */}
      <View className="h-[15%] relative">
        <LinearGradient
          colors={["#5D9CFF", "#7A69EE"]} // xanh dương -> tím
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: "100%",
            height: "100%",
            paddingHorizontal: 10,
            paddingVertical: 5,
            justifyContent: "center",
          }}
          className="w-full h-full px-3 py-2 justify-center"
        >
          {/* Vòng tròn trang trí */}
          <View className="absolute bg-white/20 w-16 h-16 rounded-full -top-4 -right-4" />
          <View className="flex-row items-center">
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text className="text-white font-semibold ml-2">
              Báo cáo #{report.report_id}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Body (chiếm ~65% còn lại) */}
      <View className="flex-1 bg-white p-3">
        {/* Pie Chart */}
        <PieChart
          data={pieData}
          width={screenWidth * 0.5} // Rộng ~ nửa màn hình
          height={90}               // Chiều cao chart
          chartConfig={{
            color: (opacity = 1) => `rgba(26, 139, 255, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          center={[0, 0]}
          hasLegend={false}
        />

        {/* Danh sách bệnh + % (Legend tùy chỉnh) */}
        <View className="mt-1 space-y-0.5">
          {report.prediction_results.map((item: any, idx: number) => (
            <Text key={idx} className="text-xs text-gray-700">
              • {item.disease}: {item.percentage}%
            </Text>
          ))}
        </View>

        {/* Triệu chứng (chat_content) */}
        <Text
          className="text-xs text-gray-600 mt-2"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {report.chat_content}
        </Text>

        {/* Nút chi tiết (ở cuối) */}
        <TouchableOpacity className="bg-blue-50 rounded-full px-3 py-1 mt-2 self-start">
          <View className="flex-row items-center space-x-1">
            <Text className="text-blue-600 text-xs font-semibold">
              View Full
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
