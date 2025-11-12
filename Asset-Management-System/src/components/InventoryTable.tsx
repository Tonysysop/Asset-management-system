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
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
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
  const { toast } = useToast();
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
          toast({
            title: "Import Warning",
            description: `Skipped duplicate asset tags: ${skippedAssetTags.join(
              ", "
            )}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Import Success",
            description: "All assets imported successfully",
          });
        }
      } catch (error) {
        console.error("Import error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast({
          title: "Import Error",
          description: `Error importing assets: ${errorMessage}`,
          variant: "destructive",
        });
      }
    },
    [addAssetsMutation, currentUser?.email, onImport, toast]
  );

  const assetSampleData = `serialNumber,type,computeType,peripheralType,networkType,brand,model,specifications,warrantyExpiry,vendor,assignedUser,staffId,emailAddress,department,status,location,notes,deployedDate,imeiNumber,computerName,itemName,screenSize,resolution,connectionType,firmwareVersion,ipAddress,macAddress,numberOfPorts,rackPosition,configBackupLocation,uplinkDownlinkInfo,poeSupport,stackClusterMembership,powerSupply,serverRole,installedApplications,hostname,processor,ramSize,storage,operatingSystem,productionIpAddress,managementMacAddress,specificPhysicalLocation,ipAssignment,managementMethod,controllerName,controllerAddress,powerSource,connectedSwitchName,connectedSwitchPort,ssidsBroadcasted,frequencyBands
SN-001,compute,laptop,,,"Dell","XPS 15","i7, 16GB RAM, 512GB SSD",2026-01-14,"Dell Inc.","John Doe","EMP001","john.doe@buagroup.com","Engineering","in-use","Building A","Room 101","2025-01-15","","","","","","","","","","","",""
SN-002,compute,desktop,,,"HP","EliteDesk 800","i5, 8GB RAM, 256GB SSD",2026-02-14,"HP Inc.","Jane Smith","EMP002","jane.smith@buagroup.com","Marketing","in-use","Building B","Room 205","2025-01-20","","","","","","","","","","","",""
SN-003,compute,mobile,,,"Apple","iPhone 15","128GB, 5G",2026-03-14,"Apple Inc.","Mike Johnson","EMP003","mike.johnson@buagroup.com","Sales","in-use","Building A","Room 150","2025-02-01","123456789012345","","","","","","","","","","","",""
SN-004,peripheral,,printer,,"Canon","PIXMA TR8620","All-in-One, Wireless",2026-04-14,"Canon Inc.","Sarah Wilson","EMP004","sarah.wilson@buagroup.com","HR","in-use","Building C","Room 301","2025-02-15","","","","","","","","","","","",""
SN-005,peripheral,,scanner,,"Epson","WorkForce ES-400","Document Scanner",2026-05-14,"Epson Inc.","David Brown","EMP005","david.brown@buagroup.com","Finance","in-use","Building B","Room 180","2025-03-01","","","","","","","","","","","",""
SN-006,peripheral,,monitor,,"Samsung","27-inch 4K","3840x2160, USB-C",2026-06-14,"Samsung Inc.","Lisa Davis","EMP006","lisa.davis@buagroup.com","IT","in-use","Building A","Room 101","2025-03-15","","27","3840x2160","USB-C","","","","","","","","",""
SN-007,compute,server,,,"Dell","PowerEdge R750","Xeon, 32GB RAM, 1TB SSD",2026-07-14,"Dell Inc.","Tom Wilson","","","IT","in-use","Data Center","Rack 1","2025-04-01","","","","","","","","","","750W","Database Server","Windows Server 2022"
SN-008,network,,,router,"Cisco","ISR 4331","Gigabit Ethernet",2026-08-14,"Cisco Inc.","","","","IT","in-use","Network Closet","Rack 2","2025-04-15","","","","","16.12.04","192.168.1.1","00:1A:2B:3C:4D:5E","4","","","",""
SN-009,network,,,switch,"Netgear","GS108T","8-Port Gigabit",2026-09-14,"Netgear Inc.","","","","IT","in-use","Network Closet","Rack 2","2025-05-01","","","","","","","","","8","","","",""
SN-010,compute,tablet,,,"Apple","iPad Pro","12.9-inch, 256GB",2026-10-14,"Apple Inc.","Alex Johnson","EMP007","alex.johnson@buagroup.com","Marketing","in-use","Building B","Room 210","2025-05-15","","","","","","","","","","","","",""
SN-011,peripheral,,keyboard,,"Logitech","MX Keys","Wireless, Backlit",2026-11-14,"Logitech Inc.","Sarah Wilson","EMP008","sarah.wilson@buagroup.com","Engineering","in-use","Building A","Room 102","2025-06-01","","","","","","","","","","","","",""
SN-012,peripheral,,mouse,,"Logitech","MX Master 3","Wireless, Ergonomic",2026-12-14,"Logitech Inc.","Mike Johnson","EMP009","mike.johnson@buagroup.com","Engineering","in-use","Building A","Room 102","2025-06-15","","","","","","","","","","","","",""
SN-013,peripheral,,headset,,"Sony","WH-1000XM5","Noise Cancelling",2027-01-14,"Sony Inc.","Lisa Davis","EMP010","lisa.davis@buagroup.com","IT","in-use","Building A","Room 103","2025-07-01","","","","","","","","","","","","",""
SN-014,peripheral,,webcam,,"Logitech","C920 HD Pro","1080p, Auto Focus",2027-02-14,"Logitech Inc.","David Brown","EMP011","david.brown@buagroup.com","Finance","in-use","Building B","Room 181","2025-07-15","","","","","","","","","","","","",""
SN-015,peripheral,,speaker,,"JBL","Charge 5","Portable, Bluetooth",2027-03-14,"JBL Inc.","Tom Wilson","EMP012","tom.wilson@buagroup.com","IT","in-use","Building A","Room 104","2025-08-01","","","","","","","","","","","","",""
SN-016,peripheral,,other,,"Generic","USB Hub","4-Port USB 3.0",2027-04-14,"Generic Inc.","Alex Johnson","EMP013","alex.johnson@buagroup.com","Marketing","in-use","Building B","Room 211","2025-08-15","","","","","","","","","","","","",""
SN-017,network,,,access_point,"Ubiquiti","UniFi AP AC Pro","802.11ac, PoE",2027-05-14,"Ubiquiti Inc.","","","","IT","in-use","Building A","Ceiling Mount","2025-09-01","","","","","","192.168.1.50","AA:BB:CC:DD:EE:FF","","","","","","","","","","","Office Floor 3","Static","UniFi Controller","controller.local","10.0.0.100","PoE 802.3af","Switch-01","GE1/0/1","Corp-WiFi","2.4GHz/5GHz"
SN-018,network,,,firewall,"Fortinet","FortiGate 60E","UTM Firewall",2027-06-14,"Fortinet Inc.","","","","IT","in-use","Network Closet","Rack 3","2025-09-15","","","","","","","","","","","","",""
SN-019,network,,,other,"Generic","Network Switch","24-Port Managed",2027-07-14,"Generic Inc.","","","","IT","in-use","Network Closet","Rack 4","2025-10-01","","","","","","","","","","","","",""`;

  const assetInstructions = [
    "The CSV file must include all columns shown in the sample. Leave fields empty if not applicable.",
    "Main asset types: compute, peripheral, network",
    "For compute assets: set type='compute' and specify computeType (laptop, desktop, mobile, server)",
    "For peripheral assets: set type='peripheral' and specify peripheralType (printer, scanner, monitor, keyboard, mouse, headset, webcam, speaker, other)",
    "For network assets: set type='network' and specify networkType (router, switch, access_point, firewall, other)",
    "Status must be one of: in-use, spare, repaired, retired",
    "Dates can be in any format (MM/DD/YYYY, YYYY-MM-DD, etc.) and will be automatically converted",
    "Asset tags will be auto-generated based on type and sequence",
    "For servers: include powerSupply and serverRole fields",
    "For monitors: include screenSize, resolution, and connectionType fields",
    "For switches: include poeSupport and stackClusterMembership fields",
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
    "staffId",
    "emailAddress",
    "department",
    "status",
    "location",
    "notes",
    "deployedDate",
    "imeiNumber",
    "computerName",
    "itemName",
    "screenSize",
    "resolution",
    "connectionType",
    "firmwareVersion",
    "ipAddress",
    "macAddress",
    "numberOfPorts",
    "rackPosition",
    "configBackupLocation",
    "uplinkDownlinkInfo",
    "poeSupport",
    "stackClusterMembership",
    "powerSupply",
    "serverRole",
    "installedApplications",
    "hostname",
    "processor",
    "ramSize",
    "storage",
    "operatingSystem",
    "productionIpAddress",
    "managementMacAddress",
    "specificPhysicalLocation",
    "ipAssignment",
    "managementMethod",
    "controllerName",
    "controllerAddress",
    "powerSource",
    "connectedSwitchName",
    "connectedSwitchPort",
    "ssidsBroadcasted",
    "frequencyBands",
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
                <TableHead
                  className="pl-6"
                  onClick={() => handleSort("assetTag")}
                >
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
                  isRetrievedView={isRetrievedView}
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
