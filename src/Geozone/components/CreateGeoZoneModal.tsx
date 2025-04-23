import React from "react";
import { XIcon } from "lucide-react";

interface User {
  _id: string;
  name: string;
  // Add other properties as needed
}

interface FormField {
  name: string;
  address: string;
  finalAddress: string;
  userId: string;
  radius: string;
  // Add other form fields as needed
}

interface CreateGeoZoneModalProps {
  isOpenModal: boolean;
  handleUpdateDialogClose: () => void;
  setFormField: (field: Partial<FormField>) => void;
  formField: FormField;
  addGeozoneHandler: () => void;
  users: User[];
  edit: boolean;
  handleUserChange: (userId: string) => void;
}

const CreateGeoZoneModal: React.FC<CreateGeoZoneModalProps> = ({
  isOpenModal,
  handleUpdateDialogClose,
  setFormField,
  formField,
  addGeozoneHandler,
  users,
  edit,
  handleUserChange,
}) => {
  if (!isOpenModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {edit ? "Update" : "Create"} Geo Zone
          </h2>
          <button
            onClick={handleUpdateDialogClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={formField.name}
              onChange={(e) => setFormField({ name: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User
            </label>
            <select
              value={formField.userId}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="Enter address"
              value={formField.address}
              onChange={(e) => setFormField({ address: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Final Address
            </label>
            <input
              type="text"
              placeholder="Enter final address"
              value={formField.finalAddress}
              onChange={(e) => setFormField({ finalAddress: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Radius (in meters)
            </label>
            <input
              type="number"
              placeholder="Enter radius"
              value={formField.radius}
              onChange={(e) => setFormField({ radius: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleUpdateDialogClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 mr-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={addGeozoneHandler}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {edit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGeoZoneModal;