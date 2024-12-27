import { View, Text } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, Button } from "react-native";
import { router } from "expo-router";
import React from "react";

const Authenticate = () => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.authContainer}>
        <Text className="text-4xl text-white font-psemibold">
          Welcome to YourApp!
        </Text>
        <ThemedText style={styles.subtitle}>
          Please log in or register to continue.
        </ThemedText>
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={() => router.push("/LoginScreen")} />
          <Button
            title="Register"
            onPress={() => router.push("/RegisterScreen")}
          />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    width: "80%",
    justifyContent: "space-between",
    height: 100,
  },
  header: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    position: "absolute",
    top: 100,
    left: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  input: {
    flex: 1,
    padding: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 10,
  },
});

export default Authenticate;
