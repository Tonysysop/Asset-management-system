import React, { useState, useMemo, useEffect } from "react";
import type {
  Asset,
  AssetType,
  AssetStatus,
  UserRole,
  Receivable,
  License,
} from "./types/inventory";
import {
  getAssets,
  addAsset,
  updateAsset,
  deleteAsset,
} from "./services/assetService";
import {
  getReceivables,
  addReceivable,
  updateReceivable,
  deleteReceivable,
} from "./services/receivableService";
import {
  getLicenses,
  addLicense,
  updateLicense,
  deleteLicense,
} from "./services/licenseService";
import {
  exportToCSV,
  exportReceivablesToCSV,
  exportLicensesToCSV,
} from "./utils/csvExport";
import EnhancedDashboard from "./components/EnhancedDashboard";
import InventoryTable from "./components/InventoryTable";
import ReceivablesTable from "./components/ReceivablesTable";
import LicensesTable from "./components/LicensesTable";
import SearchAndFilter from "./components/SearchAndFilter";
import AssetModal from "./components/AssetModal";
import ReceivableModal from "./components/ReceivableModal";
import LicenseModal from "./components/LicenseModal";
import UserRoleSelector from "./components/UserRoleSelector";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { Plus, BarChart3, Table, Package, Key, LogOut } from "lucide-react";

function App() {
  const { currentUser, logout } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [userRole, setUserRole] = useState<UserRole>("admin");

  useEffect(() => {
    const fetchAllData = async () => {
      setAssets(await getAssets());
      setReceivables(await getReceivables());
      setLicenses(await getLicenses());
    };
    fetchAllData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const [currentView, setCurrentView] = useState<
    "dashboard" | "inventory" | "receivables" | "licenses"
  >("dashboard");

  // Modal states
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [editingReceivable, setEditingReceivable] = useState<
    Receivable | undefined
  >();
  const [editingLicense, setEditingLicense] = useState<License | undefined>();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<AssetType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | "all">(
    "all"
  );
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Get unique departments for filter
  const departments = useMemo(() => {
    const assetDepts = assets.map((asset) => asset.department);
    const licenseDepts = licenses.map((license) => license.department);
    return Array.from(new Set([...assetDepts, ...licenseDepts])).sort();
  }, [assets, licenses]);

  // Filter assets based on search and filter criteria
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assignedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === "all" || asset.type === selectedType;
      const matchesStatus =
        selectedStatus === "all" || asset.status === selectedStatus;
      const matchesDepartment =
        !selectedDepartment || asset.department === selectedDepartment;

      return matchesSearch && matchesType && matchesStatus && matchesDepartment;
    });
  }, [assets, searchTerm, selectedType, selectedStatus, selectedDepartment]);

  // Filter receivables based on search
  const filteredReceivables = useMemo(() => {
    return receivables.filter((receivable) => {
      const matchesSearch =
        receivable.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receivable.serialNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        receivable.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receivable.supplierName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "all" || receivable.category === selectedType;

      return matchesSearch && matchesType;
    });
  }, [receivables, searchTerm, selectedType]);

  // Filter licenses based on search
  const filteredLicenses = useMemo(() => {
    return licenses.filter((license) => {
      const matchesSearch =
        license.licenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.assignedUser.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        !selectedDepartment || license.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [licenses, searchTerm, selectedDepartment]);

  // Asset handlers
  const handleAddAsset = () => {
    setEditingAsset(undefined);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      await deleteAsset(id);
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
    }
  };

  const handleSaveAsset = async (assetData: Omit<Asset, "id">) => {
    if (editingAsset) {
      await updateAsset(editingAsset.id, assetData);
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === editingAsset.id
            ? { ...asset, ...assetData }
            : asset
        )
      );
    } else {
      const newAsset = await addAsset(assetData);
      setAssets((prev) => [...prev, newAsset]);
    }
  };

  // Receivable handlers
  const handleAddReceivable = () => {
    setEditingReceivable(undefined);
    setIsReceivableModalOpen(true);
  };

  const handleEditReceivable = (receivable: Receivable) => {
    setEditingReceivable(receivable);
    setIsReceivableModalOpen(true);
  };

  const handleDeleteReceivable = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this receivable?")) {
      await deleteReceivable(id);
      setReceivables((prev) =>
        prev.filter((receivable) => receivable.id !== id)
      );
    }
  };

  const handleSaveReceivable = async (
    receivableData: Omit<Receivable, "id">
  ) => {
    if (editingReceivable) {
      await updateReceivable(editingReceivable.id, receivableData);
      setReceivables((prev) =>
        prev.map((receivable) =>
          receivable.id === editingReceivable.id
            ? { ...receivable, ...receivableData }
            : receivable
        )
      );
    } else {
      const newReceivable = await addReceivable(receivableData);
      setReceivables((prev) => [...prev, newReceivable]);
    }
  };

  const handleDeployReceivable = async (receivable: Receivable) => {
    if (window.confirm("Deploy this receivable to active inventory?")) {
      // Create new asset from receivable
      const newAssetData: Omit<Asset, "id"> = {
        assetTag: `AUTO-${receivable.serialNumber}`,
        serialNumber: receivable.serialNumber,
        type: receivable.category,
        brand: receivable.brand,
        model: receivable.itemName,
        specifications: receivable.description,
        purchaseDate: receivable.purchaseDate,
        warrantyExpiry: new Date(
          new Date(receivable.purchaseDate).getTime() +
            365 * 24 * 60 * 60 * 1000 * 3
        )
          .toISOString()
          .split("T")[0], // 3 years default
        vendor: receivable.supplierName,
        assignedUser: "Unassigned",
        department: "IT",
        status: "spare",
        location: "IT Storage",
        notes: `Deployed from receivables: ${receivable.notes}`,
      };
      const newAsset = await addAsset(newAssetData);
      setAssets((prev) => [...prev, newAsset]);

      // Update receivable status to deployed
      await updateReceivable(receivable.id, { status: "deployed" });
      setReceivables((prev) =>
        prev.map((r) =>
          r.id === receivable.id ? { ...r, status: "deployed" as const } : r
        )
      );
    }
  };

  // License handlers
  const handleAddLicense = () => {
    setEditingLicense(undefined);
    setIsLicenseModalOpen(true);
  };

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
    setIsLicenseModalOpen(true);
  };

  const handleDeleteLicense = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this license?")) {
      await deleteLicense(id);
      setLicenses((prev) => prev.filter((license) => license.id !== id));
    }
  };

  const handleSaveLicense = async (licenseData: Omit<License, "id">) => {
    if (editingLicense) {
      await updateLicense(editingLicense.id, licenseData);
      setLicenses((prev) =>
        prev.map((license) =>
          license.id === editingLicense.id
            ? { ...license, ...licenseData }
            : license
        )
      );
    } else {
      const newLicense = await addLicense(licenseData);
      setLicenses((prev) => [...prev, newLicense]);
    }
  };

  // Export handlers
  const handleExportAssets = () => {
    exportToCSV(filteredAssets, "it-inventory");
  };

  const handleExportReceivables = () => {
    exportReceivablesToCSV(filteredReceivables, "receivables");
  };

  const handleExportLicenses = () => {
    exportLicensesToCSV(filteredLicenses, "licenses");
  };

  const getAddButtonText = () => {
    switch (currentView) {
      case "inventory":
        return "Add Asset";
      case "receivables":
        return "Add Receivable";
      case "licenses":
        return "Add License";
      default:
        return "Add Item";
    }
  };

  const handleAddClick = () => {
    switch (currentView) {
      case "inventory":
        handleAddAsset();
        break;
      case "receivables":
        handleAddReceivable();
        break;
      case "licenses":
        handleAddLicense();
        break;
    }
  };

  const getExportHandler = () => {
    switch (currentView) {
      case "inventory":
        return handleExportAssets;
      case "receivables":
        return handleExportReceivables;
      case "licenses":
        return handleExportLicenses;
      default:
        return handleExportAssets;
    }
  };

  const getCurrentData = () => {
    switch (currentView) {
      case "inventory":
        return filteredAssets;
      case "receivables":
        return filteredReceivables;
      case "licenses":
        return filteredLicenses;
      default:
        return [];
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  IT Asset Management System
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <UserRoleSelector
                  currentRole={userRole}
                  onRoleChange={setUserRole}
                />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {currentUser?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
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

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "dashboard"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("inventory")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "inventory"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Table className="w-4 h-4 mr-2" />
                Inventory
              </button>
              <button
                onClick={() => setCurrentView("receivables")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "receivables"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                Receivables
              </button>
              <button
                onClick={() => setCurrentView("licenses")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "licenses"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Key className="w-4 h-4 mr-2" />
                Licenses
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === "dashboard" ? (
            <EnhancedDashboard
              assets={assets}
              receivables={receivables}
              licenses={licenses}
            />
          ) : (
            <div className="space-y-6">
              {/* Search and Filter */}
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={setSelectedDepartment}
                departments={departments}
                onExport={getExportHandler()}
              />

              {/* Add Button (Admin and Auditor) */}
              {(userRole === "admin" || userRole === "auditor") && (
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentView.charAt(0).toUpperCase() + currentView.slice(1)}{" "}
                    ({getCurrentData().length})
                  </h2>
                  {userRole === "admin" && (
                    <button
                      onClick={handleAddClick}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {getAddButtonText()}
                    </button>
                  )}
                </div>
              )}

              {/* Data Tables */}
              {currentView === "inventory" && (
                <InventoryTable
                  assets={filteredAssets}
                  userRole={userRole}
                  onEdit={handleEditAsset}
                  onDelete={handleDeleteAsset}
                />
              )}

              {currentView === "receivables" && (
                <ReceivablesTable
                  receivables={filteredReceivables}
                  userRole={userRole}
                  onEdit={handleEditReceivable}
                  onDelete={handleDeleteReceivable}
                  onDeploy={handleDeployReceivable}
                />
              )}

              {currentView === "licenses" && (
                <LicensesTable
                  licenses={filteredLicenses}
                  userRole={userRole}
                  onEdit={handleEditLicense}
                  onDelete={handleDeleteLicense}
                />
              )}
            </div>
          )}
        </main>

        {/* Modals */}
        <AssetModal
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          onSave={handleSaveAsset}
          asset={editingAsset}
        />

        <ReceivableModal
          isOpen={isReceivableModalOpen}
          onClose={() => setIsReceivableModalOpen(false)}
          onSave={handleSaveReceivable}
          receivable={editingReceivable}
        />

        <LicenseModal
          isOpen={isLicenseModalOpen}
          onClose={() => setIsLicenseModalOpen(false)}
          onSave={handleSaveLicense}
          license={editingLicense}
        />
      </div>
    </ProtectedRoute>
  );
}

export default App;
