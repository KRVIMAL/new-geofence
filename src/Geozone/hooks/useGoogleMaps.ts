// hooks/useGoogleMaps.ts
import { useState, useEffect, RefObject } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

interface UseGoogleMapsReturn {
  google: any;
  map: google.maps.Map | null;
  drawingManager: google.maps.drawing.DrawingManager | null;
  isLoaded: boolean;
  error: Error | null;
}

export const useGoogleMaps = (
  mapRef: RefObject<HTMLDivElement>
): UseGoogleMapsReturn => {
  const [google, setGoogle] = useState<any>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] =
    useState<google.maps.drawing.DrawingManager | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      const loader = new Loader({
        apiKey: API_KEY,
        version: "weekly",
        libraries: ["places", "drawing", "geometry"],
      });
      try {
        const googleMaps = await loader.load();
        setGoogle(googleMaps);
        setIsLoaded(true);
      } catch (err: any) {
        console.error("Error loading Google Maps:", err);
        setError(err);
      }
    };
    loadGoogleMaps();
  }, []);
  
  // Initialize Map and Drawing Manager
  useEffect(() => {
    if (!google || !isLoaded || !mapRef?.current) return;
    
    // Initialize the map
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 28.7041, lng: 77.1025 }, // Default to Delhi, India
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });
    setMap(mapInstance);
    
    // Initialize Drawing Manager
    const drawingManagerInstance = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.RECTANGLE,
        ],
      },
      markerOptions: { draggable: true },
      circleOptions: {
        fillColor: "#4285F4",
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: "#4285F4",
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: "#4285F4",
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: "#4285F4",
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1,
      },
      polylineOptions: {
        strokeColor: "#4285F4",
        strokeWeight: 2,
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1,
      },
    });
    drawingManagerInstance.setMap(mapInstance);
    setDrawingManager(drawingManagerInstance);
    
    // Ensure the map container has proper dimensions
    if (mapRef.current) {
      mapRef.current.style.height = "100%";
      mapRef.current.style.width = "100%";
    }
    
    return () => {
      // Cleanup
      if (drawingManagerInstance) {
        drawingManagerInstance.setMap(null);
      }
    };
  }, [google, isLoaded, mapRef]);

  // Trigger resize event when map is first created
  useEffect(() => {
    if (map && window.google?.maps?.event) {
      window.google.maps.event.trigger(map, "resize");
    }
  }, [map]);

  return { google, map, drawingManager, isLoaded, error };
};