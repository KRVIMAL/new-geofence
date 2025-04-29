import React, { useState, useEffect } from "react";
import {
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react";
import { GeoZone } from "../types";
import DeletePopover from "./DeletePopover";
import Pagination from "./Pagination"; // Import our improved Pagination component

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
  
  // Ensure we have valid values for page and limit
  const safePage = !isNaN(page) && page > 0 ? page : 1;
  const safeLimit = !isNaN(limit) && limit > 0 ? limit : 10;
  
  // Calculate total pages - this is crucial for pagination to work correctly
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  
  // Check if current page exceeds total pages after changing limit
  useEffect(() => {
    if (safePage > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [safeLimit, total, safePage, totalPages, setPage]);
  
  // Calculate row number for each item
  const getRowNumber = (index: number): number => {
    return (safePage - 1) * safeLimit + index + 1;
  };
  
  // Toggle table visibility
  const toggleTable = () => {
    setIsTableVisible(!isTableVisible);
  };

  // Debug logs to help troubleshoot pagination
  useEffect(() => {
    console.log("Pagination debug info:");
    console.log("- Current page:", safePage);
    console.log("- Items per page:", safeLimit);
    console.log("- Total items:", total);
    console.log("- Total pages calculated:", totalPages);
    console.log("- Current data length:", geozoneData.length);
  }, [safePage, safeLimit, total, totalPages, geozoneData.length]);

  return (
    <div className="relative">
      {/* Toggle button - always visible */}
      <button
        onClick={toggleTable}
        className={`fixed z-30 bg-white shadow-md rounded-r-md p-2 flex items-center justify-center
    ${
      isTableVisible
        ? "left-[472px] top-[300px] -translate-y-1/2"
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
                  ) : geozoneData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        No geozones found
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
                          {getRowNumber(index)}
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

            {/* Show pagination only if there are items */}
            {/* {total > 0 && ( */}
            <Pagination
  currentPage={safePage}
  totalItems={total}
  limit={safeLimit}
  onPageChange={setPage}
  onLimitChange={setLimit}
/>
            {/* )} */}
          </>
        )}
      </div>
    </div>
  );
};

export default GeozoneTable;