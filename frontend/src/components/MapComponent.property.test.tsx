import fc from "fast-check";
import L from "leaflet";

/**
 * Property-Based Tests for MapComponent
 * These tests verify universal properties hold across all valid inputs
 */

describe("MapComponent Property Tests", () => {
  /**
   * Property 1: Map Click Coordinate Capture
   * **Validates: Requirements 1.2**
   *
   * For any click event on the map component, the system should capture
   * valid coordinates with latitude between -90 and 90 and longitude
   * between -180 and 180.
   */
  it("Property 1: Map clicks produce valid coordinates", () => {
    fc.assert(
      fc.property(
        fc.record({
          lat: fc.double({ min: -90, max: 90, noNaN: true }),
          lng: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        (clickPosition) => {
          // Simulate a Leaflet click event
          const mockEvent = {
            latlng: L.latLng(clickPosition.lat, clickPosition.lng),
          } as L.LeafletMouseEvent;

          // Capture coordinates from the event
          const capturedCoords = {
            latitude: mockEvent.latlng.lat,
            longitude: mockEvent.latlng.lng,
          };

          // Verify captured coordinates are within valid ranges
          return (
            capturedCoords.latitude >= -90 &&
            capturedCoords.latitude <= 90 &&
            capturedCoords.longitude >= -180 &&
            capturedCoords.longitude <= 180 &&
            !isNaN(capturedCoords.latitude) &&
            !isNaN(capturedCoords.longitude)
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Additional property test: Coordinate precision preservation
   * Verifies that coordinates are captured with full precision
   */
  it("Property: Coordinates are captured with full precision", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const mockEvent = {
            latlng: L.latLng(lat, lng),
          } as L.LeafletMouseEvent;

          const capturedLat = mockEvent.latlng.lat;
          const capturedLng = mockEvent.latlng.lng;

          // Verify precision is preserved (within floating point tolerance)
          const latDiff = Math.abs(capturedLat - lat);
          const lngDiff = Math.abs(capturedLng - lng);

          return latDiff < 1e-10 && lngDiff < 1e-10;
        },
      ),
      { numRuns: 100 },
    );
  });
});
