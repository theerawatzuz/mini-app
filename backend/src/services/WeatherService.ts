import axios, { AxiosInstance, AxiosError } from "axios";
import { WeatherData } from "../models/WeatherData";
import {
  ServiceUnavailableError,
  BadGatewayError,
  RateLimitError,
} from "../errors";
import {
  weatherApiCallsTotal,
  weatherApiDuration,
} from "../middleware/metrics";
import logger from "../utils/logger";

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
    const maxRetries = 1;
    const startTime = Date.now();

    logger.info({ lat, lon, provider: this.provider }, "Fetching weather data");

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = this.buildApiUrl(lat, lon);
        const response = await this.axiosInstance.get(url);

        const duration = (Date.now() - startTime) / 1000;
        weatherApiDuration.labels(this.provider).observe(duration);
        weatherApiCallsTotal.labels(this.provider, "success").inc();

        logger.info(
          { lat, lon, provider: this.provider, duration, attempt: attempt + 1 },
          "Weather data fetched successfully",
        );

        return this.mapResponseToWeatherData(response.data);
      } catch (error) {
        logger.warn(
          {
            lat,
            lon,
            provider: this.provider,
            attempt: attempt + 1,
            error: (error as Error).message,
          },
          "Weather API call failed",
        );

        if (this.isRateLimitError(error)) {
          weatherApiCallsTotal.labels(this.provider, "rate_limited").inc();
          logger.error(
            { lat, lon, provider: this.provider },
            "Rate limit exceeded",
          );
          throw new RateLimitError();
        }

        if (this.isNetworkError(error)) {
          if (attempt < maxRetries) {
            logger.info(
              { lat, lon, provider: this.provider, attempt: attempt + 1 },
              "Retrying after network error",
            );
            continue;
          }
          weatherApiCallsTotal.labels(this.provider, "unavailable").inc();
          logger.error(
            { lat, lon, provider: this.provider },
            "Service unavailable after retries",
          );
          throw new ServiceUnavailableError();
        }

        break;
      }
    }

    weatherApiCallsTotal.labels(this.provider, "error").inc();
    logger.error({ lat, lon, provider: this.provider }, "Bad gateway error");
    throw new BadGatewayError();
  }

  private buildApiUrl(lat: number, lon: number): string {
    if (this.provider === "openweathermap") {
      return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    } else if (this.provider === "weatherapi") {
      return `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${lat},${lon}`;
    } else {
      throw new Error(`Unsupported weather provider: ${this.provider}`);
    }
  }

  private mapResponseToWeatherData(data: any): WeatherData {
    try {
      if (this.provider === "openweathermap") {
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
      if (error instanceof BadGatewayError) {
        throw error;
      }
      throw new BadGatewayError("Failed to parse weather data");
    }
  }

  private isRateLimitError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return axiosError.response?.status === 429;
    }
    return false;
  }

  private isNetworkError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return (
        !axiosError.response &&
        (axiosError.code === "ECONNABORTED" ||
          axiosError.code === "ENOTFOUND" ||
          axiosError.code === "ECONNREFUSED" ||
          axiosError.code === "ETIMEDOUT")
      );
    }

    const errorCode = (error as any)?.code;
    return !!(
      errorCode === "ECONNABORTED" ||
      errorCode === "ENOTFOUND" ||
      errorCode === "ECONNREFUSED" ||
      errorCode === "ETIMEDOUT"
    );
  }
}
