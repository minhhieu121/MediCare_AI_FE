// components/SearchBar.tsx
import React, { useRef } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onClear,
  placeholder = "Tìm đỉm đến...",
}) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <View className="flex-row items-center bg-white bg-opacity-90 rounded-full shadow-lg p-3">
      {/* Search Icon */}
      <View className="bg-gray-200 rounded-full p-1">
        <MaterialIcons name="search" size={20} color="#4B5563" />
      </View>

      {/* Text Input */}
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor="#6B7280" // Tailwind's gray-500
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="flex-1 mx-2 text-gray-800 font-pmedium"
        returnKeyType="search"
        autoCorrect={false}
        accessible={true}
        accessibilityLabel="Search input"
        textAlignVertical={"center"}
      />

      {/* Clear Icon */}
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          className="bg-gray-200 rounded-full p-1 mr-2"
          accessible={true}
          accessibilityLabel="Clear search input"
        >
          <MaterialIcons name="close" size={20} color="#4B5563" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
