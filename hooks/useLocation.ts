// hooks/useLocation.ts
import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { Coordinate } from "./useMapbox";

export const useLocation = () => {
  const [startLocation, setStartLocation] = useState<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setStartLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          name: "Current Location",
        });
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("An error occurred while fetching location.");
        Alert.alert("Error", "An error occurred while fetching location.");
      }
    })();
  }, []);

  return { startLocation, setStartLocation, errorMsg };
};
