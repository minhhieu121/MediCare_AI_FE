import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient"; // Nếu sử dụng Expo
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import RecentReportsView from "@/components/RecentReportsView";

enum APPOINTMENT_STATUS {
  SCHEDULED = "Scheduled",
  CANCELLED = "Cancelled",
  COMPLETED = "Completed",
  IN_PROGRESS = "InProgress",
}

// Hàm chuyển shift -> Thời gian
function convertShiftToTime(shift: number) {
  if (shift >= 0 && shift <= 9) {
    if (shift % 2 === 0) {
      return `0${shift + 7}:00 - 0${shift + 7}:30`;
    }
    return `0${shift + 7}:30 - 0${shift + 8}:00`;
  } else {
    if (shift % 2 === 0) {
      return `${shift + 3}:00 - ${shift + 3}:30`;
    }
    return `${shift + 3}:30 - ${shift + 4}:00`;
  }
}

// Hàm chuyển date -> DD/MM/YYYY
function convertDate(date: string) {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);
  return `${day}/${month}/${year}`;
}

const AppointmentDetails: React.FC = () => {
  // Dữ liệu giả lập
  const appointment = {
    hospital_id: 1,
    department_id: 1,
    room_id: 3,
    doctor_id: 1,
    patient_id: 1,
    appointment_day: "2022-12-31",
    appointment_shift: 2,
    reason: "Cảm thấy mệt, đau đầu, cần kiểm tra tổng quát.",
    status: APPOINTMENT_STATUS.SCHEDULED,
    appointment_id: 1,
    doctor_fullname: "BS. Trần Thị B",
    doctor_specialty: "Khoa Nội tiết",
  };

  // Màu & icon trạng thái
  let statusColor = "#9CA3AF"; // xám
  let statusIcon = "help-circle";

  switch (appointment.status) {
    case APPOINTMENT_STATUS.SCHEDULED:
      statusColor = "#34D399"; // xanh lá
      statusIcon = "calendar-outline";
      break;
    case APPOINTMENT_STATUS.IN_PROGRESS:
      statusColor = "#FBBF24"; // vàng
      statusIcon = "time-outline";
      break;
    case APPOINTMENT_STATUS.COMPLETED:
      statusColor = "#60A5FA"; // xanh dương
      statusIcon = "checkmark-circle-outline";
      break;
    case APPOINTMENT_STATUS.CANCELLED:
      statusColor = "#EF4444"; // đỏ
      statusIcon = "close-circle-outline";
      break;
    default:
      break;
  }

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      <ScrollView
       showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Icon name="arrow-back-outline" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-psemibold text-gray-800 ml-4">
            Back
          </Text>
        </View>
        {/* <View className="p-4 flex-row justify-between items-center shadow-md">
          <Text className="text-xl font-pbold text-black">
            Chi tiết cuộc hẹn
          </Text>
          <View className="bg-white p-2 rounded-full shadow">
            <Icon name={statusIcon} size={24} color={statusColor} />
          </View>
        </View> */}

        {/* Card thông tin */}
        <View
          className="mt-6 mx-6 p-6 bg-white rounded-2xl shadow-lg border-l-4"
          style={{ borderColor: statusColor }}
        >
          {/* Trạng thái */}
          <View className="flex-row items-center mb-4">
            <Icon name={statusIcon} size={24} color={statusColor} />
            <Text className="ml-3 text-lg font-semibold text-gray-800">
              Trạng thái:
            </Text>
            <Text
              className="ml-2 text-lg font-bold"
              style={{ color: statusColor }}
            >
              {appointment.status}
            </Text>
          </View>

          {/* Thời gian */}
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <Icon name="time-outline" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-500 text-sm">Thời gian</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-800">
              {convertDate(appointment.appointment_day)} (
              {convertShiftToTime(appointment.appointment_shift)})
            </Text>
          </View>

          {/* Thông tin bác sĩ */}
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <Icon name="person-outline" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-500 text-sm">
                Bác sĩ phụ trách
              </Text>
            </View>
            <Text className="text-lg font-semibold text-gray-800">
              {appointment.doctor_fullname} - {appointment.doctor_specialty}
            </Text>
          </View>

          {/* Lý do khám */}
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <Icon name="document-text-outline" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-500 text-sm">Lý do khám</Text>
            </View>
            <Text className="text-lg text-gray-700">{appointment.reason}</Text>
          </View>

          {/* Phòng - Khoa */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Icon name="business-outline" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-500 text-sm">Phòng - Khoa</Text>
            </View>
            <Text className="text-lg text-gray-700">
              Phòng {appointment.room_id} - Khoa số {appointment.department_id}
            </Text>
          </View>
        </View>

        {/* Card ghi chú hoặc dặn dò */}
        <View className="mt-6 mx-6 mb-6 p-5 bg-blue-100 rounded-2xl shadow-inner flex-row">
          <Icon
            name="information-circle-outline"
            size={24}
            color="#3b82f6"
            className="mr-3"
          />
          <View>
            <Text className="text-blue-800 font-semibold text-lg mb-2">
              Lưu ý trước khi khám
            </Text>
            <Text className="text-blue-700 leading-6">
              - Hạn chế ăn uống trước khi lấy mẫu xét nghiệm.{"\n"}- Đến sớm 15
              phút để làm thủ tục.{"\n"}- Mang theo hồ sơ bệnh án nếu có.
            </Text>
          </View>
        </View>
        {/* <RecentReportsView /> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentDetails;
