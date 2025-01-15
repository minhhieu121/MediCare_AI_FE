// components/MapComponent.tsx
import React, { forwardRef } from "react";
import MapView, { Marker, Polyline, MapViewProps } from "react-native-maps";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface MapComponentProps extends MapViewProps {
  destination: Coordinate | null;
  midPoints: Coordinate[];
  routeCoordinates: Coordinate[];
}

const MapComponent = forwardRef<MapView, MapComponentProps>(
  ({ destination, midPoints, routeCoordinates, ...mapProps }, ref) => {
    return (
      <MapView
        ref={ref} // Forwarded ref
        style={{ flex: 1 }}
        {...mapProps}
      >
        {destination && <Marker coordinate={destination} title="Destination" />}

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
    );
  },
);

export default MapComponent;
