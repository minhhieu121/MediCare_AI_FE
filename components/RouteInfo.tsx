// components/RouteInfo.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames"; 

interface RouteInfoProps {
  timeLeftSeconds: number; // Time left in seconds
  distanceLeftMeters: number; // Distance left in meters
}

const RouteInfo: React.FC<RouteInfoProps> = ({ timeLeftSeconds, distanceLeftMeters }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // Fade-in duration
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Calculate time left in minutes and seconds
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTimeLeft =
    timeLeftSeconds > 0
      ? `${minutes} mins`
      : "Arrived";

  // Calculate distance left in kilometers
  const distanceInKm = (distanceLeftMeters / 1000).toFixed(1);
  const formattedDistanceLeft = distanceLeftMeters > 0 ? `${distanceInKm} km` : "0.0 km";

  // Determine the color based on time left
  let timeColor = "text-gray-700"; // Default color
  if (timeLeftSeconds > 600) { // More than 10 minutes
    timeColor = "text-red-700";
  } else if (timeLeftSeconds > 300) { // Between 5 and 10 minutes
    timeColor = "text-yellow-700";
  } else if (timeLeftSeconds > 0) { // Less than 5 minutes
    timeColor = "text-green-700";
  } else {
    timeColor = "text-gray-700";
  }

  // Apply the same color to distance
  const distanceColor = timeColor;

  // Helper function to map Tailwind color class to actual color value
  const colorFromTailwind = (tailwindColor: string): string => {
    switch (tailwindColor) {
      case "text-green-700":
        return "#047857"; // Tailwind green-700
      case "text-yellow-700":
        return "#D97706"; // Tailwind yellow-700
      case "text-red-700":
        return "#B91C1C"; // Tailwind red-700
      case "text-gray-700":
      default:
        return "#374151"; // Tailwind gray-700
    }
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="w-[60%] absolute top-[9rem] bg-white bg-opacity-90 p-4 rounded-full flex-row items-center justify-between shadow-lg z-50"
      accessible={true}
      accessibilityLabel={`Time left: ${formattedTimeLeft}. Distance: ${formattedDistanceLeft}`}
    >
      {/* Time Left */}
      <View className="flex-row items-center">
        <Ionicons name="time-outline" size={20} color={colorFromTailwind(timeColor)} />
        <Text className={classNames("ml-2 text-base", timeColor)}>{formattedTimeLeft} left</Text>
      </View>

      {/* Separator */}
      <View className="w-px h-6 bg-gray-300" />

      {/* Distance */}
      <View className="flex-row items-center">
        <Ionicons name="navigate-outline" size={20} color={colorFromTailwind(distanceColor)} />
        <Text className={classNames("ml-2 text-base", distanceColor)}>{formattedDistanceLeft}</Text>
      </View>
    </Animated.View>
  );
};

export default RouteInfo;