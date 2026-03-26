/**
 * WeatherData Model
 * Represents current weather information for a location
 */

export interface WeatherData {
  locationName: string; // Human-readable location name
  temperature: number; // Temperature in Celsius
  humidity: number; // Humidity percentage (0-100)
  condition: string; // Weather condition description
  icon: string; // Weather icon code
}

/**
 * Validates weather data object
 * @param data - Weather data object to validate
 * @returns true if weather data is valid, false otherwise
 */
export function validateWeatherData(data: any): data is WeatherData {
  if (!data || typeof data !== "object") {
    return false;
  }

  // Check all required fields are present
  if (
    !("locationName" in data) ||
    !("temperature" in data) ||
    !("humidity" in data) ||
    !("condition" in data) ||
    !("icon" in data)
  ) {
    return false;
  }

  // Validate field types and constraints
  return (
    typeof data.locationName === "string" &&
    data.locationName.length > 0 &&
    typeof data.temperature === "number" &&
    !isNaN(data.temperature) &&
    typeof data.humidity === "number" &&
    !isNaN(data.humidity) &&
    data.humidity >= 0 &&
    data.humidity <= 100 &&
    typeof data.condition === "string" &&
    data.condition.length > 0 &&
    typeof data.icon === "string" &&
    data.icon.length > 0
  );
}
