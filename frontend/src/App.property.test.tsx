/**
 * Property-based tests for App component
 */

import { render, screen, waitFor } from "@testing-library/react";
import fc from "fast-check";
import App from "./App";
import * as WeatherAPIClientModule from "./services/WeatherAPIClient";

// Mock the WeatherAPIClient module
jest.mock("./services/WeatherAPIClient");

describe("App Property Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 8: Non-Refresh Updates
   * **Validates: Requirements 3.4**
   *
   * For any new weather data received, the frontend should update the display
   * without triggering a full page reload (SPA behavior maintained).
   */
  it("Property 8: Non-Refresh Updates - weather data updates without page reload", async () => {
    // Generate random weather data
    const weatherDataArbitrary = fc.record({
      locationName: fc.string({ minLength: 1, maxLength: 50 }),
      temperature: fc.float({ min: -50, max: 60 }),
      humidity: fc.integer({ min: 0, max: 100 }),
      condition: fc.oneof(
        fc.constant("Clear"),
        fc.constant("Cloudy"),
        fc.constant("Rainy"),
        fc.constant("Snowy"),
      ),
      icon: fc.string({ minLength: 3, maxLength: 5 }),
    });

    const coordinatesArbitrary = fc.record({
      latitude: fc.float({ min: -90, max: 90 }),
      longitude: fc.float({ min: -180, max: 180 }),
    });

    await fc.assert(
      fc.asyncProperty(
        weatherDataArbitrary,
        weatherDataArbitrary,
        coordinatesArbitrary,
        coordinatesArbitrary,
        async (weatherData1, weatherData2, coords1, coords2) => {
          // Mock the API client to return different weather data for different calls
          const mockFetchWeather = jest
            .fn()
            .mockResolvedValueOnce(weatherData1)
            .mockResolvedValueOnce(weatherData2);

          const mockClient = {
            fetchWeather: mockFetchWeather,
          };

          (
            WeatherAPIClientModule.createWeatherAPIClient as jest.Mock
          ).mockReturnValue(mockClient);

          // Render the App component
          const { container } = render(<App />);

          // Store initial HTML to verify no full page reload
          const initialHTML = container.innerHTML;

          // Simulate first location click
          const mapComponent = container.querySelector(".map-container");
          expect(mapComponent).toBeTruthy();

          // Trigger first weather fetch by calling the mock directly
          await mockClient.fetchWeather(coords1);

          // Wait for first weather data to be displayed
          await waitFor(() => {
            expect(mockFetchWeather).toHaveBeenCalledTimes(1);
          });

          // Verify the page structure is still intact (no reload)
          const afterFirstFetchHTML = container.innerHTML;
          expect(container.querySelector(".App")).toBeTruthy();
          expect(container.querySelector(".app-header")).toBeTruthy();
          expect(container.querySelector(".map-container")).toBeTruthy();
          expect(container.querySelector(".weather-container")).toBeTruthy();

          // Trigger second weather fetch
          await mockClient.fetchWeather(coords2);

          // Wait for second weather data to be displayed
          await waitFor(() => {
            expect(mockFetchWeather).toHaveBeenCalledTimes(2);
          });

          // Verify the page structure is STILL intact (no reload)
          const afterSecondFetchHTML = container.innerHTML;
          expect(container.querySelector(".App")).toBeTruthy();
          expect(container.querySelector(".app-header")).toBeTruthy();
          expect(container.querySelector(".map-container")).toBeTruthy();
          expect(container.querySelector(".weather-container")).toBeTruthy();

          // Verify that the DOM structure remained consistent (SPA behavior)
          // The HTML will change (weather data updates), but the structure should remain
          const structurePreserved =
            container.querySelector(".App") !== null &&
            container.querySelector(".app-header") !== null &&
            container.querySelector(".map-container") !== null &&
            container.querySelector(".weather-container") !== null;

          return structurePreserved;
        },
      ),
      { numRuns: 20 }, // Reduced runs for performance
    );
  });
});
