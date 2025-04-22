// Geozone.tsx
import { useEffect, useRef, useState } from "react";

// Import hooks
import { useGoogleMaps } from "./hooks/useGoogleMaps";
import { useGeozoneData } from "./hooks/useGeozoneData";
import { useDrawingManager } from "./hooks/useDrawingManager";
import { useEditableShapes } from "./hooks/useEditableShapes";
import { setupAutocomplete } from "./utils/mapHelpers";

// Import components
import Header from "./components/Header";
import GeozoneMap from "./components/GeozoneMap";
import GeozoneTable from "./components/GeozoneTable";
// import CreateGeoZoneModal from "./components/CreateGeoZoneModal";
// import GeozoneControls from "./components/GeozoneControls";
// import DrawingTools from "./components/DrawingTools";

const Geozone = () => {
  // State variables
  const [showDrawingTools, setShowDrawingTools] = useState<boolean>(false);
  
  // Refs
  const mapRef:any = useRef<HTMLDivElement>(null);
  const autocompleteRef:any = useRef<HTMLInputElement>(null);
  const autocompleteInstance:any = useRef<any>(null);

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
    updateGeozoneShape
  } = useGeozoneData({ google, map });

  // Initialize Drawing Manager functionality
  const {
    selectedShape,
    setSelectedShape,
    activeDrawingTool,
    handleDrawingToolClick
  } = useDrawingManager({
    google,
    map,
    drawingManager,
    setFormField,
    setOpenModal
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
    updateGeozone: updateGeozoneShape
  });

  // Setup autocomplete for location search
  useEffect(() => {
    if (google && map && autocompleteRef.current) {
      autocompleteInstance.current = setupAutocomplete(
        google,
        map,
        autocompleteRef,
        setFormField,
        setSelectedShape,
        setOpenModal
      );
    }
  }, [google, map]);

  // Handle form submission
  const handleAddGeozone = () => {
    addGeozoneHandler(selectedShape);
    setShowDrawingTools(false);
  };

  // Close modal wrapper
  const handleCloseModal = () => {
    handleCloseDialog(selectedShape);
  };

  // Handle create geozone button click
  const handleCreateGeoZoneClick = () => {
    setShowDrawingTools(true);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <Header onCreateGeoZoneClick={handleCreateGeoZoneClick} />
      
      <div className="flex relative flex-grow overflow-hidden">
        {/* Map */}
        <GeozoneMap mapRef={mapRef} />

        {/* Drawing Tools Panel - Show only when in drawing mode */}
        {showDrawingTools && (
          <div className="absolute top-4 left-4 z-20 bg-white shadow-md p-4 rounded-md w-80">
            {/* <DrawingTools 
              activeDrawingTool={activeDrawingTool}
              handleDrawingToolClick={handleDrawingToolClick}
              autocompleteRef={autocompleteRef}
            /> */}
            <button
              onClick={() => setShowDrawingTools(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Geozone Table - Positioned on the left side of the map */}
        {!showDrawingTools && (
          <div className="absolute top-20 left-10 z-10 h-full">
            <GeozoneTable
              geozoneData={geozoneData}
              loading={loading}
              searchText={searchText}
              setSearchText={setSearchText}
              handleEditGeozone={handleEditGeozone}
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

        {/* Modal */}
        {/* <CreateGeoZoneModal
          isOpenModal={isOpen}
          handleUpdateDialogClose={handleCloseModal}
          setFormField={setFormField}
          formField={formField}
          addGeozoneHandler={handleAddGeozone}
          users={users}
          edit={edit}
          handleUserChange={handleUserChange}
        /> */}

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