/**
 * WeatherAPIClient
 * Service for communicating with the backend API to fetch weather data
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { Coordinates } from "../types/Coordinates";
import { WeatherData, validateWeatherData } from "../types/WeatherData";
import { APIResponse } from "../types/APIResponse";

/**
 * Custom error class for API client errors
 */
export class WeatherAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "WeatherAPIError";
  }
}

/**
 * WeatherAPIClient class
 * Handles HTTP communication with the backend API
 */
export class WeatherAPIClient {
  private client: AxiosInstance;

  /**
   * Creates a new WeatherAPIClient instance
   * @param baseURL - Base URL of the backend API (from environment variable)
   */
  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 5000, // 5 seconds timeout as per requirements
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Fetches weather data for the given coordinates
   * @param coordinates - Geographic coordinates to fetch weather for
   * @returns Promise resolving to WeatherData
   * @throws WeatherAPIError for network failures and invalid responses
   */
  async fetchWeather(coordinates: Coordinates): Promise<WeatherData> {
    try {
      const response = await this.client.get<APIResponse<WeatherData>>(
        "/api/weather",
        {
          params: {
            lat: coordinates.latitude,
            lon: coordinates.longitude,
          },
        },
      );

      // Check if response indicates success
      if (!response.data.success || !response.data.data) {
        throw new WeatherAPIError(
          response.data.error?.message || "Invalid response from server",
          response.status,
          response.data.error?.code,
        );
      }

      // Validate response data structure
      if (!validateWeatherData(response.data.data)) {
        throw new WeatherAPIError(
          "Received invalid weather data from server",
          response.status,
          "INVALID_DATA",
        );
      }

      return response.data.data;
    } catch (error) {
      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<APIResponse<WeatherData>>;

        // Network timeout or connection failure
        if (
          axiosError.code === "ECONNABORTED" ||
          axiosError.code === "ERR_NETWORK"
        ) {
          throw new WeatherAPIError(
            "Unable to connect to weather service. Please check your connection.",
            undefined,
            "NETWORK_ERROR",
          );
        }

        // Server returned an error response
        if (axiosError.response) {
          const errorData = axiosError.response.data;
          throw new WeatherAPIError(
            errorData.error?.message ||
              "An error occurred while fetching weather data",
            axiosError.response.status,
            errorData.error?.code,
          );
        }

        // Request was made but no response received
        throw new WeatherAPIError(
          "No response from weather service. Please try again.",
          undefined,
          "NO_RESPONSE",
        );
      }

      // Re-throw if already a WeatherAPIError
      if (error instanceof WeatherAPIError) {
        throw error;
      }

      // Handle unexpected errors
      throw new WeatherAPIError(
        "An unexpected error occurred",
        undefined,
        "UNEXPECTED_ERROR",
      );
    }
  }
}

/**
 * Creates a WeatherAPIClient instance with the configured base URL
 * @param baseURL - Optional base URL override (useful for testing)
 * @returns WeatherAPIClient instance
 */
export function createWeatherAPIClient(baseURL?: string): WeatherAPIClient {
  // Use provided baseURL, or fall back to environment variable, or default
  const url =
    baseURL ||
    import.meta.env.VITE_API_URL ||
    "https://weather-api.thebrainsurf.site";
  return new WeatherAPIClient(url);
}
