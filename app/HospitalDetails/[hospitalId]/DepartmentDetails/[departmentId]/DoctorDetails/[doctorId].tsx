// app/DoctorDetails/[id].tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AvailableAppointment,
  Department,
  Doctor,
  groupAppointmentsByDate,
  Hospital,
} from "@/types/appointment"; // Import helper function
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal"; // If using react-native-modal
import { Calendar } from "react-native-calendars";
import { useAuth } from "@/context/AuthContext"; // Import Calendar

const DoctorDetails = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { hospitalId, departmentId, doctorId } = useLocalSearchParams(); // Extract route params
  const { user } = useAuth(); // Retrieve user data from AuthContext
  const patient_id = user?.user_id; // Extract patient ID from user data
  const [hospital, setHospital] = useState<Hospital>({
    hospital_name: " ",
    hospital_address: " ",
    hospital_phone: " ",
    hospital_email: " ",
    hospital_image: " ",
    hospital_id: -1,
  });
  const [department, setDepartment] = useState<Department>({
    department_name: " ",
    department_location: " ",
    hospital_id: -1,
    department_id: -1,
  });
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availableAppointments, setAvailableAppointments] = useState<
    AvailableAppointment[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State variables for modal functionality
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableShifts, setAvailableShifts] = useState<number[]>([]);
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [appointmentsByDate, setAppointmentsByDate] = useState<{
    [date: string]: number[];
  }>({});

  // New state variables for confirmation modal
  const [isConfirmModalVisible, setIsConfirmModalVisible] =
    useState<boolean>(false);
  const [reason, setReason] = useState<string>(""); // To capture the reason for appointment
  const [isBooking, setIsBooking] = useState<boolean>(false); // To manage booking API call loading state

  const formatShift = (shift: number): string => {
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
  };

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const hospitalUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/hospitals/${hospitalId}`;
        const departmentUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/departments/${departmentId}`;
        const doctorUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/doctors/${doctorId}`;
        const availableAppointmentUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/appointments/available-appointments?hospital_id=${hospitalId}&department_id=${departmentId}&doctor_id=${doctorId}`;
        const header = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await Promise.all([
          fetch(hospitalUrl, header),
          fetch(departmentUrl, header),
          fetch(doctorUrl, header),
          fetch(availableAppointmentUrl, header),
        ]);

        const foundHospital = await response[0].json();
        if (foundHospital) {
          setHospital(foundHospital);
        } else {
          setError("Hospital not found.");
        }

        const foundDepartment = await response[1].json();
        if (foundDepartment) {
          setDepartment(foundDepartment);
        } else {
          setError("Department not found.");
        }

        const foundDoctor = await response[2].json();
        if (response[2].status === 200) {
          setDoctor(foundDoctor);
        } else {
          setError("Doctor not found.");
        }

        const availableAppointmentsResponse = await response[3].json();
        if (response[3].status === 200) {
          setAvailableAppointments(
            availableAppointmentsResponse["available_appointments"]
          );
          const groupedAppointments = groupAppointmentsByDate(
            availableAppointmentsResponse["available_appointments"]
          );
          setAppointmentsByDate(groupedAppointments);
        }
      } catch (err) {
        setError("An error occurred while fetching doctor details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  // Generate marked dates with only available dates selectable
  const generateMarkedDates = () => {
    const markedDates: { [date: string]: any } = {};

    Object.keys(appointmentsByDate).forEach((date) => {
      markedDates[date] = {
        marked: true,
        dotColor: "#1e90ff",
        selected: selectedDate === date,
        selectedColor: "#1e90ff",
      };
    });

    return markedDates;
  };

  // Function to open the booking modal
  const openBookingModal = () => {
    if (availableAppointments.length === 0) {
      Alert.alert(
        "No Available Appointments",
        "This doctor has no available appointments at the moment."
      );
      return;
    }
    setIsModalVisible(true);
  };

  // Function to handle date selection
  const handleDateSelect = (day: any) => {
    const date = day.dateString;
    setSelectedDate(date);
    if (appointmentsByDate[date]) {
      setAvailableShifts(appointmentsByDate[date]);
    } else {
      setAvailableShifts([]);
    }
    setSelectedShift(null); // Reset selected shift
  };

  // Function to handle shift selection
  const handleShiftSelect = (shift: number) => {
    setSelectedShift(shift);
  };

  // Function to confirm the appointment (opens confirmation modal)
  const confirmAppointment = () => {
    if (selectedDate && selectedShift !== null) {
      setIsConfirmModalVisible(true);
      setIsModalVisible(false);
      console.log(isConfirmModalVisible);
    } else {
      Alert.alert(
        "Incomplete Selection",
        "Please select a date and time for your appointment."
      );
    }
  };

  // Function to handle final confirmation and booking API call
  const handleFinalConfirm = async () => {
    if (!selectedDate || selectedShift === null) {
      Alert.alert(
        "Incomplete Selection",
        "Please select a date and time for your appointment."
      );
      return;
    }

    if (reason.trim() === "") {
      Alert.alert(
        "Missing Reason",
        "Please provide a reason for your appointment."
      );
      return;
    }

    // Extract room_id from the selected shift
    const selectedAppointments = availableAppointments.filter(
      (appt) =>
        appt.appointment_day === selectedDate &&
        appt.appointment_shift === selectedShift
    );

    if (selectedAppointments.length === 0) {
      Alert.alert(
        "Unavailable Slot",
        "The selected appointment slot is no longer available."
      );
      setIsConfirmModalVisible(false);
      return;
    }

    const room_id = selectedAppointments[0].room_id;

    const bookingData = {
      hospital_id: Number(hospitalId),
      department_id: Number(departmentId),
      room_id: room_id,
      doctor_id: Number(doctorId),
      patient_id: patient_id, // Retrieved from AuthContext
      appointment_day: selectedDate,
      appointment_shift: selectedShift,
      reason: reason,
      status: "Scheduled",
    };

    setIsBooking(true);
    try {
      const bookingUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/appointments`;
      console.log(bookingData);
      const response = await fetch(bookingUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include authorization headers if required
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        Alert.alert(
          "Appointment Confirmed",
          `Your appointment is scheduled on ${new Date(
            selectedDate
          ).toLocaleDateString("en-GB")} at ${selectedShift}:00.`,
          [
            {
              text: "OK",
              onPress: () => {
                setIsConfirmModalVisible(false);
                setIsModalVisible(false);
                // Optionally, navigate to a confirmation screen or reset selections
                // router.push("/AppointmentConfirmation");
                // Refresh available appointments to reflect the new booking
                setAvailableAppointments((prev) =>
                  prev.filter(
                    (appt) =>
                      !(
                        appt.appointment_day === selectedDate &&
                        appt.appointment_shift === selectedShift
                      )
                  )
                );
                setAppointmentsByDate((prev) => {
                  const updated = { ...prev };
                  if (updated[selectedDate]) {
                    updated[selectedDate] = updated[selectedDate].filter(
                      (shift) => shift !== selectedShift
                    );
                    if (updated[selectedDate].length === 0) {
                      delete updated[selectedDate];
                    }
                  }
                  return updated;
                });
                setSelectedDate(null);
                setAvailableShifts([]);
                setSelectedShift(null);
                setReason("");
              },
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Booking Failed",
          errorData.message || "Unable to book the appointment."
        );
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred while booking the appointment.");
      console.error("Booking error:", err);
    } finally {
      setIsBooking(false);
    }
  };

  // Function to close the confirmation modal
  const closeConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setReason("");
  };

  const handleCallDoctor = () => {
    // Open the phone dialer with the doctor's phone number
    Linking.openURL(`tel:${doctor?.phone}`).catch((err) => {
      Alert.alert("Error", "Unable to make a call.");
      console.error("Error opening dialer:", err);
    });
  };

  const handleSendEmail = () => {
    // Open the default email app with the doctor's email address
    Linking.openURL(`mailto:${doctor?.email}`).catch((err) => {
      Alert.alert("Error", "Unable to send email.");
      console.error("Error opening email:", err);
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sky-100">
        <ActivityIndicator size="large" color="#1e90ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sky-100 px-4">
        <Text className="text-red-500 text-lg mb-4">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-4 py-2 rounded-md"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={["rgb(26,139,255)", "#cbf7ff", "#ffffff"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center mb-4 px-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Icon name="arrow-back-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-psemibold text-white ml-4">Back</Text>
        </View>

        <ScrollView className="flex-1">
          <View className="flex-1">
            {/* Doctor Image */}
            <Image
              source={{ uri: doctor?.profile_image }}
              className="w-full h-96"
              resizeMode="cover"
            />

            {/* Doctor Details */}
            <View className="px-4 py-4">
              {/* Doctor Name */}
              <Text className="text-2xl font-semibold text-gray-800">
                {doctor?.fullname}
              </Text>

              {/* Specialization */}
              <Text className="text-gray-600 mt-2">
                {doctor?.doctor_specialty}
              </Text>

              {/* Phone Number */}
              <TouchableOpacity
                onPress={handleCallDoctor}
                className="flex-row items-center mt-4"
              >
                <Icon name="call-outline" size={20} color="#1e90ff" />
                <Text className="ml-2 text-blue-500">{doctor?.phone}</Text>
              </TouchableOpacity>

              {/* Email Address */}
              <TouchableOpacity
                onPress={handleSendEmail}
                className="flex-row items-center mt-2"
              >
                <Icon name="mail-outline" size={20} color="#1e90ff" />
                <Text className="ml-2 text-blue-500">{doctor?.email}</Text>
              </TouchableOpacity>

              {/* Description or Additional Info */}
              <Text className="text-gray-700 mt-4">
                Dr. {doctor?.fullname} is a highly experienced{" "}
                {doctor?.doctor_specialty} with over 10 years of practice. She
                specializes in advanced treatments and patient care.
              </Text>

              {/* Book Appointment Button */}
              <TouchableOpacity
                onPress={openBookingModal}
                className="mt-6 bg-green-500 px-4 py-3 rounded-md items-center"
              >
                <Text className="text-white text-lg font-semibold">
                  Book Appointment
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Booking Modal */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setIsModalVisible(false)}
          style={{ margin: 20, justifyContent: "center", alignItems: "center" }}
        >
          <View className="w-full h-5/6 bg-white rounded-lg p-4">
            <Text className="text-xl font-semibold text-gray-800 mb-4">
              Select Appointment Date
            </Text>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={generateMarkedDates()}
              minDate={new Date().toISOString().split("T")[0]} // Disable past dates
              disableAllTouchEventsForDisabledDays={true} // Disable touch events for unmarked dates
              enableSwipeMonths={true}
              theme={{
                selectedDayBackgroundColor: "#1e90ff",
                todayTextColor: "#1e90ff",
                arrowColor: "#1e90ff",
                dotColor: "#1e90ff",
              }}
            />

            {/* Available Shifts */}
            {selectedDate && (
              <View className="mt-4">
                <Text className="text-xl font-semibold text-gray-800 mb-2">
                  Available Shifts on{" "}
                  {new Date(selectedDate).toLocaleDateString("en-GB")}
                </Text>
                {availableShifts.length === 0 ? (
                  <Text className="text-gray-600">
                    No shifts available on this date.
                  </Text>
                ) : (
                  <View className="flex-row flex-wrap">
                    {availableShifts.map((shift) => (
                      <TouchableOpacity
                        key={shift}
                        onPress={() => handleShiftSelect(shift)}
                        className={`m-1 px-3 py-2 rounded-md border ${
                          selectedShift === shift
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            selectedShift === shift
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {formatShift(shift)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={confirmAppointment}
              className={`mt-6 bg-green-500 px-4 py-3 rounded-md items-center flex-row justify-center ${
                !selectedDate || selectedShift === null
                  ? "opacity-50"
                  : "opacity-100"
              }`}
              disabled={!selectedDate || selectedShift === null}
            >
              {isBooking ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Confirm Appointment
                </Text>
              )}
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              className="absolute top-2 right-2 p-2"
            >
              <Icon name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Confirmation Modal */}
        {isConfirmModalVisible && (
          <View className="w-full h-5/6 bg-white rounded-lg p-4">
            <Text className="text-2xl font-psemibold text-gray-800 mb-4">
              Confirm Your Appointment
            </Text>

            {/* Appointment Details */}
            <View className="mb-4">
              <Text className="text-gray-700 text-xl">
                <Text className="font-psemibold">Hospital:</Text>{" "}
                {hospital?.hospital_name}
              </Text>
              <Text className="text-gray-700 text-xl">
                <Text className="font-psemibold">Department:</Text>{" "}
                {department?.department_name}
              </Text>
              <Text className="text-gray-700 text-xl">
                <Text className="font-psemibold">Doctor:</Text>{" "}
                {doctor?.fullname}
              </Text>
              <Text className="text-gray-700 text-xl">
                <Text className="font-psemibold">Date:</Text>{" "}
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("en-GB")
                  : ""}
              </Text>
              <Text className="text-gray-700 text-xl">
                <Text className="font-psemibold">Time:</Text> {formatShift(selectedShift || 0)}
              </Text>
            </View>

            {/* Reason for Appointment */}
            <Text className="text-gray-700 mb-2">
              <Text className="font-semibold">Reason:</Text>
            </Text>
            <TextInput
              placeholder="Enter reason for appointment"
              value={reason}
              onChangeText={setReason}
              className="border border-gray-300 rounded-md p-6 mb-4"
              multiline={true}
              numberOfLines={4}
            />

            {/* Buttons */}
            <View className="flex-row justify-end items-center">
              <TouchableOpacity
                onPress={closeConfirmModal}
                className="bg-stone-50 mr-4 px-4 py-2 rounded-md"
              >
                <Text className="text-blue-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFinalConfirm}
                className={`bg-green-500 px-4 py-2 rounded-md ${
                  isBooking ? "opacity-50" : "opacity-100"
                }`}
                disabled={isBooking}
              >
                {isBooking ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white">Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DoctorDetails;
