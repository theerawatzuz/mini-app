import { validateWeatherData, WeatherData } from "./WeatherData";

describe("WeatherData Model", () => {
  describe("validateWeatherData", () => {
    const validWeatherData: WeatherData = {
      locationName: "Bangkok, TH",
      temperature: 32.5,
      humidity: 65,
      condition: "Partly Cloudy",
      icon: "02d",
    };

    it("should accept valid weather data", () => {
      expect(validateWeatherData(validWeatherData)).toBe(true);
    });

    it("should accept weather data with boundary humidity values", () => {
      expect(validateWeatherData({ ...validWeatherData, humidity: 0 })).toBe(
        true,
      );
      expect(validateWeatherData({ ...validWeatherData, humidity: 100 })).toBe(
        true,
      );
    });

    it("should accept weather data with extreme temperatures", () => {
      expect(
        validateWeatherData({ ...validWeatherData, temperature: -50 }),
      ).toBe(true);
      expect(
        validateWeatherData({ ...validWeatherData, temperature: 60 }),
      ).toBe(true);
    });

    it("should reject data with missing locationName", () => {
      const { locationName, ...incomplete } = validWeatherData;
      expect(validateWeatherData(incomplete)).toBe(false);
    });

    it("should reject data with missing temperature", () => {
      const { temperature, ...incomplete } = validWeatherData;
      expect(validateWeatherData(incomplete)).toBe(false);
    });

    it("should reject data with missing humidity", () => {
      const { humidity, ...incomplete } = validWeatherData;
      expect(validateWeatherData(incomplete)).toBe(false);
    });

    it("should reject data with missing condition", () => {
      const { condition, ...incomplete } = validWeatherData;
      expect(validateWeatherData(incomplete)).toBe(false);
    });

    it("should reject data with missing icon", () => {
      const { icon, ...incomplete } = validWeatherData;
      expect(validateWeatherData(incomplete)).toBe(false);
    });

    it("should reject data with empty locationName", () => {
      expect(
        validateWeatherData({ ...validWeatherData, locationName: "" }),
      ).toBe(false);
    });

    it("should reject data with empty condition", () => {
      expect(validateWeatherData({ ...validWeatherData, condition: "" })).toBe(
        false,
      );
    });

    it("should reject data with empty icon", () => {
      expect(validateWeatherData({ ...validWeatherData, icon: "" })).toBe(
        false,
      );
    });

    it("should reject data with humidity below 0", () => {
      expect(validateWeatherData({ ...validWeatherData, humidity: -1 })).toBe(
        false,
      );
    });

    it("should reject data with humidity above 100", () => {
      expect(validateWeatherData({ ...validWeatherData, humidity: 101 })).toBe(
        false,
      );
    });

    it("should reject data with NaN temperature", () => {
      expect(
        validateWeatherData({ ...validWeatherData, temperature: NaN }),
      ).toBe(false);
    });

    it("should reject data with NaN humidity", () => {
      expect(validateWeatherData({ ...validWeatherData, humidity: NaN })).toBe(
        false,
      );
    });

    it("should reject data with wrong types", () => {
      expect(
        validateWeatherData({ ...validWeatherData, locationName: 123 }),
      ).toBe(false);
      expect(
        validateWeatherData({ ...validWeatherData, temperature: "32.5" }),
      ).toBe(false);
      expect(validateWeatherData({ ...validWeatherData, humidity: "65" })).toBe(
        false,
      );
      expect(validateWeatherData({ ...validWeatherData, condition: 123 })).toBe(
        false,
      );
      expect(validateWeatherData({ ...validWeatherData, icon: 123 })).toBe(
        false,
      );
    });

    it("should reject null and undefined", () => {
      expect(validateWeatherData(null)).toBe(false);
      expect(validateWeatherData(undefined)).toBe(false);
    });

    it("should reject non-object values", () => {
      expect(validateWeatherData("weather")).toBe(false);
      expect(validateWeatherData(123)).toBe(false);
      expect(validateWeatherData([])).toBe(false);
    });

    it("should reject empty object", () => {
      expect(validateWeatherData({})).toBe(false);
    });
  });
});
