// utils/reverseGeocode.ts

import { Coordinates } from "../types";

/**
 * Performs reverse geocoding to get an address from coordinates
 */
export const reverseGeocode = async (
  google: any, 
  coordinates: Coordinates
): Promise<{ address: string; addressComponents: any } | null> => {
  if (!google || !coordinates) return null;
  
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode(
      { location: { lat: coordinates.lat, lng: coordinates.lng } },
      (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          const address = results[0].formatted_address;
          const addressComponents:any = {};
          
          // Extract address components
          results[0].address_components.forEach((component: any) => {
            const types = component.types;
            
            if (types.includes("postal_code")) {
              addressComponents.zipCode = component.long_name;
            } else if (types.includes("country")) {
              addressComponents.country = component.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              addressComponents.state = component.long_name;
            } else if (types.includes("locality")) {
              addressComponents.city = component.long_name;
            } else if (types.includes("sublocality_level_1")) {
              addressComponents.district = component.long_name;
            } else if (types.includes("sublocality_level_2")) {
              addressComponents.area = component.long_name;
            }
          });
          
          resolve({ address, addressComponents });
        } else {
          reject(new Error(`Geocoder failed due to: ${status}`));
        }
      }
    );
  });
};