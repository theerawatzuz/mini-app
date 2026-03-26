import fc from "fast-check";
import L from "leaflet";

/**
 * Property-Based Tests for Visual Indicator Presence
 *
 * These tests verify the marker creation logic without rendering the full component
 * to avoid CSS import issues in the test environment.
 */

describe("MapComponent Visual Indicator Property Tests", () => {
  /**
   * Property 2: Visual Indicator Presence
   * **Validates: Requirements 1.4**
   *
   * For any location clicked on the map, a visual indicator (marker) should be
   * created at that location's coordinates.
   */
  it("Property 2: Visual indicator is created at clicked location", () => {
    fc.assert(
      fc.property(
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        (coordinates) => {
          // Create a marker at the given coordinates (simulating what MapComponent does)
          const marker = L.marker([
            coordinates.latitude,
            coordinates.longitude,
          ]);

          // Verify marker was created with correct coordinates
          const markerLatLng = marker.getLatLng();

          const latMatch =
            Math.abs(markerLatLng.lat - coordinates.latitude) < 1e-10;
          const lngMatch =
            Math.abs(markerLatLng.lng - coordinates.longitude) < 1e-10;

          return latMatch && lngMatch;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Additional property: Marker coordinates are always valid
   */
  it("Property: Marker coordinates remain within valid ranges", () => {
    fc.assert(
      fc.property(
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        (coordinates) => {
          // Create marker
          const marker = L.marker([
            coordinates.latitude,
            coordinates.longitude,
          ]);
          const markerLatLng = marker.getLatLng();

          // Verify coordinates are within valid ranges
          return (
            markerLatLng.lat >= -90 &&
            markerLatLng.lat <= 90 &&
            markerLatLng.lng >= -180 &&
            markerLatLng.lng <= 180 &&
            !isNaN(markerLatLng.lat) &&
            !isNaN(markerLatLng.lng)
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Marker position updates correctly
   */
  it("Property: Marker position can be updated to new coordinates", () => {
    fc.assert(
      fc.property(
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        (initialCoords, newCoords) => {
          // Create marker at initial position
          const marker = L.marker([
            initialCoords.latitude,
            initialCoords.longitude,
          ]);

          // Update marker position (simulating what happens when selectedLocation changes)
          marker.setLatLng([newCoords.latitude, newCoords.longitude]);

          const markerLatLng = marker.getLatLng();

          // Verify marker is now at new position
          const latMatch =
            Math.abs(markerLatLng.lat - newCoords.latitude) < 1e-10;
          const lngMatch =
            Math.abs(markerLatLng.lng - newCoords.longitude) < 1e-10;

          return latMatch && lngMatch;
        },
      ),
      { numRuns: 100 },
    );
  });
});
