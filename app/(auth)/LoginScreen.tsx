import React, { useState, useContext } from "react";
import { StyleSheet, View, TextInput, Button, Text, Image, Alert, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

import { AuthContext } from "@/context/AuthContext";  // <--- We will use signIn from here
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";

const LoginScreen: React.FC = () => {
  const { signIn } = useContext(AuthContext); // or useAuth() if you wrote a custom hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the AuthContext signIn
      await signIn(form.email, form.password);

      // If signIn succeeds, redirect to home (or wherever you want)
      router.replace("/(tabs)/HomeScreen");

    } catch (error) {
      // handle server error or invalid credentials
      Alert.alert("Login Error", "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <View
          className="w-full justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 400,
          }}
        >
          <Image
            source={images.trans_logo}
            resizeMode="contain"
            className="w-[200px] h-[160px] ml-auto mr-auto justify-center items-center"
          />
          <Text className="text-2xl text-semibold mt-10 font-psemibold">
            Login to Medicare AI
          </Text>

          <FormField
            title="Email"
            value={form.email}
            placeholder="Enter your email"
            handleChangeText={(value) => setForm({ ...form, email: value })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            placeholder="Password"
            handleChangeText={(value) => setForm({ ...form, password: value })}
            otherStyles="mt-7"
            // secureTextEntry // Let the user see asterisks
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-700 font-pregular">
              Don't have an account?
            </Text>
            <Link href="/RegisterScreen" className="text-lg font-psemibold text-sky-500">
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
