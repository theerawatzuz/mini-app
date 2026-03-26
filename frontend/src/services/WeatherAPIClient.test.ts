/**
 * Unit tests for WeatherAPIClient
 */

import axios from "axios";
import { WeatherAPIClient, WeatherAPIError } from "./WeatherAPIClient";
import { Coordinates } from "../types/Coordinates";
import { WeatherData } from "../types/WeatherData";
import { APIResponse } from "../types/APIResponse";
import fc from "fast-check";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("WeatherAPIClient", () => {
  const baseURL = "http://localhost:3001";
  const mockCoordinates: Coordinates = {
    latitude: 13.7563,
    longitude: 100.5018,
  };

  const mockWeatherData: WeatherData = {
    locationName: "Bangkok, TH",
    temperature: 32.5,
    humidity: 65,
    condition: "Partly Cloudy",
    icon: "02d",
  };

  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    jest.resetAllMocks();

    // Create a fresh mock axios instance for each test
    mockAxiosInstance = {
      get: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  describe("constructor", () => {
    it("should create axios instance with correct configuration", () => {
      new WeatherAPIClient(baseURL);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL,
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });

  describe("fetchWeather", () => {
    it("should fetch weather data successfully", async () => {
      const mockResponse: APIResponse<WeatherData> = {
        success: true,
        data: mockWeatherData,
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
      });

      const client = new WeatherAPIClient(baseURL);
      const result = await client.fetchWeather(mockCoordinates);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/weather", {
        params: {
          lat: mockCoordinates.latitude,
          lon: mockCoordinates.longitude,
        },
      });
      expect(result).toEqual(mockWeatherData);
    });

    it("should throw error for invalid coordinates (400)", async () => {
      const mockErrorResponse: APIResponse<WeatherData> = {
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid coordinates provided",
        },
      };

      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          data: mockErrorResponse,
        },
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message: "Invalid coordinates provided",
          statusCode: 400,
          code: "INVALID_COORDINATES",
        });
      }
    });

    it("should throw error for rate limit exceeded (429)", async () => {
      const mockErrorResponse: APIResponse<WeatherData> = {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded. Please try again later",
        },
      };

      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 429,
          data: mockErrorResponse,
        },
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message: "Rate limit exceeded. Please try again later",
          statusCode: 429,
          code: "RATE_LIMIT_EXCEEDED",
        });
      }
    });

    it("should throw error for bad gateway (502)", async () => {
      const mockErrorResponse: APIResponse<WeatherData> = {
        success: false,
        error: {
          code: "PROVIDER_ERROR",
          message: "Unable to retrieve weather data",
        },
      };

      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 502,
          data: mockErrorResponse,
        },
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message: "Unable to retrieve weather data",
          statusCode: 502,
          code: "PROVIDER_ERROR",
        });
      }
    });

    it("should throw error for service unavailable (503)", async () => {
      const mockErrorResponse: APIResponse<WeatherData> = {
        success: false,
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "Weather service is temporarily unavailable",
        },
      };

      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 503,
          data: mockErrorResponse,
        },
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message: "Weather service is temporarily unavailable",
          statusCode: 503,
          code: "PROVIDER_UNAVAILABLE",
        });
      }
    });

    it("should throw error for network timeout", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        code: "ECONNABORTED",
        message: "timeout of 5000ms exceeded",
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message:
            "Unable to connect to weather service. Please check your connection.",
          code: "NETWORK_ERROR",
        });
      }
    });

    it("should throw error for network connection failure", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        code: "ERR_NETWORK",
        message: "Network Error",
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message:
            "Unable to connect to weather service. Please check your connection.",
          code: "NETWORK_ERROR",
        });
      }
    });

    it("should throw error when response has no data", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        request: {},
        message: "No response received",
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message: "No response from weather service. Please try again.",
          code: "NO_RESPONSE",
        });
      }
    });

    it("should throw error for invalid weather data structure", async () => {
      const mockResponse: APIResponse<any> = {
        success: true,
        data: {
          // Missing required fields
          locationName: "Bangkok",
          temperature: 32.5,
          // Missing humidity, condition, icon
        },
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
      });

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message: "Received invalid weather data from server",
          code: "INVALID_DATA",
        });
      }
    });

    it("should throw error when success is false but no data", async () => {
      const mockResponse: APIResponse<WeatherData> = {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "Something went wrong",
        },
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
      });

      const client = new WeatherAPIClient(baseURL);

      try {
        await client.fetchWeather(mockCoordinates);
        fail("Should have thrown WeatherAPIError");
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherAPIError);
        expect(error).toMatchObject({
          message: "Something went wrong",
          statusCode: 200,
          code: "UNKNOWN_ERROR",
        });
      }
    });

    it("should handle boundary coordinates correctly", async () => {
      const boundaryCoords: Coordinates = {
        latitude: 90,
        longitude: -180,
      };

      const mockResponse: APIResponse<WeatherData> = {
        success: true,
        data: mockWeatherData,
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
      });

      const client = new WeatherAPIClient(baseURL);
      const result = await client.fetchWeather(boundaryCoords);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/weather", {
        params: {
          lat: 90,
          lon: -180,
        },
      });
      expect(result).toEqual(mockWeatherData);
    });
  });
});

/**
 * Property-Based Tests
 */
describe("Property-Based Tests", () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    mockAxiosInstance = {
      get: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  /**
   * Property 3: Frontend API Request Formation
   * **Validates: Requirements 2.1**
   *
   * For any valid coordinates received from a map click, the frontend should send
   * an HTTP request to the backend API containing those exact coordinates as query parameters.
   */
  it("Property 3: Frontend sends correct HTTP request with exact coordinates", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid coordinates
        fc.record({
          latitude: fc.float({ min: -90, max: 90, noNaN: true }),
          longitude: fc.float({ min: -180, max: 180, noNaN: true }),
        }),
        async (coordinates: Coordinates) => {
          // Reset mocks for each property test iteration
          jest.clearAllMocks();

          // Create fresh mock instance
          const freshMockInstance = {
            get: jest.fn(),
          };
          mockedAxios.create.mockReturnValue(freshMockInstance);

          // Mock successful response
          const mockWeatherData: WeatherData = {
            locationName: "Test Location",
            temperature: 25,
            humidity: 60,
            condition: "Clear",
            icon: "01d",
          };

          const mockResponse: APIResponse<WeatherData> = {
            success: true,
            data: mockWeatherData,
          };

          freshMockInstance.get.mockResolvedValue({
            data: mockResponse,
            status: 200,
          });

          // Create client and fetch weather
          const client = new WeatherAPIClient("http://localhost:3001");
          await client.fetchWeather(coordinates);

          // Verify the HTTP request was made with exact coordinates
          expect(freshMockInstance.get).toHaveBeenCalledWith("/api/weather", {
            params: {
              lat: coordinates.latitude,
              lon: coordinates.longitude,
            },
          });

          // Verify the request was made exactly once
          expect(freshMockInstance.get).toHaveBeenCalledTimes(1);

          return true;
        },
      ),
      { numRuns: 20 },
    );
  });

  /**
   * Property 10: API Endpoint Configuration
   * **Validates: Requirements 5.3**
   *
   * For any value set in the frontend's API endpoint environment variable, the frontend
   * should use that exact URL as the base URL for all backend API requests.
   */
  it("Property 10: API client uses exact configured base URL", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random base URLs with various formats
        fc.oneof(
          // Standard HTTP URLs
          fc.webUrl({ validSchemes: ["http"] }),
          // Standard HTTPS URLs
          fc.webUrl({ validSchemes: ["https"] }),
          // URLs with ports
          fc
            .record({
              protocol: fc.constantFrom("http", "https"),
              host: fc.domain(),
              port: fc.integer({ min: 1000, max: 65535 }),
            })
            .map((parts) => `${parts.protocol}://${parts.host}:${parts.port}`),
          // Localhost variations
          fc
            .record({
              protocol: fc.constantFrom("http", "https"),
              port: fc.integer({ min: 3000, max: 9999 }),
            })
            .map((parts) => `${parts.protocol}://localhost:${parts.port}`),
        ),
        async (baseURL: string) => {
          // Reset mocks for each property test iteration
          jest.clearAllMocks();

          // Create fresh mock instance
          const freshMockInstance = {
            get: jest.fn(),
          };
          mockedAxios.create.mockReturnValue(freshMockInstance);

          // Mock successful response
          const mockWeatherData: WeatherData = {
            locationName: "Test Location",
            temperature: 25,
            humidity: 60,
            condition: "Clear",
            icon: "01d",
          };

          const mockResponse: APIResponse<WeatherData> = {
            success: true,
            data: mockWeatherData,
          };

          freshMockInstance.get.mockResolvedValue({
            data: mockResponse,
            status: 200,
          });

          // Create client with the random base URL
          const client = new WeatherAPIClient(baseURL);

          // Verify axios.create was called with the exact base URL
          expect(mockedAxios.create).toHaveBeenCalledWith({
            baseURL: baseURL,
            timeout: 5000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          // Make a request to verify the client uses the configured instance
          const testCoordinates: Coordinates = {
            latitude: 0,
            longitude: 0,
          };
          await client.fetchWeather(testCoordinates);

          // Verify the request was made using the configured axios instance
          expect(freshMockInstance.get).toHaveBeenCalledTimes(1);

          return true;
        },
      ),
      { numRuns: 20 },
    );
  });
});
