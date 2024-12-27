import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Authenticate from "@/components/Authenticate";

export default function AppointmentView() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const { isLoggedIn, user, logout } = useContext(AuthContext);

  if (isLoggedIn) {
    return <Authenticate />;
  }

  const handleSubmit = () => {
    console.log("Form submitted:", { name, date, time, symptoms });
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Book Appointment</Text>

      <TextInput
        className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        placeholder="Date"
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        placeholder="Time"
        value={time}
        onChangeText={setTime}
      />

      <TextInput
        className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        placeholder="Symptoms"
        value={symptoms}
        onChangeText={setSymptoms}
        multiline
      />

      <Button title="Book Appointment" onPress={handleSubmit} />
    </View>
  );
}
