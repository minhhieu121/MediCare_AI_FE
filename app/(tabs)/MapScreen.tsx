// MapScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import * as ExpoLocation from "expo-location";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
} from "react-native";
import MapView, { Camera } from "react-native-maps";
import { KeyboardAvoidingView } from "react-native";
import SuggestionList from "@/components/SuggestionList";
import MapComponent from "@/components/MapComponent";
import ControlButtons from "@/components/ControlButtons";
import SearchBar from "@/components/SearchBar";
import { useLocation } from "@/hooks/useLocation";
import { Coordinate, useMapbox } from "@/hooks/useMapbox";
import { Ionicons } from "@expo/vector-icons";
import FloatingChatbotButton from "@/components/FloatingChatbotButton";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoibWluaGhpZXUxMSIsImEiOiJjbTU4OWdkaXA0MXg3Mmtwa2ZnMXBnbGpvIn0.VcU6Q0FhEgmHMIjSHhu2gA";

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address: string;
}

export default function MapScreen() {
  const { startLocation, errorMsg } = useLocation();
  const {
    handleSearch,
    handleSearchMid,
    handleShowRoute,
    handleSelectSuggestion,
    handleSelectMidSuggestion,
  } = useMapbox({
    accessToken: MAPBOX_ACCESS_TOKEN,
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [destination, setDestination] = useState<Coordinate | null>(null);

  const [searchMidQuery, setSearchMidQuery] = useState<string>("");
  const [midSuggestions, setMidSuggestions] = useState<Suggestion[]>([]);
  const [midPoints, setMidPoints] = useState<Coordinate[]>([]);
  const [isAddingMidpoint, setIsAddingMidpoint] = useState<boolean>(false);

  const [isFocusing, setIsFocusing] = useState<boolean>(false);

  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState<boolean>(false);
  const [isLoadingMidSuggestions, setIsLoadingMidSuggestions] =
    useState<boolean>(false);

  const fadeAnimDestination = useRef(new Animated.Value(0)).current;
  const fadeAnimMid = useRef(new Animated.Value(0)).current;

  const mapRef = useRef<MapView | null>(null);

  // Handle search for destination
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        console.log("Search query is empty. Skipping API call.");
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      console.log(`Fetching suggestions for: "${searchQuery}"`);
      const fetchedSuggestions = await handleSearch(searchQuery);
      setSuggestions(fetchedSuggestions);
      setIsLoadingSuggestions(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce delay

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle search for midpoints
  useEffect(() => {
    const fetchMidSuggestions = async () => {
      if (!searchMidQuery.trim()) {
        console.log("Midpoint search query is empty. Skipping API call.");
        setMidSuggestions([]);
        return;
      }

      setIsLoadingMidSuggestions(true);
      console.log(`Fetching midpoint suggestions for: "${searchMidQuery}"`);
      const fetchedMidSuggestions = await handleSearchMid(searchMidQuery);
      setMidSuggestions(fetchedMidSuggestions);
      setIsLoadingMidSuggestions(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchMidSuggestions();
    }, 300); // Debounce delay

    return () => clearTimeout(debounceTimer);
  }, [searchMidQuery]);

  // Handle selection of destination suggestion
  const onSelectDestination = async (mapboxId: string) => {
    setIsLoadingSuggestions(true);
    const selectedCoordinate = await handleSelectSuggestion(mapboxId);
    if (selectedCoordinate) {
      setDestination(selectedCoordinate);
      setSearchQuery(selectedCoordinate.name);
      setRouteCoordinates([]);
    }
    setSuggestions([]);
    setIsLoadingSuggestions(false);
    Keyboard.dismiss();
  };

  // Handle selection of midpoint suggestion
  const onSelectMidpoint = async (mapboxId: string) => {
    setIsLoadingMidSuggestions(true);
    const selectedCoordinate = await handleSelectMidSuggestion(mapboxId);
    if (selectedCoordinate) {
      setMidPoints((prev) => [...prev, selectedCoordinate]);
      setSearchMidQuery("");
      setIsAddingMidpoint(false); // Hide the SearchBar after selection
    }
    setMidSuggestions([]);
    setIsLoadingMidSuggestions(false);
    Keyboard.dismiss();
  };

  // Handle showing the route
  const onShowRoute = async () => {
    if (!startLocation || !destination) {
      Alert.alert("Error", "Current location or destination is not set.");
      return;
    }

    setIsLoadingRoute(true);
    const fetchedRoute = await handleShowRoute(
      startLocation,
      destination,
      midPoints,
    );
    setRouteCoordinates(fetchedRoute);
    setIsLoadingRoute(false);
  };

  // Handle focusing the map
  const onToggleFocus = () => {
    setIsFocusing((prev) => !prev);
  };

  // Handle focus state and animate camera
  useEffect(() => {
    let locationSubscription: ExpoLocation.LocationSubscription | null = null;

    const startTracking = async () => {
      try {
        locationSubscription = await ExpoLocation.watchPositionAsync(
          {
            accuracy: ExpoLocation.Accuracy.High,
            distanceInterval: 1,
            timeInterval: 1000,
          },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;

            // Update the startLocation state
            // Ensure that setStartLocation is available from useLocation
            // If not, you might need to adjust the useLocation hook to allow updates from here
            // Assuming useLocation provides setStartLocation, or adjust accordingly
            // For this example, we'll assume it's managed within useLocation

            if (isFocusing && routeCoordinates.length > 1 && mapRef.current) {
              const firstPoint = routeCoordinates[0];
              const secondPoint = routeCoordinates[1];

              // Calculate bearing from point 0 to point 1
              const bearing =
                (Math.atan2(
                  secondPoint.longitude - firstPoint.longitude,
                  secondPoint.latitude - firstPoint.latitude,
                ) *
                  180) /
                Math.PI;

              // Calculate adjusted center position
              const offsetDistance = -0.001; // Offset in degrees
              const adjustedCenter = {
                latitude:
                  latitude -
                  offsetDistance * Math.cos((bearing * Math.PI) / 180),
                longitude:
                  longitude -
                  offsetDistance * Math.sin((bearing * Math.PI) / 180),
              };

              // Update camera
              const camera: Camera = {
                center: adjustedCenter,
                heading: bearing,
                pitch: 60,
                zoom: 18,
              };

              mapRef.current.animateCamera(camera, { duration: 500 });
            }
          },
        );
      } catch (error) {
        console.error("Error starting location tracking:", error);
        Alert.alert("Error", "Could not start location tracking.");
      }
    };

    if (isFocusing) {
      startTracking();
    } else if (locationSubscription) {
      locationSubscription.remove();
    } else {
      if (mapRef.current) {
        mapRef.current.animateCamera(
          {
            pitch: 0, // Reset pitch
          },
          { duration: 500 }, // Animation duration
        );
      }
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isFocusing, routeCoordinates, startLocation]);

  // Animate suggestion dropdowns
  useEffect(() => {
    if (suggestions.length > 0) {
      Animated.timing(fadeAnimDestination, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnimDestination, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    if (midSuggestions.length > 0) {
      Animated.timing(fadeAnimMid, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnimMid, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [suggestions, midSuggestions, fadeAnimDestination, fadeAnimMid]);

  // Function to remove a midpoint by index
  const removeMidpoint = (index: number) => {
    setMidPoints((prev) => prev.filter((_, i) => i !== index));
  };

  // Render Loading Screen
  if (!startLocation) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#4B5563" />
        <Text className="mt-4 text-gray-600">
          {errorMsg || "Loading current location..."}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1">
        {/* Destination Search Bar */}
        <View className="absolute top-20 left-4 right-4 z-50">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClear={() => {
              setSearchQuery("");
              setSuggestions([]);
              setDestination(null);
              setRouteCoordinates([]);
              setMidPoints([]);
            }}
            placeholder="Search destination..."
          />

          {!destination && (
            <SuggestionList
              suggestions={suggestions}
              onSelect={onSelectDestination}
              isLoading={isLoadingSuggestions}
            />
          )}
        </View>

        {/* Midpoints Section */}
        {destination && (
          <View className="absolute top-36 left-4 right-4 z-50">
            {/* Existing Midpoints Display */}
            {midPoints.map((point, index) => (
              <View
                key={`midpoint-${index}`}
                className="flex-row items-center mb-2"
              >
                <Text className="text-gray-700 flex-1">
                  Midpoint {index + 1}: {point.name || "Unnamed Location"}
                </Text>
                {/* Remove Midpoint Button */}
                <TouchableOpacity
                  onPress={() => removeMidpoint(index)}
                  className="bg-[#ff0000] rounded-full p-1 shadow-lg"
                  accessible={true}
                  accessibilityLabel={`Remove Midpoint ${index + 1}`}
                  activeOpacity={0.7} // Provides visual feedback on press
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Midpoint Button */}
            {midPoints.length < 3 && !isAddingMidpoint && (
              <TouchableOpacity
                onPress={() => setIsAddingMidpoint(true)}
                className="bg-blue-500 rounded-lg p-3 mt-2"
                accessible={true}
                accessibilityLabel="Add Midpoint"
              >
                <Text className="text-center text-white font-semibold">
                  Add Midpoint
                </Text>
              </TouchableOpacity>
            )}

            {/* Midpoint Search Bar */}
            {isAddingMidpoint && (
              <>
                <SearchBar
                  searchQuery={searchMidQuery}
                  setSearchQuery={setSearchMidQuery}
                  onClear={() => {
                    setSearchMidQuery("");
                    setMidSuggestions([]);
                    setIsAddingMidpoint(false);
                  }}
                  placeholder={`Search midpoint ${midPoints.length + 1}...`}
                />
                <SuggestionList
                  suggestions={midSuggestions}
                  onSelect={onSelectMidpoint}
                  isLoading={isLoadingMidSuggestions}
                />
              </>
            )}
          </View>
        )}

        {/* Map Component */}
        <MapComponent
          ref={mapRef}
          destination={destination}
          midPoints={midPoints}
          routeCoordinates={routeCoordinates}
          initialRegion={{
            latitude: startLocation.latitude,
            longitude: startLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        />

        {/* Control Buttons */}
        <ControlButtons
          onShowRoute={onShowRoute}
          onToggleFocus={onToggleFocus}
          isLoadingRoute={isLoadingRoute}
          isFocusing={isFocusing}
        />
        <FloatingChatbotButton chatbotId={1} />
      </View>
    </KeyboardAvoidingView>
  );
}
