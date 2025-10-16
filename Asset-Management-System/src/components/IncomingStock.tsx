import React, { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Upload, Download } from "lucide-react";
import IncomingStockForm from "./IncomingStockForm";
import IncomingStockTable from "./IncomingStockTable";
import IncomingStockSearchBar from "./IncomingStockSearchBar";
import AllocationModal from "./AllocationModal";
import { IncomingStockImportModal } from "./IncomingStockImportModal";
import type { IncomingStock, Asset } from "../types/inventory";

interface IncomingStockProps {
  incomingStock: IncomingStock[];
  onAddStock: (stock: Omit<IncomingStock, "id">) => void;
  onAllocateStock: (stock: IncomingStock, assetData: Omit<Asset, "id">) => void;
  onImportStock: (stockItems: Omit<IncomingStock, "id">[]) => void;
}

const IncomingStockPage: React.FC<IncomingStockProps> = ({
  incomingStock,
  onAddStock,
  onAllocateStock,
  onImportStock,
}) => {
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<IncomingStock | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Filter incoming stock based on search term
  const filteredIncomingStock = useMemo(() => {
    if (!searchTerm.trim()) return incomingStock;

    const searchLower = searchTerm.toLowerCase();
    return incomingStock.filter((item) => {
      return (
        item.serialNumber.toLowerCase().includes(searchLower) ||
        item.brand.toLowerCase().includes(searchLower) ||
        item.model.toLowerCase().includes(searchLower) ||
        item.assetType.toLowerCase().includes(searchLower) ||
        item.assetSubtype.toLowerCase().includes(searchLower) ||
        (item.allocatedAssetTag &&
          item.allocatedAssetTag.toLowerCase().includes(searchLower)) ||
        (item.allocatedBy &&
          item.allocatedBy.toLowerCase().includes(searchLower))
      );
    });
  }, [incomingStock, searchTerm]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleAllocate = (stock: IncomingStock) => {
    setSelectedStock(stock);
    setIsAllocationModalOpen(true);
  };

  const handleCloseAllocationModal = () => {
    setIsAllocationModalOpen(false);
    setSelectedStock(null);
  };

  const handleSaveAllocation = (
    stock: IncomingStock,
    assetData: Omit<Asset, "id">
  ) => {
    onAllocateStock(stock, assetData);
    handleCloseAllocationModal();
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleSaveImport = (stockItems: Omit<IncomingStock, "id">[]) => {
    onImportStock(stockItems);
    handleCloseImportModal();
  };

  const handleExport = () => {
    const csvContent = [
      [
        "Serial Number",
        "Status",
        "Asset Type",
        "Asset Subtype",
        "Brand",
        "Model",
        "Allocated Asset Tag",
        "Allocated Date",
        "Allocated By",
      ],
      ...filteredIncomingStock.map((item) => [
        item.serialNumber,
        item.status,
        item.assetType,
        item.assetSubtype,
        item.brand,
        item.model,
        item.allocatedAssetTag || "",
        item.allocatedDate || "",
        item.allocatedBy || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "incoming-stock.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incoming Stock</h1>
          <p className="text-gray-600 mt-1">
            Manage incoming stock items and allocate them to the main inventory.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleImport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <IncomingStockSearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClear={handleClearSearch}
        />
        {searchTerm && (
          <div className="text-sm text-gray-600">
            {filteredIncomingStock.length} of {incomingStock.length} items
          </div>
        )}
      </div>

      <IncomingStockForm onSubmit={onAddStock} />
      <IncomingStockTable
        incomingStock={filteredIncomingStock}
        onAllocate={handleAllocate}
        readOnly={false}
      />

      <AllocationModal
        isOpen={isAllocationModalOpen}
        onClose={handleCloseAllocationModal}
        onSave={handleSaveAllocation}
        stock={selectedStock}
      />

      <IncomingStockImportModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onSave={handleSaveImport}
      />
    </div>
  );
};

export default IncomingStockPage;
