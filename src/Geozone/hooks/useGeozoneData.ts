// hooks/useGeozoneData.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  GeoZone, 
  User, 
  FormField, 
  GeozoneDataOptions 
} from '../types/index';

// Import these functions from your API service
import {
  fetchGeozoneHandler,
  searchGeozones,
  createGeozone,
  updateGeozone,
  deleteGeozone,
  searchUsers
} from '../services/geozone.service';

interface UseGeozoneDataReturn {
  geozoneData: GeoZone[];
  users: User[];
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  total: number;
  searchText: string;
  setSearchText: (text: string) => void;
  selectedRowData: GeoZone | null;
  edit: boolean;
  isOpen: boolean;
  setOpenModal: (open: boolean) => void;
  formField: FormField;
  setFormField: (field: Partial<FormField>) => void;
  addGeozoneHandler: (selectedShape: any) => void;
  handleEditGeozone: (geozone: GeoZone) => void;
  handleDeleteGeozone: (id: string) => void;
  handleCloseDialog: (selectedShape?: any) => void;
  handleUserChange: (userId: string) => void;
  updateGeozoneShape: (id: string, data: any) => Promise<void>;
}

const defaultFormField: FormField = {
  name: '',
  address: '',
  finalAddress: '',
  userId: '',
  radius: '',
  shapeData: null
};

export const useGeozoneData = ({ google, map }: GeozoneDataOptions): any => {
  // State for geozone data
  const [geozoneData, setGeozoneData] = useState<GeoZone[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  
  // State for user data
  const [users, setUsers] = useState<User[]>([]);
  
  // State for form and modal
  const [isOpen, setOpenModal] = useState<boolean>(false);
  const [formField, setFormField] = useState<FormField>(defaultFormField);
  const [selectedRowData, setSelectedRowData] = useState<GeoZone | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  
  // State for map shapes
  const [shapes, setShapes] = useState<any[]>([]);

  // Fetch geozone data
  const fetchGeozones = useCallback(async () => {
    try {
      setLoading(true);
      
      let response;
      if (searchText) {
        response = await searchGeozones({
          input: { page, limit, searchText }
        });
        const { searchGeozone } = response;
        setGeozoneData(searchGeozone.data);
        setTotal(searchGeozone.paginatorInfo.count);
      } else {
        response = await fetchGeozoneHandler({
          input: { page, limit }
        });
        console.log({response:response.data.data})
        setGeozoneData(response.data.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error fetching geozones:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchText]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await searchUsers(1, 100, {});
      setUsers(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchGeozones();
  }, [fetchGeozones]);

  // Update search results
  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (page === 1) {
        fetchGeozones();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(debounceSearch);
  }, [searchText]);

  // Display geozones on map
  useEffect(() => {
    if (!map || !google || !geozoneData?.length) return;
    
    // Clear existing shapes
    shapes.forEach((shape) => {
      if (shape && typeof shape.setMap === "function") {
        shape.setMap(null);
      }
    });
    
    // Create new shapes for each geozone
    const newShapes = geozoneData.map((geozone) => {
      if (!geozone.shapeData) return null;
      
      const { shapeData } = geozone;
      const { type, coordinates, radius } = shapeData;
      let shape: any = null;
      
      switch (type) {
        case 'circle':
          if (Array.isArray(coordinates) && coordinates.length >= 2) {
            shape = new google.maps.Circle({
              center: { 
                lat: Number(coordinates[0]), 
                lng: Number(coordinates[1]) 
              },
              radius: Number(radius) || 100,
              map,
              fillColor: "#4285F4",
              fillOpacity: 0.3,
              strokeWeight: 2,
              strokeColor: "#4285F4",
            });
          }
          break;
          
        case 'polygon':
          if (Array.isArray(coordinates) && coordinates.length > 0) {
            const path = coordinates.map((coord: any) => ({
              lat: Number(coord[0]),
              lng: Number(coord[1])
            }));
            
            shape = new google.maps.Polygon({
              paths: path,
              map,
              fillColor: "#4285F4",
              fillOpacity: 0.3,
              strokeWeight: 2,
              strokeColor: "#4285F4",
            });
          }
          break;
          
        case 'rectangle':
          if (Array.isArray(coordinates) && coordinates.length >= 2) {
            const ne = coordinates[0];
            const sw = coordinates[1];
            
            const bounds = {
              north: Number(ne[0]),
              east: Number(ne[1]),
              south: Number(sw[0]),
              west: Number(sw[1]),
            };
            
            shape = new google.maps.Rectangle({
              bounds: bounds,
              map,
              fillColor: "#4285F4",
              fillOpacity: 0.3,
              strokeWeight: 2,
              strokeColor: "#4285F4",
            });
          }
          break;
      }
      
      if (shape) {
        // Add click event to show info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <h3 style="font-weight: bold; margin-bottom: 5px;">${geozone.name}</h3>
              <p style="margin-bottom: 3px;">${geozone.finalAddress || ''}</p>
              ${type === 'circle' ? `<p>Radius: ${radius}m</p>` : ''}
            </div>
          `
        });
        
        shape.addListener('click', (e: any) => {
          const position = e.latLng || (type === 'circle' ? shape.getCenter() : null);
          if (position) {
            infoWindow.setPosition(position);
            infoWindow.open(map);
          }
        });
        
        // Store reference to geozone data
        shape.geozoneData = geozone;
      }
      
      return shape;
    }).filter(Boolean);
    
    setShapes(newShapes);
    
    return () => {
      // Cleanup shapes when component unmounts
      newShapes.forEach((shape) => {
        if (shape && typeof shape.setMap === "function") {
          google.maps.event.clearInstanceListeners(shape);
          shape.setMap(null);
        }
      });
    };
  }, [map, google, geozoneData]);

  // Add new geozone
  const addGeozoneHandler = async (selectedShape: any) => {
    try {
      setLoading(true);
      
      // Prepare payload
      const payload: any = {
        name: formField.name,
        address: formField.address,
        finalAddress: formField.finalAddress,
        userId: formField.userId || undefined,
        radius: formField.radius ? Number(formField.radius) : undefined,
        shapeData: formField.shapeData
      };
      
      let response;
      if (edit && selectedRowData) {
        response = await updateGeozone({
          input: {
            ...payload,
            _id: selectedRowData._id
          }
        });
      } else {
        response = await createGeozone({
          input: payload
        });
      }
      
      // Clear form and close modal
      setFormField(defaultFormField);
      setOpenModal(false);
      setEdit(false);
      setSelectedRowData(null);
      
      // Remove shape from map
      if (selectedShape) {
        selectedShape.setMap(null);
      }
      
      // Refresh data
      fetchGeozones();
      
    } catch (error) {
      console.error('Error saving geozone:', error);
    } finally {
      setLoading(false);
    }
  };

  // Edit geozone
  const handleEditGeozone = (geozone: GeoZone) => {
    setSelectedRowData(geozone);
    setEdit(true);
    
    setFormField({
      name: geozone.name || '',
      address: geozone.address || '',
      finalAddress: geozone.finalAddress || '',
      userId: geozone.userId || '',
      radius: geozone.shapeData?.radius?.toString() || '',
      shapeData: geozone.shapeData || null
    });
    
    setOpenModal(true);
    
    // Center map on geozone
    if (map && geozone.shapeData?.coordinates) {
      const { coordinates } = geozone.shapeData;
      
      if (Array.isArray(coordinates)) {
        let lat, lng;
        
        if (Array.isArray(coordinates[0])) {
          // For polygon and rectangle
          lat = coordinates[0][0];
          lng = coordinates[0][1];
        } else {
          // For circle
          lat = coordinates[0];
          lng = coordinates[1];
        }
        
        if (lat !== undefined && lng !== undefined) {
          map.setCenter({ lat: Number(lat), lng: Number(lng) });
          map.setZoom(15);
        }
      }
    }
  };

  // Delete geozone
  const handleDeleteGeozone = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this geozone?')) {
      try {
        setLoading(true);
        await deleteGeozone(id);
        
        // Remove the shape from the map
        shapes.forEach((shape) => {
          if (shape?.geozoneData?._id === id) {
            shape.setMap(null);
          }
        });
        
        // Remove from shapes array
        setShapes(shapes.filter(shape => shape?.geozoneData?._id !== id));
        
        fetchGeozones();
      } catch (error) {
        console.error('Error deleting geozone:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Close dialog
  const handleCloseDialog = (selectedShape?: any) => {
    setOpenModal(false);
    setFormField(defaultFormField);
    setEdit(false);
    setSelectedRowData(null);
    
    // Remove shape from map if it exists
    if (selectedShape && typeof selectedShape.setMap === 'function') {
      selectedShape.setMap(null);
    }
  };

  // Handle user selection
  const handleUserChange = (userId: string) => {
    const user = users.find(u => u._id === userId);
    setFormField({ 
      ...formField,
      userId 
    });
  };

  // Update geozone shape
  const updateGeozoneShape = async (id: string, shapeData: any) => {
    try {
      await updateGeozone({
        input: {
          _id: id,
          shapeData
        }
      });
      
      await fetchGeozones();
    } catch (error) {
      console.error('Error updating geozone shape:', error);
      return Promise.reject(error);
    }
  };

  return {
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
  };
};