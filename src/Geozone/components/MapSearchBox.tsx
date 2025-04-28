import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface MapSearchBoxProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  google: any;
  map: google.maps.Map | null;
  selectedShape: any;
  setSelectedShape: (shape: any) => void;
}

const MapSearchBox: React.FC<MapSearchBoxProps> = ({
  onPlaceSelected,
  google,
  map,
  selectedShape,
  setSelectedShape,
}) => {
  const [searchText, setSearchText] = useState<string>("");
  const inputRef: any = useRef<HTMLInputElement>(null);
  const autocompleteRef: any = useRef<google.maps.places.Autocomplete | null>(
    null
  );

  // Setup autocomplete
  useEffect(() => {
    if (!google || !map || !inputRef.current) return;

    // Initialize the autocomplete instance
    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["geometry", "formatted_address", "name"],
      }
    );

    // Bind autocomplete to map bounds
    autocompleteRef.current.bindTo("bounds", map);

    // Add place_changed listener
    const listener = autocompleteRef.current.addListener(
      "place_changed",
      () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry) {
          onPlaceSelected(place);
          setSearchText(place.formatted_address || place.name || "");
        }
      }
    );

    // Cleanup
    return () => {
      if (google.maps.event && listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [google, map, onPlaceSelected]);

  const clearSearch = () => {
    setSearchText("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Clear shape from map when search is cleared
    if (selectedShape) {
      selectedShape.setMap(null);
      setSelectedShape(null);
    }
  };

  // Updated handleSearch function for MapSearchBox
  const handleSearch = () => {
    // Check if the input contains a lat,lng format
    const latLngRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = searchText.match(latLngRegex);

    if (match) {
      // Extract latitude and longitude from the input
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[3]);

      // Validate latitude and longitude values
      if (isValidLatLng(lat, lng)) {
        // Create a coordinates object
        const latLng = {
          lat,
          lng,
        };

        // Create a place-like object to pass to onPlaceSelected
        const placeResult: google.maps.places.PlaceResult = {
          geometry: {
            location: new google.maps.LatLng(lat, lng),
          },
          formatted_address: `${lat}, ${lng}`,
          name: `${lat}, ${lng}`,
        };

        // Call onPlaceSelected with the place-like object
        onPlaceSelected(placeResult);

        // Try to get address using reverse geocoding
        if (google && map) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: latLng },
            (results: any, status: any) => {
              if (status === "OK" && results && results[0]) {
                setSearchText(results[0].formatted_address);
              }
            }
          );
        }
      } else {
        // Invalid lat/lng values
        alert(
          "Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values"
        );
      }
    } else if (autocompleteRef.current) {
      // Regular Places API search - trigger place_changed event
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        onPlaceSelected(place);
        setSearchText(place.formatted_address || place.name || "");
      } else {
        // If no place is found, try to get place predictions
        inputRef.current.focus();
      }
    }
  };

  // Function to validate latitude and longitude
  const isValidLatLng = (lat: number, lng: number): boolean => {
    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-[400px]">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a location or enter lat,lng..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="w-full h-10 pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="absolute left-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
        >
          <Search className="h-4 w-4" />
        </button>
        {searchText && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1 text-center">
        Search for a location or enter coordinates as "lat,lng"
      </div>
    </div>
  );
};

export default MapSearchBox;