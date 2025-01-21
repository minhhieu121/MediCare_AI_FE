// components/ControlButtons.tsx
import { FontAwesome6, Octicons } from "@expo/vector-icons";
import React from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ControlButtonsProps {
  onShowRoute: () => void;
  onToggleFocus: () => void;
  isLoadingRoute: boolean;
  isFocusing: boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  onShowRoute,
  onToggleFocus,
  isLoadingRoute,
  isFocusing,
}) => {
  return (
    <View className="absolute bottom-[7.5rem] left-4 right-4 flex-row justify-start">
      <TouchableOpacity
        onPress={onShowRoute}
        className="bg-green-500 rounded-lg p-3 mr-2 shadow"
        accessible={true}
        accessibilityLabel="Show Route"
      >
        {isLoadingRoute ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-center text-white font-semibold">
            Show Route
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onToggleFocus}
        className="bg-indigo-500 rounded-full p-4 ml-2 shadow flex-row justify-center"
        accessible={true}
        accessibilityLabel="Toggle Focus"
      >
        {/* <Text className="text-center text-white font-semibold">
          {isFocusing ? "Focusing" : "Focus"}
        </Text> */}
        <FontAwesome6 name="location-crosshairs" size={26} color="#fff"/>
      </TouchableOpacity>
    </View>
  );
};

export default ControlButtons;
