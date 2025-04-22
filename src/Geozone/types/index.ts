// types/index.ts

export interface GeoZone {
    _id: string;
    name: string;
    finalAddress: string;
    address?: string;
    userId?: string;
    pincode?: string;
    shapeData?: any;
    radius?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface User {
    _id: string;
    name: string;
    email?: string;
    role?: string;
  }
  
  export interface FormField {
    name: string;
    address: string;
    finalAddress: string;
    userId: string;
    radius: string;
    pincode?: string;
    shapeData?: any;
  }
  
  export interface MapOptions {
    google: any;
    map: google.maps.Map | null;
  }
  
  export interface DrawingManagerOptions extends MapOptions {
    drawingManager: google.maps.drawing.DrawingManager | null;
    setFormField: (field: Partial<FormField>) => void;
    setOpenModal: (open: boolean) => void;
  }
  
  export interface EditableShapesOptions extends MapOptions {
    geozoneData: GeoZone[];
    updateGeozone: (id: string, data: any) => void;
  }
  
  export interface GeozoneDataOptions extends MapOptions {
    
  }
  
  export interface PaginationOptions {
    page: number;
    limit: number;
    total: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
  }
  
  export interface SearchOptions {
    searchText: string;
    setSearchText: (text: string) => void;
  }
  
  export interface GeozoneListProps extends PaginationOptions, SearchOptions {
    geozoneData: GeoZone[];
    loading: boolean;
    handleEditGeozone: (geozone: GeoZone) => void;
    handleDeleteGeozone: (id: string) => void;
  }
  
  export interface DrawingToolsProps {
    activeDrawingTool: string | null;
    handleDrawingToolClick: (tool: string) => void;
    autocompleteRef: React.RefObject<HTMLInputElement>;
  }