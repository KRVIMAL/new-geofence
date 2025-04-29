import React, { memo, FC } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  // Ensure we have valid values
  const safePage = !isNaN(currentPage) && currentPage > 0 ? currentPage : 1;
  const safeLimit = !isNaN(limit) && limit > 0 ? limit : 10;
  const safeTotal = !isNaN(totalItems) && totalItems >= 0 ? totalItems : 0;

  // Calculate the total number of pages

  const totalPages = Math.ceil(safeTotal / safeLimit);
  const renderPageNumbers = () => {
    const pageButtons = [];

    // Make sure totalPages is at least 1
    const pages = Math.max(1, totalPages);

    // Simple loop to show all pages (for small number of pages)
    for (let i = 1; i <= pages; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-md 
          ${safePage === i ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
        >
          {i} {/* Make sure the page number is displayed here */}
        </button>
      );
    }
    return pageButtons;
  };
  
  return (
    <div
      className="flex justify-between items-center p-4 border-t"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {/* Row Per Page selector */}
      <div className="flex items-center">
        <span className="text-gray-600 mr-2 text-sm">Row Per Page:</span>
        <select
          value={safeLimit}
          onChange={(e) => {
            const newLimit = Number(e.target.value);
            onLimitChange(newLimit);
            // When changing limit, recalculate if we need to adjust the page
            const newTotalPages = Math.ceil(safeTotal / newLimit);
            if (safePage > newTotalPages) {
              onPageChange(Math.max(1, newTotalPages));
            } else {
              // Keep on same page if it's still valid
              onPageChange(safePage);
            }
          }}
          className="bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        {/* Previous page button */}
        <button
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="p-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <HiChevronLeft className="h-5 w-5" />
        </button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1">{renderPageNumbers()}</div>

        {/* Next page button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage >= totalPages}
          className="p-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <HiChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default memo(Pagination);
