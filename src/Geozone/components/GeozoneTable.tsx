import React, { useState } from "react";
import {
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react";
import { GeoZone } from "../types";
import DeletePopover from "./DeletePopover";
// import DeletePopover from "./DeletePopover"; // Import the DeletePopover component

interface GeozoneTableProps {
  geozoneData: GeoZone[];
  loading: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  handleEditGeozone: (geozone: GeoZone) => void;
  handleDeleteGeozone: (id: string) => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  total: number;
}

const GeozoneTable: React.FC<GeozoneTableProps> = ({
  geozoneData,
  loading,
  searchText,
  setSearchText,
  handleEditGeozone,
  handleDeleteGeozone,
  page,
  setPage,
  limit,
  setLimit,
  total,
}) => {
  const [isTableVisible, setIsTableVisible] = useState(true);
  const toggleTable = () => {
    setIsTableVisible(!isTableVisible);
  };

  return (
    <div className="relative">
      {/* Toggle button - always visible */}
      <button
        onClick={toggleTable}
        className={`fixed z-30 bg-white shadow-md rounded-r-md p-2 flex items-center justify-center
    ${
      isTableVisible
        ? "left-[512px] top-[300px] -translate-y-1/2"
        : "left-6 top-[300px] -translate-y-1/2"
    }`}
      >
        {isTableVisible ? (
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Table container with conditional width */}
      <div
        className={`bg-white rounded-md shadow-md transition-all duration-300 ease-in-out ${isTableVisible ? "w-[450px]" : "w-0 overflow-hidden"}`}
      >
        {isTableVisible && (
          <>
            <div className="p-4 border-b">
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Search geozone..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md bg-white"
                />
                <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="bg-[#F1F1F1]">
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      #
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      Address
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    geozoneData.map((item, index) => (
                      <tr
                        key={item._id}
                        className={
                          index % 2 === 0 ? "bg-[#F0F7FF]" : "bg-[#FFFFFF]"
                        }
                      >
                        <td className="py-3 px-4 text-sm">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {item.name || "--"}
                        </td>
                        <td className="py-3 px-4 text-sm relative">
                          <div
                            className="truncate max-w-[150px]"
                            title={item.finalAddress || "--"}
                          >
                            {item.finalAddress || "--"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditGeozone(item)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            {/* Replace the delete button with our DeletePopover component */}
                            <DeletePopover
                              title={`Delete Geozone`}
                              description={`Are you sure you want to delete the "${item.name}" geozone?`}
                              onDelete={() => handleDeleteGeozone(item._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-4 border-t">
              {/* Limit Selection */}
              <div className="flex items-center">
                <span className="text-gray-600 mr-2 text-sm">
                  Row Per Page:
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>

              {/* Page Navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="p-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {Array.from(
                  { length: Math.min(3, Math.ceil(total / limit)) },
                  (_, i) => {
                    // Calculate page numbers to show based on current page
                    let pageNum;
                    const totalPages = Math.ceil(total / limit);

                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (page <= 2) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 1) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = page - 1 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md 
                          ${
                            page === pageNum
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-700 border border-gray-300"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() =>
                    setPage(Math.min(page + 1, Math.ceil(total / limit)))
                  }
                  disabled={page === Math.ceil(total / limit)}
                  className="p-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GeozoneTable;