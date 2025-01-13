// MapScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
} from "react-native";
import MapView, { Marker, Polyline, Camera } from "react-native-maps";
import * as Location from "expo-location";
import { debounce } from "lodash";
import SearchBar from "@/components/SearchBar"; // Adjust the path as necessary
import { KeyboardAvoidingView } from "react-native";
import * as sea from "node:sea";

const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoibWluaGhpZXUxMSIsImEiOiJjbTU4OWdkaXA0MXg3Mmtwa2ZnMXBnbGpvIn0.VcU6Q0FhEgmHMIjSHhu2gA";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address: string;
}

export default function MapScreen() {
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [startLocation, setStartLocation] = useState<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sessionToken, setSessionToken] = useState<string>(generateUUID());
  const [destination, setDestination] = useState<Coordinate | null>(null);

  const [searchMidQuery, setSearchMidQuery] = useState<string>("");
  const [midSuggestions, setMidSuggestions] = useState<Suggestion[]>([]);

  const [midPoints, setMidPoints] = useState<Coordinate[]>([]);

  const [isFocusing, setIsFocusing] = useState<boolean>(false);

  const debugCount = useRef<number>(0);

  const mapRef = useRef<MapView | null>(null);

  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState<boolean>(false);
  const [isLoadingMidSuggestions, setIsLoadingMidSuggestions] =
    useState<boolean>(false);

  const fadeAnimDestination = useRef(new Animated.Value(0)).current;
  const fadeAnimMid = useRef(new Animated.Value(0)).current;

  const calculateDistance2D = (
    point1: Coordinate,
    point2: Coordinate,
  ): number => {
    return Math.sqrt(
      Math.pow(point2.latitude - point1.latitude, 2) +
        Math.pow(point2.longitude - point1.longitude, 2),
    );
  };

  const findNearestPointIndex = (
    currentLocation: Coordinate,
    route: Coordinate[],
  ): number => {
    let nearestIndex = -1;
    let minDistance = Infinity;

    // Iterate through the first 20 points
    route.slice(0, 20).forEach((point, index) => {
      const distance = calculateDistance2D(currentLocation, point);

      if (distance < minDistance && distance < 0.0001) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    console.log("Nearest index:", nearestIndex, "Min distance:", minDistance);
    return nearestIndex; // Returns -1 if no point satisfies
  };

  const interpolateCoordinates = (
    point1: Coordinate,
    point2: Coordinate,
    numPoints: number,
  ): Coordinate[] => {
    const points: Coordinate[] = [];
    for (let i = 1; i <= numPoints; i++) {
      const fraction = i / (numPoints + 1);
      const lat =
        point1.latitude + (point2.latitude - point1.latitude) * fraction;
      const lon =
        point1.longitude + (point2.longitude - point1.longitude) * fraction;
      points.push({ latitude: lat, longitude: lon });
    }
    return points;
  };

  // Fetch current location and watch position
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        debugCount.current = debugCount.current + 1;
        console.log("Location permission granted. Count:", debugCount.current);

        let currentLocation = await Location.getCurrentPositionAsync({});
        setStartLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 0,
            timeInterval: 500,
          },
          (newLocation) => {
            const { latitude, longitude, accuracy } = newLocation.coords;

            // if (accuracy > 10) return; // Skip if accuracy is poor

            const currentLocation: Coordinate = { latitude, longitude };
            setStartLocation(currentLocation);

            setRouteCoordinates((prevRouteCoordinates) => {
              if (prevRouteCoordinates.length > 1) {
                const nearestIndex = findNearestPointIndex(
                  currentLocation,
                  prevRouteCoordinates,
                );

                if (
                  nearestIndex !== -1 &&
                  nearestIndex < prevRouteCoordinates.length - 1
                ) {
                  const nearest = prevRouteCoordinates[nearestIndex];
                  const next = prevRouteCoordinates[nearestIndex + 1];
                  const distance = calculateDistance2D(nearest, next);

                  console.log("Distance between nearest and next:", distance);

                  if (distance < 0.0001) {
                    // Small distance, slice from nearest + 1
                    console.log("Slicing from nearest + 1");
                    return prevRouteCoordinates.slice(nearestIndex + 1);
                  } else {
                    // Large distance, add 10 interpolated points
                    console.log("Adding interpolated points");
                    const interpolatedPoints = interpolateCoordinates(
                      nearest,
                      next,
                      10,
                    );

                    // Merge interpolated points and slice from the first interpolated point
                    const updatedRoute = [
                      ...prevRouteCoordinates.slice(0, nearestIndex + 1),
                      ...interpolatedPoints,
                      ...prevRouteCoordinates.slice(nearestIndex + 1),
                    ];

                    console.log(
                      "Updated route with interpolated points:",
                      updatedRoute,
                    );

                    // Slice from the first interpolated point
                    return updatedRoute.slice(nearestIndex + 1);
                  }
                }
              }
              return prevRouteCoordinates;
            });

            // Optional: Animate map region
            /*
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            }
            */
          },
        );
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("An error occurred while fetching location.");
      }
    })();
  }, []);

  // Handle focus state and animate camera
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;

          setStartLocation({ latitude, longitude });

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
                latitude - offsetDistance * Math.cos((bearing * Math.PI) / 180),
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
  }, [isFocusing, routeCoordinates]);

  // Debounced search handlers with parameters
  const debouncedHandleSearch = useRef(
    debounce((query: string) => {
      handleSearch(query);
    }, 300), // Adjust debounce delay as needed
  ).current;

  const debouncedHandleSearchMid = useRef(
    debounce((query: string) => {
      handleSearchMid(query);
    }, 300), // Adjust debounce delay as needed
  ).current;

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedHandleSearch(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchMidQuery.trim()) {
      debouncedHandleSearchMid(searchMidQuery);
    } else {
      setMidSuggestions([]);
    }
  }, [searchMidQuery]);

  // Handle search for destination
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      console.log("Search query is empty. Skipping API call.");
      setSuggestions([]);
      return;
    }
    try {
      setIsLoadingSuggestions(true);
      console.log(`Fetching suggestions for: "${query}"`);
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          query,
        )}&language=en&country=vn&access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`,
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      // Parse the data to match your Suggestion interface
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      Alert.alert("Error", "Could not fetch suggestions.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle search for midpoints
  const handleSearchMid = async (query: string) => {
    if (!query.trim()) {
      console.log("Midpoint search query is empty. Skipping API call.");
      setMidSuggestions([]);
      return;
    }
    try {
      setIsLoadingMidSuggestions(true);
      console.log(`Fetching midpoint suggestions for: "${query}"`);
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          query,
        )}&language=en&country=vn&access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`,
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      // Parse the data to match your Suggestion interface
      setMidSuggestions(data.suggestions);
      console.log(midSuggestions);
    } catch (error) {
      console.error("Error fetching midpoint suggestions:", error);
      Alert.alert("Error", "Could not fetch midpoint suggestions.");
    } finally {
      setIsLoadingMidSuggestions(false);
    }
  };

  // Handle selection of destination suggestion
  const handleSelectSuggestion = async (mapboxId: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`,
      );
      const data = await response.json();
      const feature = data.features[0];
      const { coordinates } = feature.geometry;

      setDestination({ latitude: coordinates[1], longitude: coordinates[0] });
      setRouteCoordinates([]);
      setSearchQuery(data.features[0].properties.name);
      setSuggestions([]);
      setSessionToken(generateUUID()); // Generate new session token
      Keyboard.dismiss(); // Dismiss keyboard after selection
    } catch (error) {
      console.error("Error retrieving place details:", error);
      Alert.alert("Error", "Could not retrieve place details.");
    }
  };

  // Handle selection of midpoint suggestion
  const handleSelectMidSuggestion = async (mapboxId: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          mapboxId,
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`,
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      const feature = data.features[0];
      const { coordinates } = feature.geometry;

      setMidPoints((prevMidPoints) => [
        ...prevMidPoints,
        { latitude: coordinates[1], longitude: coordinates[0] },
      ]);
      setMidSuggestions([]);
      setSearchMidQuery("");
      console.log("Midpoints length: " + (midPoints.length + 1));
      setSessionToken(generateUUID()); // Generate new session token
      Keyboard.dismiss(); // Dismiss keyboard after selection
    } catch (error) {
      console.error("Error retrieving place details:", error);
      Alert.alert("Error", "Could not retrieve place details.");
    }
  };

  // Handle showing the route
  const handleShowRoute = async () => {
    if (!startLocation || !destination) {
      Alert.alert("Error", "Current location or destination is not set.");
      return;
    }

    try {
      setIsLoadingRoute(true);
      // Create a string of intermediate points for Mapbox API
      const midPointsString = midPoints
        .map((point) => `${point.longitude},${point.latitude}`)
        .join(";");

      // Check if there are midpoints to add semicolons
      const separator = midPoints.length > 0 ? ";" : "";

      // Build the URL with intermediate points
      const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${
        startLocation.longitude
      },${startLocation.latitude}${separator}${
        midPointsString ? midPointsString + ";" : ""
      }${destination.longitude},${
        destination.latitude
      }?geometries=geojson&steps=true&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;

      console.log(`Fetching route from: "${routeUrl}"`);
      const response = await fetch(routeUrl);
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates: Coordinate[] =
          data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => ({
              latitude: coord[1],
              longitude: coord[0],
            }),
          );
        setRouteCoordinates(coordinates);
      } else {
        Alert.alert("Error", "No routes found.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Could not fetch route.");
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Handle focusing the map
  const handleFocus = () => {
    setIsFocusing((prev) => !prev); // Toggle focus state
  };

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
  }, [suggestions, midSuggestions]);

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
            }}
            placeholder="Search destination..."
          />
          {isLoadingSuggestions && !destination ? (
            <ActivityIndicator className="mt-2" color="#4B5563" />
          ) : (
            suggestions.length > 0 &&
            searchQuery.trim() &&
            !destination && (
              <Animated.View style={{ opacity: fadeAnimDestination }}>
                <FlatList
                  data={suggestions.slice(0, 5)} // Limit to top 5 suggestions
                  keyExtractor={(item) => item.mapbox_id}
                  className="bg-white rounded-lg shadow-md max-h-60 mt-2"
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="px-4 py-2 border-b border-gray-200"
                      onPress={() => handleSelectSuggestion(item.mapbox_id)}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityLabel={`Select ${item.name}`}
                    >
                      <Text className="text-gray-800 font-semibold">
                        {item.name}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {item.full_address}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </Animated.View>
            )
          )}
        </View>

        {/* Midpoint Search Bar */}
        {destination && searchQuery.trim() && (
          <View className="absolute top-36 left-4 right-4 z-50">
            <SearchBar
              searchQuery={searchMidQuery}
              setSearchQuery={setSearchMidQuery}
              onClear={() => {
                setSearchMidQuery("");
                setMidSuggestions([]);
              }}
              placeholder="Add a midpoint..."
            />
            {isLoadingMidSuggestions ? (
              <ActivityIndicator className="mt-2" color="#4B5563" />
            ) : (
              midSuggestions.length > 0 && (
                <Animated.View style={{ opacity: fadeAnimMid }}>
                  <FlatList
                    data={midSuggestions.slice(0, 5)} // Limit to top 5 suggestions
                    keyExtractor={(item) => item.mapbox_id}
                    className="bg-white rounded-lg shadow-md max-h-60 mt-2"
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="px-4 py-2 border-b border-gray-200"
                        onPress={() =>
                          handleSelectMidSuggestion(item.mapbox_id)
                        }
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityLabel={`Select ${item.name}`}
                      >
                        <Text className="text-gray-800 font-semibold">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {item.full_address}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </Animated.View>
              )
            )}
          </View>
        )}

        {/* MapView */}
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: startLocation.latitude,
            longitude: startLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {destination && (
            <Marker coordinate={destination} title="Destination" />
          )}

          {midPoints.map((point, index) => (
            <Marker
              key={`midpoint-${index}`}
              coordinate={point}
              pinColor="blue" // Blue marker for midpoints
              title={`Midpoint ${index + 1}`}
            />
          ))}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={3}
              strokeColor="blue"
            />
          )}
        </MapView>

        {/* Bottom Buttons */}
        <View className="absolute bottom-32 left-4 right-4 flex-row justify-between">
          <TouchableOpacity
            onPress={handleShowRoute}
            className="flex-1 bg-green-500 rounded-lg p-3 mr-2 shadow"
            accessible={true}
            accessibilityLabel="Show Route"
          >
            {isLoadingRoute ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-center text-white font-psemibold">
                Show Route
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFocus}
            className="flex-1 bg-indigo-500 rounded-lg p-3 ml-2 shadow"
            accessible={true}
            accessibilityLabel="Toggle Focus"
          >
            <Text className="text-center text-white font-psemibold">
              {isFocusing ? "Focusing" : "Focus"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
