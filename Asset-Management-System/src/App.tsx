import { useState, useMemo, useEffect } from "react";
import type {
  Asset,
  AssetType,
  AssetStatus,
  UserRole,
  Receivable,
  ReceivableUser,
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
import ReceivableAssignmentModal from "./components/ReceivableAssignmentModal";
import LicenseModal from "./components/LicenseModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import {
  BarChart3,
  Table,
  Package,
  Key,
  LogOut,
  History,
  ArchiveRestore,
} from "lucide-react";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import AuditTrail from "./components/AuditTrail";
import ConfirmationDialog from "./components/ConfirmationDialog";
import RetrieveReasonDialog from "./components/RetrieveReasonDialog";
import ConnectionStatus from "./components/ConnectionStatus";
import {
  useAssets,
  useRetrievedAssets,
  useAddAsset,
  useUpdateAsset,
  useDeleteAsset,
  useRetrieveAsset,
} from "./hooks/useAssets";
import {
  useReceivables,
  useAddReceivable,
  useUpdateReceivable,
  useDeleteReceivable,
} from "./hooks/useReceivables";
import {
  useLicenses,
  useAddLicense,
  useUpdateLicense,
  useDeleteLicense,
} from "./hooks/useLicenses";
import buaLogo from "./assets/bua-logo.jpg";

function AppContent() {
  const { currentUser, logout } = useAuth();

  // React Query hooks for data fetching
  const { data: assets = [] } = useAssets();
  const { data: retrievedAssets = [] } = useRetrievedAssets();
  const { data: receivables = [] } = useReceivables();
  const { data: licenses = [] } = useLicenses();

  // React Query mutation hooks
  const addAssetMutation = useAddAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();
  const retrieveAssetMutation = useRetrieveAsset();
  const addReceivableMutation = useAddReceivable();
  const updateReceivableMutation = useUpdateReceivable();
  const deleteReceivableMutation = useDeleteReceivable();
  const addLicenseMutation = useAddLicense();
  const updateLicenseMutation = useUpdateLicense();
  const deleteLicenseMutation = useDeleteLicense();
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
  // React Query automatically handles data fetching, no need for manual fetchAllData

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      showToast("Logout failed", "error");
    }
  };

  const handleRetrieveAsset = (asset: Asset) => {
    setRetrieveReasonDialog({ isOpen: true, asset });
  };

  const handleRetrieveConfirm = async (reason: "spare" | "repair") => {
    if (!retrieveReasonDialog.asset) return;

    try {
      const retrieved = {
        ...retrieveReasonDialog.asset,
        status: reason,
        retrievedDate: new Date().toISOString().split("T")[0],
        retrievedBy: currentUser?.email || "Unknown User",
      };
      await retrieveAssetMutation.mutateAsync({
        id: retrieveReasonDialog.asset.id,
        retrieved,
        user: currentUser?.email || "Unknown User",
      });
      showToast(
        `Asset moved to Retrieved with status: ${
          reason === "repair" ? "out for repair" : reason
        }`,
        "success"
      );
    } catch {
      showToast("Error retrieving asset", "error");
    } finally {
      setRetrieveReasonDialog({ isOpen: false, asset: null });
    }
  };

  const handleRedeployFromRetrieved = (asset: Asset) => {
    setRedeployConfirmation(asset);
  };
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "inventory"
    | "receivables"
    | "licenses"
    | "retrieved"
    | "audit"
  >("dashboard");

  // Modal states
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isRedeploying, setIsRedeploying] = useState(false);
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [isReceivableAssignmentModalOpen, setIsReceivableAssignmentModalOpen] =
    useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [editingReceivable, setEditingReceivable] = useState<
    Receivable | undefined
  >();
  const [assigningReceivable, setAssigningReceivable] = useState<
    Receivable | undefined
  >();
  const [editingLicense, setEditingLicense] = useState<License | undefined>();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    type: "asset" | "receivable" | "license";
    assetTag?: string;
  } | null>(null);
  const [redeployConfirmation, setRedeployConfirmation] =
    useState<Asset | null>(null);
  const [retrieveReasonDialog, setRetrieveReasonDialog] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({ isOpen: false, asset: null });

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

      return matchesSearch;
    });
  }, [receivables, searchTerm]);

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
    setIsRedeploying(false);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsRedeploying(false);
    setIsAssetModalOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    setDeleteConfirmation({
      isOpen: true,
      id,
      type: "asset",
      assetTag: asset?.assetTag,
    });
  };

  const handleSaveAsset = async (assetData: Omit<Asset, "id">) => {
    try {
      if (editingAsset) {
        // Use the isRedeploying state to determine if this is a redeploy operation
        if (isRedeploying) {
          await addAssetMutation.mutateAsync({
            asset: assetData,
            user: currentUser?.email || "Unknown User",
          });
          // TODO: Add removeRetrieved mutation
          showToast("Asset redeployed to Inventory", "success");
        } else {
          await updateAssetMutation.mutateAsync({
            id: editingAsset.id,
            asset: assetData,
            user: currentUser?.email || "Unknown User",
          });
          showToast("Asset updated successfully", "success");
        }
      } else {
        await addAssetMutation.mutateAsync({
          asset: assetData,
          user: currentUser?.email || "Unknown User",
        });
        showToast("Asset added successfully", "success");
      }

      // Reset redeploying state and close modal after successful save
      setIsRedeploying(false);
      setIsAssetModalOpen(false);
      setEditingAsset(undefined);
    } catch (error) {
      console.error("Error saving asset:", error);
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
    setDeleteConfirmation({ isOpen: true, id, type: "receivable" });
  };

  const handleSaveReceivable = async (
    receivableData: Omit<Receivable, "id">
  ) => {
    try {
      if (editingReceivable) {
        await updateReceivableMutation.mutateAsync({
          id: editingReceivable.id,
          receivable: receivableData,
          user: currentUser?.email || "Unknown User",
        });
        showToast("Receivable updated successfully", "success");
      } else {
        await addReceivableMutation.mutateAsync({
          receivable: receivableData,
          user: currentUser?.email || "Unknown User",
        });
        showToast("Receivable added successfully", "success");
      }
    } catch {
      showToast("Error saving receivable", "error");
    }
  };

  const handleAssignReceivable = (receivable: Receivable) => {
    setAssigningReceivable(receivable);
    setIsReceivableAssignmentModalOpen(true);
  };

  const handleSaveReceivableAssignment = async (
    receivableId: string,
    assignedUsers: ReceivableUser[]
  ) => {
    try {
      await updateReceivableMutation.mutateAsync({
        id: receivableId,
        receivable: { assignedUsers },
        user: currentUser?.email || "Unknown User",
      });
      showToast("Receivable assignments updated successfully", "success");
    } catch {
      showToast("Error updating receivable assignments", "error");
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
    setDeleteConfirmation({ isOpen: true, id, type: "license" });
  };

  const handleSaveLicense = async (licenseData: Omit<License, "id">) => {
    try {
      if (editingLicense) {
        await updateLicenseMutation.mutateAsync({
          id: editingLicense.id,
          license: licenseData,
          user: currentUser?.email || "Unknown User",
        });
        showToast("License updated successfully", "success");
      } else {
        await addLicenseMutation.mutateAsync({
          license: licenseData,
          user: currentUser?.email || "Unknown User",
        });
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
        if (type === "asset") {
          await deleteAssetMutation.mutateAsync({
            id,
            user: currentUser?.email || "Unknown User",
          });
          showToast("Asset deleted successfully", "success");
        } else if (type === "receivable") {
          await deleteReceivableMutation.mutateAsync({
            id,
            user: currentUser?.email || "Unknown User",
          });
          showToast("Receivable deleted successfully", "success");
        } else if (type === "license") {
          await deleteLicenseMutation.mutateAsync({
            id,
            user: currentUser?.email || "Unknown User",
          });
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
    // React Query automatically handles cache invalidation and refetching
    // No need for manual fetchAllData
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
                  IT Asset Management System
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-bua-gold">
                    {currentUser?.email}
                  </span>
                  <button
                    onClick={handleLogout}
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

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
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
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("inventory")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "inventory"
                    ? "border-bua-red text-bua-red"
                    : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
                }`}
              >
                <Table className="w-4 h-4 mr-2" />
                Inventory
              </button>
              <button
                onClick={() => setCurrentView("receivables")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "receivables"
                    ? "border-bua-red text-bua-red"
                    : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                Receivables
              </button>
              <button
                onClick={() => setCurrentView("licenses")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "licenses"
                    ? "border-bua-red text-bua-red"
                    : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
                }`}
              >
                <Key className="w-4 h-4 mr-2" />
                Licenses
              </button>
              <button
                onClick={() => setCurrentView("retrieved")}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  currentView === "retrieved"
                    ? "border-bua-red text-bua-red"
                    : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
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
                      ? "border-bua-red text-bua-red"
                      : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
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
              onAssetAdded={() => {}}
              onLicenseAdded={() => {}}
              onReceivableAdded={() => {}}
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
              receivables={filteredReceivables}
              userRole={userRole}
              onEdit={handleEditReceivable}
              onDelete={handleDeleteReceivable}
              onAssign={handleAssignReceivable}
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
          onClose={() => {
            setIsAssetModalOpen(false);
          }}
          onSave={handleSaveAsset}
          asset={editingAsset}
          isRedeploying={isRedeploying}
        />

        <ReceivableModal
          isOpen={isReceivableModalOpen}
          onClose={() => setIsReceivableModalOpen(false)}
          onSave={handleSaveReceivable}
          receivable={editingReceivable}
        />

        <ReceivableAssignmentModal
          isOpen={isReceivableAssignmentModalOpen}
          onClose={() => setIsReceivableAssignmentModalOpen(false)}
          onSave={handleSaveReceivableAssignment}
          receivable={assigningReceivable}
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
            message={`This action cannot be undone. This will permanently delete the ${deleteConfirmation.type}.`}
            requireAssetTag={deleteConfirmation.type === "asset"}
            assetTag={deleteConfirmation.assetTag}
            confirmText="Delete"
          />
        )}
        {redeployConfirmation && (
          <ConfirmationDialog
            isOpen={true}
            onClose={() => setRedeployConfirmation(null)}
            onConfirm={async () => {
              setEditingAsset({ ...redeployConfirmation! });
              setIsRedeploying(true);
              setIsAssetModalOpen(true);
              setRedeployConfirmation(null);
            }}
            title="Redeploy asset?"
            message={`This will open the asset details for editing before redeploying ${redeployConfirmation.assetTag} back to Inventory.`}
            confirmText="Redeploy"
          />
        )}

        <RetrieveReasonDialog
          isOpen={retrieveReasonDialog.isOpen}
          onClose={() =>
            setRetrieveReasonDialog({ isOpen: false, asset: null })
          }
          onConfirm={handleRetrieveConfirm}
          assetTag={retrieveReasonDialog.asset?.assetTag || ""}
        />

        <ConnectionStatus />
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
