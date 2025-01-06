// RegisterScreen.tsx

import React, {useState, useContext} from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Image,
  Text,
  Alert,
  ScrollView,
  Dimensions,
  TouchableOpacity, Platform
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {router, Link} from "expo-router";

import {AuthContext} from "@/context/AuthContext";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import {images} from "@/constants";
import {Picker} from "@react-native-picker/picker";
import RNPickerSelect from "react-native-picker-select";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

const RegisterScreen: React.FC = () => {
  const {signUp} = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passwordCheck, setPasswordCheck] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    user_type: "",           // "Doctor" or "Patient"
    fullname: "",
    date_of_birth: "",       // e.g. "1990-01-01"
    gender: "",              // "Male", "Female", or "Other"
    address: "",
    phone: "",
    profile_image: "",
    password: "",
    doctor_specialty: "",
    doctor_experience: 0,
  });

  const initialDate = form.date_of_birth
      ? new Date(form.date_of_birth)
      : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  function formatDate(date: Date, format: boolean) {
    const year = date.getFullYear();
    // Note: months are 0-based
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return format ? `${day}-${month}-${year}` : `${year}-${month}-${day}`;
  }

  const submit = async () => {
    // 2) Basic validation: check all required fields
    if (
        !form.username ||
        !form.email ||
        !form.user_type ||
        !form.fullname ||
        !form.date_of_birth ||
        !form.gender ||
        !form.password ||
        !form.phone
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (form.password !== passwordCheck) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // 2a) If user_type = "Doctor", require doctor_specialty & doctor_experience
    if (form.user_type === "Doctor") {
      if (!form.doctor_specialty || !form.doctor_experience) {
        Alert.alert("Error", "Please enter specialty and experience for doctors.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // 3) Prepare sign-up payload.
      //    We can pass everything, or only the fields your backend expects.
      console.log("Submitting form:", form);
      await signUp({
        username: form.username,
        email: form.email,
        password: form.password,
        user_type: form.user_type,
        fullname: form.fullname,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        address: form.address,             // if empty, can pass null
        phone: form.phone,
        profile_image: form.profile_image || null,
        doctor_specialty: form.user_type === "Doctor" ? form.doctor_specialty : "Not a doctor",
        doctor_experience: form.user_type === "Doctor" ? form.doctor_experience : -1,
      });

      Alert.alert("Success", "Account created! Please login.");
      router.replace("/LoginScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userTypes = [{
    label: "Doctor",
    value: "Doctor",
  }, {
    label: "Patient",
    value: "Patient",
  }];

  const genders = [{
    label: "Male",
    value: "Male",
  }, {
    label: "Female",
    value: "Female",
  }];

  return (
      <SafeAreaView className="h-full">
        <ScrollView>
          <View
              className="w-full flex justify-center h-full px-4 my-6"
              style={{
                minHeight: Dimensions.get("window").height - 300,
              }}
          >
            <Image
                source={images.trans_logo}
                resizeMode="contain"
                className="w-[200px] h-[160px] ml-auto mr-auto justify-center items-center"
            />

            <Text className="text-2xl font-semibold mt-10 font-psemibold">
              Sign Up to Medicare AI
            </Text>

            {/* 4) Additional Form Fields */}

            {/* username */}
            <FormField
                title="Username (required)"
                placeholder="Enter username"
                value={form.username}
                handleChangeText={(value) => setForm({...form, username: value})}
                otherStyles="mt-7"
            />

            {/* fullname */}
            <FormField
                title="Full Name (required)"
                placeholder="Enter your full name"
                value={form.fullname}
                handleChangeText={(value) => setForm({...form, fullname: value})}
                otherStyles="mt-7"
            />

            {/* email */}
            <FormField
                title="Email (required)"
                placeholder="Enter email"
                value={form.email}
                handleChangeText={(value) => setForm({...form, email: value})}
                keyboardType="email-address"
                otherStyles="mt-7"
            />

            {/* password */}
            <FormField
                title="Password (required)"
                placeholder="Enter password"
                value={form.password}
                handleChangeText={(value) => setForm({...form, password: value})}
                otherStyles="mt-7"
            />

            {/* password check */}
            <FormField
                title="Re-enter password (required)"
                placeholder="Enter password again"
                value={passwordCheck}
                handleChangeText={(value) => setPasswordCheck(value)}
                otherStyles="mt-7"
            />

            {/* user_type (Doctor or Patient) */}
            <Text className="text-gray-700 mt-7 font-psemibold">User Type (required)</Text>
            <View className="border-2 border-stone-600 rounded-2xl mt-2">
              <RNPickerSelect
                  onValueChange={(value) => setForm({...form, user_type: value})}
                  items={userTypes}
                  placeholder={{
                    label: 'Choose user type...',
                    value: '',
                    color: '#737171',
                  }}
                  style={{
                    inputIOS: {
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 14,
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      color: '#000000',
                      flex: 1,
                      paddingRight: 30, // Đảm bảo có đủ không gian cho icon
                      backgroundColor: '#F5F5F5',
                      borderRadius: 16,
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
                  value={form.user_type}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => {
                    return <Icon name="chevron-down-outline" size={24} color="#6B7280"/>;
                  }}
              >
              </RNPickerSelect>
            </View>


            {/* date_of_birth */}
            <Text className="text-gray-700 mt-7 font-psemibold">Date of Birth (required)</Text>

            <TouchableOpacity
                className="border-2 border-stone-600 rounded-2xl p-3 mt-2 flex-row items-center justify-between"
                onPress={() => setShowDatePicker(!showDatePicker)}
            >
              {!form.date_of_birth? (
                  <Text className="text-[#7B7B8B] font-pmedium">
                    Select a date
                  </Text>
              ) : (
                  <Text className="font-psemibold text-base">
                    {formatDate(selectedDate, true)}
                  </Text>
              )}
              <Icon name="calendar-outline" size={20} color="#6B7280"/>
            </TouchableOpacity>
            {showDatePicker && (
                <View className="flex w-full items-center justify-center">
                  <DateTimePicker
                      mode="date"
                      display="inline"
                      value={selectedDate} // The Date object
                      onChange={(event, date) => {
                        // setShowDatePicker(false);
                        if (date) {
                          // user picked a date
                          setSelectedDate(date);
                          // format date => "YYYY-MM-DD"
                          const formatted = formatDate(date, false);
                          setForm({...form, date_of_birth: formatted});
                        }
                      }}
                      maximumDate={new Date()}
                  />
                </View>
            )}


            {/* gender (Male, Female, or Other) */}
            <Text className="text-gray-700 mt-7 font-psemibold">Gender (required)</Text>
            <View className="border-2 border-stone-600 rounded-2xl mt-2">
              <RNPickerSelect
                  onValueChange={(value) => setForm({...form, gender: value})}
                  items={genders}
                  placeholder={{
                    label: 'Choose gender...',
                    value: '',
                    color: '#737171',
                  }}
                  style={{
                    inputIOS: {
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 14,
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      color: '#000000',
                      flex: 1,
                      paddingRight: 30, // Đảm bảo có đủ không gian cho icon
                      backgroundColor: '#F5F5F5',
                      borderRadius: 16,
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
                  value={form.gender}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => {
                    return <Icon name="chevron-down-outline" size={24} color="#6B7280"/>;
                  }}
              >
              </RNPickerSelect>
            </View>


            {/* address (optional) */}
            <FormField
                title="Address (optional)"
                placeholder="Enter address"
                value={form.address}
                handleChangeText={(value) => setForm({...form, address: value})}
                otherStyles="mt-7"
            />

            {/* phone*/}
            <FormField
                title="Phone (required)"
                placeholder="Enter phone number"
                value={form.phone}
                handleChangeText={(value) => setForm({...form, phone: value})}
                keyboardType="phone-pad"
                otherStyles="mt-7"
            />

            {/* profile_image (optional) */}
            <FormField
                title="Profile Image URL (optional)"
                placeholder="Enter image URL"
                value={form.profile_image}
                handleChangeText={(value) => setForm({...form, profile_image: value})}
                otherStyles="mt-7"
            />

            {/* If user_type = Doctor, show specialty & experience */}
            {form.user_type === "Doctor" && (
                <>
                  <FormField
                      title="Doctor Specialty (required for Doctor)"
                      placeholder="e.g. Cardiology"
                      value={form.doctor_specialty}
                      handleChangeText={(value) => setForm({...form, doctor_specialty: value})}
                      otherStyles="mt-7"
                  />

                  <FormField
                      title="Doctor Experience (required for Doctor)"
                      placeholder="Years of experience"
                      value={String(form.doctor_experience)}
                      handleChangeText={(value) =>
                          setForm({...form, doctor_experience: parseInt(value) || 0})
                      }
                      keyboardType="numeric"
                      otherStyles="mt-7"
                  />
                </>
            )}

            {/* Sign Up Button */}
            <CustomButton
                title="Sign Up"
                handlePress={submit}
                containerStyles="mt-7"
                isLoading={isSubmitting}
            />

            <View className="flex justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-700 font-pregular">
                Have an account already?
              </Text>
              <Link
                  href="/LoginScreen"
                  className="text-lg font-psemibold text-sky-500"
              >
                Login
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
};

export default RegisterScreen;
