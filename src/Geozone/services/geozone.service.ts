// services/geozone.service.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-dev.k8s.imztech.io/api/v1/geofence';
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3000/api/users';

// Fetch geozone list
export const fetchGeozoneHandler = async (params: { input: any }) => {
  try {
    const { page = 1, limit = 10, searchText = '' } = params.input;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(searchText && { searchText })
    }).toString();
    
    const response = await axios.get(`${BASE_URL}/geofences?${queryParams}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching geozones:', error);
    throw error.message;
  }
};

// Search geozones
export const searchGeozones = async (params: { input: any }) => {
  try {
    const { page = 1, limit = 10, searchText = '' } = params.input;
    const response = await axios.get(
      `${BASE_URL}/geofences/search?page=${page}&limit=${limit}&searchText=${searchText}`
    );
    
    return {
      searchGeozone: {
        data: response.data.data,
        paginatorInfo: {
          count: response.data.total,
          currentPage: page,
          perPage: limit,
        },
      },
    };
  } catch (error: any) {
    console.error('Error searching geozones:', error);
    throw error.message;
  }
};

// Create new geozone
export const createGeozone = async (data: { input: any }) => {
  try {
    const response = await axios.post(`${BASE_URL}/geofences`, data.input);
    return response.data;
  } catch (error: any) {
    console.error('Error creating geozone:', error);
    throw error.message;
  }
};

// Update existing geozone
export const updateGeozone = async (data: { input: any }) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/geofences/${data.input._id}`,
      data.input
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating geozone:', error);
    throw error.message;
  }
};

// Delete geozone
export const deleteGeozone = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/geofences/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting geozone:', error);
    throw error.message;
  }
};

// Get geozone by ID
export const getGeozoneById = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/geofences/${id}`);
    return {
      getGeozone: {
        data: response.data,
      },
    };
  } catch (error: any) {
    console.error('Error getting geozone:', error);
    throw error.message;
  }
};

// Search users
export const searchUsers = async (page = 1, limit = 10, search = {}) => {
  try {
    const response = await axios.post(
      USER_SERVICE_URL,
      {
        page,
        limit,
        search,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw error.message;
  }
};