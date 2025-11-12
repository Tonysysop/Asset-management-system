import { useState, useMemo, useEffect } from "react";
import type {
  Asset,
  AssetStatus,
  UserRole,
  License,
  LicenseUser,
  IncomingStock,
} from "./types/inventory";
import { exportToCSV, exportLicensesToCSV } from "./utils/csvExport";
import EnhancedDashboard from "./components/EnhancedDashboard";
import InventoryTable from "./components/InventoryTable";
import ReceivablesTable from "./components/ReceivablesTable";
import LicensesTable from "./components/LicensesTable";
import StockKeeperView from "./components/StockKeeperView";
import SearchAndFilter from "./components/SearchAndFilter";
import type { ExtendedAssetType } from "./components/SearchAndFilter";
import AssetModal from "./components/AssetModal";
import AllocationModal from "./components/AllocationModal";
import LicenseModal from "./components/LicenseModal";
import LicenseAssignmentModal from "./components/LicenseAssignmentModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import {
  BarChart3,
  Table,
  Package,
  Key,
  LogOut,
  History,
  ArchiveRestore,
  Settings,
} from "lucide-react";
import { useToast } from "./hooks/useToast";
import { Toaster } from "./components/ui/toaster";
import AuditTrail from "./components/AuditTrail";
import ConfirmationDialog from "./components/ConfirmationDialog";
import RetrieveReasonDialog from "./components/RetrieveReasonDialog";
import ConnectionStatus from "./components/ConnectionStatus";
import EmailConfiguration from "./components/EmailConfiguration";
import { useEmailNotifications } from "./hooks/useEmailNotifications";
import {
  useAssets,
  useRetrievedAssets,
  useAddAsset,
  useUpdateAsset,
  useDeleteAsset,
  useRetrieveAsset,
  useDeleteRetrievedAsset,
} from "./hooks/useAssets";
import {
  useLicenses,
  useAddLicense,
  useUpdateLicense,
  useDeleteLicense,
} from "./hooks/useLicenses";
import {
  useIncomingStock,
  useAddIncomingStock,
  useUpdateIncomingStock,
  useDeleteIncomingStock,
} from "./hooks/useIncomingStock";
import { useConsumablesManagement } from "./hooks/useConsumables";
import ConsumablesDataInitializer from "./components/ConsumablesDataInitializer";
import buaLogo from "./assets/bua-logo.jpg";

function AppContent() {
  const { currentUser, logout } = useAuth();

  // React Query hooks for data fetching
  const { data: assets = [] } = useAssets();
  const { data: retrievedAssets = [] } = useRetrievedAssets();
  const { data: licenses = [] } = useLicenses();
  const { data: incomingStock = [] } = useIncomingStock();

  // Consumables management
  const consumablesManagement = useConsumablesManagement();

  // React Query mutation hooks
  const addAssetMutation = useAddAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();
  const retrieveAssetMutation = useRetrieveAsset();
  const deleteRetrievedAssetMutation = useDeleteRetrievedAsset();
  const addLicenseMutation = useAddLicense();
  const updateLicenseMutation = useUpdateLicense();
  const deleteLicenseMutation = useDeleteLicense();
  const addIncomingStockMutation = useAddIncomingStock();
  const updateIncomingStockMutation = useUpdateIncomingStock();
  const deleteIncomingStockMutation = useDeleteIncomingStock();
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const { toast } = useToast();
  const { sendAssetAllocationNotification, sendConsumableIssueNotification } =
    useEmailNotifications();

  // Sync userRole with URL path (/ for admin, /audit for auditor)
  useEffect(() => {
    const applyRoleFromPath = () => {
      const isAuditPath = window.location.pathname === "/audit";
      setUserRole(isAuditPath ? "auditor" : "admin");
    };

    // Apply role immediately
    applyRoleFromPath();

    // Listen for URL changes
    const onPopState = () => applyRoleFromPath();
    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, [currentUser]); // Only re-run when user changes (login/logout)

  // Note: URL controls role; we do not push URL changes based on role.
  // React Query automatically handles data fetching, no need for manual fetchAllData

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Error",
        description: "Logout failed",
        variant: "destructive",
      });
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
      toast({
        title: "Asset Retrieved",
        description: `Asset moved to retrieved with status: ${
          reason === "repair" ? "out for repair" : reason
        }`,
      });
    } catch {
      toast({
        title: "Retrieval Error",
        description: "Error retrieving asset",
        variant: "destructive",
      });
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
    | "settings"
  >("dashboard");

  // Modal states
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isRedeploying, setIsRedeploying] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocatingStock, setAllocatingStock] = useState<IncomingStock | null>(
    null
  );
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isLicenseAssignmentModalOpen, setIsLicenseAssignmentModalOpen] =
    useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [editingLicense, setEditingLicense] = useState<License | undefined>();
  const [assigningLicense, setAssigningLicense] = useState<
    License | undefined
  >();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    type: "asset" | "license";
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
  const [selectedType, setSelectedType] = useState<ExtendedAssetType>("all");
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | "all">(
    "all"
  );
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Get unique departments for filter
  const departments = useMemo(() => {
    const assetDepts = assets
      .map((asset) => asset.department)
      .filter((dept): dept is string => Boolean(dept));
    const licenseDepts = licenses
      .map((license) => license.department)
      .filter((dept): dept is string => Boolean(dept));
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

      const matchesType =
        selectedType === "all" ||
        asset.type === selectedType ||
        asset.computeType === selectedType ||
        asset.peripheralType === selectedType ||
        asset.networkType === selectedType;
      const matchesStatus =
        selectedStatus === "all" || asset.status === selectedStatus;
      const matchesDepartment =
        !selectedDepartment || asset.department === selectedDepartment;

      return matchesSearch && matchesType && matchesStatus && matchesDepartment;
    });
  }, [assets, searchTerm, selectedType, selectedStatus, selectedDepartment]);

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
          await deleteRetrievedAssetMutation.mutateAsync({
            id: editingAsset.id,
            user: currentUser?.email || "Unknown User",
          });
          toast({
            title: "Asset Redeployed",
            description: "Asset redeployed to Inventory",
          });
        } else {
          await updateAssetMutation.mutateAsync({
            id: editingAsset.id,
            asset: assetData,
            user: currentUser?.email || "Unknown User",
          });
          toast({
            title: "Asset Updated",
            description: "Asset updated successfully",
          });
        }
      } else {
        await addAssetMutation.mutateAsync({
          asset: assetData,
          user: currentUser?.email || "Unknown User",
        });
        toast({
          title: "Asset Added",
          description: "Asset added successfully",
        });
      }

      // Reset redeploying state and close modal after successful save
      setIsRedeploying(false);
      setIsAssetModalOpen(false);
      setEditingAsset(undefined);
    } catch (error) {
      console.error("Error saving asset:", error);
      toast({
        title: "Save Error",
        description: "Error saving asset",
        variant: "destructive",
      });
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
        toast({
          title: "License Updated",
          description: "License updated successfully",
        });
      } else {
        await addLicenseMutation.mutateAsync({
          license: licenseData,
          user: currentUser?.email || "Unknown User",
        });
        toast({
          title: "License Added",
          description: "License added successfully",
        });
      }
    } catch {
      toast({
        title: "Save Error",
        description: "Error saving license",
        variant: "destructive",
      });
    }
  };

  const handleAssignLicense = (license: License) => {
    setAssigningLicense(license);
    setIsLicenseAssignmentModalOpen(true);
  };

  const handleSaveLicenseAssignment = async (
    licenseId: string,
    assignedUsers: LicenseUser[]
  ) => {
    try {
      await updateLicenseMutation.mutateAsync({
        id: licenseId,
        license: {
          ...assigningLicense!,
          assignedUsers: assignedUsers,
        },
        user: currentUser?.email || "Unknown User",
      });
      toast({
        title: "Licenses Updated",
        description: "License assignments updated successfully",
      });
    } catch {
      toast({
        title: "Update Error",
        description: "Error updating license assignments",
        variant: "destructive",
      });
    }
  };

  // Incoming Stock handlers
  const handleAddIncomingStock = async (stock: Omit<IncomingStock, "id">) => {
    try {
      await addIncomingStockMutation.mutateAsync(stock);
      toast({
        title: "Incoming Stock Added",
        description: "New incoming stock item added successfully",
      });
    } catch {
      toast({
        title: "Add Error",
        description: "Error adding incoming stock item",
        variant: "destructive",
      });
    }
  };

  const handleAllocateIncomingStock = async (
    stock: IncomingStock,
    assetData: Omit<Asset, "id">
  ) => {
    try {
      // Add to main inventory
      await addAssetMutation.mutateAsync({
        asset: assetData,
        user: currentUser?.email || "Unknown User",
      });

      // Update incoming stock status to "in-use" and add allocation tracking
      await updateIncomingStockMutation.mutateAsync({
        id: stock.id,
        stock: {
          status: "in-use",
          allocatedDate: new Date().toISOString().split("T")[0],
          allocatedBy: currentUser?.email || "Unknown User",
          allocatedAssetTag: assetData.assetTag,
        },
      });

      toast({
        title: "Asset Allocated",
        description: "Asset successfully allocated and moved to inventory",
      });

      // Close the modal after successful allocation
      setIsAllocationModalOpen(false);
      setAllocatingStock(null);

      // Send allocation email notification (non-blocking)
      try {
        type EmailConfigLite = {
          enabled?: boolean;
          assetAllocations?: boolean;
        };
        const saved = localStorage.getItem("emailConfig");
        const cfg: EmailConfigLite | null = saved ? JSON.parse(saved) : null;
        const enabled = cfg?.enabled && cfg?.assetAllocations;
        const recipient = assetData.emailAddress || "";
        if (enabled && recipient) {
          await sendAssetAllocationNotification(
            {
              assetTag: assetData.assetTag,
              itemName:
                assetData.itemName ||
                assetData.model ||
                assetData.brand ||
                "Asset",
              serialNumber: assetData.serialNumber,
              assignedUser: assetData.assignedUser || recipient,
              department: assetData.department || "",
              allocatedBy: currentUser?.email || "Unknown User",
            },
            recipient
          );
        }
      } catch (e) {
        console.error("Allocation email failed:", e);
      }
    } catch {
      toast({
        title: "Allocation Error",
        description: "Error allocating asset",
        variant: "destructive",
      });
      // Re-throw the error so the modal can handle it
      throw new Error("Allocation failed");
    }
  };

  const handleImportIncomingStock = async (
    stockItems: Omit<IncomingStock, "id">[]
  ) => {
    try {
      for (const stock of stockItems) {
        await addIncomingStockMutation.mutateAsync(stock);
      }
      toast({
        title: "Import Successful",
        description: `${stockItems.length} incoming stock items imported successfully`,
      });
    } catch {
      toast({
        title: "Import Error",
        description: "Error importing incoming stock items",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIncomingStock = async (stockId: string) => {
    try {
      const stockItem = incomingStock.find((item) => item.id === stockId);
      if (!stockItem) {
        toast({
          title: "Error",
          description: "Stock item not found",
          variant: "destructive",
        });
        return;
      }
      if (stockItem.status === "in-use") {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete allocated stock items",
          variant: "destructive",
        });
        return;
      }
      await deleteIncomingStockMutation.mutateAsync(stockId);
      toast({
        title: "Stock Item Deleted",
        description: "Incoming stock item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting incoming stock:", error);
      toast({
        title: "Delete Error",
        description: "Error deleting incoming stock item",
        variant: "destructive",
      });
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
          toast({
            title: "Asset Deleted",
            description: "Asset deleted successfully",
          });
        } else if (type === "license") {
          await deleteLicenseMutation.mutateAsync({
            id,
            user: currentUser?.email || "Unknown User",
          });
          toast({
            title: "License Deleted",
            description: "License deleted successfully",
          });
        }
      } catch {
        toast({
          title: "Delete Error",
          description: `Error deleting ${type}`,
          variant: "destructive",
        });
      }
      setDeleteConfirmation(null);
    }
  };

  // Export handlers
  const handleExportAssets = () => {
    exportToCSV(filteredAssets, "it-inventory");
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
      case "licenses":
        return handleExportLicenses;
      default:
        return handleExportAssets;
    }
  };

  // Check if user is store keeper
  const isStoreKeeper = currentUser?.email === "store@buagroup.com";

  // If store keeper, show simplified view with only incoming stock
  if (isStoreKeeper) {
    return (
      <ProtectedRoute>
        <ConsumablesDataInitializer>
          <StockKeeperView
            incomingStock={incomingStock}
            consumables={consumablesManagement.consumables}
            consumableTransactions={consumablesManagement.transactions}
            userEmail={currentUser?.email || ""}
            onLogout={handleLogout}
            onAddStock={handleAddIncomingStock}
            onImportStock={handleImportIncomingStock}
            onDeleteStock={handleDeleteIncomingStock}
            onReceiveConsumable={async (consumable) => {
              try {
                await consumablesManagement.createConsumableWithStock({
                  consumable,
                  initialQuantity: consumable.currentQuantity,
                  supplier: consumable.supplier,
                  notes: consumable.notes,
                });
                toast({
                  title: "Consumable Received",
                  description: `${consumable.itemName} added to inventory`,
                });
              } catch (error) {
                console.error("Error receiving consumable:", error);
                toast({
                  title: "Error",
                  description: "Failed to receive consumable",
                  variant: "destructive",
                });
              }
            }}
            onIssueConsumable={async (transaction) => {
              try {
                await consumablesManagement.issueStock({
                  consumableId: transaction.consumableId,
                  quantity: transaction.quantity,
                  issuedTo: transaction.issuedTo!,
                  department: transaction.department,
                  reason: transaction.reason,
                  reference: transaction.reference,
                  notes: transaction.notes,
                });
                toast({
                  title: "Consumable Issued",
                  description: `${transaction.consumableName} issued to ${transaction.issuedTo}`,
                });

                // Send issue notification if enabled (non-blocking)
                try {
                  type EmailConfigLite = {
                    enabled?: boolean;
                    consumableIssues?: boolean;
                  };
                  const saved = localStorage.getItem("emailConfig");
                  const cfg: EmailConfigLite | null = saved
                    ? JSON.parse(saved)
                    : null;
                  const enabled = cfg?.enabled && cfg?.consumableIssues;
                  const recipient =
                    transaction.emailAddress || transaction.issuedTo;
                  if (enabled && recipient) {
                    await sendConsumableIssueNotification(
                      {
                        itemName: transaction.consumableName,
                        quantity: transaction.quantity,
                        issuedTo: recipient,
                        department: transaction.department || "",
                        issuedBy: currentUser?.email || "Unknown User",
                        reason: transaction.reason,
                      },
                      recipient
                    );
                  }
                } catch (e) {
                  console.error("Consumable issue email failed:", e);
                }
              } catch (error) {
                console.error("Error issuing consumable:", error);
                toast({
                  title: "Error",
                  description: "Failed to issue consumable",
                  variant: "destructive",
                });
              }
            }}
            onUpdateConsumable={async (transaction) => {
              try {
                await consumablesManagement.receiveStock({
                  consumableId: transaction.consumableId,
                  quantity: transaction.quantity,
                  unitCost: transaction.unitCost,
                  reference: transaction.reference,
                  notes: transaction.notes,
                });
                toast({
                  title: "Stock Updated",
                  description: `${transaction.consumableName} stock updated`,
                });
              } catch (error) {
                console.error("Error updating consumable:", error);
                toast({
                  title: "Error",
                  description: "Failed to update consumable stock",
                  variant: "destructive",
                });
              }
            }}
          />
        </ConsumablesDataInitializer>
      </ProtectedRoute>
    );
  }

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
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
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
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
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
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
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
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
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
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
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
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
                    currentView === "audit"
                      ? "border-bua-red text-bua-red"
                      : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
                  }`}
                >
                  <History className="w-4 h-4 mr-2" />
                  Audit Trail
                </button>
              )}
              {userRole === "admin" && (
                <button
                  onClick={() => setCurrentView("settings")}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
                    currentView === "settings"
                      ? "border-bua-red text-bua-red"
                      : "border-transparent text-gray-500 hover:text-bua-red hover:border-bua-light-red"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
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
              licenses={licenses}
              incomingStock={incomingStock}
              onAssetAdded={() => {}}
              onLicenseAdded={() => {}}
            />
          )}
          {currentView !== "dashboard" &&
            currentView !== "audit" &&
            currentView !== "receivables" &&
            currentView !== "settings" && (
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
              incomingStock={incomingStock}
              userRole={userRole}
              onAssign={(stock) => {
                setAllocatingStock(stock);
                setIsAllocationModalOpen(true);
              }}
            />
          )}
          {currentView === "licenses" && (
            <LicensesTable
              licenses={filteredLicenses}
              userRole={userRole}
              onEdit={handleEditLicense}
              onDelete={handleDeleteLicense}
              onAssign={handleAssignLicense}
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
              onRetrieve={handleRedeployFromRetrieved}
              isRetrievedView
            />
          )}
          {currentView === "audit" && <AuditTrail />}
          {currentView === "settings" && <EmailConfiguration />}
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

        <AllocationModal
          isOpen={isAllocationModalOpen}
          onClose={() => {
            setIsAllocationModalOpen(false);
            setAllocatingStock(null);
          }}
          onSave={handleAllocateIncomingStock}
          stock={allocatingStock}
        />

        <LicenseModal
          isOpen={isLicenseModalOpen}
          onClose={() => setIsLicenseModalOpen(false)}
          onSave={handleSaveLicense}
          license={editingLicense}
        />

        <LicenseAssignmentModal
          isOpen={isLicenseAssignmentModalOpen}
          onClose={() => setIsLicenseAssignmentModalOpen(false)}
          onSave={handleSaveLicenseAssignment}
          license={assigningLicense}
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
    <>
      <AppContent />
      <Toaster />
    </>
  );
}

export default App;
