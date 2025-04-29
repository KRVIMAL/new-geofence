// Geozone.tsx
import { useRef, useState } from "react";

// Import hooks
import { useGoogleMaps } from "./hooks/useGoogleMaps";
import { useGeozoneData } from "./hooks/useGeozoneData";
import { useDrawingManager } from "./hooks/useDrawingManager";
import { useEditableShapes } from "./hooks/useEditableShapes";

// Import components
import Header from "./components/Header";
import GeozoneMap from "./components/GeozoneMap";
import GeozoneTable from "./components/GeozoneTable";
import GeofenceForm from "./components/GeofenceForm";
import MapSearchBox from "./components/MapSearchBox";
import DrawingTools from "./components/DrawingTools";
import { reverseGeocode } from "./utils/reverseGeocode";

const Geozone = () => {
  // State variables
  const [showDrawingTools, setShowDrawingTools] = useState<boolean>(false);
  const [showGeofenceForm, setShowGeofenceForm] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedGeozoneForEdit, setSelectedGeozoneForEdit] =
    useState<any>(null);
  const [currentCoordinates, setCurrentCoordinates] = useState({
    lat: 28.7041,
    lng: 77.1025,
  }); // Default to Delhi
  const [currentAddress, setCurrentAddress] = useState("");
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);
  // Refs
  const mapRef: any = useRef<HTMLDivElement>(null);
  const autocompleteRef: any = useRef<HTMLInputElement>(null);

  // Initialize Google Maps
  const { google, map, drawingManager, isLoaded } = useGoogleMaps(mapRef);

  // Initialize Geozone data handling
  const {
    geozoneData,
    users,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    total,
    searchText,
    setSearchText,
    selectedRowData,
    edit,
    isOpen,
    setOpenModal,
    formField,
    setFormField,
    addGeozoneHandler,
    handleEditGeozone,
    handleDeleteGeozone,
    handleCloseDialog,
    handleUserChange,
    updateGeozoneShape,
  } = useGeozoneData({ google, map });

  // Initialize Drawing Manager functionality
  const {
    selectedShape,
    setSelectedShape,
    activeDrawingTool,
    handleDrawingToolClick,
  } = useDrawingManager({
    google,
    map,
    drawingManager,
    setFormField,
    setOpenModal,
  });

  // Initialize editable shapes functionality
  const {
    // isEditMode,
    // toggleEditMode,
    // error: editShapesError
  } = useEditableShapes({
    google,
    map,
    geozoneData,
    updateGeozone: updateGeozoneShape,
  });

  // Handle shape creation with proper address extraction
  const handleGeofenceSubmit = async (formData: any) => {
    // Get the shape coordinates and type from the selected shape
    let coordinates;
    let radius;
    let shapeType = "Circle"; // Default to Circle

    if (selectedShape) {
      if (
        "getCenter" in selectedShape &&
        typeof selectedShape.getCenter === "function"
      ) {
        // For Circle
        const center: any = selectedShape.getCenter();
        coordinates = [center.lat(), center.lng()];
        radius = selectedShape.getRadius();
        shapeType = "Circle";

        // If address data is empty or incomplete, try to fetch it using reverse geocoding
        if (!formData.address || !formData.address.country) {
          try {
            const reverseGeocodingResult = await reverseGeocode(google, {
              lat: center.lat(),
              lng: center.lng(),
            });

            if (reverseGeocodingResult) {
              formData.address = reverseGeocodingResult.addressComponents;
              formData.finalAddress = reverseGeocodingResult.address;
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          }
        }
      } else if (
        "getPath" in selectedShape &&
        typeof selectedShape.getPath === "function"
      ) {
        // For Polygon
        const path = selectedShape.getPath();
        coordinates = path
          .getArray()
          .map((latLng: any) => [latLng.lat(), latLng.lng()]);
        shapeType = "Polygon";

        // Use the first point for reverse geocoding if needed
        if (!formData.address || !formData.address.country) {
          const firstPoint = path.getAt(0);
          try {
            const reverseGeocodingResult = await reverseGeocode(google, {
              lat: firstPoint.lat(),
              lng: firstPoint.lng(),
            });

            if (reverseGeocodingResult) {
              formData.address = reverseGeocodingResult.addressComponents;
              formData.finalAddress = reverseGeocodingResult.address;
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          }
        }
      } else if (
        "getBounds" in selectedShape &&
        typeof selectedShape.getBounds === "function"
      ) {
        // For Rectangle
        const bounds: any = selectedShape.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        coordinates = [
          [ne.lat(), ne.lng()],
          [sw.lat(), sw.lng()],
        ];
        shapeType = "Rectangle";

        // Use the center point for reverse geocoding if needed
        if (!formData.address || !formData.address.country) {
          const center = {
            lat: (ne.lat() + sw.lat()) / 2,
            lng: (ne.lng() + sw.lng()) / 2,
          };

          try {
            const reverseGeocodingResult = await reverseGeocode(google, center);

            if (reverseGeocodingResult) {
              formData.address = reverseGeocodingResult.addressComponents;
              formData.finalAddress = reverseGeocodingResult.address;
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          }
        }
      }
    }

    // Ensure we have an address object
    const addressData = formData.address || {};

    // Create proper payload structure
    const payload = {
      userId: "67cea10c4858dd0fc1e444e2",
      name: formData.name,
      mobileNumber: formData.mobileNumber || "9560564085",
      address: addressData,
      finalAddress: formData.finalAddress || currentAddress || "",
      geoCodeData: {
        type: "Feature",
        geometry: {
          type: shapeType,
          coordinates: coordinates || [],
          radius: radius || 1000,
        },
      },
      isPublic: formData.isPublic,
      isPrivate: formData.isPrivate,
      createdBy: localStorage.getItem("userName") || "admin",
    };
    if (editMode && formData._id) {
      // Update existing geozone
      updateGeozoneShape(formData._id, payload);
    } else {
      // Create new geozone
      addGeozoneHandler(payload);
    }

    // Close the form
    setShowGeofenceForm(false);
    setEditMode(false);
    setSelectedGeozoneForEdit(null);

    // Clear the selected shape
    if (selectedShape) {
      selectedShape.setMap(null);
      setSelectedShape(null);
    }
  };

  // Handle radius change from form
  const handleRadiusChange = (radius: number) => {
    if (
      selectedShape &&
      "setRadius" in selectedShape &&
      typeof selectedShape.setRadius === "function"
    ) {
      selectedShape.setRadius(radius);
    }
  };

  // Handle shape type change from form
  const handleShapeTypeChange = (shapeType: string) => {
    // Reset drawing mode
    if (drawingManager) {
      switch (shapeType) {
        case "Circle":
          handleDrawingToolClick("circle");
          break;
        case "Polygon":
          handleDrawingToolClick("polygon");
          break;
        default:
          break;
      }
    }
  };

  // Handle place selected from search box
  const handlePlaceSelected = async (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location && map) {
      const latLng = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      // Center map on selected location
      map.setCenter(latLng);
      map.setZoom(15);

      // Set current coordinates
      setCurrentCoordinates(latLng);

      // Extract address components
      let addressComponents = {
        zipCode: "",
        country: "",
        state: "",
        city: "",
        district: "",
        area: "",
      };

      let formattedAddress = "";

      if (place.address_components) {
        place.address_components.forEach((component) => {
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

        formattedAddress = place.formatted_address || "";
      } else {
        // If place doesn't have address_components, use reverse geocoding
        try {
          const reverseGeocodingResult = await reverseGeocode(google, latLng);
          if (reverseGeocodingResult) {
            addressComponents = reverseGeocodingResult.addressComponents;
            formattedAddress = reverseGeocodingResult.address;
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        }
      }

      // Set form fields with address data
      setFormField({
        ...formField,
        zipCode: { value: addressComponents.zipCode, error: "" },
        country: { value: addressComponents.country, error: "" },
        state: { value: addressComponents.state, error: "" },
        city: { value: addressComponents.city, error: "" },
        district: { value: addressComponents.district, error: "" },
        area: { value: addressComponents.area, error: "" },
        address: { value: formattedAddress, error: "" },
      });

      setCurrentAddress(formattedAddress);

      // Create a circle at the selected location
      if (google && drawingManager) {
        // Clear previous shape
        if (selectedShape) {
          selectedShape.setMap(null);
        }

        // Create new circle
        const circle = new google.maps.Circle({
          center: latLng,
          radius: 1000,
          map: map,
          fillColor: "#4285F4",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#4285F4",
          editable: true,
          draggable: true,
        });

        setSelectedShape(circle);

        // Open the geofence form
        setShowGeofenceForm(true);
        setEditMode(false);
        setSelectedGeozoneForEdit(null);
      }
    }
  };

  // Handle create geozone button click
  const handleCreateGeoZoneClick = () => {
    setShowDrawingTools(true);
    setShowGeofenceForm(false);
    setEditMode(false);
    setSelectedGeozoneForEdit(null);
    setShowSearchBox(true); // Add state variable to control search box visibility
  };

  // Handle edit geozone from table
  // Handle edit geozone from table
  const handleEditGeozoneFromTable = (geozone: any) => {
    setEditMode(true);
    setSelectedGeozoneForEdit(geozone);
    setShowGeofenceForm(true);
    setShowDrawingTools(false);

    if (map && google && geozone.geoCodeData?.geometry) {
      // Center map on the geozone
      const { coordinates, type, radius } = geozone.geoCodeData.geometry;

      if (
        type === "Circle" &&
        Array.isArray(coordinates) &&
        coordinates.length >= 2
      ) {
        const center = {
          lat: Number(coordinates[0]),
          lng: Number(coordinates[1]),
        };

        map.setCenter(center);
        map.setZoom(15);

        setCurrentCoordinates(center);
        setCurrentAddress(geozone.finalAddress || "");

        // Clear previous shape
        if (selectedShape) {
          selectedShape.setMap(null);
        }

        // Create circle representation
        const circle = new google.maps.Circle({
          center: center,
          radius: Number(radius) || 100,
          map: map,
          fillColor: "#4285F4",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#4285F4",
          editable: true,
          draggable: true,
        });

        setSelectedShape(circle);
      } else if (
        type === "Polygon" &&
        Array.isArray(coordinates) &&
        coordinates.length > 0
      ) {
        // Handle polygon rendering for edit
        const path = coordinates.map((coord: any) => ({
          lat: Number(coord[0]),
          lng: Number(coord[1]),
        }));

        // Calculate center for map positioning
        let sumLat = 0;
        let sumLng = 0;
        coordinates.forEach((coord: any) => {
          sumLat += Number(coord[0]);
          sumLng += Number(coord[1]);
        });

        const center = {
          lat: sumLat / coordinates.length,
          lng: sumLng / coordinates.length,
        };

        map.setCenter(center);
        map.setZoom(15);

        setCurrentCoordinates(center);
        setCurrentAddress(geozone.finalAddress || "");

        // Clear previous shape
        if (selectedShape) {
          selectedShape.setMap(null);
        }

        // Create polygon representation
        const polygon = new google.maps.Polygon({
          paths: path,
          map: map,
          fillColor: "#4285F4",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#4285F4",
          editable: true,
          draggable: true,
        });

        setSelectedShape(polygon);
      } else if (
        type === "Rectangle" &&
        Array.isArray(coordinates) &&
        coordinates.length >= 2
      ) {
        // Handle rectangle rendering for edit
        const ne = coordinates[0];
        const sw = coordinates[1];

        const bounds = {
          north: Number(ne[0]),
          east: Number(ne[1]),
          south: Number(sw[0]),
          west: Number(sw[1]),
        };

        const center = {
          lat: (Number(ne[0]) + Number(sw[0])) / 2,
          lng: (Number(ne[1]) + Number(sw[1])) / 2,
        };

        map.setCenter(center);
        map.setZoom(15);

        setCurrentCoordinates(center);
        setCurrentAddress(geozone.finalAddress || "");

        // Clear previous shape
        if (selectedShape) {
          selectedShape.setMap(null);
        }

        // Create rectangle representation
        const rectangle = new google.maps.Rectangle({
          bounds: bounds,
          map: map,
          fillColor: "#4285F4",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#4285F4",
          editable: true,
          draggable: true,
        });

        setSelectedShape(rectangle);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <Header onCreateGeoZoneClick={handleCreateGeoZoneClick} />

      <div className="flex relative flex-grow overflow-hidden">
        {/* Geofence Form - 30% width when visible */}
        {showGeofenceForm && (
          <div className="w-[30%] h-full">
            <GeofenceForm
              isOpen={showGeofenceForm}
              onClose={() => setShowGeofenceForm(false)}
              onSubmit={handleGeofenceSubmit}
              onShapeTypeChange={handleShapeTypeChange}
              onRadiusChange={handleRadiusChange}
              initialCoordinates={currentCoordinates}
              currentAddress={currentAddress}
              editMode={editMode}
              geozoneData={selectedGeozoneForEdit}
              selectedShape={selectedShape}
              setSelectedShape={setSelectedShape}
            />
          </div>
        )}

        {/* Map Container - takes remaining width */}
        <div
          className={`relative ${showGeofenceForm ? "w-[70%]" : "w-full"} h-full`}
        >
          {/* Map */}
          <GeozoneMap mapRef={mapRef} />

          {/* Map Search Box */}
          {isLoaded && google && map && showSearchBox && (
            <MapSearchBox
              google={google}
              map={map}
              onPlaceSelected={handlePlaceSelected}
              selectedShape={selectedShape}
              setSelectedShape={setSelectedShape}
            />
          )}

          {/* Drawing Tools Panel - Show only when in drawing mode */}
          {showDrawingTools && (
            <div className="absolute top-16 left-4 z-20 bg-white shadow-md p-4 rounded-md w-80">
              <DrawingTools
                activeDrawingTool={activeDrawingTool}
                handleDrawingToolClick={handleDrawingToolClick}
                autocompleteRef={autocompleteRef}
              />
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    setShowDrawingTools(false);
                    setShowSearchBox(false);
                    // Clear shape
                    if (selectedShape) {
                      selectedShape.setMap(null);
                      setSelectedShape(null);
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                {selectedShape && (
                  <button
                    onClick={() => {
                      setShowGeofenceForm(true);
                      setShowDrawingTools(false);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Geozone Table - only show when not in form or drawing mode */}
          {!showDrawingTools && !showGeofenceForm && (
            <div className="absolute top-16 left-0 z-10 h-[calc(100%-4rem)]">
              <GeozoneTable
                geozoneData={geozoneData}
                loading={loading}
                searchText={searchText}
                setSearchText={setSearchText}
                handleEditGeozone={handleEditGeozoneFromTable}
                handleDeleteGeozone={handleDeleteGeozone}
                page={page}
                setPage={setPage}
                limit={limit}
                setLimit={setLimit}
                total={total}
              />
            </div>
          )}

          {/* Map Controls */}
          {/* <GeozoneControls 
            isEditMode={isEditMode} 
            toggleEditMode={toggleEditMode}
            error={editShapesError}
            geozoneData={geozoneData}
          /> */}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Geozone;
