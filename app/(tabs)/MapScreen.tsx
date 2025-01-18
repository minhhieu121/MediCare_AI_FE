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
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import FloatingMicroButton from "@/components/FLoatingMicroButton";
import { set } from "lodash";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoibWluaGhpZXUxMSIsImEiOiJjbTU4OWdkaXA0MXg3Mmtwa2ZnMXBnbGpvIn0.VcU6Q0FhEgmHMIjSHhu2gA";

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address: string;
}

interface Message {
  sender: "user" | "bot";
  text: string;
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
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

  const fadeAnimDestination = useRef(new Animated.Value(0)).current;
  const fadeAnimMid = useRef(new Animated.Value(0)).current;

  const mapRef = useRef<MapView | null>(null);

  // Handle search for destination
  useEffect(() => {
    ws.current = new WebSocket(`ws://${wsUrl}/ws/chat`);

    ws.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.current.onmessage = (e) => {
      const data = e.data;
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === "traffic_alert") {
          Alert.alert("Cảnh báo giao thông", parsedData.message);
        } else {
          // Sử dụng expo-speech để đọc tin nhắn của bot
          Speech.speak(data, { language: "vi" });
        }
      } catch (error) {
        // Sử dụng expo-speech để đọc tin nhắn của bot
        Speech.speak(data, { language: "vi" });
      }
      setIsLoading(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false);
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.current?.close();
    };
  }, [wsUrl]);

  const sendLocation = () => {
    if (
      startLocation &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      const locationData = JSON.stringify({
        type: "location",
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
      });
      try {
        ws.current.send(locationData);
        console.log(
          `Gửi vị trí: ${startLocation.latitude}, ${startLocation.longitude}`,
        );
      } catch (error) {
        console.error("Error sending location", error);
      }
    }
  };

  useEffect(() => {
    // Yêu cầu quyền truy cập vị trí
    const requestLocationPermission = () => {
      // Gửi vị trí ngay lập tức khi có quyền
      sendLocation();

      // Thiết lập interval để gửi vị trí mỗi 5 giây
      const intervalId = setInterval(() => {
        sendLocation();
        // console.log("Sending location...");
      }, 5000); // 5000ms = 5 giây

      // Dọn dẹp interval khi component unmount
      return () => clearInterval(intervalId);
    };

    requestLocationPermission();
  }, []);

  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Không có quyền truy cập microphone");
        return;
      }

      console.log("Starting recording..");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopping recording..");
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      console.log("Recording stopped and stored at", uri);

      if (uri) {
        // Gửi file audio đến API Speech-to-Text
        console.log("Sending audio to Speech-to-Text API...");
        setIsLoading(true); // Bắt đầu loading sau khi dừng ghi âm

        const text = await sendAudioToSpeechToText(uri);
        sendMessage(text || "Hi");
        // Trạng thái loading sẽ dừng khi nhận được phản hồi từ WebSocket
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
      setIsLoading(false); // Đảm bảo loading dừng khi có lỗi
    }
  };

  // Hàm gửi audio đến API Speech-to-Text và nhận lại văn bản
  const sendAudioToSpeechToText = async (
    uri: string
  ): Promise<string | null> => {
    try {
      // Thay đổi URL API và cách gửi dữ liệu tùy theo dịch vụ bạn sử dụng
      const apiUrl = `http://${wsUrl}/speech-to-text`; // Thay đổi URL cho phù hợp

      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: "recording.wav",
        type: "audio/wav",
      } as any); // Ép kiểu thành 'any' để tránh lỗi TypeScript

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          // Thêm các headers cần thiết như Authorization nếu cần
        },
        body: formData,
      });

      if (!response.ok) {
        console.error(
          "Failed to send audio to Speech-to-Text API:",
          response.status
        );
        setIsLoading(false);
        return null;
      }

      const result = await response.json();
      console.log("Result from Speech-to-Text API:", result);
      // Giả sử API trả về { text: "văn bản nhận diện được" }
      return result.text || null;
    } catch (error) {
      console.error("Error in Speech-to-Text API: ", error);
      setIsLoading(false);
      return null;
    }
  };

  const sendMessage = (text?: string) => {
    const messageText = text;
    if (messageText?.trim() !== "") {
      const messageData = JSON.stringify({ type: "text", text: messageText });
      ws.current?.send(messageData);
    }
  };

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
      midPoints
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
                  secondPoint.latitude - firstPoint.latitude
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
          }
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
          { duration: 500 } // Animation duration
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
        <FloatingMicroButton
          onPress={!isRecording ? startRecording : stopRecording}
          isRecording={isRecording}
          isLoading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
