// hooks/useGeozoneData.ts
import { useState, useEffect, useCallback } from "react";
import { GeoZone, User, FormField, GeozoneDataOptions } from "../types/index";
import toast from 'react-hot-toast';
// Import these functions from your API service
import {
  fetchGeozoneHandler,
  searchGeozones,
  createGeozone,
  updateGeozone,
  deleteGeozone,
  searchUsers,
} from "../services/geozone.service";

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
  setFormField: any;
  addGeozoneHandler: (selectedShape: any) => void;
  handleEditGeozone: (geozone: GeoZone) => void;
  handleDeleteGeozone: (id: string) => void;
  handleCloseDialog: (selectedShape?: any) => void;
  handleUserChange: (userId: string) => void;
  updateGeozoneShape: (id: string, data: any) => Promise<void>;
}

const defaultFormField: FormField = {
  name: "",
  address: "",
  finalAddress: "",
  userId: "",
  radius: "",
  shapeData: null,
};

export const useGeozoneData = ({ google, map }: GeozoneDataOptions): UseGeozoneDataReturn => {
  // State for geozone data
  const [geozoneData, setGeozoneData] = useState<GeoZone[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPageInternal] = useState<number>(1);
  const [limit, setLimitInternal] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");

  // State for user data
  const [users, setUsers] = useState<User[]>([]);

  // State for form and modal
  const [isOpen, setOpenModal] = useState<boolean>(false);
  const [formField, setFormField] = useState<FormField>(defaultFormField);
  const [selectedRowData, setSelectedRowData] = useState<GeoZone | null>(null);
  const [edit, setEdit] = useState<boolean>(false);

  // State for map shapes
  const [shapes, setShapes] = useState<any[]>([]);
  
  // Track if we should preserve the page number when changing limit
  const [shouldPreservePage, setShouldPreservePage] = useState(false);

  // Safe page setter that prevents NaN values
  const setPage = (newPage: number) => {
    // Ensure page is a number and >= 1
    if (isNaN(newPage) || newPage < 1) {
      setPageInternal(1);
      return;
    }
    
    // Calculate total pages based on current limit and total items
    const totalPages = Math.max(1, Math.ceil(total / limit));
    
    // If the requested page is greater than total pages, set to max page
    if (newPage > totalPages && totalPages > 0) {
      setPageInternal(totalPages);
    } else {
      setPageInternal(newPage);
    }
  };

  // Safe limit setter that prevents NaN values
  const setLimit = (newLimit: number) => {
    // Ensure limit is a number and >= 5
    if (isNaN(newLimit) || newLimit < 5) {
      setLimitInternal(10);
    } else {
      setLimitInternal(newLimit);
      // Don't auto-change the page - let the user manually navigate
    }
  };

  // Recalculate page when limit changes
  useEffect(() => {
    if (shouldPreservePage) {
      setShouldPreservePage(false);
      
      // Calculate new total pages with new limit
      const newTotalPages = Math.ceil(total / limit);
      
      // If current page is greater than new total pages, adjust it
      if (page > newTotalPages && newTotalPages > 0) {
        setPageInternal(newTotalPages);
      }
      // Otherwise keep the same page if it's still valid
    }
  }, [limit, total, page, shouldPreservePage]);

  // Fetch geozone data with safe pagination parameters
  const fetchGeozones = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use safe values for API calls
      const safePage = !isNaN(page) ? page : 1;
      const safeLimit = !isNaN(limit) ? limit : 10;

      let response;
      if (searchText) {
        response = await searchGeozones({
          input: { page: safePage, limit: safeLimit, searchText },
        });
        
        const { searchGeozone } = response;
        setGeozoneData(searchGeozone.data || []);
        setTotal(searchGeozone.paginatorInfo.count || 0);
      } else {
        response = await fetchGeozoneHandler({
          input: { page: safePage, limit: safeLimit },
        });
        
        // Make sure we have valid data
        if (response && response.data) {
          setGeozoneData(response.data.data || []);
          setTotal(response.total || response.data.total);
        } else {
          setGeozoneData([]);
          setTotal(0);
          console.error("Invalid response format:", response);
        }
      }
      
      // Log pagination details for debugging
      console.log(`Fetched geozones: Page ${safePage}, Limit ${safeLimit}, Total ${response.total || 0}`);
    } catch (error) {
      console.error("Error fetching geozones:", error);
      toast.error("Failed to load geozones");
      setGeozoneData([]);
      setTotal(0);
    }
     finally {
      setLoading(false);
    }
  }, [page, limit, searchText]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await searchUsers(1, 100, {});
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      toast.error("Failed to load users");
    } finally {
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

  // Update search results with debounce
  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (page === 1) {
        fetchGeozones();
      } else {
        // Reset to page 1 when search text changes
        setPageInternal(1);
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
    const newShapes = geozoneData
      .map((geozone: any) => {
        if (!geozone.geoCodeData?.geometry) return null;

        const { geometry } = geozone.geoCodeData;
        const { type, coordinates, radius } = geometry;
        let shape: any = null;

        switch (type) {
          case "Circle":
            if (Array.isArray(coordinates) && coordinates.length >= 2) {
              shape = new google.maps.Circle({
                center: {
                  lat: Number(coordinates[0]),
                  lng: Number(coordinates[1]),
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

          case "Polygon":
            if (Array.isArray(coordinates) && coordinates.length > 0) {
              const path = coordinates.map((coord: any) => ({
                lat: Number(coord[0]),
                lng: Number(coord[1]),
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

          case "Rectangle":
            if (Array.isArray(coordinates) && coordinates.length >= 2) {
              const ne: any = coordinates[0];
              const sw: any = coordinates[1];

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
            <p style="margin-bottom: 3px;">${geozone.finalAddress || ""}</p>
            ${type === "Circle" ? `<p>Radius: ${radius}m</p>` : ""}
          </div>
        `,
          });

          shape.addListener("click", (e: any) => {
            const position =
              e.latLng || (type === "Circle" ? shape.getCenter() : null);
            if (position) {
              infoWindow.setPosition(position);
              infoWindow.open(map);
            }
          });

          // Store reference to geozone data
          shape.geozoneData = geozone;
        }

        return shape;
      })
      .filter(Boolean);

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

  const addGeozoneHandler = async (payload: any) => {
    try {
      setLoading(true);

      if (edit && selectedRowData) {
      const res=  await updateGeozone({
          input: {
            ...payload,
            _id: selectedRowData._id,
          },
        });
        toast.success(res?.message);
      } else {
      const res=  await createGeozone({
          input: payload,
        });
      toast.success(res.message);
      }
      // Clear form and close modal
      setFormField(defaultFormField);
      setOpenModal(false);
      setEdit(false);
      setSelectedRowData(null);

      // Refresh data
      fetchGeozones();
    } catch (error:any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  // Edit geozone
const handleEditGeozone = (geozone: any) => {
  setSelectedRowData(geozone);
  setEdit(true);
  
  // Format the form data correctly
  const formFieldData = {
    name: geozone.name || '',
    address: geozone.address || '',
    finalAddress: geozone.finalAddress || '',
    userId: geozone.userId || '',
    radius: geozone.geoCodeData?.geometry?.radius?.toString() || '',
    shapeData: geozone.geoCodeData?.geometry || null
  };
  
  setFormField(formFieldData);
  setOpenModal(true);
  
  // Center map on geozone
  if (map && geozone.geoCodeData?.geometry?.coordinates) {
    const { coordinates } = geozone.geoCodeData.geometry;
    
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
    try {
      setLoading(true);
    const res=  await deleteGeozone(id);
    toast.success(res.message);
      // Remove the shape from the map
      shapes.forEach((shape) => {
        if (shape?.geozoneData?._id === id) {
          shape.setMap(null);
        }
      });

      // Remove from shapes array
      setShapes(shapes.filter((shape) => shape?.geozoneData?._id !== id));

      // Check if deleting the last item on a page
      if (geozoneData.length === 1 && page > 1) {
        // Go to previous page
        setPage(page - 1);
      } else {
        // Stay on current page and refresh
        fetchGeozones();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Close dialog
  const handleCloseDialog = (selectedShape?: any) => {
    setOpenModal(false);
    setFormField(defaultFormField);
    setEdit(false);
    setSelectedRowData(null);

    // Remove shape from map if it exists
    if (selectedShape && typeof selectedShape.setMap === "function") {
      selectedShape.setMap(null);
    }
  };

  // Handle user selection
  const handleUserChange = (userId: string) => {
    const user = users.find((u) => u._id === userId);
    setFormField({
      ...formField,
      userId,
    });
  };


  // Update geozone shape
  const updateGeozoneShape = async (id: string, shapeData: any) => {
    try {
      setLoading(true);

      // Ensure we're sending the data in the expected format
      const payload = {
        input: {
          _id: id,
          ...shapeData,
        },
      };

      const res = await updateGeozone(payload);
      toast.success(res.message);
      
      // Refresh the data after update
      await fetchGeozones();

      setLoading(false);
      return Promise.resolve();
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
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
    updateGeozoneShape,
  };
};
