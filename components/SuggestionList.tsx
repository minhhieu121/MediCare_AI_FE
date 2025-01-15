// components/SuggestionList.tsx
import { Coordinate } from "@/hooks/useMapbox";
import React from "react";
import {
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address: string;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
  onSelect: (mapboxId: string) => void;
  isLoading: boolean;
  // fadeAnim: Animated.Value;
}

const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  onSelect,
  isLoading,
  // fadeAnim,
}) => {
  if (isLoading) {
    return <ActivityIndicator className="mt-2" color="#4B5563" />;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Animated.View>
      <FlatList
        data={suggestions.slice(0, 5)} // Limit to top 5 suggestions
        keyExtractor={(item) => item.mapbox_id}
        className="bg-white rounded-lg shadow-md max-h-60 mt-2"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="px-4 py-2 border-b border-gray-200"
            onPress={() => onSelect(item.mapbox_id)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`Select ${item.name}`}
          >
            <Text className="text-gray-800 font-semibold">{item.name}</Text>
            <Text className="text-gray-500 text-sm">{item.full_address}</Text>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );
};

export default SuggestionList;
