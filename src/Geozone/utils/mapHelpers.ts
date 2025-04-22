// utils/mapHelpers.ts
import { FormField } from "../types";

// Setup autocomplete for location search
export const setupAutocomplete = (
  google: any,
  map: google.maps.Map | null,
  autocompleteRef: React.RefObject<HTMLInputElement>,
  setFormField: (field: Partial<FormField>) => void,
  setSelectedShape: (shape: any) => void,
  setOpenModal: (open: boolean) => void
): google.maps.places.Autocomplete | null => {
  if (!google || !map || !autocompleteRef.current) return null;

  // Create autocomplete instance
  const autocomplete = new google.maps.places.Autocomplete(autocompleteRef.current, {
    types: ['geocode'],
    fields: ['geometry', 'formatted_address', 'address_components'],
  });

  // Bind the autocomplete to the map
  autocomplete.bindTo('bounds', map);

  // Add listener for place selection
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      console.warn("No location data for the selected place");
      return;
    }

    // Set map view to the selected place
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17); 
    }

    // Extract location information
    const location = place.geometry.location;
    const lat = location.lat();
    const lng = location.lng();
    
    // Extract address components
    let zipCode = '';
    let country = '';
    let state = '';
    let city = '';
    let district = '';
    let area = '';

    if (place.address_components) {
      place.address_components.forEach((component:any) => {
        const types = component.types;
        
        if (types.includes('postal_code')) {
          zipCode = component.long_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('sublocality_level_1')) {
          district = component.long_name;
        } else if (types.includes('sublocality_level_2')) {
          area = component.long_name;
        }
      });
    }

    // Create a circle shape at the selected location
    const circle = new google.maps.Circle({
      center: location,
      radius: 100, // Default radius in meters
      map: map,
      fillColor: '#4285F4',
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeColor: '#4285F4',
      editable: true,
      draggable: true,
    });
    
    setSelectedShape(circle);
    
    // Update form fields
    setFormField({
      address: place.formatted_address || '',
      finalAddress: place.formatted_address || '',
      radius: '100',
      shapeData: {
        type: 'circle',
        coordinates: [lat, lng],
        radius: 100
      }
    });
    
    // Open the modal
    setOpenModal(true);
  });

  return autocomplete;
};