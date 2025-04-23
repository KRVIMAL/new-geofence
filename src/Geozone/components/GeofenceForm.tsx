import React, { useState, useEffect } from "react";
import { XIcon, Search, X } from "lucide-react";
import { Coordinates, GeoZone } from "../types";

interface GeofenceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (geofenceData: any) => void;
  onShapeTypeChange?: (shapeType: string) => void;
  onRadiusChange?: (radius: number) => void;
  initialCoordinates: Coordinates;
  currentAddress?: string;
  editMode?: boolean;
  geozoneData?: GeoZone | null | any;
  selectedShape: any;
  setSelectedShape: (shape: any) => void;
}

const GeofenceForm: React.FC<GeofenceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onShapeTypeChange = () => {},
  onRadiusChange = () => {},
  initialCoordinates,
  currentAddress = "",
  editMode = false,
  geozoneData = null,
  selectedShape,
  setSelectedShape,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    isPublic: true,
    isPrivate: false,
    mobileNumber: "",
    radius: 100,
    shapeType: "Circle",
    coordinates: [initialCoordinates.lat, initialCoordinates.lng],
  });

  const [addressData, setAddressData] = useState({
    zipCode: "",
    country: "",
    state: "",
    area: "",
    city: "",
    district: "",
  });

  const [finalAddress, setFinalAddress] = useState(currentAddress);

  // Reset form or populate with existing data
  useEffect(() => {
    if (isOpen) {
      if (editMode && geozoneData) {
        // Populate form with existing data for editing
        const coordinates = geozoneData.geoCodeData?.geometry?.coordinates || [
          initialCoordinates.lat,
          initialCoordinates.lng,
        ];

        setFormData({
          name: geozoneData.name || "",
          isPublic: geozoneData.isPublic || true,
          isPrivate: geozoneData.isPrivate || false,
          mobileNumber: geozoneData.mobileNumber || "",
          radius: geozoneData.geoCodeData?.geometry?.radius || 100,
          shapeType: geozoneData.geoCodeData?.geometry?.type || "Circle",
          coordinates: Array.isArray(coordinates[0])
            ? coordinates[0]
            : coordinates,
        });

        // Set address data if available
        if (geozoneData.address) {
          setAddressData({
            zipCode: geozoneData.address.zipCode || "",
            country: geozoneData.address.country || "",
            state: geozoneData.address.state || "",
            area: geozoneData.address.area || "",
            city: geozoneData.address.city || "",
            district: geozoneData.address.district || "",
          });
        }

        if (geozoneData.finalAddress) {
          setFinalAddress(geozoneData.finalAddress);
          if (!geozoneData.address) {
            extractAddressComponents(geozoneData.finalAddress);
          }
        }
      } else {
        // Reset the form state with default values
        setFormData({
          name: "",
          isPublic: true,
          isPrivate: false,
          mobileNumber: "",
          radius: 100,
          shapeType: "Circle",
          coordinates: [initialCoordinates.lat, initialCoordinates.lng],
        });

        if (currentAddress) {
          setFinalAddress(currentAddress);
          extractAddressComponents(currentAddress);
        }
      }
    }
  }, [isOpen, initialCoordinates, currentAddress, editMode, geozoneData]);

  // Extract address components from formatted address
  const extractAddressComponents = (address: string) => {
    const parts = address.split(",").map((part) => part.trim());
    const addressObj = { ...addressData };

    if (parts.length > 0) {
      // Try to extract zip code from the last part
      const zipMatch = parts[parts.length - 1].match(/\d{5,6}/);
      if (zipMatch) {
        addressObj.zipCode = zipMatch[0];
      }

      // The country is often the last meaningful part
      if (parts.length > 1) {
        addressObj.country = parts[parts.length - 1].replace(/\d+/, "").trim();
      }

      // The state/province is often the second-to-last part
      if (parts.length > 2) {
        addressObj.state = parts[parts.length - 2];
      }

      // The city is often the third-to-last part
      if (parts.length > 3) {
        addressObj.city = parts[parts.length - 3];
      }

      // Area and district might be earlier parts
      if (parts.length > 4) {
        addressObj.district = parts[parts.length - 4];
      }

      if (parts.length > 5) {
        addressObj.area = parts[parts.length - 5];
      }
    }

    setAddressData(addressObj);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseFloat(e.target.value);

    // Update local state
    setFormData((prev) => ({
      ...prev,
      radius: newRadius,
    }));

    // Notify parent component about radius change
    onRadiusChange(newRadius);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "radio") {
      if (name === "visibility") {
        setFormData({
          ...formData,
          isPublic: value === "public",
          isPrivate: value === "private",
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === "number" ? parseFloat(value) : value,
      });

      // If shape type changed, notify parent
      if (name === "shapeType") {
        onShapeTypeChange(value);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare payload
    const payload: any = {
      userId: "67cea10c4858dd0fc1e444e2", // Default user ID or get from context/props
      userEmail: localStorage.getItem("userEmail") || "",
      name: formData.name,
      mobileNumber: formData.mobileNumber,
      address: addressData, // Include the addressData state
      finalAddress,
      shapeData: {
        type: formData.shapeType,
        coordinates: formData.coordinates,
        radius: formData.radius,
      },
      isPublic: formData.isPublic,
      isPrivate: formData.isPrivate,
      createdBy: localStorage.getItem("userName") || "admin",
    };

    // If editing, include the ID
    if (editMode && geozoneData) {
      payload._id = geozoneData._id;
    }

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white h-full overflow-y-auto w-full">
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {editMode ? "Update" : "Create"} Geo Zone
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter name"
            />
          </div>

          {/* Shape Type */}
          <div className="mb-4">
            <label
              htmlFor="shapeType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shape Type *
            </label>
            <select
              id="shapeType"
              name="shapeType"
              value={formData.shapeType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Circle">Circle</option>
              <option value="Polygon">Polygon</option>
            </select>
          </div>

          {/* Visibility Settings */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility Settings *
            </label>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  id="visibility-public"
                  name="visibility"
                  type="radio"
                  value="public"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="visibility-public"
                  className="ml-2 text-sm text-gray-700"
                >
                  Public
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="visibility-private"
                  name="visibility"
                  type="radio"
                  value="private"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="visibility-private"
                  className="ml-2 text-sm text-gray-700"
                >
                  Private
                </label>
              </div>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="mb-4">
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mobile Number
            </label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="text"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mobile number"
            />
          </div>

          {/* Radius (Only for Circle) */}
          {formData.shapeType === "Circle" && (
            <div className="mb-4">
              <label
                htmlFor="radius"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Radius (meters) *
              </label>
              <input
                id="radius"
                name="radius"
                type="number"
                min="10"
                max="10000"
                value={formData.radius}
                onChange={handleRadiusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Coordinates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coordinates
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="lat" className="block text-xs text-gray-500">
                  Latitude
                </label>
                <input
                  id="lat"
                  type="text"
                  value={formData.coordinates[0]}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="lng" className="block text-xs text-gray-500">
                  Longitude
                </label>
                <input
                  id="lng"
                  type="text"
                  value={formData.coordinates[1]}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          {editMode && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={finalAddress}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md h-20 resize-none"
              />
            </div>
          )}

          <div className="flex justify-start mt-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                // Clear shape
                if (selectedShape) {
                  selectedShape.setMap(null);
                  setSelectedShape(null);
                }
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editMode ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeofenceForm;
