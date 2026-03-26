import { Request, Response } from "express";
import { WeatherService } from "../services/WeatherService";
import { isValidCoordinates } from "../models/Coordinates";
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
} from "../models/APIResponse";
import {
  RateLimitError,
  BadGatewayError,
  ServiceUnavailableError,
} from "../errors";

/**
 * WeatherController
 * Handles HTTP requests for weather data endpoints
 */
export class WeatherController {
  private weatherService: WeatherService;

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

  /**
   * GET /api/weather
   * Fetches weather data for given coordinates
   * @param req - Express request with lat and lon query parameters
   * @param res - Express response
   */
  async getWeather(req: Request, res: Response): Promise<void> {
    // Extract and parse query parameters
    const latParam = req.query.lat;
    const lonParam = req.query.lon;

    // Check if parameters are provided
    if (!latParam || !lonParam) {
      res
        .status(400)
        .json(
          createErrorResponse(
            ErrorCode.INVALID_COORDINATES,
            "Missing required parameters: lat and lon",
            400,
          ),
        );
      return;
    }

    // Parse to numbers
    const lat = parseFloat(latParam as string);
    const lon = parseFloat(lonParam as string);

    // Validate coordinates using utility function
    if (!isValidCoordinates(lat, lon)) {
      res
        .status(400)
        .json(
          createErrorResponse(
            ErrorCode.INVALID_COORDINATES,
            "Invalid coordinates provided",
            400,
          ),
        );
      return;
    }

    // Fetch weather data from service
    // Errors are caught by the global error handling middleware
    const weatherData = await this.weatherService.getWeatherByCoordinates(
      lat,
      lon,
    );

    // Return success response
    res.status(200).json(createSuccessResponse(weatherData));
  }
}
