import React, { useState, useMemo, useCallback } from "react";
import type { Asset, UserRole } from "../types/inventory";
import { Upload, Plus } from "lucide-react";
import AssetTableRow from "./AssetTableRow";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { useAddAssets } from "../hooks/useAssets";
import ImportModal from "./ImportModal";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import ConfirmationDialog from "./ConfirmationDialog";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "./ui/table";

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
  const addAssetsMutation = useAddAssets();

  const handleFileImport = useCallback(
    async (data: unknown[]) => {
      const assetData = data as Omit<Asset, "id">[];
      try {
        const skippedAssetTags = await addAssetsMutation.mutateAsync({
          assets: assetData,
          user: currentUser?.email || "Unknown User",
        });
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
    },
    [addAssetsMutation, currentUser?.email, onImport, showToast]
  );

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

  // Memoized handlers to prevent unnecessary re-renders
  const handleEdit = useCallback(
    (asset: Asset) => {
      onEdit(asset);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  const handleRetrieve = useCallback(
    (asset: Asset) => {
      onRetrieve?.(asset);
    },
    [onRetrieve]
  );

  const handleSort = useCallback(
    (field: keyof Asset) => {
      if (field === sortField) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

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
      {!isRetrievedView && userRole === "admin" && (
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
      {!isRetrievedView && userRole === "admin" && (
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
                <AssetTableRow
                  key={asset.id}
                  asset={asset}
                  userRole={userRole as "admin" | "auditor"}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRetrieve={handleRetrieve}
                />
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
