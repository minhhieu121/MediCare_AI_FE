import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
// @ts-ignore
import FloatingChatbotButton from "@/components/FloatingChatbotButton"; // Import mock data
import HospitalItem from "@/components/HospitalItem";
import { useAuth } from "@/context/AuthContext";
import { Hospital } from "@/types/appointment";
import { debounce } from "lodash";

const AppointmentScreen = () => {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState<number>(0);
  const [limit] = useState<number>(20); // You can adjust the limit as needed
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchHospitals = async () => {
    if (!hasMore) return; // No more data to fetch
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hospitals?skip=${skip}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error fetching hospitals: ${response.statusText}`);
      }

      const data: Hospital[] = await response.json();

      if (data.length < limit) {
        setHasMore(false); // No more data available
      }

      setHospitals((prevHospitals) => [...prevHospitals, ...data]);
      setFilteredHospitals((prevHospitals) => [...prevHospitals, ...data]);
      setSkip((prevSkip) => prevSkip + limit);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching hospitals.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Debounced search to optimize performance
  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() === "") {
        setFilteredHospitals(hospitals);
      } else {
        const filtered = hospitals.filter((hospital) =>
          hospital.hospital_name.toLowerCase().includes(query.toLowerCase()),
        );
        setFilteredHospitals(filtered);
      }
    }, 300),
    [hospitals],
  );

  const onChangeSearch = (text: string) => {
    setSearchQuery(text);
    handleSearch(text);
  };

  const handleRetry = () => {
    fetchHospitals();
  };

  const renderItem = ({ item }: { item: Hospital }) => (
    <HospitalItem hospital={item} />
  );

  const keyExtractor = (item: Hospital) => item.hospital_id?.toString() || "";

  const handleEndReached = () => {
    if (!loading && hasMore) {
      fetchHospitals();
    }
  };

  return (
    <LinearGradient
      colors={["rgb(26,139,255)", "#cbf7ff", "#ffffff"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView className="flex-1 w-full">
        {/* Search Bar */}
        <View className="px-4 py-2 shadow">
          <View className="flex-row items-center bg-white rounded-lg p-4">
            <Icon name="search-outline" size={20} color="#666" />
            <TextInput
              placeholder="Search hospitals..."
              value={searchQuery}
              onChangeText={onChangeSearch}
              className="ml-2 flex-1 text-gray-700 font-pmedium"
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
            {searchQuery !== "" && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setFilteredHospitals(hospitals);
                }}
              >
                <Icon name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hospital List */}
        <View className="flex-1 px-4 pt-2">
          {loading && hospitals.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1e90ff" />
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-red-500 text-lg mb-4">{error}</Text>
              <TouchableOpacity
                onPress={handleRetry}
                className="mt-4 bg-blue-500 px-4 py-2 rounded-md"
              >
                <Text className="text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredHospitals.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-600 text-lg">No hospitals found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredHospitals}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              className="flex-1 bg-transparent"
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loading && hasMore ? (
                  <View className="py-4">
                    <ActivityIndicator size="small" color="#1e90ff" />
                  </View>
                ) : null
              }
            />
          )}
        </View>
        {/* <FloatingChatbotButton chatbotId={2} /> */}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AppointmentScreen;
