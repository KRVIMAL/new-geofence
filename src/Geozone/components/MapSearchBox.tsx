import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface MapSearchBoxProps {
    onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
    google: any;
    map: google.maps.Map | null;
    selectedShape: any;
    setSelectedShape: (shape: any) => void;
  }

const MapSearchBox: React.FC<MapSearchBoxProps> = ({ onPlaceSelected, google, map,selectedShape,setSelectedShape }) => {
  const [searchText, setSearchText] = useState<string>("");
  const inputRef:any = useRef<HTMLInputElement>(null);
  const autocompleteRef:any = useRef<google.maps.places.Autocomplete | null>(null);

  // Setup autocomplete
  useEffect(() => {
    if (!google || !map || !inputRef.current) return;

    // Initialize the autocomplete instance
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address", "name"],
    });

    // Bind autocomplete to map bounds
    autocompleteRef.current.bindTo("bounds", map);

    // Add place_changed listener
    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && place.geometry) {
        onPlaceSelected(place);
        setSearchText(place.formatted_address || place.name || "");
      }
    });

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

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-[400px]">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a location..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full h-10 pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        {searchText && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MapSearchBox;