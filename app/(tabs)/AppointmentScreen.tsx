import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {useRouter} from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import {LinearGradient} from 'expo-linear-gradient';
import {BlurView} from 'expo-blur';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Card} from 'react-native-paper';
import {StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";

const AppointmentScreen = () => {
  const router = useRouter();

  // State variables
  const [specialty, setSpecialty] = useState<string>("");
  const [doctor, setDoctor] = useState<string>("");
  const [doctorsList, setDoctorsList] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sample data
  const specialties = [
    {label: "Tim Mạch", value: "Cardiology"},
    {label: "Da Liễu", value: "Dermatology"},
    {label: "Nội Tổng Hợp", value: "General Medicine"},
    // Thêm các chuyên khoa khác nếu cần
  ];

  const doctors: { [key: string]: string[] } = {
    "Cardiology": ["Dr. John Doe", "Dr. Emily Clark"],
    "Dermatology": ["Dr. Jane Smith", "Dr. Michael Brown"],
    "General Medicine": ["Dr. Sarah Johnson", "Dr. David Lee"],
    // Thêm các bác sĩ cho từng chuyên khoa
  };

  // Update doctors list based on selected specialty
  useEffect(() => {
    if (specialty) {
      setDoctorsList(doctors[specialty] || []);
      setDoctor(""); // Reset selected doctor
    }
  }, [specialty]);

  // Handlers for date and time pickers
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  // Handler for form submission
  const handleSubmit = () => {
    // Validate inputs
    if (!specialty || !doctor || !name || !phone || !email) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Here, you can integrate with backend API to submit the appointment
    // For demonstration, we'll just show the success modal
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setModalVisible(true);
      // Reset form
      setSpecialty("");
      setDoctor("");
      setDate(new Date());
      setTime(new Date());
      setName("");
      setPhone("");
      setEmail("");
    }, 2000);
  };

  return (
      <LinearGradient
          colors={['rgb(26,139,255)', '#cbf7ff', '#ffffff']}
          style={styles.container}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
      >
        <View className="flex-1 w-full mb-24 mt-1">
          {/* Blur Overlay */}
          <BlurView intensity={50} className="absolute top-0 left-0 right-0 bottom-0"/>

          {/* ScrollView for content */}
          <Animated.ScrollView
              entering={FadeIn.duration(800)}
              className="flex-1 px-6 pt-12"
          >
            {/* Header */}
            <View className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => router.back()} className="p-2">
                <Icon name="arrow-back-outline" size={24} color="#ffffff"/>
              </TouchableOpacity>
              <Text className="text-2xl font-psemibold text-white ml-4">Đặt Lịch Hẹn</Text>
            </View>

            {/* Form Container */}
            <Card className="bg-white shadow-custom-medium rounded-lg p-6">
              {/* Chuyên Khoa */}
              <View className="text-gray-700 mb-2 flex-row items-center">
                <Icon name="medkit-outline" size={20} color="#3B82F6"/>
                <Text className="ml-2 font-pmedium">
                  Department
                </Text>
              </View>
              <View className="border border-gray-300 rounded-lg p-2">
                <RNPickerSelect
                    onValueChange={(value) => setSpecialty(value)}
                    items={specialties}
                    placeholder={{
                      label: 'Choose department...',
                      value: '',
                      color: '#9E9E9E',
                    }}
                    style={{
                      inputIOS: {
                        fontFamily: 'Poppins-Regular',
                        fontSize: 16,
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        color: '#000000',
                        flex: 1,
                        paddingRight: 30, // Đảm bảo có đủ không gian cho icon
                        backgroundColor: '#F5F5F5',
                        borderRadius: 8,
                      },
                      inputAndroid: {
                        fontFamily: 'Poppins-Regular',
                        fontSize: 16,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        color: '#000',
                        flex: 1,
                        paddingRight: 30, // Đảm bảo có đủ không gian cho icon
                        backgroundColor: '#F5F5F5',
                        borderRadius: 8,
                      },
                      placeholder: {
                        fontFamily: 'Poppins-Regular',
                        color: '#9E9E9E',
                      },
                      iconContainer: {
                        top: 12,
                        right: 10,
                      },
                    }}
                    value={specialty}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {
                      return <Icon name="chevron-down-outline" size={24} color="#6B7280"/>;
                    }}
                />
              </View>

              {/* Bác Sĩ */}
              <View className="text-gray-700 mt-4 mb-2 flex-row items-center">
                <Icon name="person-outline" size={20} color="#3B82F6" className="mr-2"/>
                <Text className="font-pmedium">
                  Doctor
                </Text>
              </View>
              <View className="border border-gray-300 rounded-lg p-2">
                <RNPickerSelect
                    onValueChange={(value) => setDoctor(value)}
                    items={doctorsList.map((doc) => ({label: doc, value: doc}))}
                    placeholder={{
                      label: 'Choose doctor...',
                      value: '',
                      color: '#9E9E9E',
                    }}
                    style={{
                      inputIOS: {
                        fontFamily: 'Poppins-Regular',
                        fontSize: 16,
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        color: '#000',
                        flex: 1,
                        paddingRight: 30, // Đảm bảo có đủ không gian cho icon
                        backgroundColor: '#F5F5F5',
                        borderRadius: 8,
                      },
                      inputAndroid: {
                        fontFamily: 'Poppins-Regular',
                        fontSize: 16,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        color: '#000',
                        flex: 1,
                        paddingRight: 30, // Đảm bảo có đủ không gian cho icon
                        backgroundColor: '#F5F5F5',
                        borderRadius: 8,
                      },
                      placeholder: {
                        fontFamily: 'Poppins-Regular',
                        color: '#9E9E9E',
                      },
                      iconContainer: {
                        top: 12,
                        right: 10,
                      },
                    }}
                    value={doctor}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {
                      return <Icon name="chevron-down-outline" size={24} color="#6B7280"/>;
                    }}
                />
              </View>

              <View className="flex-row items-center mt-4 mb-2">
                <Icon name="calendar-outline" size={20} color="#3B82F6" className="mr-2"/>
                <Text className="text-gray-700 font-pmedium">Date</Text>
              </View>
              <View className="border border-gray-300 rounded-lg p-4 flex-row items-center justify-between">
                <Text className="text-gray-700 font-pregular">
                  {date.toLocaleDateString('en-EN', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
                  <Icon name="calendar-outline" size={20} color="#6B7280"/>
                </TouchableOpacity>

              </View>

              {showDatePicker && (<DateTimePicker
                  value={date}
                  mode="date"
                  display="inline"
                  onChange={onChangeDate}
                  minimumDate={new Date()}
              />)}


              {/* Giờ Hẹn */}
              <View className="text-gray-700 mt-4 mb-2 flex-row items-center">
                <Icon name="time-outline" size={20} color="#3B82F6" className="mr-2"/>
                <Text className="font-pmedium">
                  Time
                </Text>
              </View>
              <TouchableOpacity
                  onPress={() => setShowTimePicker(!showTimePicker)}
                  className="border border-gray-300 rounded-lg p-4 flex-row items-center justify-between font-pregular"
              >
                <Text className="text-gray-700">
                  {time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </Text>
                <Icon name="time-outline" size={20} color="#6B7280"/>
              </TouchableOpacity>
              {showTimePicker && (
                  <DateTimePicker
                      value={time}
                      mode="time"
                      display="spinner"
                      onChange={onChangeTime}
                  />
              )}

              {/* Tên */}
              <View className="text-gray-700 mt-4 mb-2 flex-row items-center">
                <Icon name="person-outline" size={20} color="#3B82F6" className="mr-2"/>
                <Text className="font-pmedium">
                  Name
                </Text>
              </View>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
                <Icon name="person-outline" size={20} color="#6B7280" className="mr-2"/>
                <TextInput
                    className="flex-1 text-gray-700 font-pregular"
                    placeholder="Enter your name..."
                    value={name}
                    onChangeText={setName}
                />
              </View>

              {/* Số Điện Thoại */}
              <View className="text-gray-700 mt-4 mb-2 flex-row items-center">
                <Icon name="call-outline" size={20} color="#3B82F6" className="mr-2"/>
                <Text className="font-pmedium">
                  Phone
                </Text>
              </View>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
                <Icon name="call-outline" size={20} color="#6B7280" className="mr-2"/>
                <TextInput
                    className="flex-1 text-gray-700 font-pregular"
                    placeholder="Enter your phone number..."
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
              </View>

              {/* Email */}
              <View className="text-gray-700 mt-4 mb-2 flex-row items-center">
                <Icon name="mail-outline" size={20} color="#3B82F6" className="mr-2"/>
                <Text className="font-pmedium">
                  Email
                </Text>
              </View>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
                <Icon name="mail-outline" size={20} color="#6B7280" className="mr-2"/>
                <TextInput
                    className="flex-1 text-gray-700 font-pregular"
                    placeholder="Enter your email..."
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
              </View>

              {/* Nút Đặt Lịch */}
              <TouchableOpacity
                  onPress={handleSubmit}
                  className="bg-primaryBlue rounded-lg p-4 mt-6 flex-row justify-center items-center shadow-custom-medium mb-8"
                  disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF"/>
                ) : (
                    <>
                      <Icon name="checkmark-circle-outline" size={20} color="#FFFFFF" className="mr-2"/>
                      <Text className="text-white font-psemibold">Đặt Lịch</Text>
                    </>
                )}
              </TouchableOpacity>
            </Card>
          </Animated.ScrollView>

          {/* Modal Thông Báo Thành Công */}
          <Modal isVisible={isModalVisible}>
            <View className="bg-white rounded-lg p-6">
              <Icon name="checkmark-circle-outline" size={60} color="#10B981" className="self-center"/>
              <Text className="text-xl font-semibold text-center text-gray-800 mt-4">Đặt Lịch Thành Công!</Text>
              <Text className="text-gray-600 text-center mt-2">
                Chúng tôi đã ghi nhận lịch hẹn của bạn. Vui lòng kiểm tra email để biết thêm chi tiết.
              </Text>
              <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-green-500 rounded-lg p-3 mt-6"
              >
                <Text className="text-white font-semibold text-center">Đóng</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default AppointmentScreen;
