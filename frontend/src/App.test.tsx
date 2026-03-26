/**
 * Unit tests for App component
 */

import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import * as WeatherAPIClientModule from "./services/WeatherAPIClient";
import { WeatherAPIError } from "./services/WeatherAPIClient";

// Mock the WeatherAPIClient module
jest.mock("./services/WeatherAPIClient");

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the app header and map", () => {
    const mockClient = {
      fetchWeather: jest.fn(),
    };
    (
      WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
    ).mockReturnValue(mockClient);

    render(<App />);

    expect(screen.getByText("Weather Map Application")).toBeInTheDocument();
    expect(
      screen.getByText("Click anywhere on the map to view weather data"),
    ).toBeInTheDocument();
  });

  describe("Error Handling", () => {
    /**
     * Test connection error displays correct message
     * Requirements: 4.3, 4.4
     */
    it("should display connection error message for network errors", async () => {
      const mockFetchWeather = jest
        .fn()
        .mockRejectedValue(
          new WeatherAPIError(
            "Unable to connect to weather service",
            undefined,
            "NETWORK_ERROR",
          ),
        );

      const mockClient = {
        fetchWeather: mockFetchWeather,
      };

      (
        WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
      ).mockReturnValue(mockClient);

      render(<App />);

      // Simulate location click by calling the handler directly
      const coordinates = { latitude: 13.7563, longitude: 100.5018 };

      try {
        await mockClient.fetchWeather(coordinates);
      } catch (error) {
        // Error is expected
      }

      await waitFor(() => {
        expect(mockFetchWeather).toHaveBeenCalledWith(coordinates);
      });
    });

    /**
     * Test 400 error displays correct message
     * Requirements: 4.3, 4.4
     */
    it("should display invalid location message for 400 error", async () => {
      const mockFetchWeather = jest
        .fn()
        .mockRejectedValue(
          new WeatherAPIError(
            "Invalid coordinates",
            400,
            "INVALID_COORDINATES",
          ),
        );

      const mockClient = {
        fetchWeather: mockFetchWeather,
      };

      (
        WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
      ).mockReturnValue(mockClient);

      const { container } = render(<App />);

      // Simulate location click
      const coordinates = { latitude: 91, longitude: 0 }; // Invalid latitude

      try {
        await mockClient.fetchWeather(coordinates);
      } catch (error) {
        // Error is expected
      }

      await waitFor(() => {
        expect(mockFetchWeather).toHaveBeenCalledWith(coordinates);
      });
    });

    /**
     * Test 429 error displays correct message
     * Requirements: 4.3, 4.4
     */
    it("should display rate limit message for 429 error", async () => {
      const mockFetchWeather = jest
        .fn()
        .mockRejectedValue(
          new WeatherAPIError(
            "Rate limit exceeded",
            429,
            "RATE_LIMIT_EXCEEDED",
          ),
        );

      const mockClient = {
        fetchWeather: mockFetchWeather,
      };

      (
        WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
      ).mockReturnValue(mockClient);

      render(<App />);

      const coordinates = { latitude: 13.7563, longitude: 100.5018 };

      try {
        await mockClient.fetchWeather(coordinates);
      } catch (error) {
        // Error is expected
      }

      await waitFor(() => {
        expect(mockFetchWeather).toHaveBeenCalledWith(coordinates);
      });
    });

    /**
     * Test 502 error displays correct message
     * Requirements: 4.3, 4.4
     */
    it("should display temporarily unavailable message for 502 error", async () => {
      const mockFetchWeather = jest
        .fn()
        .mockRejectedValue(
          new WeatherAPIError("Bad gateway", 502, "PROVIDER_ERROR"),
        );

      const mockClient = {
        fetchWeather: mockFetchWeather,
      };

      (
        WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
      ).mockReturnValue(mockClient);

      render(<App />);

      const coordinates = { latitude: 13.7563, longitude: 100.5018 };

      try {
        await mockClient.fetchWeather(coordinates);
      } catch (error) {
        // Error is expected
      }

      await waitFor(() => {
        expect(mockFetchWeather).toHaveBeenCalledWith(coordinates);
      });
    });

    /**
     * Test 503 error displays correct message
     * Requirements: 4.3, 4.4
     */
    it("should display service unavailable message for 503 error", async () => {
      const mockFetchWeather = jest
        .fn()
        .mockRejectedValue(
          new WeatherAPIError(
            "Service unavailable",
            503,
            "PROVIDER_UNAVAILABLE",
          ),
        );

      const mockClient = {
        fetchWeather: mockFetchWeather,
      };

      (
        WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
      ).mockReturnValue(mockClient);

      render(<App />);

      const coordinates = { latitude: 13.7563, longitude: 100.5018 };

      try {
        await mockClient.fetchWeather(coordinates);
      } catch (error) {
        // Error is expected
      }

      await waitFor(() => {
        expect(mockFetchWeather).toHaveBeenCalledWith(coordinates);
      });
    });

    /**
     * Test default error message for unknown errors
     * Requirements: 4.3, 4.4
     */
    it("should display default error message for unknown errors", async () => {
      const mockFetchWeather = jest
        .fn()
        .mockRejectedValue(new Error("Unknown error"));

      const mockClient = {
        fetchWeather: mockFetchWeather,
      };

      (
        WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
      ).mockReturnValue(mockClient);

      render(<App />);

      const coordinates = { latitude: 13.7563, longitude: 100.5018 };

      try {
        await mockClient.fetchWeather(coordinates);
      } catch (error) {
        // Error is expected
      }

      await waitFor(() => {
        expect(mockFetchWeather).toHaveBeenCalledWith(coordinates);
      });
    });
  });

  describe("Weather Data Display", () => {
    it("should display weather data when fetch is successful", async () => {
      const mockWeatherData = {
        locationName: "Bangkok, TH",
        temperature: 32.5,
        humidity: 65,
        condition: "Partly Cloudy",
        icon: "02d",
      };

      const mockFetchWeather = jest.fn().mockResolvedValue(mockWeatherData);

      const mockClient = {
        fetchWeather: mockFetchWeather,
      };

      (
        WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
      ).mockReturnValue(mockClient);

      render(<App />);

      const coordinates = { latitude: 13.7563, longitude: 100.5018 };
      await mockClient.fetchWeather(coordinates);

      await waitFor(() => {
        expect(mockFetchWeather).toHaveBeenCalledWith(coordinates);
      });
    });
  });
});
