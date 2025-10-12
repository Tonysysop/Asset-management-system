import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  Calendar,
  User,
  MapPin,
  Tag,
  Package,
  Shield,
  Clock,
  AlertCircle,
  Users,
  Mail,
  IdCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReceivableUser, Receivable, Asset } from "../types/inventory";
import BarcodeLabel from "./BarcodeLabel";

interface ViewDetailsModalProps {
  item: unknown;
  title: string;
}

// Type guard to check if item has assignedUsers
const hasAssignedUsers = (item: unknown): item is Receivable => {
  return (
    typeof item === "object" &&
    item !== null &&
    "assignedUsers" in item &&
    Array.isArray((item as Record<string, unknown>).assignedUsers)
  );
};

// Type guard to check if item is an asset (has assetTag)
const isAsset = (item: unknown): item is Asset => {
  return (
    typeof item === "object" &&
    item !== null &&
    "assetTag" in item &&
    typeof (item as Record<string, unknown>).assetTag === "string"
  );
};

// Helper function to format field names
const formatFieldName = (key: string): string => {
  const fieldMap: Record<string, string> = {
    id: "ID",
    assetTag: "Asset Tag",
    serialNumber: "Serial Number",
    itemName: "Item Name",
    licenseName: "License Name",
    licenseKey: "License Key",
    assignedUser: "Assigned User",
    staffId: "Staff ID",
    emailAddress: "Email Address",
    warrantyExpiry: "Warranty Expiry",
    warrantyExpiration: "Warranty Expiration",
    deployedDate: "Deployed Date",
    purchaseDate: "Purchase Date",
    retrievedDate: "Retrieved Date",
    retrievedBy: "Retrieved By",
    supplierName: "Supplier",
    category: "Category",
    computeType: "Compute Type",
    peripheralType: "Peripheral Type",
    networkType: "Network Type",
    hostname: "Hostname",
    processor: "Processor",
    ramSize: "RAM Size",
    storageSize: "Storage Size",
    operatingSystem: "Operating System",
    monitorSize: "Monitor Size",
    monitorResolution: "Resolution",
    printerType: "Printer Type",
    networkPorts: "Network Ports",
    powerSupply: "Power Supply",
    serverRole: "Server Role",
    installedApplications: "Installed Applications",
    notes: "Notes",
    description: "Description",
    specifications: "Specifications",
    location: "Location",
    department: "Department",
    vendor: "Vendor",
    brand: "Brand",
    model: "Model",
    status: "Status",
    type: "Type",
    email: "Email",
    role: "Role",
    timestamp: "Timestamp",
    action: "Action",
    details: "Details",
    user: "User",
    assetId: "Asset ID",
    licenseId: "License ID",
    receivableId: "Receivable ID",
    // Access Point specific fields
    specificPhysicalLocation: "Specific Physical Location",
    ipAssignment: "IP Assignment",
    managementMethod: "Management Method",
    controllerName: "Controller Name",
    controllerAddress: "Controller Address",
    powerSource: "Power Source",
    connectedSwitchName: "Connected Switch Name",
    connectedSwitchPort: "Connected Switch Port",
    ssidsBroadcasted: "SSIDs Broadcasted",
    frequencyBands: "Frequency Bands",
  };

  return (
    fieldMap[key] ||
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  );
};

// Helper function to get icon for field
const getFieldIcon = (key: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    assetTag: <Tag className="w-4 h-4" />,
    serialNumber: <Package className="w-4 h-4" />,
    assignedUser: <User className="w-4 h-4" />,
    staffId: <IdCard className="w-4 h-4" />,
    emailAddress: <Mail className="w-4 h-4" />,
    warrantyExpiry: <Calendar className="w-4 h-4" />,
    warrantyExpiration: <Calendar className="w-4 h-4" />,
    deployedDate: <Calendar className="w-4 h-4" />,
    purchaseDate: <Calendar className="w-4 h-4" />,
    retrievedDate: <Calendar className="w-4 h-4" />,
    location: <MapPin className="w-4 h-4" />,
    status: <Shield className="w-4 h-4" />,
    timestamp: <Clock className="w-4 h-4" />,
    notes: <AlertCircle className="w-4 h-4" />,
    description: <AlertCircle className="w-4 h-4" />,
    specifications: <AlertCircle className="w-4 h-4" />,
  };

  return iconMap[key] || <Package className="w-4 h-4" />;
};

// Helper function to format field values
const formatFieldValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) return "N/A";

  const stringValue = String(value);

  // Format dates
  if (
    key.includes("Date") ||
    key.includes("Expiry") ||
    key.includes("Expiration")
  ) {
    try {
      const date = new Date(stringValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      // If date parsing fails, return original value
    }
  }

  // Format status values
  if (key === "status") {
    return stringValue
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Format type values
  if (key === "type" || key === "category") {
    return stringValue
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return stringValue;
};

// Helper function to get status badge variant
const getStatusBadgeVariant = (key: string, value: string) => {
  if (key === "status") {
    const status = value.toLowerCase();
    if (
      status.includes("active") ||
      status.includes("in-use") ||
      status.includes("deployed")
    ) {
      return "default";
    } else if (status.includes("retired") || status.includes("deleted")) {
      return "destructive";
    } else if (status.includes("spare") || status.includes("available")) {
      return "secondary";
    } else if (status.includes("repair") || status.includes("maintenance")) {
      return "outline";
    }
  }
  return "secondary";
};

// Helper function to check if field is applicable to asset type and subtype
const isFieldApplicable = (
  key: string,
  assetType: string,
  assetSubtype: string,
  value: unknown
): boolean => {
  // Always show basic fields
  const basicFields = [
    "id",
    "assetTag",
    "serialNumber",
    "brand",
    "model",
    "type",
    "status",
    "specifications",
    "description",
    "notes",
  ];
  if (basicFields.includes(key)) return true;

  // Always show date fields
  const dateFields = [
    "deployedDate",
    "purchaseDate",
    "retrievedDate",
    "warrantyExpiry",
    "warrantyExpiration",
    "timestamp",
  ];
  if (dateFields.includes(key)) return true;

  // Don't show empty or null values
  if (!value || value === "" || value === "N/A") return false;

  // Show assignment fields only for non-network devices
  const assignmentFields = [
    "assignedUser",
    "staffId",
    "emailAddress",
    "department",
  ];
  if (assignmentFields.includes(key)) {
    return assetType?.toLowerCase() !== "network";
  }

  // Show location and vendor for all asset types
  if (["location", "vendor"].includes(key)) return true;

  // Type-specific field visibility based on new structure
  switch (assetType?.toLowerCase()) {
    case "compute":
      // Compute-specific fields
      const computeFields = [
        "computeType",
        "computerName",
        "hostname",
        "processor",
        "ramSize",
        "storage",
        "operatingSystem",
        "imeiNumber",
      ];

      if (computeFields.includes(key)) return true;

      // Server-specific fields
      if (assetSubtype?.toLowerCase() === "server") {
        const serverFields = [
          "productionIpAddress",
          "managementMacAddress",
          "powerSupply",
          "serverRole",
          "installedApplications",
        ];
        return serverFields.includes(key);
      }

      return false;

    case "peripheral":
      // Peripheral-specific fields
      const peripheralFields = ["peripheralType", "itemName"];

      if (peripheralFields.includes(key)) return true;

      // Monitor-specific fields
      if (assetSubtype?.toLowerCase() === "monitor") {
        const monitorFields = ["screenSize", "resolution", "connectionType"];
        return monitorFields.includes(key);
      }

      return false;

    case "network":
      // Network-specific fields
      const networkFields = [
        "networkType",
        "firmwareVersion",
        "ipAddress",
        "macAddress",
        "numberOfPorts",
        "rackPosition",
        "configBackupLocation",
        "uplinkDownlinkInfo",
        "poeSupport",
        "stackClusterMembership",
      ];

      if (networkFields.includes(key)) return true;

      // Access Point specific fields
      if (assetSubtype?.toLowerCase() === "access_point") {
        const accessPointFields = [
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
        return accessPointFields.includes(key);
      }

      return false;

    default:
      // For unknown types, show all fields that have values
      return true;
  }
};

// Helper function to render assigned users
const renderAssignedUsers = (assignedUsers: ReceivableUser[]) => {
  if (!assignedUsers || assignedUsers.length === 0) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
        <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
          <Users className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Assigned Users
          </p>
          <p className="text-sm text-foreground">No users assigned yet</p>
        </div>
      </div>
    );
  }

  const totalAssignedQuantity = assignedUsers.reduce(
    (sum, user) => sum + user.quantityAssigned,
    0
  );

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
        <Users className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Assigned Users
          </p>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {totalAssignedQuantity} items assigned
          </Badge>
        </div>
        <div className="space-y-2">
          {assignedUsers.map((user) => (
            <div
              key={user.id}
              className="p-2 bg-background rounded border border-border/50"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <Badge variant="outline" className="text-xs">
                  Qty: {user.quantityAssigned}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>{user.email}</p>
                <div className="flex items-center gap-2">
                  <span>{user.department}</span>
                  <span>•</span>
                  <span>
                    Assigned: {new Date(user.assignedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to categorize fields
const categorizeFields = (item: Record<string, unknown>) => {
  const assetType = String(item.type || "").toLowerCase();

  // Determine asset subtype based on asset type and available fields
  let assetSubtype = "";
  if (assetType === "compute") {
    assetSubtype = String(item.computeType || "").toLowerCase();
  } else if (assetType === "peripheral") {
    assetSubtype = String(item.peripheralType || "").toLowerCase();
  } else if (assetType === "network") {
    assetSubtype = String(item.networkType || "").toLowerCase();
  }

  const categories = {
    basic: [] as Array<[string, unknown]>,
    technical: [] as Array<[string, unknown]>,
    assignment: [] as Array<[string, unknown]>,
    dates: [] as Array<[string, unknown]>,
    other: [] as Array<[string, unknown]>,
  };

  Object.entries(item).forEach(([key, value]) => {
    // Skip assignedUsers as it's handled specially
    if (key === "assignedUsers") return;

    // Skip non-applicable fields
    if (!isFieldApplicable(key, assetType, assetSubtype, value)) return;

    if (
      [
        "id",
        "assetTag",
        "serialNumber",
        "itemName",
        "licenseName",
        "brand",
        "model",
        "type",
        "category",
        "status",
        "computerName",
      ].includes(key)
    ) {
      categories.basic.push([key, value]);
    } else if (
      [
        "computeType",
        "peripheralType",
        "networkType",
        "computerName",
        "hostname",
        "processor",
        "ramSize",
        "storage",
        "operatingSystem",
        "screenSize",
        "resolution",
        "connectionType",
        "itemName",
        "imeiNumber",
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
        "productionIpAddress",
        "managementMacAddress",
        // Access Point specific fields
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
      ].includes(key)
    ) {
      categories.technical.push([key, value]);
    } else if (
      [
        "assignedUser",
        "staffId",
        "emailAddress",
        "department",
        "location",
      ].includes(key)
    ) {
      categories.assignment.push([key, value]);
    } else if (
      [
        "deployedDate",
        "purchaseDate",
        "retrievedDate",
        "warrantyExpiry",
        "warrantyExpiration",
        "timestamp",
      ].includes(key)
    ) {
      categories.dates.push([key, value]);
    } else if (["vendor", "supplierName"].includes(key)) {
      categories.other.push([key, value]);
    } else {
      categories.other.push([key, value]);
    }
  });

  // Sort assignment fields in the desired order: assignedUser, staffId, emailAddress, department, location
  const assignmentOrder = [
    "assignedUser",
    "staffId",
    "emailAddress",
    "department",
    "location",
  ];
  categories.assignment.sort((a, b) => {
    const aIndex = assignmentOrder.indexOf(a[0]);
    const bIndex = assignmentOrder.indexOf(b[0]);
    // If field is not in the order array, put it at the end
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return categories;
};

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ item, title }) => {
  const categorizedFields = categorizeFields(item as Record<string, unknown>);

  const renderFieldGroup = (
    title: string,
    fields: Array<[string, unknown]>,
    icon?: React.ReactNode
  ) => {
    if (fields.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          {icon}
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <div className="grid gap-3">
          {fields.map(([key, value]) => (
            <div
              key={key}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                {getFieldIcon(key)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {formatFieldName(key)}
                  </p>
                  {(key === "status" ||
                    key === "type" ||
                    key === "category") && (
                    <Badge
                      variant={getStatusBadgeVariant(key, String(value))}
                      className="text-xs px-2 py-0.5"
                    >
                      {formatFieldValue(key, value)}
                    </Badge>
                  )}
                </div>
                {key !== "status" && key !== "type" && key !== "category" && (
                  <p className="text-sm text-foreground break-words">
                    {formatFieldValue(key, value)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          View
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-bua-red" />
            {title}
          </DialogTitle>
          <DialogDescription className="sticky top-0 bg-background z-10 pb-2 border-b border-border/50">
            View detailed information about this item including specifications,
            assignments, and important dates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pt-4">
          {/* Barcode section for assets */}
          {isAsset(item) && (
            <div className="pb-6 border-b border-border">
              <BarcodeLabel asset={item} showPrintButton={true} />
            </div>
          )}

          {renderFieldGroup(
            "Basic Information",
            categorizedFields.basic,
            <Tag className="w-4 h-4 text-bua-red" />
          )}
          {renderFieldGroup(
            "Technical Specifications",
            categorizedFields.technical,
            <Package className="w-4 h-4 text-bua-red" />
          )}
          {renderFieldGroup(
            "Assignment & Location",
            categorizedFields.assignment,
            <User className="w-4 h-4 text-bua-red" />
          )}

          {/* Special rendering for assigned users in receivables */}
          {hasAssignedUsers(item) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Users className="w-4 h-4 text-bua-red" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Assigned Users
                </h3>
              </div>
              {renderAssignedUsers(item.assignedUsers || [])}
            </div>
          )}

          {renderFieldGroup(
            "Important Dates",
            categorizedFields.dates,
            <Calendar className="w-4 h-4 text-bua-red" />
          )}
          {renderFieldGroup(
            "Additional Information",
            categorizedFields.other,
            <AlertCircle className="w-4 h-4 text-bua-red" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;
