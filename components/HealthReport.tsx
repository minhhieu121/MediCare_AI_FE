import React from "react";
import { View, Text, ScrollView, FlatList, Dimensions } from "react-native";
import { ProgressBar } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";

// types.ts
export interface PredictionResult {
  disease: string;
  percentage: number;
}

export interface HealthReport {
  report_id: number;
  appointment_id: number;
  patient_id: number;
  height: number; // Chiều cao (cm)
  weight: number; // Cân nặng (kg)
  medical_history: string[]; // Tiền sử bệnh án
  clinical_info: string; // Thông tin khám sức khỏe lâm sàng
  chat_content: string; // Triệu chứng (dạng chuỗi)
  prediction_results: PredictionResult[];
}

export interface HealthReportProps {
  report: HealthReport;
}


export const fakeHealthReport: HealthReport = {
  report_id: 101,
  appointment_id: 501,
  patient_id: 1001,
  height: 175, // Chiều cao: 175 cm
  weight: 70, // Cân nặng: 70 kg
  medical_history: ["Tiểu đường", "Huyết áp cao"], // Tiền sử bệnh án
  clinical_info: "Khám tổng quát: Cân đối, không có dấu hiệu bất thường về tim mạch và hô hấp.",
  chat_content: "Triệu chứng: Ho khan, sốt nhẹ, mệt mỏi kéo dài, đau họng, khó thở lúc ban đêm.",
  prediction_results: [
    { disease: "Covid-19", percentage: 40 },
    { disease: "Cảm cúm", percentage: 30 },
    { disease: "Viêm họng", percentage: 15 },
    { disease: "Khác", percentage: 15 },
  ],
};

// Nếu bạn muốn tạo nhiều báo cáo giả:
export const fakeHealthReports: HealthReport[] = [
  {
    report_id: 101,
    appointment_id: 501,
    patient_id: 1001,
    height: 175,
    weight: 70,
    medical_history: ["Tiểu đường", "Huyết áp cao"],
    clinical_info: "Khám tổng quát: Cân đối, không có dấu hiệu bất thường về tim mạch và hô hấp.",
    chat_content: "Triệu chứng: Ho khan, sốt nhẹ, mệt mỏi kéo dài, đau họng, khó thở lúc ban đêm.",
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
    height: 160,
    weight: 60,
    medical_history: ["Hen suyễn"],
    clinical_info: "Khám tổng quát: Nhẹm mạch đều, phổi nghe phổi rõ ràng.",
    chat_content: "Triệu chứng: Đau bụng, buồn nôn, tiêu chảy, mất cảm giác vị giác và khứu giác.",
    prediction_results: [
      { disease: "Viêm ruột", percentage: 35 },
      { disease: "Cúm đường ruột", percentage: 25 },
      { disease: "Đau dạ dày", percentage: 20 },
      { disease: "Khác", percentage: 20 },
    ],
  },
];

const screenWidth = Dimensions.get("window").width;

const getColor = (index: number) => {
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
  return colors[index % colors.length];
};

const HealthReportDetail: React.FC<HealthReportProps> = ({ report }) => {
  // Tách triệu chứng từ chat_content
  const symptoms = report.chat_content
    .replace("Triệu chứng:", "")
    .split(",")
    .map((symptom) => symptom.trim());

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = report.prediction_results.map((item, index) => ({
    name: item.disease,
    population: item.percentage,
    color: getColor(index),
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  }));

  return (
    <ScrollView className="p-4 bg-white flex-1">
      {/* Tiêu đề */}
      <View className="mb-6">
        <Text className="text-2xl font-bold mb-2">Chi Tiết Báo Cáo Sức Khỏe</Text>
        <View className="border-b border-gray-200" />
      </View>

      {/* Thông tin cơ bản */}
      <View className="mb-4">
        <Text className="text-gray-600">Mã Báo Cáo:</Text>
        <Text className="text-black text-lg">{report.report_id}</Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-600">Mã Cuộc Hẹn:</Text>
        <Text className="text-black text-lg">{report.appointment_id}</Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-600">Mã Bệnh Nhân:</Text>
        <Text className="text-black text-lg">{report.patient_id}</Text>
      </View>

      {/* Thông tin sức khỏe cá nhân */}
      <View className="mb-6">
        <Text className="text-gray-600 mb-2">Thông Tin Sức Khỏe Cá Nhân:</Text>
        <View className="flex-row mb-2">
          <Text className="text-gray-600">Chiều Cao:</Text>
          <Text className="text-black ml-2">{report.height} cm</Text>
        </View>
        <View className="flex-row mb-2">
          <Text className="text-gray-600">Cân Nặng:</Text>
          <Text className="text-black ml-2">{report.weight} kg</Text>
        </View>
        <View className="flex-row mb-2">
          <Text className="text-gray-600">Tiền Sử Bệnh Án:</Text>
          <View className="flex-1 flex-wrap flex-row">
            {report.medical_history.map((history, index) => (
              <View
                key={index}
                className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-blue-800 text-sm">{history}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className="flex-row">
          <Text className="text-gray-600">Thông Tin Khám Lâm Sàng:</Text>
          <Text className="text-black ml-2">{report.clinical_info}</Text>
        </View>
      </View>

      {/* Triệu chứng */}
      <View className="mb-6">
        <Text className="text-gray-600 mb-2">Triệu Chứng:</Text>
        <View className="flex-row flex-wrap">
          {symptoms.map((symptom, index) => (
            <View
              key={index}
              className="bg-green-100 rounded-full px-3 py-1 mr-2 mb-2"
            >
              <Text className="text-green-800 text-sm">{symptom}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Kết quả dự đoán */}
      <View className="mb-6">
        <Text className="text-gray-600 mb-2">Kết Quả Dự Đoán:</Text>
        <PieChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <View className="mt-4">
          {report.prediction_results.map((item, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getColor(index) }}
              />
              <Text className="text-gray-700">{item.disease}: {item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HealthReportDetail;