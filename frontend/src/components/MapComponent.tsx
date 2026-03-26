import { useEffect, useRef } from "react";
import L from "leaflet";
import { Coordinates } from "../types/Coordinates";

// Note: Import 'leaflet/dist/leaflet.css' in your main App.tsx or index.tsx

// Fix for default marker icons in Leaflet with webpack/vite
import iconUrl from "leaflet/dist/images/marker-icon.png?url";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png?url";

const DefaultIcon = L.icon({
  iconUrl: iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  onLocationClick: (coordinates: Coordinates) => void;
  selectedLocation?: Coordinates;
}

export default function MapComponent({
  onLocationClick,
  selectedLocation,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map with world view (zoom level 2)
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Handle map clicks
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationClick({
        latitude: lat,
        longitude: lng,
      });
    });

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationClick]);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker if location is selected
    if (selectedLocation) {
      const marker = L.marker([
        selectedLocation.latitude,
        selectedLocation.longitude,
      ]).addTo(mapRef.current);

      markerRef.current = marker;
    }
  }, [selectedLocation]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
}
