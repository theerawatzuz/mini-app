import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { WeatherController } from "./controllers/WeatherController";
import { WeatherService } from "./services/WeatherService";
import { errorHandler } from "./middleware/errorHandler";
import { metricsMiddleware, register } from "./middleware/metrics";
import logger from "./utils/logger";

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

// Structured logging middleware
app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },
  }),
);

// Metrics middleware
app.use(metricsMiddleware);

// Metrics endpoint for Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Weather API routes
app.get("/api/weather", (req, res, next) =>
  weatherController.getWeather(req, res).catch(next),
);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
