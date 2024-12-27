import React, { useState, useContext } from "react";
import { StyleSheet, View, TextInput, Button, Text, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { AuthContext } from "@/context/AuthContext";
import { router, Link } from "expo-router";
import "../../global.css";

const LoginScreen: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = () => {
    // TODO: Thực hiện xác thực người dùng (API call)
    // Giả sử đăng nhập thành công
    if (email === "test@example.com" && password === "password") {
      const user = {
        id: "1",
        name: "Nguyễn Văn A",
        email: "test@example.com",
      };
      login(user);
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", "Invalid email or password");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.registerContainer}>
        <Text>Don't have an account?</Text>
        <Link
          href="/RegisterScreen"
          className="text-blue-500 text-lg font-psemibold text-secondary"
        >
          Sign up
        </Link>
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
  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default LoginScreen;
