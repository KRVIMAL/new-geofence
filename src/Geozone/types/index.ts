// types/index.ts

export interface GeoZone {
  _id: string;
  name: string;
  finalAddress: string;
  address?: string;
  userId?: string;
  userEmail?: string;
  mobileNumber?: string;
  isPublic?: boolean;
  isPrivate?: boolean;
  shapeData?: {
    type: string;
    coordinates: number[] | number[][];
    radius?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name?: string;
  fullName?: string;
  email?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FormField {
  name: string;
  address: string;
  finalAddress: string;
  userId: string;
  radius: string;
  shapeData?: any;
}

export interface GeozoneDataOptions {
  google: any;
  map: google.maps.Map | null;
}

export interface DrawingManagerOptions extends GeozoneDataOptions {
  drawingManager: google.maps.drawing.DrawingManager | null;
  setFormField: (field: Partial<FormField>) => void;
  setOpenModal: (open: boolean) => void;
}

export interface EditableShapesOptions extends GeozoneDataOptions {
  geozoneData: GeoZone[];
  updateGeozone: (id: string, data: any) => Promise<void>;
}