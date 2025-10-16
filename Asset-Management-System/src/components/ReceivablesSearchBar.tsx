import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface ReceivablesSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

const ReceivablesSearchBar: React.FC<ReceivablesSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search receivables by serial number, brand, model, vendor...",
}) => {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-bua-red focus:border-bua-red"
        />
        {searchTerm && (
          <Button
            onClick={handleClearSearch}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReceivablesSearchBar;
