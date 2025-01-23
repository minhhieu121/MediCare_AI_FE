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
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";

interface Doctor {
  user_id: number;
  username: string;
  email: string;
  fullname: string;
  doctor_specialty: string;
  doctor_experience: number;
  profile_image: string;
  doctor_rating: number;
  hospital_name: string;
}

interface Appointment {
  appointment_shift: number;
  // Add other relevant fields if necessary
}

const DoctorDetails = () => {
  const { doctorId } = useLocalSearchParams();
  const { token } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<
    { shift: number; time: string; available: boolean }[]
  >([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [loadingBook, setLoadingBook] = useState<boolean>(false);

  // Function to fetch doctor details
  const fetchDoctorDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/doctors/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch doctor details");
      }
      const data = await response.json();
      setDoctor(data);
    } catch (error) {
      console.error("Error fetching doctor:", error);
    }
  };

  // Function to format shift number to time range
  const formatShift = (shift: number): string => {
    const baseHour = 7;
    const hour = Math.floor(shift / 2) + baseHour;
    const minutes = shift % 2 === 0 ? "00" : "30";

    return hour <= 9 ? `0${hour}:${minutes}` : `${hour}:${minutes}`;
  };

  // Function to fetch available time slots
  const fetchAvailableTimeSlots = async (doctorId: string | string[], date: Date) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      console.log("Fetching slots for:", { doctorId, formattedDate });

      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/appointments?user_id=${doctorId}&start_date=${formattedDate}&end_date=${formattedDate}`;
      console.log("Request URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch appointments: ${response.status} ${errorText}`
        );
      }

      const bookedAppointments: Appointment[] = await response.json();
      console.log("Booked appointments:", bookedAppointments);

      const bookedShifts = new Set(
        bookedAppointments.map((app) => app.appointment_shift)
      );
      console.log("Booked shifts:", Array.from(bookedShifts));

      // Generate all possible shifts (0-23 representing shifts from 7:00 AM to 7:00 PM)
      const allTimeSlots = Array.from({ length: 20 }, (_, i) => ({
        shift: i,
        time: formatShift(i),
        available: !bookedShifts.has(i),
      }));

      console.log("Final time slots:", allTimeSlots);
      setTimeSlots(allTimeSlots);
    } catch (error) {
      console.error("Error details:", error);
      throw error; // Re-throw to be handled by caller
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchDoctorDetails();
        await fetchAvailableTimeSlots(doctorId, new Date());
      } catch (error) {
        console.error("Failed to load data:", error);
        // Optionally, display an error message to the user here
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      loadData();
    }
  }, [doctorId]);

  // Floating animation
  const startFloatingAnimation = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const floatingPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  // Booking confirmation handler
  const handleBookingConfirmation = () => {
    setLoadingBook(true);
    setTimeout(() => {
      setIsBookingConfirmed(true);
      startFloatingAnimation();
      setLoadingBook(false);
    }, 2000);
  };

  // Booking function
  const bookAppointment = async () => {
    if (!doctorId || !selectedSlot || !reason) {
      setBookingError("Please select a time slot and provide a reason for the appointment.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    const appointmentDay = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const appointmentShift = timeSlots.find(slot => slot.time === selectedSlot)?.shift;

    if (appointmentShift === undefined) {
      setBookingError("Invalid time slot selected.");
      setBookingLoading(false);
      return;
    }

    const body = {
      hospital_id: 35, // Fixed as per your requirement
      department_id: 35, // Fixed as per your requirement
      doctor_id: Number(doctorId),
      patient_id: 20, // Fixed as per your requirement
      appointment_day: appointmentDay,
      appointment_shift: appointmentShift,
      reason: reason,
      status: "Scheduled",
    };

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to book appointment: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Appointment booked successfully:", data);

      // Optionally, you can refresh the available time slots
      await fetchAvailableTimeSlots(doctorId, new Date());

      // Show confirmation modal
      handleBookingConfirmation();
    } catch (error) {
      console.error("Error booking appointment:", error);
      setBookingError(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Optional: Reset booking state after confirmation
  const closeConfirmationModal = () => {
    setIsBookingConfirmed(false);
    setSelectedSlot("");
    setReason("");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2F51D7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3f9]">
      <ScrollView className="flex-1 py-6">
        {/* Header */}
        <View className="flex-row items-center mb-2 px-5">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back-outline" size={24} color="#000000" />
          </TouchableOpacity>
          <Text className="text-2xl font-psemibold text-black ml-4">Back</Text>
        </View>

        {/* Doctor Info Section */}
        <View className="px-5">
          <View className="bg-white p-5 rounded-2xl w-full">
            <View className="flex-row items-center">
              {doctor?.profile_image ? (
                <Image
                  source={{ uri: doctor.profile_image }}
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={{ uri: doctor.profile_image }}
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              )}
              <View className="ml-4">
                <Text className="text-xl font-psemibold text-gray-800 pb-2">
                  Dr. {doctor?.fullname}
                </Text>
                <Text className="text-gray-500 text-lg font-pregular">
                  {doctor?.doctor_specialty}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="business-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-400 ml-1 font-pregular text-md">
                    {doctor?.hospital_name || "Hospital"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View className="flex-row px-5 justify-between mt-2 w-full gap-2">
          <View className="flex-1 bg-white rounded-xl py-3 px-4 items-center">
            <Ionicons name="star" size={24} color="gold" />
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900 text-center">
                {doctor?.doctor_rating || "4.5"}
              </Text>
              <Text className="text-gray-500 text-xs text-center">
                Đánh giá
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl py-3 px-4 items-center">
            <Ionicons name="medkit-outline" size={24} color="#3B82F6" />
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900 text-center">
                {doctor?.doctor_experience || "5"} Năm
              </Text>
              <Text className="text-gray-500 text-xs text-center">
                Kinh nghiệm
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl py-3 px-4 items-center">
            <Ionicons name="bed-outline" size={24} color="#EF4444" />
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900 text-center">
                100+
              </Text>
              <Text className="text-gray-500 text-xs text-center">
                Bệnh nhân
              </Text>
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
                  Lịch trống hôm nay
                </Text>
              </View>
              <View className="bg-pink-200 px-3 py-2 rounded-full">
                <Text className="text-pink-600 font-pmedium text-sm">
                  {timeSlots.filter((slot) => slot.available).length} Chỗ
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2 justify-center mt-4 w-full px-2">
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot.time)}
                  className={`basis-[23%] px-3 py-2 rounded-lg ${
                    slot.available
                      ? selectedSlot === slot.time
                        ? "bg-[#2F51D7]"
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

            {selectedSlot !== "" && (
              <>
                <View className="mt-6 bg-white p-4 rounded-lg border-l-4 border-[#2F51D7]">
                  <Text className="text-[#2F51D7] font-psemibold">
                    Cuộc hẹn của bạn sẽ vào lúc {selectedSlot}, kéo dài 30 phút.
                  </Text>
                  <Text className="text-gray-700 mt-2 font-pregular">
                    Vui lòng mô tả triệu chứng hoặc mối quan tâm của bạn để bác
                    sĩ có thể chuẩn bị tốt hơn.
                  </Text>
                </View>

                <View className="mt-4">
                  <Text className="text-gray-800 font-pmedium mb-2">
                    Lý do khám bệnh:
                  </Text>
                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Ví dụ: Ho dai dẳng, sốt nhẹ..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    className="bg-white p-4 rounded-lg border border-gray-300 text-gray-900 font-pregular"
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Book Button */}
        {selectedSlot && reason && (
          <View className="flex-1 items-center justify-center mt-6 mb-6">
            <TouchableOpacity
              onPress={bookAppointment}
              className="bg-[#2F51D7] px-4 py-4 w-[80%] rounded-lg items-center"
              disabled={bookingLoading} // Disable button while loading
            >
              {bookingLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-lg font-psemibold">
                  Đặt lịch hẹn
                </Text>
              )}
            </TouchableOpacity>
            {bookingError && (
              <Text className="text-red-500 mt-2 text-center">{bookingError}</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
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
              Xác nhận đặt lịch
            </Text>
            <Text
              style={{ color: "#6B7280", textAlign: "center", marginTop: 10 }}
            >
              Cuộc hẹn của bạn với Dr. {doctor?.fullname} đã được xác nhận.
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
              Bác sĩ: Dr. {doctor?.fullname}
            </Text>
            <Text style={{ fontWeight: "600", color: "#555" }}>
              Chuyên khoa: {doctor?.doctor_specialty}
            </Text>
            <Text style={{ fontWeight: "600", color: "#555" }}>
              Ngày: {new Date().toLocaleDateString()}
            </Text>
            <Text style={{ fontWeight: "600", color: "#555" }}>
              Thời gian: {selectedSlot}
            </Text>
            <Text style={{ fontWeight: "600", color: "#555" }}>
              Địa điểm: {doctor?.hospital_name}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: "#2F51D7",
              padding: 15,
              borderRadius: 30,
            }}
            onPress={() => {
              closeConfirmationModal();
              router.push("/HomeScreen");
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>
              Trở về màn hình chính
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default DoctorDetails;
