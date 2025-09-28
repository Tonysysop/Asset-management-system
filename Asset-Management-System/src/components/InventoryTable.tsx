import React, { useState, useMemo } from "react";
import type { Asset, UserRole } from "../types/inventory";
import {
  Edit,
  Trash2,
  Monitor,
  Laptop,
  Printer,
  Server,
  Router,
  Smartphone,
  HardDrive,
  Upload,
  Plus,
  MoreVertical,
  ArchiveRestore,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { addAssets } from "../services/assetService";
import ImportModal from "./ImportModal";
import ViewDetailsModal from "./ViewDetailsModal";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import ConfirmationDialog from "./ConfirmationDialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface InventoryTableProps {
  assets: Asset[];
  userRole: UserRole;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onImport: () => void;
  onAdd: () => void;
  onRetrieve?: (asset: Asset) => void;
  isRetrievedView?: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  assets,
  userRole,
  onEdit,
  onDelete,
  onImport,
  onAdd,
  onRetrieve,
  isRetrievedView = false,
}) => {
  const [sortField, setSortField] = useState<keyof Asset>("assetTag");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const [assetToRetrieve, setAssetToRetrieve] = useState<Asset | null>(null);

  const handleFileImport = async (data: unknown[]) => {
    const assetData = data as Omit<Asset, "id">[];
    try {
      const skippedAssetTags = await addAssets(
        assetData,
        currentUser?.email || "Unknown User"
      );
      onImport();
      if (skippedAssetTags.length > 0) {
        showToast(
          `Skipped duplicate asset tags: ${skippedAssetTags.join(", ")}`,
          "warning"
        );
      } else {
        showToast("All assets imported successfully", "success");
      }
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Error importing assets: ${errorMessage}`, "error");
    }
  };

  const assetSampleData = `serialNumber,type,computeType,peripheralType,networkType,brand,model,specifications,warrantyExpiry,vendor,assignedUser,department,status,location,notes,deployedDate,imeiNumber,screenSize,resolution,connectionType,firmwareVersion,ipAddress,macAddress,numberOfPorts,powerSupply,serverRole,installedApplications
SN-001,laptop,,,,"Dell","XPS 15","i7, 16GB RAM, 512GB SSD",2026-01-14,"Dell Inc.","John Doe","Engineering","in-use","Building A","Room 101","2025-01-15","","","","","","","","","","","",""
SN-002,desktop,,,,"HP","EliteDesk 800","i5, 8GB RAM, 256GB SSD",2026-02-14,"HP Inc.","Jane Smith","Marketing","in-use","Building B","Room 205","2025-01-20","","","","","","","","","","","",""
SN-003,mobile,,,,"Apple","iPhone 15","128GB, 5G",2026-03-14,"Apple Inc.","Mike Johnson","Sales","in-use","Building A","Room 150","2025-02-01","123456789012345","","","","","","","","","","","",""
SN-004,printer,,,,"Canon","PIXMA TR8620","All-in-One, Wireless",2026-04-14,"Canon Inc.","Sarah Wilson","HR","in-use","Building C","Room 301","2025-02-15","","","","","","","","","","","",""
SN-005,scanner,,,,"Epson","WorkForce ES-400","Document Scanner",2026-05-14,"Epson Inc.","David Brown","Finance","in-use","Building B","Room 180","2025-03-01","","","","","","","","","","","",""
SN-006,monitor,,,,"Samsung","27-inch 4K","3840x2160, USB-C",2026-06-14,"Samsung Inc.","Lisa Davis","IT","in-use","Building A","Room 101","2025-03-15","","27","3840x2160","USB-C","","","","","","","","",""
SN-007,server,,,,"Dell","PowerEdge R750","Xeon, 32GB RAM, 1TB SSD",2026-07-14,"Dell Inc.","Tom Wilson","IT","in-use","Data Center","Rack 1","2025-04-01","","","","","","","","","","750W","Database Server","Windows Server 2022"
SN-008,router,,,,"Cisco","ISR 4331","Gigabit Ethernet",2026-08-14,"Cisco Inc.","Network Admin","IT","in-use","Network Closet","Rack 2","2025-04-15","","","","","16.12.04","192.168.1.1","00:1A:2B:3C:4D:5E","4","","","",""
SN-009,switch,,,,"Netgear","GS108T","8-Port Gigabit",2026-09-14,"Netgear Inc.","Network Admin","IT","in-use","Network Closet","Rack 2","2025-05-01","","","","","","","","","8","","","",""`;

  const assetInstructions = [
    "The CSV file must include all columns shown in the sample. Leave fields empty if not applicable.",
    "Asset types: laptop, desktop, mobile, printer, scanner, monitor, server, router, switch",
    "For compute types (laptop, desktop, mobile): use computeType field",
    "For peripheral types (printer, scanner, monitor): use peripheralType field",
    "For network types (router, switch): use networkType field",
    "Status must be one of: in-use, spare, repair, retired",
    "Dates can be in any format (MM/DD/YYYY, YYYY-MM-DD, etc.) and will be automatically converted",
    "Asset tags will be auto-generated based on type and sequence",
  ];

  const expectedAssetHeaders = [
    "serialNumber",
    "type",
    "computeType",
    "peripheralType",
    "networkType",
    "brand",
    "model",
    "specifications",
    "warrantyExpiry",
    "vendor",
    "assignedUser",
    "department",
    "status",
    "location",
    "notes",
    "deployedDate",
    "imeiNumber",
    "screenSize",
    "resolution",
    "connectionType",
    "firmwareVersion",
    "ipAddress",
    "macAddress",
    "numberOfPorts",
    "powerSupply",
    "serverRole",
    "installedApplications",
  ];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "laptop":
        return <Laptop className="w-4 h-4" />;
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "printer":
        return <Printer className="w-4 h-4" />;
      case "server":
        return <Server className="w-4 h-4" />;
      case "router":
        return <Router className="w-4 h-4" />;
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <HardDrive className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-use":
        return "bg-green-100 text-green-800";
      case "spare":
        return "bg-blue-100 text-blue-800";
      case "repair":
        return "bg-amber-100 text-amber-800";
      case "retired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isWarrantyExpiring = (warrantyDate: string) => {
    const warranty = new Date(warrantyDate);
    const today = new Date();
    const monthsUntilExpiry =
      (warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  };

  const handleSort = (field: keyof Asset) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? 1 : -1;
      if (bValue == null) return sortDirection === "asc" ? -1 : 1;

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [assets, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = sortedAssets.slice(startIndex, endIndex);

  // Reset to first page when assets change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [assets.length]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {!isRetrievedView && (
        <div className="p-4 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => onAdd()}
            className="flex items-center px-4 py-2 bg-bua-red text-white rounded-md hover:bg-bua-dark-red"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </button>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center px-4 py-2 bg-bua-red text-white rounded-md hover:bg-bua-dark-red"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </button>
        </div>
      )}
      {!isRetrievedView && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleFileImport}
          sampleData={assetSampleData}
          instructions={assetInstructions}
          expectedHeaders={expectedAssetHeaders}
          importType="assets"
        />
      )}
      <div className="overflow-x-auto">
        {paginatedAssets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No assets found.</p>
            {!isRetrievedView && (
              <button
                type="button"
                onClick={() => onAdd()}
                className="flex items-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("assetTag")}>
                  Asset Tag
                </TableHead>
                <TableHead onClick={() => handleSort("type")}>Type</TableHead>
                <TableHead onClick={() => handleSort("brand")}>
                  Brand/Model
                </TableHead>
                <TableHead onClick={() => handleSort("assignedUser")}>
                  Assigned User
                </TableHead>
                <TableHead onClick={() => handleSort("department")}>
                  Department
                </TableHead>
                <TableHead onClick={() => handleSort("status")}>
                  Status
                </TableHead>
                <TableHead onClick={() => handleSort("warrantyExpiry")}>
                  Warranty
                </TableHead>
                {(userRole === "admin" || userRole === "auditor") && (
                  <TableHead>Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="font-medium">{asset.assetTag}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.serialNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="mr-2">{getAssetIcon(asset.type)}</div>
                      <span className="capitalize">{asset.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{asset.brand}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.model}
                    </div>
                  </TableCell>
                  <TableCell>{asset.assignedUser}</TableCell>
                  <TableCell>{asset.department}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        asset.status
                      )}`}
                    >
                      {asset.status.replace("-", " ").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`${
                        isWarrantyExpiring(asset.warrantyExpiry)
                          ? "text-amber-600 font-medium"
                          : ""
                      }`}
                    >
                      {asset.warrantyExpiry
                        ? (() => {
                            try {
                              const date = new Date(asset.warrantyExpiry);
                              return isNaN(date.getTime())
                                ? asset.warrantyExpiry
                                : format(date, "PPP");
                            } catch {
                              return asset.warrantyExpiry;
                            }
                          })()
                        : "N/A"}
                    </div>
                    {isWarrantyExpiring(asset.warrantyExpiry) && (
                      <div className="text-xs text-amber-600">
                        Expiring Soon
                      </div>
                    )}
                  </TableCell>
                  {userRole === "admin" && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <ViewDetailsModal
                              item={asset}
                              title="Asset Details"
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(asset)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(asset.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                          {onRetrieve && !isRetrievedView && (
                            <DropdownMenuItem
                              onClick={() => setAssetToRetrieve(asset)}
                            >
                              <ArchiveRestore className="w-4 h-4 mr-2" />{" "}
                              Retrieve
                            </DropdownMenuItem>
                          )}
                          {isRetrievedView && (
                            <DropdownMenuItem onClick={() => onEdit(asset)}>
                              <ArchiveRestore className="w-4 h-4 mr-2" />{" "}
                              Redeploy
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                  {userRole === "auditor" && (
                    <TableCell>
                      <ViewDetailsModal item={asset} title="Asset Details" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, sortedAssets.length)} of {sortedAssets.length}{" "}
            assets
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      {assetToRetrieve && (
        <ConfirmationDialog
          isOpen={!!assetToRetrieve}
          onClose={() => setAssetToRetrieve(null)}
          onConfirm={() => {
            if (onRetrieve) {
              onRetrieve(assetToRetrieve);
            }
            setAssetToRetrieve(null);
          }}
          title="Move this asset to Retrieved?"
          message=""
          confirmText="Retrieve"
        />
      )}
    </div>
  );
};

export default InventoryTable;
