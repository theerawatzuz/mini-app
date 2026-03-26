import { render, cleanup } from "@testing-library/react";
import WeatherDisplay from "./WeatherDisplay";
import fc from "fast-check";

/**
 * Property-Based Tests for WeatherDisplay Component
 * Validates universal properties across all valid inputs
 */

describe("WeatherDisplay Property Tests", () => {
  afterEach(() => {
    cleanup(); // Clean up after each test
  });

  /**
   * Property 6: Loading State Display
   * **Validates: Requirements 3.2**
   *
   * For any pending weather data request, the frontend should display
   * a loading indicator until the response is received or an error occurs.
   */
  it("Property 6: Loading indicator is displayed during pending requests", () => {
    fc.assert(
      fc.property(
        fc.boolean(), // loading state
        fc.option(fc.string(), { nil: null }), // error state
        (loading, error) => {
          // Only test when loading is true and error is not present
          if (!loading || error) return true;

          const { container, unmount } = render(
            <WeatherDisplay
              weatherData={null}
              loading={loading}
              error={error}
            />,
          );

          // Verify loading indicator is present
          const loadingSpinner = container.querySelector(".loading-spinner");
          const loadingText = container.querySelector("p");
          const hasLoadingText = loadingText?.textContent?.includes(
            "Loading weather data",
          );

          unmount(); // Clean up after each render

          return loadingSpinner !== null && hasLoadingText === true;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: Weather Icon Display
   * **Validates: Requirements 3.3**
   *
   * For any weather data displayed in the UI, the rendered output should
   * include a weather icon corresponding to the condition.
   */
  it("Property 7: Weather icon is rendered for each condition", () => {
    fc.assert(
      fc.property(
        fc.record({
          locationName: fc.string({ minLength: 1, maxLength: 50 }),
          temperature: fc.float({ min: -50, max: 60 }),
          humidity: fc.integer({ min: 0, max: 100 }),
          condition: fc.string({ minLength: 1, maxLength: 30 }),
          icon: fc.string({ minLength: 1, maxLength: 10 }),
        }),
        (weatherData) => {
          const { container, unmount } = render(
            <WeatherDisplay
              weatherData={weatherData}
              loading={false}
              error={null}
            />,
          );

          // Verify weather icon is rendered
          const weatherIcon = container.querySelector(".weather-icon");

          if (!weatherIcon) {
            unmount();
            return false;
          }

          // Verify icon src includes the icon code
          const iconSrc = weatherIcon.getAttribute("src");
          const result = iconSrc !== null && iconSrc.includes(weatherData.icon);

          unmount(); // Clean up after each render
          return result;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 9: Error Message Display
   * **Validates: Requirements 4.3**
   *
   * For any error response received from the backend API, the frontend
   * should display a user-friendly error message to the user.
   */
  it("Property 9: User-friendly error messages are displayed", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(
            "Invalid location selected. Please try another location.",
          ),
          fc.constant("Too many requests. Please wait a moment and try again."),
          fc.constant(
            "Weather data temporarily unavailable. Please try again.",
          ),
          fc.constant(
            "Weather service is currently unavailable. Please try again later.",
          ),
          fc.constant("An error occurred while fetching weather data."),
          fc.constant(
            "Unable to connect to weather service. Please check your connection.",
          ),
          fc.string({ minLength: 10, maxLength: 100 }), // Any error message
        ),
        (errorMessage) => {
          const { container, unmount } = render(
            <WeatherDisplay
              weatherData={null}
              loading={false}
              error={errorMessage}
            />,
          );

          // Verify error message is displayed
          const errorText = container.querySelector(".error-message");
          const result =
            errorText !== null && errorText.textContent === errorMessage;

          unmount(); // Clean up after each render
          return result;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Additional Property: Weather Data Completeness Display
   * Verifies all required fields are displayed when weather data is present
   */
  it("Property: All weather data fields are displayed", () => {
    fc.assert(
      fc.property(
        fc.record({
          locationName: fc.string({ minLength: 1, maxLength: 50 }),
          temperature: fc.float({ min: -50, max: 60 }),
          humidity: fc.integer({ min: 0, max: 100 }),
          condition: fc.string({ minLength: 1, maxLength: 30 }),
          icon: fc.string({ minLength: 1, maxLength: 10 }),
        }),
        (weatherData) => {
          const { container, unmount } = render(
            <WeatherDisplay
              weatherData={weatherData}
              loading={false}
              error={null}
            />,
          );

          // Verify all fields are displayed
          const locationName = container.querySelector(".location-name");
          const temperatureElement = container.querySelector(
            ".weather-item.temperature .value",
          );
          const humidityElement = container.querySelector(
            ".weather-item.humidity .value",
          );
          const conditionElement = container.querySelector(
            ".weather-item.condition .value",
          );

          const result =
            locationName !== null &&
            locationName.textContent === weatherData.locationName &&
            temperatureElement !== null &&
            temperatureElement.textContent?.includes(
              weatherData.temperature.toString(),
            ) &&
            humidityElement !== null &&
            humidityElement.textContent?.includes(
              weatherData.humidity.toString(),
            ) &&
            conditionElement !== null &&
            conditionElement.textContent === weatherData.condition;

          unmount(); // Clean up after each render
          return result;
        },
      ),
      { numRuns: 100 },
    );
  });
});
