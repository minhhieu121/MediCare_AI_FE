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
import RouteInfo from "@/components/RouteInfo";
import { method, set } from "lodash";
import { useAuth } from "@/context/AuthContext";

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
  const { user, token } = useAuth();
  // Inside your MapScreen component
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutes in seconds
  const [distanceLeft, setDistanceLeft] = useState<number>(5300); // 5.3 km in meters

  // Add new interface at top of file
interface BasicCoordinate {
  latitude: number;
  longitude: number;
}

// Update helper functions
const calculateDistance2D = (point1: BasicCoordinate, point2: BasicCoordinate) => {
  return Math.sqrt(
    Math.pow(point2.latitude - point1.latitude, 2) +
    Math.pow(point2.longitude - point1.longitude, 2)
  );
};

const findNearestPointIndex = (currentLocation: BasicCoordinate, route: Coordinate[]) => {
  let nearestIndex = -1;
  let minDistance = Infinity;

  route.slice(0, 20).forEach((point, index) => {
    const distance = calculateDistance2D(currentLocation, point);
    if (distance < minDistance && distance < 0.0001) {
      minDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
};

const interpolatePoints = (
  start: BasicCoordinate,
  end: BasicCoordinate,
  numPoints: number
): BasicCoordinate[] => {
  const points: BasicCoordinate[] = [];
  const latStep = (end.latitude - start.latitude) / (numPoints + 1);
  const lonStep = (end.longitude - start.longitude) / (numPoints + 1);

  for (let i = 1; i <= numPoints; i++) {
    points.push({
      latitude: start.latitude + latStep * i,
      longitude: start.longitude + lonStep * i,
    });
  }

  return points;
};


  // Handle search for destination
  useEffect(() => {
    ws.current = new WebSocket(`wss://${wsUrl}/ws/agent1/${user?.user_id}`);

    ws.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.current.onmessage = (e) => {
      const data = e.data;
      try {
        const parsedData = JSON.parse(data);
        console.log(parsedData);
        if (parsedData.event === "caution") {
          Speech.speak(
            "Đoạn đường sắp tới có thể bị kẹt xe, bạn có muốn đổi tuyến đường không?",
            { language: "vi" }
          );
        }

        if (parsedData.event === "route_data") {
          setIsLoadingRoute(true);
        
          // Lấy danh sách tọa độ gốc
          const originalCoordinates: Coordinate[] =
            parsedData.data.routes[0].geometry.coordinates.map(
              (coord: [number, number]) => ({
                latitude: coord[1],
                longitude: coord[0],
              })
            );
        
          // Tạo danh sách tọa độ với các điểm nội suy
          const interpolatedCoordinates: Coordinate[] = [];
          for (let i = 0; i < originalCoordinates.length - 1; i++) {
            const start = originalCoordinates[i];
            const end = originalCoordinates[i + 1];
        
            // Thêm điểm gốc
            interpolatedCoordinates.push(start);
        
            // Thêm 10 điểm nội suy
            const interpolatedPoints = interpolatePoints(start, end, 10);
            interpolatedCoordinates.push(...interpolatedPoints);
          }
        
          // Thêm điểm cuối cùng
          interpolatedCoordinates.push(originalCoordinates[originalCoordinates.length - 1]);
        
          // Cập nhật routeCoordinates
          setRouteCoordinates(interpolatedCoordinates);
          setIsLoadingRoute(false);
        
          Speech.speak("Tôi đã thay đổi tuyến đường cho bạn rồi!", {
            language: "vi",
          });
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
        // console.log(
        //   `Gửi vị trí: ${startLocation.latitude}, ${startLocation.longitude}`,
        // );
      } catch (error) {
        console.error("Error sending location", error);
      }
    }
  };

  // Thêm useEffect để theo dõi thay đổi routeCoordinates
  useEffect(() => {
    if (routeCoordinates.length > 0) {
      console.log("Updated:", routeCoordinates);
      setIsFocusing(true);
      // Code cập nhật bản đồ (nếu cần)
    }
  }, [routeCoordinates]);

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
        await sendMessage(text || "Hi");
        setIsLoading(false);
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
      const apiUrl = `${process.env.EXPO_PUBLIC_CHATBOT_URL}/speech-to-text`; // Thay đổi URL cho phù hợp

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
  /***
   * - User: Bạn hãy giúp tôi tạo đường đi từ vị trí hiện tại đến chợ Võ Thành Trang
  - Chatbot: Có phải bạn muốn đến chợ Võ Thành Trang ở địa chỉ 15 đường Trường Chinh, Phường 13, Tân Bình, Hồ Chí Minh, Việt Nam không?
  - User: Đúng vậy
  - Chatbot: Tôi vừa tạo đường đi cho bạn! Nếu có thêm yêu cầu nào, bạn hãy gọi cho tôi để hỗ trợ bạn.
  
  - User: Có, bạn hãy đổi cho tôi
  - Chatbot: Tôi vừa cho bạn một tuyến đường mới đi qua đường Phạm Phú Thứ để tránh kẹt xe! Nếu bạn cần giúp đỡ thêm hãy nói cho tôi biết.
   */

  const sendMessage = async (text?: string) => {
    const messageText = text?.trim();
    if (messageText) {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_CHATBOT_URL}/chat/agent/1`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: messageText,
            }),
          }
        );
        console.log("Payload being sent:", {
          query: messageText,
        });
        if (!response.ok) {
          console.log(`HTTP error! status: ${response.status}`);
          throw new Error("Failed to fetch response from API");
        }

        const data = await response.json();
        console.log("API response:", data);

        if (data.response) {
          Speech.speak(data.response, { language: "vi" });
        } else {
          console.log("No response text available.");
        }
      } catch (e) {
        console.error("Error in sendMessage:", e);
      }
    } else {
      console.log("Message text is empty or undefined.");
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
            const { latitude, longitude, heading } = newLocation.coords;
            const currentLocation: BasicCoordinate = { latitude, longitude };
  
            // Cập nhật route coordinates dựa trên vị trí hiện tại
            setRouteCoordinates((prevRouteCoordinates) => {
              if (prevRouteCoordinates.length > 1) {
                const nearestIndex = findNearestPointIndex(currentLocation, prevRouteCoordinates);
                
                if (nearestIndex !== -1) {
                  // Chỉ giữ lại các điểm sau điểm gần nhất
                  return prevRouteCoordinates.slice(nearestIndex + 1);
                }
              }
              return prevRouteCoordinates;
            });
  
            // // Xử lý camera animation nếu đang trong chế độ focus
            // if (isFocusing && mapRef.current) {
            //   mapRef.current.animateCamera(
            //     {
            //       center: { latitude, longitude },
            //       heading: heading || 0,
            //       pitch: 60,
            //       zoom: 18,
            //     },
            //     { duration: 500 }
            //   );
            // }
          }
        );
      } catch (error) {
        console.error("Error starting location tracking:", error);
        Alert.alert("Error", "Could not start location tracking.");
      }
    };
  
    if (isFocusing) {
      startTracking();
    } else {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (mapRef.current) {
        mapRef.current.animateCamera(
          { pitch: 0, heading: 0 },
          { duration: 500 }
        );
      }
    }
  
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isFocusing, routeCoordinates]);
  

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

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (routeCoordinates.length > 0) {
      // Initialize time and distance when a route is set
      setTimeLeft(1200); // 20 minutes
      setDistanceLeft(5300); // 5.3 km

      // Start the timer to decrement time and distance every second
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 0.7;
        });

        setDistanceLeft((prevDistance) => {
          const decrement = 5300 / 1200; // Approximately 4.42 meters per second
          if (prevDistance <= 0) {
            return 0;
          }
          return Math.max(prevDistance - decrement, 0);
        });
      }, 1000); // 1000ms = 1 second
    }

    // Cleanup the timer when the component unmounts or routeCoordinates change
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [routeCoordinates]);

  // Format time as "X mins Y secs"
  const formattedTimeLeft =
    timeLeft > 0
      ? `${Math.floor(timeLeft / 60)} mins`
      : "Arrived";

  // Format distance as "X.X km"
  const formattedDistance =
    distanceLeft > 0 ? `${(distanceLeft / 1000).toFixed(1)} km` : "0.0 km";

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

  const fixedTimeLeft = "20 mins";
  const fixedDistance = "5.3 km";

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
        {routeCoordinates.length > 0 && (
          <View className="flex-row justify-center">
            <RouteInfo
            timeLeftSeconds={timeLeft}
            distanceLeftMeters={distanceLeft}
          />
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
