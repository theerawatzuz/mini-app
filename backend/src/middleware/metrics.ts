import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Create a Registry
export const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const weatherApiCallsTotal = new client.Counter({
  name: "weather_api_calls_total",
  help: "Total number of weather API calls",
  labelNames: ["provider", "status"],
  registers: [register],
});

export const weatherApiDuration = new client.Histogram({
  name: "weather_api_duration_seconds",
  help: "Duration of weather API calls in seconds",
  labelNames: ["provider"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Middleware to track metrics
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestTotal.labels(req.method, route, res.statusCode.toString()).inc();
  });

  next();
};
