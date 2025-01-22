// // app/DoctorDetails/[id].tsx

// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Linking,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import Icon from "react-native-vector-icons/Ionicons";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   AvailableAppointment,
//   Department,
//   Doctor,
//   groupAppointmentsByDate,
//   Hospital,
// } from "@/types/appointment"; // Import helper function
// import { LinearGradient } from "expo-linear-gradient";
// import Modal from "react-native-modal"; // If using react-native-modal
// import { Calendar } from "react-native-calendars";
// import { useAuth } from "@/context/AuthContext"; // Import Calendar

// const DoctorDetails = () => {
//   const router = useRouter();
//   const { token } = useAuth();
//   const { hospitalId, departmentId, doctorId } = useLocalSearchParams(); // Extract route params
//   const { user } = useAuth(); // Retrieve user data from AuthContext
//   const patient_id = user?.user_id; // Extract patient ID from user data
//   const [hospital, setHospital] = useState<Hospital>({
//     hospital_name: " ",
//     hospital_address: " ",
//     hospital_phone: " ",
//     hospital_email: " ",
//     hospital_image: " ",
//     hospital_id: -1,
//   });
//   const [department, setDepartment] = useState<Department>({
//     department_name: " ",
//     department_location: " ",
//     hospital_id: -1,
//     department_id: -1,
//   });
//   const [doctor, setDoctor] = useState<Doctor | null>(null);
//   const [availableAppointments, setAvailableAppointments] = useState<
//     AvailableAppointment[]
//   >([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // State variables for modal functionality
//   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [availableShifts, setAvailableShifts] = useState<number[]>([]);
//   const [selectedShift, setSelectedShift] = useState<number | null>(null);
//   const [appointmentsByDate, setAppointmentsByDate] = useState<{
//     [date: string]: number[];
//   }>({});

//   // New state variables for confirmation modal
//   const [isConfirmModalVisible, setIsConfirmModalVisible] =
//     useState<boolean>(false);
//   const [reason, setReason] = useState<string>(""); // To capture the reason for appointment
//   const [isBooking, setIsBooking] = useState<boolean>(false); // To manage booking API call loading state

//   const formatShift = (shift: number): string => {
//     if (shift >= 0 && shift <= 9) {
//       if (shift % 2 === 0) {
//         return `0${shift + 7}:00 - 0${shift + 7}:30`;
//       }
//       return `0${shift + 7}:30 - 0${shift + 8}:00`;
//     } else {
//       if (shift % 2 === 0) {
//         return `${shift + 3}:00 - ${shift + 3}:30`;
//       }
//       return `${shift + 3}:30 - ${shift + 4}:00`;
//     }
//   };

//   useEffect(() => {
//     const fetchDoctorDetails = async () => {
//       try {
//         const hospitalUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/hospitals/${hospitalId}`;
//         const departmentUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/departments/${departmentId}`;
//         const doctorUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/doctors/${doctorId}`;
//         const availableAppointmentUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/appointments/available-appointments?hospital_id=${hospitalId}&department_id=${departmentId}&doctor_id=${doctorId}`;
//         const header = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         };

//         const response = await Promise.all([
//           fetch(hospitalUrl, header),
//           fetch(departmentUrl, header),
//           fetch(doctorUrl, header),
//           fetch(availableAppointmentUrl, header),
//         ]);

//         const foundHospital = await response[0].json();
//         if (foundHospital) {
//           setHospital(foundHospital);
//         } else {
//           setError("Hospital not found.");
//         }

//         const foundDepartment = await response[1].json();
//         if (foundDepartment) {
//           setDepartment(foundDepartment);
//         } else {
//           setError("Department not found.");
//         }

//         const foundDoctor = await response[2].json();
//         if (response[2].status === 200) {
//           setDoctor(foundDoctor);
//         } else {
//           setError("Doctor not found.");
//         }

//         const availableAppointmentsResponse = await response[3].json();
//         if (response[3].status === 200) {
//           setAvailableAppointments(
//             availableAppointmentsResponse["available_appointments"]
//           );
//           const groupedAppointments = groupAppointmentsByDate(
//             availableAppointmentsResponse["available_appointments"]
//           );
//           setAppointmentsByDate(groupedAppointments);
//         }
//       } catch (err) {
//         setError("An error occurred while fetching doctor details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctorDetails();
//   }, [doctorId]);

//   // Generate marked dates with only available dates selectable
//   const generateMarkedDates = () => {
//     const markedDates: { [date: string]: any } = {};

//     Object.keys(appointmentsByDate).forEach((date) => {
//       markedDates[date] = {
//         marked: true,
//         dotColor: "#1e90ff",
//         selected: selectedDate === date,
//         selectedColor: "#1e90ff",
//       };
//     });

//     return markedDates;
//   };

//   // Function to open the booking modal
//   const openBookingModal = () => {
//     if (availableAppointments.length === 0) {
//       Alert.alert(
//         "No Available Appointments",
//         "This doctor has no available appointments at the moment."
//       );
//       return;
//     }
//     setIsModalVisible(true);
//   };

//   // Function to handle date selection
//   const handleDateSelect = (day: any) => {
//     const date = day.dateString;
//     setSelectedDate(date);
//     if (appointmentsByDate[date]) {
//       setAvailableShifts(appointmentsByDate[date]);
//     } else {
//       setAvailableShifts([]);
//     }
//     setSelectedShift(null); // Reset selected shift
//   };

//   // Function to handle shift selection
//   const handleShiftSelect = (shift: number) => {
//     setSelectedShift(shift);
//   };

//   // Function to confirm the appointment (opens confirmation modal)
//   const confirmAppointment = () => {
//     if (selectedDate && selectedShift !== null) {
//       setIsConfirmModalVisible(true);
//       setIsModalVisible(false);
//       console.log(isConfirmModalVisible);
//     } else {
//       Alert.alert(
//         "Incomplete Selection",
//         "Please select a date and time for your appointment."
//       );
//     }
//   };

//   // Function to handle final confirmation and booking API call
//   const handleFinalConfirm = async () => {
//     if (!selectedDate || selectedShift === null) {
//       Alert.alert(
//         "Incomplete Selection",
//         "Please select a date and time for your appointment."
//       );
//       return;
//     }

//     if (reason.trim() === "") {
//       Alert.alert(
//         "Missing Reason",
//         "Please provide a reason for your appointment."
//       );
//       return;
//     }

//     // Extract room_id from the selected shift
//     const selectedAppointments = availableAppointments.filter(
//       (appt) =>
//         appt.appointment_day === selectedDate &&
//         appt.appointment_shift === selectedShift
//     );

//     if (selectedAppointments.length === 0) {
//       Alert.alert(
//         "Unavailable Slot",
//         "The selected appointment slot is no longer available."
//       );
//       setIsConfirmModalVisible(false);
//       return;
//     }

//     const room_id = selectedAppointments[0].room_id;

//     const bookingData = {
//       hospital_id: Number(hospitalId),
//       department_id: Number(departmentId),
//       room_id: room_id,
//       doctor_id: Number(doctorId),
//       patient_id: patient_id, // Retrieved from AuthContext
//       appointment_day: selectedDate,
//       appointment_shift: selectedShift,
//       reason: reason,
//       status: "Scheduled",
//     };

//     setIsBooking(true);
//     try {
//       const bookingUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/appointments`;
//       console.log(bookingData);
//       const response = await fetch(bookingUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           // Include authorization headers if required
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(bookingData),
//       });

//       if (response.ok) {
//         Alert.alert(
//           "Appointment Confirmed",
//           `Your appointment is scheduled on ${new Date(
//             selectedDate
//           ).toLocaleDateString("en-GB")} at ${selectedShift}:00.`,
//           [
//             {
//               text: "OK",
//               onPress: () => {
//                 setIsConfirmModalVisible(false);
//                 setIsModalVisible(false);
//                 // Optionally, navigate to a confirmation screen or reset selections
//                 // router.push("/AppointmentConfirmation");
//                 // Refresh available appointments to reflect the new booking
//                 setAvailableAppointments((prev) =>
//                   prev.filter(
//                     (appt) =>
//                       !(
//                         appt.appointment_day === selectedDate &&
//                         appt.appointment_shift === selectedShift
//                       )
//                   )
//                 );
//                 setAppointmentsByDate((prev) => {
//                   const updated = { ...prev };
//                   if (updated[selectedDate]) {
//                     updated[selectedDate] = updated[selectedDate].filter(
//                       (shift) => shift !== selectedShift
//                     );
//                     if (updated[selectedDate].length === 0) {
//                       delete updated[selectedDate];
//                     }
//                   }
//                   return updated;
//                 });
//                 setSelectedDate(null);
//                 setAvailableShifts([]);
//                 setSelectedShift(null);
//                 setReason("");
//               },
//             },
//           ]
//         );
//       } else {
//         const errorData = await response.json();
//         Alert.alert(
//           "Booking Failed",
//           errorData.message || "Unable to book the appointment."
//         );
//       }
//     } catch (err) {
//       Alert.alert("Error", "An error occurred while booking the appointment.");
//       console.error("Booking error:", err);
//     } finally {
//       setIsBooking(false);
//     }
//   };

//   // Function to close the confirmation modal
//   const closeConfirmModal = () => {
//     setIsConfirmModalVisible(false);
//     setReason("");
//   };

//   const handleCallDoctor = () => {
//     // Open the phone dialer with the doctor's phone number
//     Linking.openURL(`tel:${doctor?.phone}`).catch((err) => {
//       Alert.alert("Error", "Unable to make a call.");
//       console.error("Error opening dialer:", err);
//     });
//   };

//   const handleSendEmail = () => {
//     // Open the default email app with the doctor's email address
//     Linking.openURL(`mailto:${doctor?.email}`).catch((err) => {
//       Alert.alert("Error", "Unable to send email.");
//       console.error("Error opening email:", err);
//     });
//   };

//   if (loading) {
//     return (
//       <SafeAreaView className="flex-1 items-center justify-center bg-sky-100">
//         <ActivityIndicator size="large" color="#1e90ff" />
//       </SafeAreaView>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView className="flex-1 items-center justify-center bg-sky-100 px-4">
//         <Text className="text-red-500 text-lg mb-4">{error}</Text>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="bg-blue-500 px-4 py-2 rounded-md"
//         >
//           <Text className="text-white">Go Back</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <LinearGradient
//       colors={["rgb(26,139,255)", "#cbf7ff", "#ffffff"]}
//       style={{ flex: 1 }}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 0, y: 1 }}
//     >
//       <SafeAreaView className="flex-1">
//         {/* Header */}
//         <View className="flex-row items-center mb-4 px-4">
//           <TouchableOpacity onPress={() => router.back()} className="p-2">
//             <Icon name="arrow-back-outline" size={24} color="#ffffff" />
//           </TouchableOpacity>
//           <Text className="text-2xl font-psemibold text-white ml-4">Back</Text>
//         </View>

//         <ScrollView className="flex-1">
//           <View className="flex-1">
//             {/* Doctor Image */}
//             <Image
//               source={{ uri: doctor?.profile_image }}
//               className="w-full h-96"
//               resizeMode="cover"
//             />

//             {/* Doctor Details */}
//             <View className="px-4 py-4">
//               {/* Doctor Name */}
//               <Text className="text-2xl font-semibold text-gray-800">
//                 {doctor?.fullname}
//               </Text>

//               {/* Specialization */}
//               <Text className="text-gray-600 mt-2">
//                 {doctor?.doctor_specialty}
//               </Text>

//               {/* Phone Number */}
//               <TouchableOpacity
//                 onPress={handleCallDoctor}
//                 className="flex-row items-center mt-4"
//               >
//                 <Icon name="call-outline" size={20} color="#1e90ff" />
//                 <Text className="ml-2 text-blue-500">{doctor?.phone}</Text>
//               </TouchableOpacity>

//               {/* Email Address */}
//               <TouchableOpacity
//                 onPress={handleSendEmail}
//                 className="flex-row items-center mt-2"
//               >
//                 <Icon name="mail-outline" size={20} color="#1e90ff" />
//                 <Text className="ml-2 text-blue-500">{doctor?.email}</Text>
//               </TouchableOpacity>

//               {/* Description or Additional Info */}
//               <Text className="text-gray-700 mt-4">
//                 Dr. {doctor?.fullname} is a highly experienced{" "}
//                 {doctor?.doctor_specialty} with over 10 years of practice. She
//                 specializes in advanced treatments and patient care.
//               </Text>

//               {/* Book Appointment Button */}
//               <TouchableOpacity
//                 onPress={openBookingModal}
//                 className="mt-6 bg-green-500 px-4 py-3 rounded-md items-center"
//               >
//                 <Text className="text-white text-lg font-semibold">
//                   Book Appointment
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>

//         {/* Booking Modal */}
//         <Modal
//           isVisible={isModalVisible}
//           onBackdropPress={() => setIsModalVisible(false)}
//           style={{ margin: 20, justifyContent: "center", alignItems: "center" }}
//         >
//           <View className="w-full h-5/6 bg-white rounded-lg p-4">
//             <Text className="text-xl font-semibold text-gray-800 mb-4">
//               Select Appointment Date
//             </Text>
//             <Calendar
//               onDayPress={handleDateSelect}
//               markedDates={generateMarkedDates()}
//               minDate={new Date().toISOString().split("T")[0]} // Disable past dates
//               disableAllTouchEventsForDisabledDays={true} // Disable touch events for unmarked dates
//               enableSwipeMonths={true}
//               theme={{
//                 selectedDayBackgroundColor: "#1e90ff",
//                 todayTextColor: "#1e90ff",
//                 arrowColor: "#1e90ff",
//                 dotColor: "#1e90ff",
//               }}
//             />

//             {/* Available Shifts */}
//             {selectedDate && (
//               <View className="mt-4">
//                 <Text className="text-xl font-semibold text-gray-800 mb-2">
//                   Available Shifts on{" "}
//                   {new Date(selectedDate).toLocaleDateString("en-GB")}
//                 </Text>
//                 {availableShifts.length === 0 ? (
//                   <Text className="text-gray-600">
//                     No shifts available on this date.
//                   </Text>
//                 ) : (
//                   <View className="flex-row flex-wrap">
//                     {availableShifts.map((shift) => (
//                       <TouchableOpacity
//                         key={shift}
//                         onPress={() => handleShiftSelect(shift)}
//                         className={`m-1 px-3 py-2 rounded-md border ${
//                           selectedShift === shift
//                             ? "bg-blue-500 border-blue-500"
//                             : "bg-white border-gray-300"
//                         }`}
//                       >
//                         <Text
//                           className={`text-sm ${
//                             selectedShift === shift
//                               ? "text-white"
//                               : "text-gray-800"
//                           }`}
//                         >
//                           {formatShift(shift)}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}
//               </View>
//             )}

//             {/* Confirm Button */}
//             <TouchableOpacity
//               onPress={confirmAppointment}
//               className={`mt-6 bg-green-500 px-4 py-3 rounded-md items-center flex-row justify-center ${
//                 !selectedDate || selectedShift === null
//                   ? "opacity-50"
//                   : "opacity-100"
//               }`}
//               disabled={!selectedDate || selectedShift === null}
//             >
//               {isBooking ? (
//                 <ActivityIndicator size="small" color="#ffffff" />
//               ) : (
//                 <Text className="text-white text-lg font-semibold">
//                   Confirm Appointment
//                 </Text>
//               )}
//             </TouchableOpacity>

//             {/* Close Button */}
//             <TouchableOpacity
//               onPress={() => setIsModalVisible(false)}
//               className="absolute top-2 right-2 p-2"
//             >
//               <Icon name="close-circle" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>
//         </Modal>

//         {/* Confirmation Modal */}
//         {isConfirmModalVisible && (
//           <View className="w-full h-5/6 bg-white rounded-lg p-4">
//             <Text className="text-2xl font-psemibold text-gray-800 mb-4">
//               Confirm Your Appointment
//             </Text>

//             {/* Appointment Details */}
//             <View className="mb-4">
//               <Text className="text-gray-700 text-xl">
//                 <Text className="font-psemibold">Hospital:</Text>{" "}
//                 {hospital?.hospital_name}
//               </Text>
//               <Text className="text-gray-700 text-xl">
//                 <Text className="font-psemibold">Department:</Text>{" "}
//                 {department?.department_name}
//               </Text>
//               <Text className="text-gray-700 text-xl">
//                 <Text className="font-psemibold">Doctor:</Text>{" "}
//                 {doctor?.fullname}
//               </Text>
//               <Text className="text-gray-700 text-xl">
//                 <Text className="font-psemibold">Date:</Text>{" "}
//                 {selectedDate
//                   ? new Date(selectedDate).toLocaleDateString("en-GB")
//                   : ""}
//               </Text>
//               <Text className="text-gray-700 text-xl">
//                 <Text className="font-psemibold">Time:</Text> {formatShift(selectedShift || 0)}
//               </Text>
//             </View>

//             {/* Reason for Appointment */}
//             <Text className="text-gray-700 mb-2">
//               <Text className="font-semibold">Reason:</Text>
//             </Text>
//             <TextInput
//               placeholder="Enter reason for appointment"
//               value={reason}
//               onChangeText={setReason}
//               className="border border-gray-300 rounded-md p-6 mb-4"
//               multiline={true}
//               numberOfLines={4}
//             />

//             {/* Buttons */}
//             <View className="flex-row justify-end items-center">
//               <TouchableOpacity
//                 onPress={closeConfirmModal}
//                 className="bg-stone-50 mr-4 px-4 py-2 rounded-md"
//               >
//                 <Text className="text-blue-500">Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleFinalConfirm}
//                 className={`bg-green-500 px-4 py-2 rounded-md ${
//                   isBooking ? "opacity-50" : "opacity-100"
//                 }`}
//                 disabled={isBooking}
//               >
//                 {isBooking ? (
//                   <ActivityIndicator size="small" color="#ffffff" />
//                 ) : (
//                   <Text className="text-white">Confirm</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// export default DoctorDetails;

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import SlideToBookButton from "@/components/SlideToBookButton";
import { className } from "postcss-selector-parser";
import { router } from "expo-router";

const DoctorDetails = () => {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const timeSlots = [
    { time: "4:30 PM", available: true },
    { time: "5:00 PM", available: true },
    { time: "5:30 PM", available: true },
    { time: "6:00 PM", available: false },
    { time: "7:30 PM", available: true },
    { time: "9:30 PM", available: false },
  ];

  const startFloatingAnimation = () => {
    Animated.timing(animatedValue, {
      toValue: 1, // Moves to the top position
      duration: 800, // Duration in milliseconds
      easing: Easing.out(Easing.ease), // Smooth easing effect
      useNativeDriver: true, // Enable native driver for performance
    }).start();
  };

  const floatingPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0], // Start from bottom (off-screen), move to top
  });

  const handleBookingConfirmation = () => {
    setIsBookingConfirmed(true);
    startFloatingAnimation();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3f9]">
      <ScrollView className="flex-1 py-6">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Icon name="arrow-back-outline" size={24} color="#000000" />
          </TouchableOpacity>
          <Text className="text-2xl font-psemibold text-black ml-4">Back</Text>
        </View>
        {/* Doctor Info Section */}
        <View className="px-5">
          <View className="bg-white p-5 rounded-2xl w-full">
            {/* Doctor Profile Section */}
            <View className="flex-row items-center">
              <Image
                source={{ uri: "https://picsum.photos/200/200" }} // Thay ảnh thực tế vào đây
                className="w-24 h-24 rounded-full"
              />
              <View className="ml-4">
                <Text className="text-xl font-psemibold text-gray-800 pb-2">
                  Dr. Wesley Cain
                </Text>
                <Text className="text-gray-500 text-lg font-pregular">
                  Pulmonologist
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="business-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-400 ml-1 font-pregular text-md">
                    St. Memorial Hospital
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Doctor Statistics Section */}
        <View className="flex-row px-5 justify-between mt-2 w-full">
          {/* Rating */}
          <View className="flex-row justify-center bg-white rounded-xl py-3 px-6 items-center">
            <Ionicons name="star" size={24} color="gold" />
            <View className="flex-col items-center ml-2">
              <Text className="text-xl font-bold text-gray-900">4.5</Text>
              <Text className="text-gray-500 text-sm">Rating</Text>
            </View>
          </View>

          {/* Experience */}
          <View className="flex-row justify-center bg-white rounded-xl py-3 px-6 items-center">
            <Ionicons name="medkit-outline" size={24} color="#3B82F6" />
            <View className="flex-col items-center ml-2">
              <Text className="text-xl font-bold text-gray-900">5 Year</Text>
              <Text className="text-gray-500 text-sm">Experience</Text>
            </View>
          </View>

          {/* Patients */}
          <View className="flex-row justify-center bg-white rounded-xl py-3 px-6 items-center">
            <Ionicons name="bed-outline" size={24} color="#EF4444" />
            <View className="flex-col items-center ml-2">
              <Text className="text-xl font-bold text-gray-900">100</Text>
              <Text className="text-gray-500 text-sm">Patients</Text>
            </View>
          </View>
        </View>

        {/* Availability Section */}
        <View className="bg-white px-5 mt-6">
          <View className="p-5 my-6 rounded-lg bg-[#f4f5f7]">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={24} color="#6B7280" />

                <Text className="ml-2 text-lg font-psemibold text-gray-800">
                  Today Availability
                </Text>
              </View>
              <View className="bg-pink-200 px-3 py-2 rounded-full">
                <Text className="text-pink-600 font-pmedium text-sm">
                  4 Slots
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between items-center mt-4 w-full">
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot.time)}
                  className={`px-7 py-4 rounded-lg m-1 ${
                    slot.available
                      ? selectedSlot === slot.time
                        ? "bg-[#2F51D7] text-white"
                        : "bg-gray-100"
                      : "bg-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center text-lg font-psemibold ${
                      slot.available
                        ? selectedSlot === slot.time
                          ? "text-white"
                          : "text-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Notification for selected slot */}
            {selectedSlot !== "" && (
              <View className="mt-6 bg-white p-4 rounded-lg border-l-4 border-[#2F51D7]">
                <Text className="text-[#2F51D7] font-psemibold">
                  Cuộc hẹn sẽ diễn ra vào {selectedSlot}, kéo dài trong vòng 30
                  phút.
                </Text>
                <Text className="text-gray-700 mt-2 font-pregular">
                  Vui lòng điền các triệu chứng hoặc thông tin bệnh bạn đang gặp
                  phải để bác sĩ có thể hỗ trợ tốt hơn.
                </Text>
              </View>
            )}

            {/* Input for Reason */}
            {selectedSlot !== "" && (
              <View className="mt-4">
                <Text className="text-gray-800 font-pmedium mb-2">
                  Nhập lý do khám bệnh:
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Ví dụ: Ho kéo dài, sốt nhẹ..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  className="bg-white p-4 rounded-lg border border-gray-300 text-gray-900 font-pregular"
                />
              </View>
            )}
          </View>
        </View>

        {/* Book Button */}
        {selectedSlot && reason && (
          <View className="flex-1 items-center justify-center mt-6">
            <TouchableOpacity
              onPress={handleBookingConfirmation}
              className="bg-[#2F51D7] px-4 py-4 w-[80%] rounded-lg items-center "
            >
              <Text className="text-white text-lg font-psemibold">
                Booking Consultation
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {isBookingConfirmed && (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateY: floatingPosition }],
            backgroundColor: "white",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 10,
            padding: 20,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>
              Booking Confirmed
            </Text>
            <Text
              style={{ color: "#6B7280", textAlign: "center", marginTop: 10 }}
            >
              Your booking is confirmed. Please find the details for the
              appointment.
            </Text>
          </View>

          <View
            style={{
              marginTop: 20,
              backgroundColor: "#F3F4F6",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "600", color: "#555" }}>
              Date: Jan 29, 2023
            </Text>
            <Text style={{ fontWeight: "600", color: "#555" }}>
              Time: {selectedSlot}
            </Text>
            <Text style={{ fontWeight: "600", color: "#555" }}>
              Location: Wallich St Singapore
            </Text>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: "#2F51D7",
              padding: 15,
              borderRadius: 30,
            }}
            onPress={() => setIsBookingConfirmed(false)}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>
              Back To Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default DoctorDetails;
