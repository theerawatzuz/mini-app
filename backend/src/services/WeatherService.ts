import axios, { AxiosInstance, AxiosError } from "axios";
import { WeatherData } from "../models/WeatherData";
import {
  ServiceUnavailableError,
  BadGatewayError,
  RateLimitError,
} from "../errors";

/**
 * WeatherService
 * Integrates with external weather API providers to fetch real-time weather data
 */
export class WeatherService {
  private apiKey: string;
  private provider: string;
  private axiosInstance: AxiosInstance;

  constructor(apiKey: string, provider: string) {
    this.apiKey = apiKey;
    this.provider = provider;

    // Configure axios with timeout
    this.axiosInstance = axios.create({
      timeout: 2000, // 2 seconds timeout as per requirement 6.1
    });
  }

  /**
   * Fetches weather data by coordinates with retry logic
   * @param lat - Latitude (-90 to 90)
   * @param lon - Longitude (-180 to 180)
   * @returns Promise<WeatherData>
   * @throws ServiceUnavailableError if weather provider is unreachable
   * @throws BadGatewayError if weather provider returns invalid data
   * @throws RateLimitError if rate limit is exceeded
   */
  async getWeatherByCoordinates(
    lat: number,
    lon: number,
  ): Promise<WeatherData> {
    const maxRetries = 1; // 1 retry on network failure as per requirement 6.1
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = this.buildApiUrl(lat, lon);
        console.log(`[WeatherService] Fetching weather data from: ${url}`);
        const response = await this.axiosInstance.get(url);
        console.log(`[WeatherService] Response status: ${response.status}`);

        // Validate and map external API response to internal WeatherData model
        return this.mapResponseToWeatherData(response.data);
      } catch (error) {
        lastError = error as Error;
        console.error(
          `[WeatherService] Error on attempt ${attempt + 1}:`,
          error,
        );

        // Check for rate limit error (429)
        if (this.isRateLimitError(error)) {
          throw new RateLimitError();
        }

        // Check for network timeout/connection errors
        if (this.isNetworkError(error)) {
          if (attempt < maxRetries) {
            console.log(`[WeatherService] Network error, retrying...`);
            continue; // Retry on network errors
          }
          // After retries exhausted, throw ServiceUnavailableError
          throw new ServiceUnavailableError();
        }

        // For other errors (API errors, invalid responses), don't retry
        console.error(`[WeatherService] Non-network error, not retrying`);
        break;
      }
    }

    // If we get here, it's likely an API error or unexpected error
    // Throw BadGatewayError for invalid responses
    console.error(
      `[WeatherService] All attempts failed, throwing BadGatewayError`,
    );
    throw new BadGatewayError();
  }

  /**
   * Builds the API URL based on the provider
   */
  private buildApiUrl(lat: number, lon: number): string {
    if (this.provider === "openweathermap") {
      return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    } else if (this.provider === "weatherapi") {
      return `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${lat},${lon}`;
    } else {
      throw new Error(`Unsupported weather provider: ${this.provider}`);
    }
  }

  /**
   * Maps external API response to internal WeatherData model
   * @throws BadGatewayError if response data is invalid or malformed
   */
  private mapResponseToWeatherData(data: any): WeatherData {
    try {
      if (this.provider === "openweathermap") {
        // Validate required fields exist
        if (
          !data ||
          data.main?.temp === undefined ||
          data.main?.humidity === undefined ||
          !data.weather?.[0]?.description ||
          !data.weather?.[0]?.icon
        ) {
          throw new BadGatewayError(
            "Invalid response data from weather provider",
          );
        }

        // Handle missing location name or country (e.g., ocean coordinates)
        const locationName =
          data.name && data.sys?.country
            ? `${data.name}, ${data.sys.country}`
            : data.name ||
              `${data.coord?.lat?.toFixed(2) || "Unknown"}, ${data.coord?.lon?.toFixed(2) || "Unknown"}`;

        return {
          locationName,
          temperature: data.main.temp,
          humidity: data.main.humidity,
          condition: data.weather[0].description,
          icon: data.weather[0].icon,
        };
      } else if (this.provider === "weatherapi") {
        // Validate required fields exist
        if (
          !data ||
          !data.location?.name ||
          !data.location?.country ||
          data.current?.temp_c === undefined ||
          data.current?.humidity === undefined ||
          !data.current?.condition?.text ||
          !data.current?.condition?.icon
        ) {
          throw new BadGatewayError(
            "Invalid response data from weather provider",
          );
        }

        return {
          locationName: `${data.location.name}, ${data.location.country}`,
          temperature: data.current.temp_c,
          humidity: data.current.humidity,
          condition: data.current.condition.text,
          icon: data.current.condition.icon,
        };
      } else {
        throw new Error(`Unsupported weather provider: ${this.provider}`);
      }
    } catch (error) {
      // If it's already a BadGatewayError, re-throw it
      if (error instanceof BadGatewayError) {
        throw error;
      }
      // Otherwise, wrap it in a BadGatewayError
      throw new BadGatewayError("Failed to parse weather data");
    }
  }

  /**
   * Checks if an error is a rate limit error (429 status)
   */
  private isRateLimitError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return axiosError.response?.status === 429;
    }
    return false;
  }

  /**
   * Checks if an error is a network error (timeout, connection refused, etc.)
   */
  private isNetworkError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Network errors have no response
      return (
        !axiosError.response &&
        (axiosError.code === "ECONNABORTED" || // Timeout
          axiosError.code === "ENOTFOUND" || // DNS lookup failed
          axiosError.code === "ECONNREFUSED" || // Connection refused
          axiosError.code === "ETIMEDOUT") // Connection timeout
      );
    }

    // Check for error code directly on the error object
    const errorCode = (error as any)?.code;
    return !!(
      errorCode === "ECONNABORTED" ||
      errorCode === "ENOTFOUND" ||
      errorCode === "ECONNREFUSED" ||
      errorCode === "ETIMEDOUT"
    );
  }
}
