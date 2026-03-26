import { useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import MapComponent from "./components/MapComponent";
import WeatherDisplay from "./components/WeatherDisplay";
import { Coordinates } from "./types/Coordinates";
import { WeatherData } from "./types/WeatherData";
import {
  createWeatherAPIClient,
  WeatherAPIError,
} from "./services/WeatherAPIClient";

const apiClient = createWeatherAPIClient();

function App() {
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    Coordinates | undefined
  >(undefined);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationClick = async (coordinates: Coordinates) => {
    setSelectedCoordinates(coordinates);
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.fetchWeather(coordinates);
      setWeatherData(data);
    } catch (err) {
      if (err instanceof WeatherAPIError) {
        // Map error status codes to user-friendly messages
        if (err.code === "NETWORK_ERROR" || err.code === "NO_RESPONSE") {
          setError(
            "Unable to connect to weather service. Please check your connection.",
          );
        } else if (err.statusCode === 400) {
          setError("Invalid location selected. Please try another location.");
        } else if (err.statusCode === 429) {
          setError("Too many requests. Please wait a moment and try again.");
        } else if (err.statusCode === 502) {
          setError("Weather data temporarily unavailable. Please try again.");
        } else if (err.statusCode === 503) {
          setError(
            "Weather service is currently unavailable. Please try again later.",
          );
        } else {
          setError("An error occurred while fetching weather data.");
        }
      } else {
        setError("An error occurred while fetching weather data.");
      }
      setWeatherData(null);
    } finally {
      setLoading(false);
    }

    //TRIGGER FIX API
    // TEST UPDATE 2
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Weather Map Application</h1>
        <p className="app-subtitle">
          Click anywhere on the map to view weather data
        </p>
      </header>

      <main className="app-main">
        <div className="map-container">
          <MapComponent
            onLocationClick={handleLocationClick}
            selectedLocation={selectedCoordinates}
          />
        </div>

        <div className="weather-container">
          <WeatherDisplay
            weatherData={weatherData}
            loading={loading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
