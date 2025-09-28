import React from "react";
import { Search, Download } from "lucide-react";
import type { AssetType, AssetStatus } from "../types/inventory";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: AssetType | "all";
  onTypeChange: (type: AssetType | "all") => void;
  selectedStatus: AssetStatus | "all";
  onStatusChange: (status: AssetStatus | "all") => void;
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
  departments: string[];
  onExport: () => void;
  canExport?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
  onExport,
  canExport = true,
}) => {
  const assetTypes: (AssetType | "all")[] = [
    "all",
    "laptop",
    "desktop",
    "printer",
    "scanner",
    "monitor",
    "server",
    "router",
    "switch",
    "mobile",
  ];
  const assetStatuses: (AssetStatus | "all")[] = [
    "all",
    "in-use",
    "spare",
    "repair",
    "retired",
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Asset Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as AssetType | "all")}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {assetTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all"
                  ? "All Types"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) =>
              onStatusChange(e.target.value as AssetStatus | "all")
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {assetStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "all"
                  ? "All Statuses"
                  : status.replace("-", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Export Button (Admin only) */}
        {canExport && (
          <div>
            <button
              onClick={onExport}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;
