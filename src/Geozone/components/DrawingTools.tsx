import React from "react";
import { Square, Circle, Triangle, Hand } from "lucide-react";

interface DrawingToolsProps {
  activeDrawingTool: string | null;
  handleDrawingToolClick: (tool: string) => void;
  autocompleteRef?: React.RefObject<HTMLInputElement>;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({
  activeDrawingTool,
  handleDrawingToolClick,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-gray-800 border-l-4 border-blue-600 pl-2">
        Drawing Tools
      </h2>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleDrawingToolClick("rectangle")}
          className={`flex items-center justify-center p-3 rounded-md ${
            activeDrawingTool === "rectangle"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          } hover:bg-blue-100 hover:text-blue-700`}
        >
          <Square className="h-5 w-5 mr-2" />
          <span>Rectangle</span>
        </button>

        <button
          onClick={() => handleDrawingToolClick("circle")}
          className={`flex items-center justify-center p-3 rounded-md ${
            activeDrawingTool === "circle"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          } hover:bg-blue-100 hover:text-blue-700`}
        >
          <Circle className="h-5 w-5 mr-2" />
          <span>Circle</span>
        </button>

        <button
          onClick={() => handleDrawingToolClick("polygon")}
          className={`flex items-center justify-center p-3 rounded-md ${
            activeDrawingTool === "polygon"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          } hover:bg-blue-100 hover:text-blue-700`}
        >
          <Triangle className="h-5 w-5 mr-2" />
          <span>Polygon</span>
        </button>

        <button
          onClick={() => handleDrawingToolClick("null")}
          className={`flex items-center justify-center p-3 rounded-md ${
            activeDrawingTool === null
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          } hover:bg-blue-100 hover:text-blue-700`}
        >
          <Hand className="h-5 w-5 mr-2" />
          <span>Pan</span>
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Draw a shape on the map to create a geofence. You can adjust the shape
          after drawing.
        </p>
      </div>
    </div>
  );
};

export default DrawingTools;
