import { render, screen } from "@testing-library/react";
import MapComponent from "./MapComponent";
import L from "leaflet";

/**
 * Unit Tests for MapComponent
 * Test specific examples and edge cases
 */

// Mock Leaflet
jest.mock("leaflet", () => {
  const mockMap = {
    on: jest.fn(),
    remove: jest.fn(),
    setView: jest.fn().mockReturnThis(),
  };

  const mockMarker = {
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    getLatLng: jest.fn(),
    setLatLng: jest.fn(),
  };

  const mockTileLayer = {
    addTo: jest.fn(),
  };

  return {
    map: jest.fn(() => mockMap),
    marker: jest.fn(() => mockMarker),
    tileLayer: jest.fn(() => mockTileLayer),
    icon: jest.fn(() => ({})),
    Marker: {
      prototype: {
        options: { icon: null },
      },
    },
    _getMockMap: () => mockMap,
    _getMockMarker: () => mockMarker,
    _getMockTileLayer: () => mockTileLayer,
  };
});

describe("MapComponent Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Map renders with default view
   * Requirements: 1.1
   */
  it("should render map container", () => {
    const mockOnLocationClick = jest.fn();

    const { container } = render(
      <MapComponent onLocationClick={mockOnLocationClick} />,
    );

    const mapContainer = container.querySelector("div");
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveStyle({ width: "100%", height: "500px" });
  });

  /**
   * Test: Map initializes with OpenStreetMap tiles
   * Requirements: 1.1
   */
  it("should initialize map with OpenStreetMap tiles", () => {
    const mockOnLocationClick = jest.fn();

    render(<MapComponent onLocationClick={mockOnLocationClick} />);

    // Verify map was created
    expect(L.map).toHaveBeenCalled();

    // Verify tile layer was added
    expect(L.tileLayer).toHaveBeenCalledWith(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      expect.objectContaining({
        attribution: expect.stringContaining("OpenStreetMap"),
        maxZoom: 19,
      }),
    );

    const mockTileLayer = (L as any)._getMockTileLayer();
    expect(mockTileLayer.addTo).toHaveBeenCalled();
  });

  /**
   * Test: Click event handler is registered
   * Requirements: 1.2
   */
  it("should register click event handler on map", () => {
    const mockOnLocationClick = jest.fn();

    render(<MapComponent onLocationClick={mockOnLocationClick} />);

    const mockMap = (L as any)._getMockMap();
    expect(mockMap.on).toHaveBeenCalledWith("click", expect.any(Function));
  });

  /**
   * Test: Click event triggers coordinate capture
   * Requirements: 1.2
   */
  it("should capture coordinates when map is clicked", () => {
    const mockOnLocationClick = jest.fn();

    render(<MapComponent onLocationClick={mockOnLocationClick} />);

    const mockMap = (L as any)._getMockMap();
    const clickHandler = mockMap.on.mock.calls.find(
      (call: any) => call[0] === "click",
    )?.[1];

    expect(clickHandler).toBeDefined();

    // Simulate click event
    const mockEvent = {
      latlng: {
        lat: 13.7563,
        lng: 100.5018,
      },
    };

    clickHandler(mockEvent);

    expect(mockOnLocationClick).toHaveBeenCalledWith({
      latitude: 13.7563,
      longitude: 100.5018,
    });
  });

  /**
   * Test: Marker appears at selected location
   * Requirements: 1.4
   */
  it("should create marker at selected location", () => {
    const mockOnLocationClick = jest.fn();
    const selectedLocation = { latitude: 40.7128, longitude: -74.006 };

    render(
      <MapComponent
        onLocationClick={mockOnLocationClick}
        selectedLocation={selectedLocation}
      />,
    );

    expect(L.marker).toHaveBeenCalledWith([40.7128, -74.006]);

    const mockMarker = (L as any)._getMockMarker();
    expect(mockMarker.addTo).toHaveBeenCalled();
  });

  /**
   * Test: Marker updates when location changes
   * Requirements: 1.4
   */
  it("should update marker when selected location changes", () => {
    const mockOnLocationClick = jest.fn();
    const initialLocation = { latitude: 40.7128, longitude: -74.006 };

    const { rerender } = render(
      <MapComponent
        onLocationClick={mockOnLocationClick}
        selectedLocation={initialLocation}
      />,
    );

    expect(L.marker).toHaveBeenCalledWith([40.7128, -74.006]);

    // Change location
    const newLocation = { latitude: 51.5074, longitude: -0.1278 };
    rerender(
      <MapComponent
        onLocationClick={mockOnLocationClick}
        selectedLocation={newLocation}
      />,
    );

    // Should remove old marker and create new one
    const mockMarker = (L as any)._getMockMarker();
    expect(mockMarker.remove).toHaveBeenCalled();
    expect(L.marker).toHaveBeenCalledWith([51.5074, -0.1278]);
  });

  /**
   * Test: No marker when no location selected
   * Requirements: 1.4
   */
  it("should not create marker when no location is selected", () => {
    const mockOnLocationClick = jest.fn();

    render(<MapComponent onLocationClick={mockOnLocationClick} />);

    // Marker should not be created initially
    expect(L.marker).not.toHaveBeenCalled();
  });

  /**
   * Test: Map cleanup on unmount
   * Requirements: 1.1, 1.3
   */
  it("should cleanup map on unmount", () => {
    const mockOnLocationClick = jest.fn();

    const { unmount } = render(
      <MapComponent onLocationClick={mockOnLocationClick} />,
    );

    const mockMap = (L as any)._getMockMap();

    unmount();

    expect(mockMap.remove).toHaveBeenCalled();
  });

  /**
   * Test: Boundary coordinates are handled correctly
   * Requirements: 1.2
   */
  it("should handle boundary coordinates correctly", () => {
    const mockOnLocationClick = jest.fn();

    render(<MapComponent onLocationClick={mockOnLocationClick} />);

    const mockMap = (L as any)._getMockMap();
    const clickHandler = mockMap.on.mock.calls.find(
      (call: any) => call[0] === "click",
    )?.[1];

    // Test maximum latitude
    clickHandler({ latlng: { lat: 90, lng: 0 } });
    expect(mockOnLocationClick).toHaveBeenCalledWith({
      latitude: 90,
      longitude: 0,
    });

    // Test minimum latitude
    clickHandler({ latlng: { lat: -90, lng: 0 } });
    expect(mockOnLocationClick).toHaveBeenCalledWith({
      latitude: -90,
      longitude: 0,
    });

    // Test maximum longitude
    clickHandler({ latlng: { lat: 0, lng: 180 } });
    expect(mockOnLocationClick).toHaveBeenCalledWith({
      latitude: 0,
      longitude: 180,
    });

    // Test minimum longitude
    clickHandler({ latlng: { lat: 0, lng: -180 } });
    expect(mockOnLocationClick).toHaveBeenCalledWith({
      latitude: 0,
      longitude: -180,
    });
  });
});
