import { WeatherService } from "./WeatherService";
import axios from "axios";
import fc from "fast-check";
import {
  ServiceUnavailableError,
  BadGatewayError,
  RateLimitError,
} from "../errors";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("WeatherService", () => {
  let weatherService: WeatherService;
  const mockApiKey = "test-api-key";
  const mockProvider = "openweathermap";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup axios.create mock
    const mockAxiosInstance = {
      get: jest.fn(),
    };
    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

    weatherService = new WeatherService(mockApiKey, mockProvider);
  });

  describe("constructor", () => {
    it("should create axios instance with 2 second timeout", () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 2000,
      });
    });

    it("should accept API key and provider from environment variables", () => {
      const service = new WeatherService("my-key", "weatherapi");
      expect(service).toBeDefined();
    });
  });

  describe("getWeatherByCoordinates", () => {
    it("should fetch weather data for valid coordinates", async () => {
      const mockResponse = {
        data: {
          name: "Bangkok",
          sys: { country: "TH" },
          main: { temp: 32.5, humidity: 65 },
          weather: [{ description: "Partly Cloudy", icon: "02d" }],
        },
      };

      const axiosInstance = (weatherService as any).axiosInstance;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await weatherService.getWeatherByCoordinates(13.75, 100.5);

      expect(result).toEqual({
        locationName: "Bangkok, TH",
        temperature: 32.5,
        humidity: 65,
        condition: "Partly Cloudy",
        icon: "02d",
      });
    });

    it("should use correct OpenWeatherMap API URL", async () => {
      const mockResponse = {
        data: {
          name: "London",
          sys: { country: "GB" },
          main: { temp: 15, humidity: 70 },
          weather: [{ description: "Cloudy", icon: "03d" }],
        },
      };

      const axiosInstance = (weatherService as any).axiosInstance;
      axiosInstance.get.mockResolvedValue(mockResponse);

      await weatherService.getWeatherByCoordinates(51.5, -0.1);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `https://api.openweathermap.org/data/2.5/weather?lat=51.5&lon=-0.1&appid=${mockApiKey}&units=metric`,
      );
    });

    it("should retry once on network failure", async () => {
      const axiosInstance = (weatherService as any).axiosInstance;
      const networkError = new Error("Network Error");
      (networkError as any).code = "ECONNABORTED";

      const mockResponse = {
        data: {
          name: "Tokyo",
          sys: { country: "JP" },
          main: { temp: 20, humidity: 60 },
          weather: [{ description: "Clear", icon: "01d" }],
        },
      };

      // First call fails with network error, second succeeds
      axiosInstance.get
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockResponse);

      const result = await weatherService.getWeatherByCoordinates(35.6, 139.7);

      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result.locationName).toBe("Tokyo, JP");
    });

    it("should not retry on API errors (non-network)", async () => {
      const axiosInstance = (weatherService as any).axiosInstance;
      const apiError = new Error("API Error") as any;
      apiError.response = { status: 404, data: { message: "Not found" } };
      apiError.isAxiosError = true;

      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      axiosInstance.get.mockRejectedValue(apiError);

      await expect(
        weatherService.getWeatherByCoordinates(0, 0),
      ).rejects.toThrow();

      // Should only try once, no retry for API errors
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it("should throw error after max retries exhausted", async () => {
      const axiosInstance = (weatherService as any).axiosInstance;
      const networkError = new Error("Network Error");
      (networkError as any).code = "ETIMEDOUT";

      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
      axiosInstance.get.mockRejectedValue(networkError);

      await expect(
        weatherService.getWeatherByCoordinates(0, 0),
      ).rejects.toThrow(ServiceUnavailableError);

      // Should try twice (initial + 1 retry)
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling", () => {
    describe("Timeout Scenarios", () => {
      it("should throw ServiceUnavailableError when request exceeds 2 second timeout", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const timeoutError = new Error("timeout of 2000ms exceeded");
        (timeoutError as any).code = "ECONNABORTED";

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(timeoutError);

        await expect(
          weatherService.getWeatherByCoordinates(13.75, 100.5),
        ).rejects.toThrow(ServiceUnavailableError);

        // Should retry once before throwing
        expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      });

      it("should handle delayed response that times out", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;

        // Simulate a delayed response that exceeds timeout
        const delayedPromise = new Promise((_, reject) => {
          setTimeout(() => {
            const timeoutError = new Error("timeout exceeded");
            (timeoutError as any).code = "ETIMEDOUT";
            reject(timeoutError);
          }, 100);
        });

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockReturnValue(delayedPromise);

        await expect(
          weatherService.getWeatherByCoordinates(51.5, -0.1),
        ).rejects.toThrow(ServiceUnavailableError);
      });
    });

    describe("Network Timeout Errors", () => {
      it("should throw ServiceUnavailableError on ECONNABORTED", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const networkError = new Error("Network Error");
        (networkError as any).code = "ECONNABORTED";

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(networkError);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(ServiceUnavailableError);
      });

      it("should throw ServiceUnavailableError on ETIMEDOUT", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const networkError = new Error("Network Error");
        (networkError as any).code = "ETIMEDOUT";

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(networkError);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(ServiceUnavailableError);
      });

      it("should throw ServiceUnavailableError on ECONNREFUSED", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const networkError = new Error("Network Error");
        (networkError as any).code = "ECONNREFUSED";

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(networkError);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(ServiceUnavailableError);
      });

      it("should throw ServiceUnavailableError on ENOTFOUND", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const networkError = new Error("Network Error");
        (networkError as any).code = "ENOTFOUND";

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(networkError);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(ServiceUnavailableError);
      });

      it("should throw ServiceUnavailableError on network connection failure without response", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const networkError = new Error("Network Error") as any;
        networkError.code = "ECONNREFUSED"; // Use a valid network error code
        networkError.isAxiosError = true;
        // No response property indicates network failure

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(networkError);

        await expect(
          weatherService.getWeatherByCoordinates(35.6, 139.7),
        ).rejects.toThrow(ServiceUnavailableError);
      });

      it("should throw ServiceUnavailableError on DNS resolution failure", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const dnsError = new Error(
          "getaddrinfo ENOTFOUND api.openweathermap.org",
        );
        (dnsError as any).code = "ENOTFOUND";

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(dnsError);

        await expect(
          weatherService.getWeatherByCoordinates(48.85, 2.35),
        ).rejects.toThrow(ServiceUnavailableError);
      });
    });

    describe("Invalid JSON Response Handling", () => {
      it("should throw BadGatewayError when response is not valid JSON", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;

        // Simulate a response with invalid JSON structure
        const invalidResponse = {
          data: "This is not JSON",
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(13.75, 100.5),
        ).rejects.toThrow(BadGatewayError);
      });

      it("should throw BadGatewayError when response is an empty string", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;

        const invalidResponse = {
          data: "",
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(BadGatewayError);
      });

      it("should throw BadGatewayError when response is a number instead of object", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;

        const invalidResponse = {
          data: 12345,
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(BadGatewayError);
      });

      it("should throw BadGatewayError when response is an array instead of object", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;

        const invalidResponse = {
          data: [{ temp: 25 }],
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(BadGatewayError);
      });
    });

    describe("Invalid Response Data", () => {
      it("should throw BadGatewayError when OpenWeatherMap response is missing name", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const invalidResponse = {
          data: {
            // Missing name
            sys: { country: "TH" },
            main: { temp: 32.5, humidity: 65 },
            weather: [{ description: "Partly Cloudy", icon: "02d" }],
          },
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(BadGatewayError);
      });

      it("should throw BadGatewayError when OpenWeatherMap response is missing temperature", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const invalidResponse = {
          data: {
            name: "Bangkok",
            sys: { country: "TH" },
            main: { humidity: 65 }, // Missing temp
            weather: [{ description: "Partly Cloudy", icon: "02d" }],
          },
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(BadGatewayError);
      });

      it("should throw BadGatewayError when OpenWeatherMap response is missing weather array", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const invalidResponse = {
          data: {
            name: "Bangkok",
            sys: { country: "TH" },
            main: { temp: 32.5, humidity: 65 },
            // Missing weather array
          },
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(BadGatewayError);
      });

      it("should throw BadGatewayError when response data is null", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const invalidResponse = {
          data: null,
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(BadGatewayError);
      });

      it("should throw BadGatewayError when response data is undefined", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const invalidResponse = {
          data: undefined,
        };

        axiosInstance.get.mockResolvedValue(invalidResponse);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(BadGatewayError);
      });
    });

    describe("Rate Limit Errors", () => {
      it("should throw RateLimitError on 429 response", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const rateLimitError = new Error("Rate limit exceeded") as any;
        rateLimitError.response = { status: 429 };
        rateLimitError.isAxiosError = true;

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(rateLimitError);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(RateLimitError);
      });

      it("should not retry on rate limit error", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const rateLimitError = new Error("Rate limit exceeded") as any;
        rateLimitError.response = { status: 429 };
        rateLimitError.isAxiosError = true;

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(rateLimitError);

        await expect(
          weatherService.getWeatherByCoordinates(0, 0),
        ).rejects.toThrow(RateLimitError);

        // Should only try once, no retry for rate limit errors
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });

      it("should throw RateLimitError with 429 status and error message", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const rateLimitError = new Error("API rate limit exceeded") as any;
        rateLimitError.response = {
          status: 429,
          data: { message: "You have exceeded your rate limit" },
        };
        rateLimitError.isAxiosError = true;

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(rateLimitError);

        await expect(
          weatherService.getWeatherByCoordinates(13.75, 100.5),
        ).rejects.toThrow(RateLimitError);
      });

      it("should handle 429 response from OpenWeatherMap provider", async () => {
        const axiosInstance = (weatherService as any).axiosInstance;
        const rateLimitError = new Error("Too Many Requests") as any;
        rateLimitError.response = { status: 429 };
        rateLimitError.isAxiosError = true;

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        axiosInstance.get.mockRejectedValue(rateLimitError);

        await expect(
          weatherService.getWeatherByCoordinates(51.5, -0.1),
        ).rejects.toThrow(RateLimitError);
      });

      it("should handle 429 response from WeatherAPI provider", async () => {
        // Create a new service with weatherapi provider
        const mockAxiosInstance = {
          get: jest.fn(),
        };
        mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
        const weatherApiService = new WeatherService(mockApiKey, "weatherapi");

        const rateLimitError = new Error("Rate limit exceeded") as any;
        rateLimitError.response = { status: 429 };
        rateLimitError.isAxiosError = true;

        (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);
        mockAxiosInstance.get.mockRejectedValue(rateLimitError);

        await expect(
          weatherApiService.getWeatherByCoordinates(48.85, 2.35),
        ).rejects.toThrow(RateLimitError);
      });
    });
  });

  describe("WeatherAPI provider", () => {
    beforeEach(() => {
      const mockAxiosInstance = {
        get: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
      weatherService = new WeatherService(mockApiKey, "weatherapi");
    });

    it("should use correct WeatherAPI URL", async () => {
      const mockResponse = {
        data: {
          location: { name: "Paris", country: "France" },
          current: {
            temp_c: 18,
            humidity: 75,
            condition: { text: "Rainy", icon: "09d" },
          },
        },
      };

      const axiosInstance = (weatherService as any).axiosInstance;
      axiosInstance.get.mockResolvedValue(mockResponse);

      await weatherService.getWeatherByCoordinates(48.85, 2.35);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `https://api.weatherapi.com/v1/current.json?key=${mockApiKey}&q=48.85,2.35`,
      );
    });

    it("should map WeatherAPI response correctly", async () => {
      const mockResponse = {
        data: {
          location: { name: "Sydney", country: "Australia" },
          current: {
            temp_c: 25,
            humidity: 55,
            condition: { text: "Sunny", icon: "01d" },
          },
        },
      };

      const axiosInstance = (weatherService as any).axiosInstance;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await weatherService.getWeatherByCoordinates(
        -33.86,
        151.2,
      );

      expect(result).toEqual({
        locationName: "Sydney, Australia",
        temperature: 25,
        humidity: 55,
        condition: "Sunny",
        icon: "01d",
      });
    });
  });

  describe("unsupported provider", () => {
    it("should throw BadGatewayError for unsupported provider", async () => {
      const mockAxiosInstance = {
        get: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

      const service = new WeatherService(mockApiKey, "unsupported-provider");

      await expect(service.getWeatherByCoordinates(0, 0)).rejects.toThrow(
        BadGatewayError,
      );
    });
  });

  describe("Property-Based Tests", () => {
    /**
     * Property 12: API Key Usage
     * **Validates: Requirements 6.2**
     *
     * For any request made by the backend to the weather provider,
     * the request should include the API key configured via environment variables.
     */
    it("Property 12: API key is included in all weather provider requests", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random API keys
          fc.string({ minLength: 10, maxLength: 50 }),
          // Generate random valid coordinates
          fc.float({ min: -90, max: 90 }),
          fc.float({ min: -180, max: 180 }),
          // Generate random provider (openweathermap or weatherapi)
          fc.constantFrom("openweathermap", "weatherapi"),
          async (apiKey, lat, lon, provider) => {
            // Create a new service instance with the random API key
            const mockAxiosInstance = {
              get: jest.fn().mockResolvedValue({
                data:
                  provider === "openweathermap"
                    ? {
                        name: "TestCity",
                        sys: { country: "TC" },
                        main: { temp: 20, humidity: 50 },
                        weather: [{ description: "Clear", icon: "01d" }],
                      }
                    : {
                        location: { name: "TestCity", country: "TestCountry" },
                        current: {
                          temp_c: 20,
                          humidity: 50,
                          condition: { text: "Clear", icon: "01d" },
                        },
                      },
              }),
            };
            mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

            const service = new WeatherService(apiKey, provider);

            // Make a request
            await service.getWeatherByCoordinates(lat, lon);

            // Verify that the API key was included in the request URL
            expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
            const calledUrl = mockAxiosInstance.get.mock.calls[0][0];

            // Check that the API key appears in the URL
            if (provider === "openweathermap") {
              expect(calledUrl).toContain(`appid=${apiKey}`);
            } else if (provider === "weatherapi") {
              expect(calledUrl).toContain(`key=${apiKey}`);
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
