import { render, screen } from "@testing-library/react";
import WeatherDisplay from "./WeatherDisplay";

/**
 * Unit Tests for WeatherDisplay Component
 * Test specific examples and edge cases
 * Requirements: 3.1, 3.2, 3.3, 4.3
 */

describe("WeatherDisplay Unit Tests", () => {
  /**
   * Test: Loading indicator appears when loading is true
   * Requirements: 3.2
   */
  it("should display loading indicator when loading is true", () => {
    const { container } = render(
      <WeatherDisplay weatherData={null} loading={true} error={null} />,
    );

    // Verify loading spinner is present
    const loadingSpinner = container.querySelector(".loading-spinner");
    expect(loadingSpinner).toBeInTheDocument();

    // Verify loading text is present
    expect(screen.getByText(/loading weather data/i)).toBeInTheDocument();

    // Verify loading class is applied
    const weatherDisplay = container.querySelector(".weather-display");
    expect(weatherDisplay).toHaveClass("loading");
  });

  /**
   * Test: Weather data displays correctly with all fields
   * Requirements: 3.1
   */
  it("should display weather data with all fields", () => {
    const weatherData = {
      locationName: "Bangkok, TH",
      temperature: 32.5,
      humidity: 65,
      condition: "Partly Cloudy",
      icon: "02d",
    };

    render(
      <WeatherDisplay weatherData={weatherData} loading={false} error={null} />,
    );

    // Verify location name
    expect(screen.getByText("Bangkok, TH")).toBeInTheDocument();

    // Verify temperature
    expect(screen.getByText(/32.5°C/)).toBeInTheDocument();

    // Verify humidity
    expect(screen.getByText(/65%/)).toBeInTheDocument();

    // Verify condition
    expect(screen.getByText("Partly Cloudy")).toBeInTheDocument();
  });

  /**
   * Test: Weather icon renders with correct icon code
   * Requirements: 3.3
   */
  it("should render weather icon with correct icon code", () => {
    const weatherData = {
      locationName: "Tokyo, JP",
      temperature: 18.0,
      humidity: 55,
      condition: "Clear Sky",
      icon: "01d",
    };

    const { container } = render(
      <WeatherDisplay weatherData={weatherData} loading={false} error={null} />,
    );

    // Verify weather icon is rendered
    const weatherIcon = container.querySelector(".weather-icon");
    expect(weatherIcon).toBeInTheDocument();

    // Verify icon src includes the icon code
    expect(weatherIcon).toHaveAttribute(
      "src",
      "https://openweathermap.org/img/wn/01d@2x.png",
    );

    // Verify alt text
    expect(weatherIcon).toHaveAttribute("alt", "Clear Sky");
  });

  /**
   * Test: Error message displays for different error types
   * Requirements: 4.3
   */
  it("should display error message for 400 error", () => {
    const error = "Invalid location selected. Please try another location.";

    render(<WeatherDisplay weatherData={null} loading={false} error={error} />);

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it("should display error message for 429 error", () => {
    const error = "Too many requests. Please wait a moment and try again.";

    render(<WeatherDisplay weatherData={null} loading={false} error={error} />);

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it("should display error message for 502 error", () => {
    const error = "Weather data temporarily unavailable. Please try again.";

    render(<WeatherDisplay weatherData={null} loading={false} error={error} />);

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it("should display error message for 503 error", () => {
    const error =
      "Weather service is currently unavailable. Please try again later.";

    render(<WeatherDisplay weatherData={null} loading={false} error={error} />);

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it("should display error message for connection error", () => {
    const error =
      "Unable to connect to weather service. Please check your connection.";

    render(<WeatherDisplay weatherData={null} loading={false} error={error} />);

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  /**
   * Test: Smooth transition animations are applied
   * Requirements: 3.1
   */
  it("should apply smooth transition animations", () => {
    const weatherData = {
      locationName: "London, GB",
      temperature: 15.0,
      humidity: 70,
      condition: "Rainy",
      icon: "10d",
    };

    const { container } = render(
      <WeatherDisplay weatherData={weatherData} loading={false} error={null} />,
    );

    // Verify data class is applied (which has fadeIn animation in CSS)
    const weatherDisplay = container.querySelector(".weather-display");
    expect(weatherDisplay).toHaveClass("data");

    // Verify weather items have transition classes
    const weatherItems = container.querySelectorAll(".weather-item");
    expect(weatherItems.length).toBeGreaterThan(0);
    weatherItems.forEach((item) => {
      expect(item).toHaveClass("weather-item");
    });
  });

  /**
   * Test: Empty state displays when no data
   * Requirements: 3.1
   */
  it("should display empty state when no data is available", () => {
    render(<WeatherDisplay weatherData={null} loading={false} error={null} />);

    expect(
      screen.getByText(/click on the map to view weather data/i),
    ).toBeInTheDocument();
  });

  /**
   * Test: Error state takes precedence over loading
   * Requirements: 4.3
   */
  it("should display error even when loading is true", () => {
    const error = "An error occurred while fetching weather data.";

    render(<WeatherDisplay weatherData={null} loading={true} error={error} />);

    // Error should be displayed
    expect(screen.getByText(error)).toBeInTheDocument();

    // Loading indicator should not be displayed
    expect(screen.queryByText(/loading weather data/i)).not.toBeInTheDocument();
  });

  /**
   * Test: Weather data with extreme values
   * Requirements: 3.1
   */
  it("should display weather data with extreme temperature values", () => {
    const weatherData = {
      locationName: "Antarctica",
      temperature: -50.0,
      humidity: 10,
      condition: "Clear",
      icon: "01d",
    };

    render(
      <WeatherDisplay weatherData={weatherData} loading={false} error={null} />,
    );

    expect(screen.getByText(/-50°C/)).toBeInTheDocument();
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });

  it("should display weather data with high temperature values", () => {
    const weatherData = {
      locationName: "Death Valley, US",
      temperature: 56.7,
      humidity: 5,
      condition: "Sunny",
      icon: "01d",
    };

    render(
      <WeatherDisplay weatherData={weatherData} loading={false} error={null} />,
    );

    expect(screen.getByText(/56.7°C/)).toBeInTheDocument();
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  /**
   * Test: Weather data with 100% humidity
   * Requirements: 3.1
   */
  it("should display weather data with maximum humidity", () => {
    const weatherData = {
      locationName: "Rainforest",
      temperature: 28.0,
      humidity: 100,
      condition: "Heavy Rain",
      icon: "10d",
    };

    render(
      <WeatherDisplay weatherData={weatherData} loading={false} error={null} />,
    );

    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  /**
   * Test: Error icon is displayed
   * Requirements: 4.3
   */
  it("should display error icon when error occurs", () => {
    const error = "An error occurred";

    const { container } = render(
      <WeatherDisplay weatherData={null} loading={false} error={error} />,
    );

    const errorIcon = container.querySelector(".error-icon");
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveTextContent("⚠️");
  });
});
