import { useState, useMemo, useEffect } from "react";
import type {
  Asset,
  AssetType,
  AssetStatus,
  UserRole,
  Receivable,
  License,
} from "./types/inventory";
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
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { BarChart3, Table, Package, Key, LogOut, History, ArchiveRestore } from "lucide-react";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import AuditTrail from "./components/AuditTrail";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { useStore } from "./store/store";

function AppContent() {
  const { currentUser, logout } = useAuth();
  const {
    assets,
    retrievedAssets,
    receivables,
    licenses,
    fetchAllData,
    addAsset,
    updateAsset,
    deleteAsset,
    retrieveAsset,
    addReceivable,
    updateReceivable,
    deleteReceivable,
    addLicense,
    updateLicense,
    deleteLicense,
  } = useStore();
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const { showToast } = useToast();

  // Sync userRole with URL path (/ for admin, /audit for auditor)
  useEffect(() => {
    const applyRoleFromPath = () => {
      const isAuditPath = window.location.pathname === "/audit";
      setUserRole(isAuditPath ? "auditor" : "admin");
    };
    applyRoleFromPath();
    const onPopState = () => applyRoleFromPath();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Ensure role matches URL right after login/logout
  useEffect(() => {
    const isAuditPath = window.location.pathname === "/audit";
    setUserRole(isAuditPath ? "auditor" : "admin");
  }, [currentUser]);

  // Note: URL controls role; we do not push URL changes based on role.

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      showToast("Logout failed", "error");
    }
  };

  const handleRetrieveAsset = async (asset: Asset) => {
    try {
      const retrieved = {
        ...asset,
        retrievedDate: new Date().toISOString().split('T')[0],
        retrievedBy: currentUser?.email || 'Unknown User',
      } as unknown;
      await retrieveAsset(asset.id, retrieved, currentUser?.email || 'Unknown User');
      showToast("Asset moved to Retrieved", "success");
    } catch {
      showToast("Error retrieving asset", "error");
    }
  };

  const handleRedeployFromRetrieved = (asset: Asset) => {
    setRedeployConfirmation(asset);
  };
  const [currentView, setCurrentView] = useState<
    "dashboard" | "inventory" | "receivables" | "licenses" | "retrieved" | "audit"
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
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ 
    isOpen: boolean; 
    id: string; 
    type: 'asset' | 'receivable' | 'license'; 
  } | null>(null);
  const [redeployConfirmation, setRedeployConfirmation] = useState<Asset | null>(null);

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

  const filteredRetrieved = useMemo(() => {
    return retrievedAssets.filter((asset) => {
      const matchesSearch =
        asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assignedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === "all" || asset.type === selectedType;
      const matchesDepartment =
        !selectedDepartment || asset.department === selectedDepartment;

      return matchesSearch && matchesType && matchesDepartment;
    });
  }, [retrievedAssets, searchTerm, selectedType, selectedDepartment]);

  // Asset handlers
  const handleAddAsset = () => {
    setEditingAsset(undefined);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id, type: 'asset' });
  };

  const handleSaveAsset = async (assetData: Omit<Asset, "id">) => {
    try {
      if (editingAsset) {
        // If editing asset that exists in retrieved view, add new asset and remove retrieved
        const isRedeploying = currentView === 'retrieved' || (retrievedAssets.find(a => a.id === editingAsset?.id) ? true : false);
        if (isRedeploying) {
          await addAsset(assetData, currentUser?.email || "Unknown User");
          await useStore.getState().removeRetrieved(editingAsset.id, currentUser?.email || "Unknown User");
          showToast("Asset redeployed to Inventory", "success");
        } else {
          await updateAsset(editingAsset.id, assetData, currentUser?.email || "Unknown User");
          showToast("Asset updated successfully", "success");
        }
      } else {
        await addAsset(assetData, currentUser?.email || "Unknown User");
        showToast("Asset added successfully", "success");
      }
    } catch {
      showToast("Error saving asset", "error");
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

  const handleDeleteReceivable = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id, type: 'receivable' });
  };

  const handleSaveReceivable = async (
    receivableData: Omit<Receivable, "id">
  ) => {
    try {
      if (editingReceivable) {
        await updateReceivable(editingReceivable.id, receivableData, currentUser?.email || "Unknown User");
        showToast("Receivable updated successfully", "success");
      } else {
        await addReceivable(receivableData, currentUser?.email || "Unknown User");
        showToast("Receivable added successfully", "success");
      }
    } catch {
      showToast("Error saving receivable", "error");
    }
  };

  const handleDeployReceivable = async (receivable: Receivable) => {
    if (window.confirm("Deploy this receivable to active inventory?")) {
      try {
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
        await addAsset(newAssetData, currentUser?.email || "Unknown User");

        // Update receivable status to deployed
        await updateReceivable(receivable.id, { status: "deployed" }, currentUser?.email || "Unknown User");
        showToast("Receivable deployed successfully", "success");
      } catch {
        showToast("Error deploying receivable", "error");
      }
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

  const handleDeleteLicense = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id, type: 'license' });
  };

  const handleSaveLicense = async (licenseData: Omit<License, "id">) => {
    try {
      if (editingLicense) {
        await updateLicense(editingLicense.id, licenseData, currentUser?.email || "Unknown User");
        showToast("License updated successfully", "success");
      } else {
        await addLicense(licenseData, currentUser?.email || "Unknown User");
        showToast("License added successfully", "success");
      }
    } catch {
      showToast("Error saving license", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      const { id, type } = deleteConfirmation;
      try {
        if (type === 'asset') {
          await deleteAsset(id, currentUser?.email || "Unknown User");
          showToast("Asset deleted successfully", "success");
        } else if (type === 'receivable') {
          await deleteReceivable(id, currentUser?.email || "Unknown User");
          showToast("Receivable deleted successfully", "success");
        } else if (type === 'license') {
          await deleteLicense(id, currentUser?.email || "Unknown User");
          showToast("License deleted successfully", "success");
        }
      } catch {
        showToast(`Error deleting ${type}`, "error");
      }
      setDeleteConfirmation(null);
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

  const handleImport = () => {
    fetchAllData();
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
              <button
                onClick={() => setCurrentView("retrieved")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "retrieved"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <ArchiveRestore className="w-4 h-4 mr-2" />
                Retrieved
              </button>
              {userRole === "auditor" && (
                <button
                  onClick={() => setCurrentView("audit")}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                    currentView === "audit"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <History className="w-4 h-4 mr-2" />
                  Audit Trail
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === "dashboard" && (
            <EnhancedDashboard
              assets={assets}
              receivables={receivables}
              licenses={licenses}
              onImport={handleImport}
              onAssetAdded={fetchAllData}
              onLicenseAdded={fetchAllData}
              onReceivableAdded={fetchAllData}
            />
          )}
          {currentView !== "dashboard" && currentView !== "audit" && (
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
          )}
          {currentView === "inventory" && (
            <InventoryTable
              assets={filteredAssets}
              userRole={userRole}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              onImport={handleImport}
              onAdd={handleAddAsset}
              onRetrieve={handleRetrieveAsset}
            />
          )}
          {currentView === "receivables" && (
            <ReceivablesTable
              userRole={userRole}
              onEdit={handleEditReceivable}
              onDelete={handleDeleteReceivable}
              onDeploy={handleDeployReceivable}
              onImport={handleImport}
              onAdd={handleAddReceivable}
            />
          )}
          {currentView === "licenses" && (
            <LicensesTable
              licenses={filteredLicenses}
              userRole={userRole}
              onEdit={handleEditLicense}
              onDelete={handleDeleteLicense}
              onImport={handleImport}
              onAdd={handleAddLicense}
            />
          )}
          {currentView === "retrieved" && (
            <InventoryTable
              assets={filteredRetrieved}
              userRole={userRole}
              onEdit={handleRedeployFromRetrieved}
              onDelete={handleDeleteAsset}
              onImport={handleImport}
              onAdd={handleAddAsset}
              isRetrievedView
            />
          )}
          {currentView === "audit" && <AuditTrail />}
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

        {deleteConfirmation && (
          <ConfirmationDialog
            isOpen={deleteConfirmation.isOpen}
            onClose={() => setDeleteConfirmation(null)}
            onConfirm={handleConfirmDelete}
            title="Are you sure?"
            description={`This action cannot be undone. This will permanently delete the ${deleteConfirmation.type}.`}
          />
        )}
        {redeployConfirmation && (
          <ConfirmationDialog
            isOpen={true}
            onClose={() => setRedeployConfirmation(null)}
            onConfirm={async () => {
              setEditingAsset({ ...redeployConfirmation! });
              setIsAssetModalOpen(true);
              setRedeployConfirmation(null);
            }}
            title="Redeploy asset?"
            description={`This will open the asset details for editing before redeploying ${redeployConfirmation.assetTag} back to Inventory.`}
            confirmLabel="Redeploy"
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
