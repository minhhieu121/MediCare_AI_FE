// HealthReportDetail.tsx
import React from "react";
import { View, Text, ScrollView, FlatList, Dimensions } from "react-native";
import { ProgressBar } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";

const sample_prediction_result = {
  "ThongTinBenhNhan": {
      "HoVaTen": "Vũ Xuân Vinh",
      "Tuoi": "20",
      "GioiTinh": "Nam",
      "LienHe": "0778984805"
  },
  "TrieuChungVaPhanNan": {
      "MoTa": "Bệnh nhân báo cáo ngứa và đỏ da tại vùng cổ tay, lan đến cánh tay.",
      "ThoiGianBatDau": "Vài ngày trước sau khi sử dụng một chiếc vòng tay mới.",
      "TrieuChungChiTiet": [
          "Ngứa",
          "Đỏ da", 
          "Khô",
          "Tróc vảy",
          "Một số mụn nước nhỏ"
      ]
  },
  "KetQuaSoBo": {
      "ChanDoanAI": "Viêm da tiếp xúc dị ứng",
      "NguyenNhanDuKien": "Do tiếp xúc với kim loại trong chiếc vòng tay."
  },
  "KhuyenNghiChoBacSi": [
      "Yêu cầu bệnh nhân ngừng sử dụng vòng tay nghi ngờ là nguyên nhân.",
      "Tửng thực kiểm tra lâm sàng vùng da bị tác động.",
      "Xem xét kê đơn kem bôi corticosteroid nhẹ và thuốc kháng histamine nếu ngứa nhiều.",
      "Khuyên bệnh nhân dợ rửa vùng da tác động với nước sạch và xà phòng không gây kích ứng."
  ],
  "LuuYGuiBacSi": "Báo cáo này được tạo tự động bởi hệ thống AI nhằm cung cấp tóm tắt ban đầu cho bác sĩ tham khảo. Vui lòng xác nhận kết quả qua khám lâm sàng và xét nghiệm."
}

const screenWidth = Dimensions.get("window").width;

const getColor = (index: number) => {
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
  return colors[index % colors.length];
};

const HealthReportDetail: React.FC = () => {
  const report = sample_prediction_result;

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = report.KetQuaSoBo.ChanDoanAI
    ? [
        {
          name: report.KetQuaSoBo.ChanDoanAI,
          population: 70,
          color: getColor(0),
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        },
        {
          name: report.KetQuaSoBo.NguyenNhanDuKien,
          population: 30,
          color: getColor(1),
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        },
      ]
    : [];

    const symptoms = report.TrieuChungVaPhanNan.TrieuChungChiTiet.map(
      (symptom) => symptom.trim()
    );

  return (
    <ScrollView className="p-6 bg-white flex-1">
      {/* Tiêu đề */}
      <View className="mb-8">
        <Text className="text-3xl font-psemibold text-gray-800 mb-2">
          Chi Tiết Báo Cáo Sức Khỏe
        </Text>
        <View className="h-1 bg-gray-100 rounded-full" />
      </View>

      {/* Thông tin bệnh nhân */}
      <View className="mb-8">
        <Text className="text-2xl font-psemibold text-gray-800 mb-4">
          Thông Tin Bệnh Nhân
        </Text>
        <View className="mb-4">
          <Text className="text-lg font-pmedium text-gray-600">Họ Và Tên:</Text>
          <Text className="text-xl text-gray-800">{report.ThongTinBenhNhan.HoVaTen}</Text>
        </View>
        <View className="mb-4">
          <Text className="text-lg font-pmedium text-gray-600">Tuổi:</Text>
          <Text className="text-xl text-gray-800">{report.ThongTinBenhNhan.Tuoi}</Text>
        </View>
        <View className="mb-4">
          <Text className="text-lg font-pmedium text-gray-600">Giới Tính:</Text>
          <Text className="text-xl text-gray-800">{report.ThongTinBenhNhan.GioiTinh}</Text>
        </View>
      </View>

      {/* Triệu chứng */}
      <View className="mb-8">
        <Text className="text-2xl font-psemibold text-gray-800 mb-4">
          Triệu Chứng
        </Text>
        <View className="mb-4">
          <Text className="text-lg font-pmedium text-gray-600">Mô Tả:</Text>
          <Text className="text-xl text-gray-800">
            {report.TrieuChungVaPhanNan.MoTa}
          </Text>
        </View>
        <View className="mb-4">
          <Text className="text-lg font-pmedium text-gray-600">
            Thời Gian Bắt Đầu:
          </Text>
          <Text className="text-xl text-gray-800">
            {report.TrieuChungVaPhanNan.ThoiGianBatDau}
          </Text>
        </View>
        <View>
          <Text className="text-lg font-pmedium text-gray-600 mb-2">
            Triệu Chứng Chi Tiết:
          </Text>
          <View className="flex-row flex-wrap">
            {symptoms.map((symptom, index) => (
              <View
                key={index}
                className="bg-green-100 rounded-full px-4 py-2 mr-3 mb-3"
              >
                <Text className="text-green-800 text-sm">{symptom}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Kết quả sơ bộ */}
      

      {/* Khuyến nghị cho bác sĩ */}
      {/* <View className="mb-8">
        <Text className="text-2xl font-psemibold text-gray-800 mb-4">
          Khuyến Nghị Cho Bác Sĩ
        </Text>
        <FlatList
          data={report.KhuyenNghiChoBacSi}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View className="flex-row items-start mb-3">
              <Text className="text-xl font-psemibold text-gray-600 mr-3">•</Text>
              <Text className="text-lg text-gray-800 flex-1">{item}</Text>
            </View>
          )}
        />
      </View> */}

      {/* Lưu ý gửi bác sĩ */}
      <View className="mb-8">
        <Text className="text-2xl font-psemibold text-gray-800 mb-4">
          Lưu Ý Gửi Bác Sĩ
        </Text>
        <Text className="text-lg text-gray-800">
          {report.LuuYGuiBacSi}
        </Text>
      </View>
    </ScrollView>
  );
};

export default HealthReportDetail;
