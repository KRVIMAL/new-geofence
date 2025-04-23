// utils/coordinatesUtils.ts

import { Coordinates } from "../types";

/**
 * Converts a Google Maps LatLng object to a simple Coordinates object
 */
export const latLngToCoordinates = (latLng: google.maps.LatLng): Coordinates => {
  return {
    lat: latLng.lat(),
    lng: latLng.lng()
  };
};

/**
 * Gets center coordinates from a shape (works with Circle, Rectangle, Polygon)
 */
export const getShapeCenter = (shape: any): Coordinates | null => {
  if (!shape) return null;
  
  // For Circles, getCenter() is available
  if (shape.getCenter && typeof shape.getCenter === 'function') {
    return latLngToCoordinates(shape.getCenter());
  }
  
  // For Rectangle, get center from bounds
  if (shape.getBounds && typeof shape.getBounds === 'function') {
    const bounds = shape.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    return {
      lat: (ne.lat() + sw.lat()) / 2,
      lng: (ne.lng() + sw.lng()) / 2
    };
  }
  
  // For Polygon, compute centroid of all points
  if (shape.getPath && typeof shape.getPath === 'function') {
    const path = shape.getPath();
    const points = path.getArray();
    
    if (points.length === 0) return null;
    
    let sumLat = 0;
    let sumLng = 0;
    
    points.forEach((point: google.maps.LatLng) => {
      sumLat += point.lat();
      sumLng += point.lng();
    });
    
    return {
      lat: sumLat / points.length,
      lng: sumLng / points.length
    };
  }
  
  return null;
};

/**
 * Gets coordinates data from a shape in the format needed for the backend
 */
export const getShapeCoordinatesData = (shape: any): { type: string; coordinates: any; radius?: number } | null => {
  if (!shape) return null;
  
  // For Circle
  if (shape.getCenter && shape.getRadius) {
    const center = shape.getCenter();
    return {
      type: 'Circle',
      coordinates: [center.lat(), center.lng()],
      radius: shape.getRadius()
    };
  }
  
  // For Rectangle
  if (shape.getBounds) {
    const bounds = shape.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    return {
      type: 'Rectangle',
      coordinates: [
        [ne.lat(), ne.lng()],
        [sw.lat(), sw.lng()]
      ]
    };
  }
  
  // For Polygon
  if (shape.getPath) {
    const path = shape.getPath();
    const points = path.getArray();
    const coordinates = points.map((point: google.maps.LatLng) => [point.lat(), point.lng()]);
    
    return {
      type: 'Polygon',
      coordinates: coordinates
    };
  }
  
  return null;
};