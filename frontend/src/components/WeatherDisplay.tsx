import { WeatherData } from "../types/WeatherData";
import "./WeatherDisplay.css";

interface WeatherDisplayProps {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export default function WeatherDisplay({
  weatherData,
  loading,
  error,
}: WeatherDisplayProps) {
  // Display error message (takes precedence over loading)
  if (error) {
    return (
      <div className="weather-display error">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  // Display loading indicator
  if (loading) {
    return (
      <div className="weather-display loading">
        <div className="loading-spinner" />
        <p>Loading weather data...</p>
      </div>
    );
  }

  // Display weather data
  if (weatherData) {
    return (
      <div className="weather-display data">
        <h2 className="location-name">{weatherData.locationName}</h2>

        <div className="weather-icon-container">
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
            alt={weatherData.condition}
            className="weather-icon"
          />
        </div>

        <div className="weather-info">
          <div className="weather-item temperature">
            <span className="label">Temperature:</span>
            <span className="value">{weatherData.temperature}°C</span>
          </div>

          <div className="weather-item humidity">
            <span className="label">Humidity:</span>
            <span className="value">{weatherData.humidity}%</span>
          </div>

          <div className="weather-item condition">
            <span className="label">Condition:</span>
            <span className="value">{weatherData.condition}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default state - no data yet
  return (
    <div className="weather-display empty">
      <p>Click on the map to view weather data</p>
    </div>
  );
}
