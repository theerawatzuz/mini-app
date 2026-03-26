import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { WeatherController } from "./controllers/WeatherController";
import { WeatherService } from "./services/WeatherService";
import { errorHandler } from "./middleware/errorHandler";

// Load environment variables first
dotenv.config();

const app = express();

// Initialize WeatherService and WeatherController
const weatherService = new WeatherService(
  process.env.WEATHER_API_KEY || "",
  process.env.WEATHER_PROVIDER || "openweathermap",
);
const weatherController = new WeatherController(weatherService);

// CORS middleware - configured to allow cross-origin requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET"],
  }),
);

// JSON body parser middleware
app.use(express.json());

// Request logging middleware (development only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Weather API routes
app.get("/api/weather", (req, res, next) =>
  weatherController.getWeather(req, res).catch(next),
);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
