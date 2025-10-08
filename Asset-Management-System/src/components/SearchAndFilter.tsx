import React from "react";
import { Search, Download, Filter, X } from "lucide-react";
import type { AssetType, AssetStatus } from "../types/inventory";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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

  // Count active filters
  const activeFiltersCount = [
    searchTerm && searchTerm.length > 0,
    selectedType !== "all",
    selectedStatus !== "all",
    selectedDepartment !== "" && selectedDepartment !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onSearchChange("");
    onTypeChange("all");
    onStatusChange("all");
    onDepartmentChange("");
  };

  const getFilterIcon = (type: string) => {
    const icons: Record<string, string> = {
      laptop: "💻",
      desktop: "🖥️",
      printer: "🖨️",
      scanner: "📷",
      monitor: "🖥️",
      server: "🖥️",
      router: "📶",
      switch: "🔌",
      mobile: "📱",
    };
    return icons[type] || "📦";
  };

  return (
    <Card className="mb-2 border border-gray-200">
      <CardContent className="p-2">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Filter className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-gray-900">
              SEARCH & FILTER
            </span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 h-4 px-1 cursor-pointer"
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>

        {/* Search and Filters in Same Row */}
        <div className="flex gap-1 items-center">
          {/* Search Input - Reduced width */}
          <div className="relative w-120 space-x-1">
            <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-6  text-xs"
            />
          </div>

          {/* Compact Filters - Take the other half */}
          <div className="flex flex-1 gap-1">
            {/* Asset Type Filter */}
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger className="h-6 flex-1 text-xs cursor-pointer">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    <div className="flex items-center gap-1">
                      <span>{getFilterIcon(type)}</span>
                      <span>
                        {type === "all"
                          ? "All Types"
                          : type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="h-6 flex-1 text-xs cursor-pointer">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {assetStatuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-xs">
                    <div className="flex items-center gap-1">
                      {status !== "all" && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            status === "in-use"
                              ? "bg-green-500"
                              : status === "spare"
                              ? "bg-blue-500"
                              : status === "repair"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />
                      )}
                      <span>
                        {status === "all"
                          ? "All Status"
                          : status.replace("-", " ").toUpperCase()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select
              value={
                selectedDepartment === "" ? "all" : selectedDepartment || "all"
              }
              onValueChange={(value) =>
                onDepartmentChange(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="h-6 flex-1 text-xs cursor-pointer">
                <SelectValue placeholder="Dept" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Depts
                </SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-xs">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export Button */}
            {canExport && (
              <Button
                onClick={onExport}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-2 text-xs whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3 h-3 mr-0.5" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display - Only show if active */}
        {(searchTerm ||
          selectedType !== "all" ||
          selectedStatus !== "all" ||
          selectedDepartment) &&
          activeFiltersCount > 0 && (
            <div className="mt-2 pt-1 border-t border-gray-100">
              <div className="flex flex-wrap gap-0.5">
                {searchTerm && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                    "{searchTerm}"
                    <button
                      onClick={() => onSearchChange("")}
                      className="ml-0.5 hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
                {selectedType !== "all" && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                    <span className="mr-0.5">
                      {getFilterIcon(selectedType)}
                    </span>
                    {selectedType}
                    <button
                      onClick={() => onTypeChange("all")}
                      className="ml-0.5 hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
                {selectedStatus !== "all" && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mr-0.5 ${
                        selectedStatus === "in-use"
                          ? "bg-green-500"
                          : selectedStatus === "spare"
                          ? "bg-blue-500"
                          : selectedStatus === "repair"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    {selectedStatus}
                    <button
                      onClick={() => onStatusChange("all")}
                      className="ml-0.5 hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
                {selectedDepartment && selectedDepartment !== "all" && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                    {selectedDepartment}
                    <button
                      onClick={() => onDepartmentChange("")}
                      className="ml-0.5 hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;
