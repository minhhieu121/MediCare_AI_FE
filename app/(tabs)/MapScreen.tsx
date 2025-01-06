import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Button,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

// Hàm tạo UUID ngẫu nhiên
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibWluaGhpZXUxMSIsImEiOiJjbTU4OWdkaXA0MXg3Mmtwa2ZnMXBnbGpvIn0.VcU6Q0FhEgmHMIjSHhu2gA";

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [startLocation, setStartLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sessionToken, setSessionToken] = useState(generateUUID());
  const [destination, setDestination] = useState(null);


  const [searchMidQuery, setSearchMidQuery] = useState("")
  const [midSuggestions, setMidSuggestions] = useState([]);

  const [midPoints, setMidPoints] = useState<Coordinate[]>([]);

  const [isFocusing, setIsFocusing] = useState(false);



  const debugCount = useRef(0);

  const mapRef = useRef(null);

  const calculateDistance2D = (point1: Coordinate, point2: Coordinate) => {
    return Math.sqrt(
      Math.pow(point2.latitude - point1.latitude, 2) +
      Math.pow(point2.longitude - point1.longitude, 2)
    );
  };

  const findNearestPointIndex = (currentLocation: Coordinate, route: Coordinate[]) => {
    let nearestIndex = -1;
    let minDistance = Infinity;

    // Lặp qua 10 điểm đầu tiên của route
    route.slice(0, 20).forEach((point, index) => {
      const distance = calculateDistance2D(currentLocation, point);

      if (distance < minDistance && distance < 0.0001) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    console.log("Nearest index:", nearestIndex, "Min distance:", minDistance);
    return nearestIndex; // Trả về -1 nếu không tìm được điểm nào thỏa mãn
  };

  const interpolateCoordinates = (point1, point2, numPoints) => {
    const points = [];
    for (let i = 1; i <= numPoints; i++) {
      const fraction = i / (numPoints + 1);
      const lat = point1.latitude + (point2.latitude - point1.latitude) * fraction;
      const lon = point1.longitude + (point2.longitude - point1.longitude) * fraction;
      points.push({ latitude: lat, longitude: lon });
    }
    return points;
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        debugCount.current = debugCount.current + 1;
        console.log(debugCount);

        let currentLocation = await Location.getCurrentPositionAsync({});
        setStartLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 0, timeInterval: 500 },
          (newLocation) => {
            const { latitude, longitude, accuracy } = newLocation.coords;

            // if (accuracy > 10) return; // Bỏ qua nếu sai số lớn

            const currentLocation = { latitude, longitude };
            setStartLocation(currentLocation);

            setRouteCoordinates((prevRouteCoordinates) => {
              if (prevRouteCoordinates.length > 1) {
                const nearestIndex = findNearestPointIndex(currentLocation, prevRouteCoordinates);

                if (nearestIndex !== -1 && nearestIndex < prevRouteCoordinates.length - 1) {
                  const nearest = prevRouteCoordinates[nearestIndex];
                  const next = prevRouteCoordinates[nearestIndex + 1];
                  const distance = calculateDistance2D(nearest, next);

                  console.log("Distance between nearest and next:", distance);

                  if (distance < 0.0001) {
                    // Khoảng cách nhỏ, slice từ nearest + 1
                    console.log("Slicing from nearest + 1");
                    return prevRouteCoordinates.slice(nearestIndex + 1);
                  } else {
                    // Khoảng cách lớn, thêm 5 điểm nội suy
                    console.log("Adding interpolated points");
                    const interpolatedPoints = interpolateCoordinates(nearest, next, 10);

                    // Gộp các điểm nội suy vào danh sách và slice từ điểm đầu tiên của nội suy
                    const updatedRoute = [
                      ...prevRouteCoordinates.slice(0, nearestIndex + 1),
                      ...interpolatedPoints,
                      ...prevRouteCoordinates.slice(nearestIndex + 1),
                    ];

                    console.log("Updated route with interpolated points:", updatedRoute);

                    // Slice từ điểm đầu tiên của nhóm nội suy
                    return updatedRoute.slice(nearestIndex + 1);
                  }
                }
              }
              return prevRouteCoordinates;
            });

            // setRouteCoordinates((prevRouteCoordinates) => {
            //   if (prevRouteCoordinates.length > 0) {
            //     const nearestIndex = findNearestPointIndex(currentLocation, prevRouteCoordinates);

            //     if (nearestIndex !== -1) {
            //       // Chỉ slice nếu tìm được điểm gần nhất với khoảng cách < 10m
            //       console.log("Update route: Slicing from index", nearestIndex);
            //       return prevRouteCoordinates.slice(nearestIndex + 1);
            //     }
            //   }
            //   return prevRouteCoordinates;
            // });

            // if (mapRef.current) {
            //   mapRef.current.animateToRegion(
            //     {
            //       latitude,
            //       longitude,
            //       latitudeDelta: 0.01,
            //       longitudeDelta: 0.01,
            //     },
            //     1000
            //   );
            // }
          }
        );
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("An error occurred while fetching location.");
      }
    })();
  }, []);

  useEffect(() => {
    let locationSubscription;

    const startTracking = async () => {
      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1, timeInterval: 1000 },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;

          setStartLocation({ latitude, longitude });

          if (isFocusing && routeCoordinates.length > 1) {
            const firstPoint = routeCoordinates[0];
            const secondPoint = routeCoordinates[1];

            // Tính toán hướng của bản đồ từ điểm 0 đến điểm 1
            const bearing = Math.atan2(
              secondPoint.longitude - firstPoint.longitude,
              secondPoint.latitude - firstPoint.latitude
            ) * (180 / Math.PI);

            // Tính toán vị trí "center" dịch xuống theo hướng nhìn
            const offsetDistance = -0.001; // Khoảng cách cần dịch (đơn vị: độ)
            const adjustedCenter = {
              latitude: startLocation.latitude - offsetDistance * Math.cos((bearing * Math.PI) / 180),
              longitude: startLocation.longitude - offsetDistance * Math.sin((bearing * Math.PI) / 180),
            };

            // Cập nhật camera
            if (mapRef.current) {
              mapRef.current.animateCamera(
                {
                  center: adjustedCenter, // Vị trí được điều chỉnh
                  heading: bearing, // Hướng bản đồ
                  pitch: 60, // Góc nghiêng bản đồ
                  zoom: 18, // Độ zoom
                },
                { duration: 500 } // Thời gian di chuyển camera (ms)
              );
            }
          }
        }
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
            pitch: 0, // Góc nghiêng bản đồ
          },
          { duration: 500 } // Thời gian di chuyển camera (ms)
        );
      }
    }


    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isFocusing, routeCoordinates]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a search query.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          searchQuery
        )}&access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`
      );
      const data = await response.json();
      console.log(data)
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      Alert.alert("Error", "Could not fetch suggestions.");
    }
  };

  const handleSearchMid = async () => {
    if (!searchMidQuery.trim()) {
      Alert.alert("Error", "Please enter a search mid query.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          searchMidQuery
        )}&access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`
      );
      const data = await response.json();
      console.log(data)
      setMidSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      Alert.alert("Error", "Could not fetch suggestions.");
    }
  };

  const handleSelectSuggestion = async (mapboxId) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`
      );
      const data = await response.json();
      const feature = data.features[0];
      const { coordinates } = feature.geometry;

      setDestination({ latitude: coordinates[1], longitude: coordinates[0] });
      setRouteCoordinates([]);
      setSuggestions([]);
      setSearchQuery("");
      setSessionToken(generateUUID()); // Tạo session token mới
    } catch (error) {
      console.error("Error retrieving place details:", error);
      Alert.alert("Error", "Could not retrieve place details.");
    }
  };

  const handleSelectMidSuggestion = async (mapboxId) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`
      );
      const data = await response.json();
      const feature = data.features[0];
      const { coordinates } = feature.geometry;

      setMidPoints((prevMidPoints) => [
        ...prevMidPoints,
        { latitude: coordinates[1], longitude: coordinates[0] },
      ]);
      setMidSuggestions([]);
      setSearchMidQuery("");
      console.log("do dai mid " + midPoints.length)
      setSessionToken(generateUUID()); // Tạo session token mới
    } catch (error) {
      console.error("Error retrieving place details:", error);
      Alert.alert("Error", "Could not retrieve place details.");
    }
  };

  const handleShowRoute = async () => {
    if (!startLocation || !destination) {
      Alert.alert("Error", "Current location or destination is not set.");
      return;
    }

    try {
      // Tạo chuỗi các điểm trung gian cho API Mapbox
      const midPointsString = midPoints
        .map((point) => `${point.longitude},${point.latitude}`)
        .join(";");

      // Xây dựng URL với các điểm trung gian
      const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLocation.longitude},${startLocation.latitude};${midPointsString}${destination.longitude},${destination.latitude}?geometries=geojson&steps=true&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(routeUrl);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Could not fetch route.");
    }
  };

  // const handleFocus = () => {
  //   if (!routeCoordinates || routeCoordinates.length < 2) {
  //     Alert.alert("Error", "Route must have at least two points to focus.");
  //     return;
  //   }

  //   const firstPoint = routeCoordinates[0];
  //   const secondPoint = routeCoordinates[1];

  //   // Tính toán hướng của bản đồ từ điểm 0 đến điểm 1
  //   const bearing = Math.atan2(
  //     secondPoint.longitude - firstPoint.longitude,
  //     secondPoint.latitude - firstPoint.latitude
  //   ) * (180 / Math.PI);

  //   if (mapRef.current) {
  //     mapRef.current.animateCamera(
  //       {
  //         center: {
  //           latitude: startLocation.latitude,
  //           longitude: startLocation.longitude,
  //         },
  //         heading: bearing, // Hướng của bản đồ
  //         pitch: 0, // Góc nghiêng bản đồ
  //         zoom: 15, // Độ zoom
  //       },
  //       { duration: 1000 } // Thời gian di chuyển camera (ms)
  //     );
  //   }
  // };
  const handleFocus = () => {
    setIsFocusing((prev) => !prev); // Chuyển đổi trạng thái Focus
  };

  if (!startLocation) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg || "Loading current location..."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
        />
        <Button title="Search" onPress={handleSearch} />
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.mapbox_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(item.mapbox_id)}
            >
              <Text>{item.name}</Text>
              <Text style={styles.suggestionAddress}>{item.full_address}</Text>
            </TouchableOpacity>
          )}
        />


        <TextInput
          placeholder="Search middle location..."
          value={searchMidQuery}
          onChangeText={setSearchMidQuery}
          style={styles.input}
        />
        <Button title="Search" onPress={handleSearchMid} />
        <FlatList
          data={midSuggestions}
          keyExtractor={(item) => item.mapbox_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelectMidSuggestion(item.mapbox_id)}
            >
              <Text>{item.name}</Text>
              <Text style={styles.suggestionAddress}>{item.full_address}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
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
            pinColor="blue" // Marker màu xanh biển
            title={`Midpoint ${index + 1}`} // Hiển thị số thứ tự
          />
        ))}


        {routeCoordinates.length > 0 && (
          <>
            {/* Polyline để hiển thị tuyến đường */}
            <Polyline coordinates={routeCoordinates} strokeWidth={3} strokeColor="blue" />

            {/* Thêm các Marker cho từng tọa độ trong routeCoordinates */}
            {/* {routeCoordinates.map((coordinate, index) => (
              <Marker
                key={`route-coordinate-${index}`}
                coordinate={coordinate}
                pinColor="red" // Màu đỏ cho Marker
                title={`Point ${index + 1}`}
              />
            ))} */}
          </>
        )}
      </MapView>
      <View className="mb-24">
      <Button title="Show Route" onPress={handleShowRoute} />
      <Button title={isFocusing ? "Focussing" : "Focus"} onPress={handleFocus} />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 20,
    left: 10,
    right: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  suggestionAddress: {
    color: "#777",
  },
  map: {
    flex: 1,
  },
});