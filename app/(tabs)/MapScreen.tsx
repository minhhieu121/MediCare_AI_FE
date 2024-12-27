import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Button,
  TextInput,
  Text,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { ThemedView } from "@/components/ThemedView";

const GOOGLE_MAPS_APIKEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE"; // Thay thế bằng API Key của bạn

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [destinationInput, setDestinationInput] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          console.log("Permission to access location was denied");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        console.log("Current Location:", currentLocation);
        setLocation(currentLocation.coords);
        setOrigin({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("An error occurred while fetching location.");
      }
    })();
  }, []);

  const handleGetDirections = async () => {
    if (!destinationInput) {
      Alert.alert("Error", "Please enter a destination address.");
      return;
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      destinationInput
    )}&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === "OK") {
        const destCoordinates: Coordinate = {
          latitude: data.results[0].geometry.location.lat,
          longitude: data.results[0].geometry.location.lng,
        };
        setDestination(destCoordinates);
      } else {
        Alert.alert("Error", "Không tìm thấy địa chỉ. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Đã xảy ra lỗi khi tìm địa chỉ.");
    }
  };

  if (!location) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          {errorMsg ? <Text>{errorMsg}</Text> : <Text>Loading...</Text>}
        </View>
      </ThemedView>
    );
  }

  const initialRegion: Region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <ThemedView className="flex-1 items-center justify-center">
      <ThemedView className="absolute z-10 top-16 w-11/12 bg-white rounded-lg p-2.5 flex-row items-center shadow-lg">
        <TextInput
          className="flex-1 p-2 border border-gray-300 rounded-md mr-2.5 w-auto"
          placeholder="Search here"
          value={destinationInput}
          onChangeText={setDestinationInput}
        />
        <Button title="Go" onPress={handleGetDirections} />
      </ThemedView>
      <MapView
        // provider={PROVIDER_GOOGLE} // Sử dụng Google Maps
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {origin && <Marker coordinate={origin} title="Origin" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="hotpink"
            onError={(errorMessage: string) => {
              console.log("Error in MapViewDirections:", errorMessage);
            }}
          />
        )}
      </MapView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  input: {
    flex: 1,
    padding: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
