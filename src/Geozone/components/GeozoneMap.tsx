import React from 'react';

interface MapProps {
  mapRef: React.RefObject<HTMLDivElement>;
}

const GeozoneMap: React.FC<MapProps> = ({ mapRef }) => {
  return (
    <div className="flex-grow h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ height: 'calc(100vh - 64px)' }} // Subtract header height
      />
    </div>
  );
};

export default GeozoneMap;