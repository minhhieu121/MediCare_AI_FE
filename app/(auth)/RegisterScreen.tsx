import React, {useState, useContext} from "react";
import {StyleSheet, View, TextInput, Button, Image, Text, Alert, ScrollView, Dimensions} from "react-native";
import {ThemedView} from "@/components/ThemedView";
import {AuthContext} from "@/context/AuthContext";
import {router, Link} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import {images} from "@/constants";

const RegisterScreen: React.FC = () => {
  const {login} = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const user = {
      id: "1",
      name: form.email,
      email: form.email,
    };

    setIsSubmitting(true);
    login(user);
    router.replace("/(tabs)/HomeScreen");
  };
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

            <FormField
                title="Username"
                placeholder="Username"
                value={form.username}
                handleChangeText={(e) => setForm({...form, username: e})}
                otherStyles="mt-10"
            />

            <FormField
                title="Email"
                placeholder="Email"
                value={form.email}
                handleChangeText={(e) => setForm({...form, email: e})}
                otherStyles="mt-7"
                keyboardType="email-address"
            />

            <FormField
                title="Password"
                placeholder="Password"
                value={form.password}
                handleChangeText={(e) => setForm({...form, password: e})}
                otherStyles="mt-7"
            />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  loginContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default RegisterScreen;
