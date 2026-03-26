/**
 * Coordinates Type
 * Represents a geographic location on the map
 */

export interface Coordinates {
  latitude: number; // Range: -90 to 90
  longitude: number; // Range: -180 to 180
}

/**
 * Validates coordinate values
 * @param latitude - Latitude value to validate
 * @param longitude - Longitude value to validate
 * @returns true if coordinates are valid, false otherwise
 */
export function isValidCoordinates(
  latitude: number,
  longitude: number,
): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Validates a Coordinates object
 * @param coords - Coordinates object to validate
 * @returns true if coordinates object is valid, false otherwise
 */
export function validateCoordinates(coords: any): coords is Coordinates {
  return (
    coords !== null &&
    typeof coords === "object" &&
    "latitude" in coords &&
    "longitude" in coords &&
    isValidCoordinates(coords.latitude, coords.longitude)
  );
}
