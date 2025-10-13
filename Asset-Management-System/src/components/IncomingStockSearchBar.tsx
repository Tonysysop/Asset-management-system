import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, X } from "lucide-react";

interface IncomingStockSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const IncomingStockSearchBar: React.FC<IncomingStockSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onClear,
  placeholder = "Search by serial number, brand, model, or asset type...",
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default IncomingStockSearchBar;
