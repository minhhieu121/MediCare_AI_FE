// hooks/useMapbox.ts
import { useState } from "react";
import { Alert } from "react-native";

export interface Coordinate {
  latitude: number;
  longitude: number;
  name: string;
}

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address: string;
}

interface UseMapboxProps {
  accessToken: string;
}

export const useMapbox = ({ accessToken }: UseMapboxProps) => {
  const [sessionToken, setSessionToken] = useState<string>(generateUUID());

  // Function to generate a UUID for session tokens
  function generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Handle search for destination suggestions.
   * @param query The search query input by the user.
   * @returns A promise that resolves to an array of suggestions.
   */
  const handleSearch = async (query: string): Promise<Suggestion[]> => {
    if (!query.trim()) {
      console.log("Search query is empty. Skipping API call.");
      return [];
    }
    try {
      console.log(`Fetching suggestions for: "${query}"`);
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          query,
        )}&language=en&country=vn&access_token=${accessToken}&session_token=${sessionToken}`,
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      // Assuming data.suggestions is an array of Suggestion
      return data.suggestions;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      Alert.alert("Error", "Could not fetch suggestions.");
      return [];
    }
  };

  /**
   * Handle search for midpoint suggestions.
   * @param query The midpoint search query input by the user.
   * @returns A promise that resolves to an array of midpoint suggestions.
   */
  const handleSearchMid = async (query: string): Promise<Suggestion[]> => {
    if (!query.trim()) {
      console.log("Midpoint search query is empty. Skipping API call.");
      return [];
    }
    try {
      console.log(`Fetching midpoint suggestions for: "${query}"`);
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          query,
        )}&language=en&country=vn&access_token=${accessToken}&session_token=${sessionToken}`,
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      // Assuming data.suggestions is an array of Suggestion
      return data.suggestions;
    } catch (error) {
      console.error("Error fetching midpoint suggestions:", error);
      Alert.alert("Error", "Could not fetch midpoint suggestions.");
      return [];
    }
  };

  /**
   * Handle selection of a destination suggestion.
   * @param mapboxId The unique identifier for the selected place.
   * @returns A promise that resolves to the coordinates of the selected destination.
   */
  const handleSelectSuggestion = async (
    mapboxId: string,
  ): Promise<Coordinate | null> => {
    try {
      console.log(`Retrieving place details for ID: ${mapboxId}`);
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
          mapboxId,
        )}?access_token=${accessToken}&session_token=${sessionToken}`,
      );
      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        throw new Error("No features found in the response.");
      }
      const feature = data.features[0];
      const { coordinates } = feature.geometry;
      // Generate a new session token after selection to ensure uniqueness
      setSessionToken(generateUUID());
      return {
        latitude: coordinates[1],
        longitude: coordinates[0],
        name: feature.properties.name,
      };
    } catch (error) {
      console.error("Error retrieving place details:", error);
      Alert.alert("Error", "Could not retrieve place details.");
      return null;
    }
  };

  /**
   * Handle selection of a midpoint suggestion.
   * @param mapboxId The unique identifier for the selected midpoint.
   * @returns A promise that resolves to the coordinates of the selected midpoint.
   */
  const handleSelectMidSuggestion = async (
    mapboxId: string,
  ): Promise<Coordinate | null> => {
    try {
      console.log(`Retrieving midpoint place details for ID: ${mapboxId}`);
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
          mapboxId,
        )}?access_token=${accessToken}&session_token=${sessionToken}`,
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        throw new Error("No features found in the response.");
      }
      const feature = data.features[0];
      const { coordinates } = feature.geometry;
      // Generate a new session token after selection to ensure uniqueness
      setSessionToken(generateUUID());
      return {
        latitude: coordinates[1],
        longitude: coordinates[0],
        name: feature.properties.name,
      };
    } catch (error) {
      console.error("Error retrieving midpoint place details:", error);
      Alert.alert("Error", "Could not retrieve midpoint place details.");
      return null;
    }
  };

  /**
   * Handle fetching the route from start location through midpoints to destination.
   * @param startLocation The user's current location.
   * @param destination The selected destination coordinates.
   * @param midPoints An array of selected midpoint coordinates.
   * @returns A promise that resolves to an array of coordinates representing the route.
   */
  const handleShowRoute = async (
    startLocation: Coordinate,
    destination: Coordinate,
    midPoints: Coordinate[],
  ): Promise<Coordinate[]> => {
    if (!startLocation || !destination) {
      Alert.alert("Error", "Start location or destination is not set.");
      return [];
    }
    try {
      console.log("Fetching route...");
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
      }?geometries=geojson&steps=true&overview=full&access_token=${accessToken}`;

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
        return coordinates;
      } else {
        Alert.alert("Error", "No routes found.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Could not fetch route.");
      return [];
    }
  };

  return {
    handleSearch,
    handleSearchMid,
    handleSelectSuggestion,
    handleSelectMidSuggestion,
    handleShowRoute,
  };
};
