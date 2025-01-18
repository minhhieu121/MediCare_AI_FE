import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Animated,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface FloatingMicroButtonProps {
  onPress: () => void;
  isRecording: boolean;
  isLoading: boolean;
}

const FloatingMicroButton: React.FC<FloatingMicroButtonProps> = ({
  onPress,
  isRecording,
  isLoading,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      // Bắt đầu animation pulsing khi đang ghi âm
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Dừng animation khi không còn ghi âm
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulse,
          {
            transform: [{ scale: pulseAnim }],
            opacity: isRecording ? 0.6 : 0,
          },
        ]}
      />
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonRecording]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon
            name={isRecording ? "mic" : "mic-outline"}
            size={30}
            color={isRecording ? "#ff4d4d" : "#fff"}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff4d4d",
  },
  button: {
    backgroundColor: "#1e90ff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Cho Android
    shadowColor: "#000", // Cho iOS
    shadowOffset: { width: 0, height: 2 }, // Cho iOS
    shadowOpacity: 0.3, // Cho iOS
    shadowRadius: 4, // Cho iOS
    zIndex: 1000, // Đảm bảo nó nằm trên các thành phần khác
  },
  buttonRecording: {
    backgroundColor: "#ff4d4d",
  },
});

export default FloatingMicroButton;