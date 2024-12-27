import React, { useState, useContext } from "react";
import { StyleSheet, View, TextInput, Button, Text, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { AuthContext } from "@/context/AuthContext";
import { router, Link } from "expo-router";

const RegisterScreen: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleRegister = () => {
    // TODO: Thực hiện đăng ký người dùng (API call)
    // Giả sử đăng ký thành công
    if (name && email && password) {
      const user = {
        id: "2",
        name: name,
        email: email,
      };
      login(user);
      router.replace("/LoginScreen");
    } else {
      Alert.alert("Error", "Please fill all fields");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
      <View style={styles.loginContainer}>
        <Text>Already have an account?</Text>
        <Link href={"/LoginScreen"}>Sign in</Link>
      </View>
    </ThemedView>
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
