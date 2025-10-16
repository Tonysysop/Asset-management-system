import React, { useState, useMemo } from "react";
import { Button } from "./ui/button";
import {
  Download,
  LogOut,
  Package,
  Upload,
  LayoutDashboard,
  Table as TableIcon,
  FileText,
  ShoppingCart,
} from "lucide-react";
import IncomingStockTable from "./IncomingStockTable";
import IncomingStockSearchBar from "./IncomingStockSearchBar";
import IncomingStockForm from "./IncomingStockForm";
import { IncomingStockImportModal } from "./IncomingStockImportModal";
import StoreKeeperDashboard from "./StoreKeeperDashboard";
import BinCardDetail from "./BinCardDetail";
import ConsumablesView from "./ConsumablesView";
import ConfirmationDialog from "./ConfirmationDialog";
import type {
  IncomingStock,
  Consumable,
  ConsumableTransaction,
} from "../types/inventory";
import buaLogo from "../assets/bua-logo.jpg";

interface StockKeeperViewProps {
  incomingStock: IncomingStock[];
  consumables: Consumable[];
  consumableTransactions: ConsumableTransaction[];
  userEmail: string;
  onLogout: () => void;
  onAddStock: (stock: Omit<IncomingStock, "id">) => void;
  onImportStock: (stockItems: Omit<IncomingStock, "id">[]) => void;
  onDeleteStock: (stockId: string) => void;
  onReceiveConsumable: (consumable: Omit<Consumable, "id">) => void;
  onIssueConsumable: (transaction: Omit<ConsumableTransaction, "id">) => void;
  onUpdateConsumable: (transaction: Omit<ConsumableTransaction, "id">) => void;
}

const StockKeeperView: React.FC<StockKeeperViewProps> = ({
  incomingStock,
  consumables,
  consumableTransactions,
  userEmail,
  onLogout,
  onAddStock,
  onImportStock,
  onDeleteStock,
  onReceiveConsumable,
  onIssueConsumable,
  onUpdateConsumable,
}) => {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "stock" | "bin-card" | "consumables"
  >("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    stockId: string;
    serialNumber: string;
  }>({
    isOpen: false,
    stockId: "",
    serialNumber: "",
  });

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

  const handleDeleteStock = (stockId: string) => {
    const stockItem = incomingStock.find((item) => item.id === stockId);
    if (stockItem) {
      setDeleteConfirmation({
        isOpen: true,
        stockId,
        serialNumber: stockItem.serialNumber,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.stockId) {
      await onDeleteStock(deleteConfirmation.stockId);
      setDeleteConfirmation({
        isOpen: false,
        stockId: "",
        serialNumber: "",
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      stockId: "",
      serialNumber: "",
    });
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-bua-red shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src={buaLogo}
                alt="BUA Logo"
                className="h-10 w-auto object-contain"
              />
              <h1 className="text-2xl font-bold text-white">
                Stock Keeper Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-bua-gold">{userEmail}</span>
                <button
                  onClick={onLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium text-bua-red bg-bua-gold rounded-md hover:bg-yellow-300 transition-colors duration-150"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                currentView === "dashboard"
                  ? "border-bua-red text-bua-red"
                  : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("stock")}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                currentView === "stock"
                  ? "border-bua-red text-bua-red"
                  : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
              }`}
            >
              <TableIcon className="w-4 h-4 mr-2" />
              Stock Management
            </button>
            <button
              onClick={() => setCurrentView("bin-card")}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                currentView === "bin-card"
                  ? "border-bua-red text-bua-red"
                  : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Bin Card
            </button>
            <button
              onClick={() => setCurrentView("consumables")}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                currentView === "consumables"
                  ? "border-bua-red text-bua-red"
                  : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Consumables
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" ? (
          <StoreKeeperDashboard
            incomingStock={incomingStock}
            onNavigateToStock={() => setCurrentView("stock")}
            onNavigateToBinCard={() => setCurrentView("bin-card")}
            onAddStock={() => {
              setCurrentView("stock");
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 100);
            }}
            onImportStock={handleImport}
            onExportStock={handleExport}
          />
        ) : currentView === "bin-card" ? (
          <BinCardDetail
            incomingStock={incomingStock}
            consumables={consumables}
            consumableTransactions={consumableTransactions}
          />
        ) : currentView === "consumables" ? (
          <ConsumablesView
            consumables={consumables}
            transactions={consumableTransactions}
            onReceiveStock={onReceiveConsumable}
            onIssueStock={onIssueConsumable}
            onUpdateConsumable={onUpdateConsumable}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-8 h-8 text-bua-red" />
                  Incoming Stock
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage incoming stock items - add, allocate, and track
                  inventory.
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
              onDelete={handleDeleteStock}
              readOnly={false}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <IncomingStockImportModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onSave={handleSaveImport}
      />
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Stock Item"
        message={`To confirm deletion, please enter the serial number "${deleteConfirmation.serialNumber}" below. This action cannot be undone.`}
        confirmText="Delete"
        requireAssetTag={true}
        assetTag={deleteConfirmation.serialNumber}
      />
    </div>
  );
};

export default StockKeeperView;
