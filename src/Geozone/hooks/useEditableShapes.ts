// hooks/useEditableShapes.ts
import { useState, useEffect } from 'react';
import { EditableShapesOptions } from '../types';

interface UseEditableShapesReturn {
  isEditMode: boolean;
  toggleEditMode: () => void;
  error: string | null;
}

export const useEditableShapes = ({
  google,
  map,
  geozoneData,
  updateGeozone
}: EditableShapesOptions): any => {
  const [editableShapes, setEditableShapes] = useState<Map<string, any>>(new Map());
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create editable shapes from geozone data
  useEffect(() => {
    if (!google || !map || !isEditMode || !geozoneData?.length) return;

    try {
      // Clear existing editable shapes
      editableShapes.forEach((shape) => {
        if (shape && typeof shape.setMap === "function") {
          google.maps.event.clearInstanceListeners(shape);
          shape.setMap(null);
        }
      });

      // Create new editable shapes
      const newShapes = new Map<string, any>();

      geozoneData.forEach((geozone:any) => {
        try {
          if (!geozone || !geozone.geoCodeData?.geometry) {
            console.warn("Invalid geozone data", geozone);
            return;
          }

          const { geometry } = geozone.geoCodeData;
          const { type, coordinates, radius } = geometry;

          if (!type || !coordinates) {
            console.warn("Missing type or coordinates", { type, coordinates });
            return;
          }

          let shape: any = null;

          switch (type) {
            case "Circle":
              if (!Array.isArray(coordinates) || coordinates.length < 2) {
                console.warn("Invalid circle coordinates", coordinates);
                return;
              }

              shape = new google.maps.Circle({
                center: {
                  lat: Number(coordinates[0]),
                  lng: Number(coordinates[1]),
                },
                radius: Number(radius) || 100,
                map,
                fillColor: "#4285F4",
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: "#4285F4",
                editable: true,
                draggable: true,
              });

              // Add event listeners
              google.maps.event.addListener(shape, "radius_changed", () => {
                handleShapeChange(geozone._id, shape, "Circle");
              });

              google.maps.event.addListener(shape, "center_changed", () => {
                handleShapeChange(geozone._id, shape, "Circle");
              });

              break;

            case "Polygon":
              if (!Array.isArray(coordinates) || !coordinates.length) {
                console.warn("Invalid polygon coordinates", coordinates);
                return;
              }

              try {
                const path = coordinates.map((coord: number[]) => ({
                  lat: Number(coord[0]),
                  lng: Number(coord[1]),
                }));

                shape = new google.maps.Polygon({
                  paths: path,
                  map,
                  fillColor: "#4285F4",
                  fillOpacity: 0.3,
                  strokeWeight: 2,
                  strokeColor: "#4285F4",
                  editable: true,
                  draggable: true,
                });

                // Add event listeners to the path
                const polygonPath = shape.getPath();
                google.maps.event.addListener(polygonPath, "insert_at", () => {
                  handleShapeChange(geozone._id, shape, "Polygon");
                });

                google.maps.event.addListener(polygonPath, "remove_at", () => {
                  handleShapeChange(geozone._id, shape, "Polygon");
                });

                google.maps.event.addListener(polygonPath, "set_at", () => {
                  handleShapeChange(geozone._id, shape, "Polygon");
                });
              } catch (err) {
                console.error("Error creating polygon:", err);
              }

              break;

            case "Rectangle":
              // For Rectangle, we need to construct bounds from coordinates
              // Assuming coordinates is in format [[ne_lat, ne_lng], [sw_lat, sw_lng]]
              if (
                Array.isArray(coordinates) &&
                coordinates.length >= 2 &&
                Array.isArray(coordinates[0]) &&
                Array.isArray(coordinates[1])
              ) {
                try {
                  const ne = coordinates[0];
                  const sw = coordinates[1];

                  const bounds = {
                    north: Number(ne[0]),
                    east: Number(ne[1]),
                    south: Number(sw[0]),
                    west: Number(sw[1]),
                  };

                  shape = new google.maps.Rectangle({
                    bounds: bounds,
                    map,
                    fillColor: "#4285F4",
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: "#4285F4",
                    editable: true,
                    draggable: true,
                  });

                  // Add event listener
                  google.maps.event.addListener(shape, "bounds_changed", () => {
                    handleShapeChange(geozone._id, shape, "Rectangle");
                  });
                } catch (err) {
                  console.error("Error creating rectangle:", err);
                }
              } else {
                console.warn("Invalid rectangle coordinates:", coordinates);
              }
              break;
          }

          if (shape) {
            // Add dragging event listeners for all shape types
            ["dragstart", "drag", "dragend"].forEach((eventName) => {
              try {
                google.maps.event.addListener(shape, eventName, () => {
                  if (eventName === "dragend") {
                    handleShapeChange(geozone._id, shape, type);
                  }
                });
              } catch (err) {
                console.error(`Error adding ${eventName} listener:`, err);
              }
            });

            // Store the original geozone data with the shape for reference
            shape.geozoneData = geozone;

            // Add the shape to our map
            newShapes.set(geozone._id, shape);
          }
        } catch (err) {
          console.error("Error processing geozone:", err, geozone);
        }
      });

      setEditableShapes(newShapes);
      setError(null);

      // Clean up
      return () => {
        newShapes.forEach((shape) => {
          if (shape) {
            try {
              google.maps.event.clearInstanceListeners(shape);
              shape.setMap(null);
            } catch (err) {
              console.error("Error cleaning up shape:", err);
            }
          }
        });
      };
    } catch (err) {
      console.error("Error in useEditableShapes effect:", err);
      setError("Failed to render editable shapes. Please try again.");
    }
  }, [google, map, geozoneData, isEditMode]);

  // Handle shape changes and update the database
  const handleShapeChange = async (
    geozoneId: string,
    shape: any,
    shapeType: string
  ) => {
    try {
      const geozone = geozoneData.find((g:any) => g._id === geozoneId);
      if (!geozone) {
        console.warn("Geozone not found for ID:", geozoneId);
        return;
      }

      let coordinates: number[] | number[][] = [];
      let radius: number | undefined;

      switch (shapeType) {
        case "Circle":
          const center = shape.getCenter();
          coordinates = [center.lat(), center.lng()];
          radius = shape.getRadius();
          break;

        case "Polygon":
          const path = shape.getPath();
          coordinates = path
            .getArray()
            .map((latLng: any) => [latLng.lat(), latLng.lng()]);
          break;

        case "Rectangle":
          const bounds = shape.getBounds();
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          coordinates = [
            [ne.lat(), ne.lng()],
            [sw.lat(), sw.lng()],
          ];
          break;

        default:
          console.warn("Unknown shape type:", shapeType);
          return;
      }

      // Create updated geometry data in the correct format
      const updatedPayload = {
        ...geozone,
        geoCodeData: {
          type: "Feature",
          geometry: {
            type: shapeType,
            coordinates,
            ...(radius !== undefined && { radius }),
          }
        }
      };

      // Update geozone
      await updateGeozone(geozoneId, updatedPayload);
    } catch (error) {
      console.error("Error updating geozone:", error);
      setError("Failed to update shape. Please try again.");
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    // If we're currently in edit mode, turn it off
    if (isEditMode) {
      // Clear all editable shapes
      editableShapes.forEach((shape) => {
        if (shape && typeof shape.setMap === "function") {
          try {
            google.maps.event.clearInstanceListeners(shape);
            shape.setMap(null);
          } catch (err) {
            console.error("Error clearing shape:", err);
          }
        }
      });
      setEditableShapes(new Map());
    }

    // Toggle the state
    setIsEditMode((prev) => !prev);
  };

  return {
    editableShapes,
    isEditMode,
    toggleEditMode,
    error,
  };
};