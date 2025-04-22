// Header.tsx
import React from 'react';
import { PlusCircleIcon, StarIcon, FilterIcon, UserIcon } from 'lucide-react';

interface HeaderProps {
  onCreateGeoZoneClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateGeoZoneClick }) => {
  return (
    <header className="bg-white w-full h-8 flex items-center justify-between px-4 border-b border-gray-200">
      <div>
        <button 
          onClick={onCreateGeoZoneClick}
          className="flex items-center  text-dark px-4 py-2 rounded-md transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2  text-blue-600" />
          <span>Create Geo Zone</span>
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <StarIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <FilterIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <UserIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;