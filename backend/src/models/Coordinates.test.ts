import {
  isValidCoordinates,
  validateCoordinates,
  Coordinates,
} from "./Coordinates";
import fc from "fast-check";

describe("Coordinates Model", () => {
  describe("isValidCoordinates", () => {
    it("should accept valid coordinates at boundaries", () => {
      expect(isValidCoordinates(-90, -180)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
    });

    it("should accept valid coordinates within range", () => {
      expect(isValidCoordinates(45.5, 120.3)).toBe(true);
      expect(isValidCoordinates(-45.5, -120.3)).toBe(true);
    });

    it("should reject latitude outside range", () => {
      expect(isValidCoordinates(-90.1, 0)).toBe(false);
      expect(isValidCoordinates(90.1, 0)).toBe(false);
      expect(isValidCoordinates(-91, 0)).toBe(false);
      expect(isValidCoordinates(91, 0)).toBe(false);
    });

    it("should reject longitude outside range", () => {
      expect(isValidCoordinates(0, -180.1)).toBe(false);
      expect(isValidCoordinates(0, 180.1)).toBe(false);
      expect(isValidCoordinates(0, -181)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
    });

    it("should reject NaN values", () => {
      expect(isValidCoordinates(NaN, 0)).toBe(false);
      expect(isValidCoordinates(0, NaN)).toBe(false);
      expect(isValidCoordinates(NaN, NaN)).toBe(false);
    });

    it("should reject non-number values", () => {
      expect(isValidCoordinates("45" as any, 0)).toBe(false);
      expect(isValidCoordinates(0, "120" as any)).toBe(false);
      expect(isValidCoordinates(null as any, 0)).toBe(false);
      expect(isValidCoordinates(0, undefined as any)).toBe(false);
    });
  });

  describe("validateCoordinates", () => {
    it("should accept valid Coordinates object", () => {
      const coords: Coordinates = { latitude: 45.5, longitude: 120.3 };
      expect(validateCoordinates(coords)).toBe(true);
    });

    it("should accept coordinates at boundaries", () => {
      expect(validateCoordinates({ latitude: -90, longitude: -180 })).toBe(
        true,
      );
      expect(validateCoordinates({ latitude: 90, longitude: 180 })).toBe(true);
    });

    it("should reject object with invalid latitude", () => {
      expect(validateCoordinates({ latitude: 91, longitude: 0 })).toBe(false);
      expect(validateCoordinates({ latitude: -91, longitude: 0 })).toBe(false);
    });

    it("should reject object with invalid longitude", () => {
      expect(validateCoordinates({ latitude: 0, longitude: 181 })).toBe(false);
      expect(validateCoordinates({ latitude: 0, longitude: -181 })).toBe(false);
    });

    it("should reject object with missing fields", () => {
      expect(validateCoordinates({ latitude: 45 })).toBe(false);
      expect(validateCoordinates({ longitude: 120 })).toBe(false);
      expect(validateCoordinates({})).toBe(false);
    });

    it("should reject null and undefined", () => {
      expect(validateCoordinates(null)).toBe(false);
      expect(validateCoordinates(undefined)).toBe(false);
    });

    it("should reject non-object values", () => {
      expect(validateCoordinates("coordinates")).toBe(false);
      expect(validateCoordinates(123)).toBe(false);
      expect(validateCoordinates([])).toBe(false);
    });
  });

  describe("Property-Based Tests", () => {
    /**
     * Property 13: Coordinate Validation
     * **Validates: Requirements 1.2, 2.1**
     *
     * For any coordinate input to the backend API, if the latitude is outside
     * the range [-90, 90] or longitude is outside the range [-180, 180],
     * the validation should reject them.
     */
    it("Property 13: should reject all invalid coordinates", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Invalid latitude with valid longitude
            fc.record({
              lat: fc.oneof(
                fc.double({ min: -1000, max: -90.00001, noNaN: true }),
                fc.double({ min: 90.00001, max: 1000, noNaN: true }),
              ),
              lon: fc.double({ min: -180, max: 180, noNaN: true }),
            }),
            // Invalid longitude with valid latitude
            fc.record({
              lat: fc.double({ min: -90, max: 90, noNaN: true }),
              lon: fc.oneof(
                fc.double({ min: -1000, max: -180.00001, noNaN: true }),
                fc.double({ min: 180.00001, max: 1000, noNaN: true }),
              ),
            }),
            // Both invalid
            fc.record({
              lat: fc.oneof(
                fc.double({ min: -1000, max: -90.00001, noNaN: true }),
                fc.double({ min: 90.00001, max: 1000, noNaN: true }),
              ),
              lon: fc.oneof(
                fc.double({ min: -1000, max: -180.00001, noNaN: true }),
                fc.double({ min: 180.00001, max: 1000, noNaN: true }),
              ),
            }),
          ),
          (coords) => {
            // Validation should reject invalid coordinates
            const result = isValidCoordinates(coords.lat, coords.lon);
            return result === false;
          },
        ),
        { numRuns: 20 },
      );
    });

    /**
     * Property 13: Coordinate Validation
     * **Validates: Requirements 1.2, 2.1**
     *
     * For any coordinate input to the backend API, if the latitude is within
     * the range [-90, 90] and longitude is within the range [-180, 180],
     * the validation should accept them.
     */
    it("Property 13: should accept all valid coordinates", () => {
      fc.assert(
        fc.property(
          fc.record({
            lat: fc.double({ min: -90, max: 90, noNaN: true }),
            lon: fc.double({ min: -180, max: 180, noNaN: true }),
          }),
          (coords) => {
            // Validation should accept valid coordinates
            const result = isValidCoordinates(coords.lat, coords.lon);
            return result === true;
          },
        ),
        { numRuns: 20 },
      );
    });

    /**
     * Property 13: Coordinate Validation (validateCoordinates function)
     * **Validates: Requirements 1.2, 2.1**
     *
     * Test the validateCoordinates function with random valid coordinate objects
     */
    it("Property 13: validateCoordinates should accept all valid coordinate objects", () => {
      fc.assert(
        fc.property(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
          }),
          (coords) => {
            // Validation should accept valid coordinate objects
            const result = validateCoordinates(coords);
            return result === true;
          },
        ),
        { numRuns: 20 },
      );
    });

    /**
     * Property 13: Coordinate Validation (validateCoordinates function)
     * **Validates: Requirements 1.2, 2.1**
     *
     * Test the validateCoordinates function with random invalid coordinate objects
     */
    it("Property 13: validateCoordinates should reject all invalid coordinate objects", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Invalid latitude
            fc.record({
              latitude: fc.oneof(
                fc.double({ min: -1000, max: -90.00001, noNaN: true }),
                fc.double({ min: 90.00001, max: 1000, noNaN: true }),
              ),
              longitude: fc.double({ min: -180, max: 180, noNaN: true }),
            }),
            // Invalid longitude
            fc.record({
              latitude: fc.double({ min: -90, max: 90, noNaN: true }),
              longitude: fc.oneof(
                fc.double({ min: -1000, max: -180.00001, noNaN: true }),
                fc.double({ min: 180.00001, max: 1000, noNaN: true }),
              ),
            }),
          ),
          (coords) => {
            // Validation should reject invalid coordinate objects
            const result = validateCoordinates(coords);
            return result === false;
          },
        ),
        { numRuns: 20 },
      );
    });
  });
});
