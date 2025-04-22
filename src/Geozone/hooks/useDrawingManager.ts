// hooks/useDrawingManager.ts
import { useState, useEffect } from 'react';
import { DrawingManagerOptions } from '../types';
// import { DrawingManagerOptions, FormField } from '../types';

interface UseDrawingManagerReturn {
  selectedShape: google.maps.Polygon | google.maps.Circle | google.maps.Rectangle | null;
  setSelectedShape: (shape: google.maps.Polygon | google.maps.Circle | google.maps.Rectangle | null) => void;
  activeDrawingTool: string | null;
  handleDrawingToolClick: (tool: string | null) => void;
}

export const useDrawingManager = ({
  google,
  map,
  drawingManager,
  setFormField,
  setOpenModal
}: DrawingManagerOptions): UseDrawingManagerReturn => {
  const [selectedShape, setSelectedShape] = useState<google.maps.Polygon | google.maps.Circle | google.maps.Rectangle | null>(null);
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null);

  // Handle drawing tool click
  const handleDrawingToolClick = (tool: string | null) => {
    if (!google || !drawingManager) return;

    setActiveDrawingTool(tool);

    // Clear the selected shape
    if (selectedShape) {
      selectedShape.setMap(null);
      setSelectedShape(null);
    }

    // Set the drawing mode based on the selected tool
    switch (tool) {
      case 'rectangle':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
        break;
      case 'circle':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
        break;
      case 'polygon':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
        break;
      default:
        drawingManager.setDrawingMode(null);
        break;
    }
  };

  // Setup drawing event listeners
  useEffect(() => {
    if (!google || !map || !drawingManager) return;

    // Handle overlay complete event
    const overlayCompleteListener = drawingManager.addListener('overlaycomplete', (event: any) => {
      // Remove the drawing manager tool after shape is drawn
      drawingManager.setDrawingMode(null);
      setActiveDrawingTool(null);

      // Get the shape
      const shape = event.overlay;
      
      // Clear previous selected shape
      if (selectedShape) {
        selectedShape.setMap(null);
      }

      // Set new selected shape
      setSelectedShape(shape);

      // Extract shape data based on type
      let shapeData: any = {};
      
      if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
        const bounds = shape.getBounds();
        const ne = bounds?.getNorthEast();
        const sw = bounds?.getSouthWest();
        
        shapeData = {
          type: 'rectangle',
          bounds: {
            north: ne?.lat(),
            east: ne?.lng(),
            south: sw?.lat(),
            west: sw?.lng()
          }
        };
      } else if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
        shapeData = {
          type: 'circle',
          center: {
            lat: shape.getCenter()?.lat(),
            lng: shape.getCenter()?.lng()
          },
          radius: shape.getRadius()
        };
        
        // Set radius in the form
        setFormField({ radius: shape.getRadius().toString() });
      } else if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        const path = shape.getPath();
        const pathArray = [];
        
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          pathArray.push({
            lat: point.lat(),
            lng: point.lng()
          });
        }
        
        shapeData = {
          type: 'polygon',
          paths: pathArray
        };
      }
      
      // Update form with shape data
      setFormField({ shapeData });
      
      // Open the create geozone modal
      setOpenModal(true);
    });

    return () => {
      // Clean up listeners
      google.maps.event.removeListener(overlayCompleteListener);
    };
  }, [google, map, drawingManager, selectedShape, setFormField, setOpenModal]);

  return {
    selectedShape,
    setSelectedShape,
    activeDrawingTool,
    handleDrawingToolClick
  };
};