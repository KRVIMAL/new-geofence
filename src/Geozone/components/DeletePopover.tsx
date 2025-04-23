"use client";

import React, { useState, useRef } from 'react';
import { PiTrashFill } from 'react-icons/pi';

type DeletePopoverProps = {
  title: string;
  description: string;
  onDelete?: () => void;
};

export default function DeletePopover({
  title,
  description,
  onDelete,
}: DeletePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDelete = () => {
    onDelete && onDelete();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Delete Item"
      >
        <PiTrashFill className="w-4 h-4" />
      </button>

      {/* Popover Content */}
      {isOpen && (
        <div className="absolute right-full mr-2 top-0 z-10 w-56 rounded-md border border-gray-200 bg-white shadow-md">
          <div className="p-3">
            <h6 className="mb-1 flex items-start text-sm font-semibold text-gray-700">
              <PiTrashFill className="mr-1 w-[17px] h-[17px]" /> {title}
            </h6>
            <p className="mb-3 text-sm leading-relaxed text-gray-500">
              {description}
            </p>
            <div className="flex items-center justify-end">
              <button
                className="mr-2 h-7 px-3 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                onClick={handleDelete}
              >
                Yes
              </button>
              <button
                className="h-7 px-3 text-xs font-medium border border-gray-300 rounded hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}