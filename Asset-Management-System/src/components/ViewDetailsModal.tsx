import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ViewDetailsModalProps {
  item: unknown;
  title: string;
}

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

// Helper function to check if field is applicable to asset type
const isFieldApplicable = (
  key: string,
  assetType: string,
  value: unknown
): boolean => {
  // Always show basic fields
  const basicFields = [
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
    "specifications",
  ];
  if (basicFields.includes(key)) return true;

  // Always show assignment and date fields
  const commonFields = [
    "assignedUser",
    "department",
    "location",
    "vendor",
    "supplierName",
    "deployedDate",
    "purchaseDate",
    "retrievedDate",
    "warrantyExpiry",
    "warrantyExpiration",
    "timestamp",
    "notes",
    "description",
  ];
  if (commonFields.includes(key)) return true;

  // Don't show empty or null values
  if (!value || value === "" || value === "N/A") return false;

  // Type-specific field visibility
  switch (assetType?.toLowerCase()) {
    case "laptop":
    case "desktop":
    case "mobile":
      return [
        "computeType",
        "hostname",
        "processor",
        "ramSize",
        "storageSize",
        "operatingSystem",
        "imeiNumber",
      ].includes(key);

    case "printer":
    case "scanner":
      return ["peripheralType", "printerType", "connectionType"].includes(key);

    case "monitor":
      return [
        "peripheralType",
        "screenSize",
        "resolution",
        "connectionType",
      ].includes(key);

    case "server":
      return [
        "hostname",
        "processor",
        "ramSize",
        "storageSize",
        "operatingSystem",
        "powerSupply",
        "serverRole",
        "installedApplications",
      ].includes(key);

    case "router":
    case "switch":
      return [
        "networkType",
        "firmwareVersion",
        "ipAddress",
        "macAddress",
        "numberOfPorts",
        "connectionType",
      ].includes(key);

    default:
      // For unknown types, show all fields that have values
      return true;
  }
};

// Helper function to categorize fields
const categorizeFields = (item: Record<string, unknown>) => {
  const assetType = String(item.type || "").toLowerCase();

  const categories = {
    basic: [] as Array<[string, unknown]>,
    technical: [] as Array<[string, unknown]>,
    assignment: [] as Array<[string, unknown]>,
    dates: [] as Array<[string, unknown]>,
    other: [] as Array<[string, unknown]>,
  };

  Object.entries(item).forEach(([key, value]) => {
    // Skip non-applicable fields
    if (!isFieldApplicable(key, assetType, value)) return;

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
      ].includes(key)
    ) {
      categories.basic.push([key, value]);
    } else if (
      [
        "computeType",
        "peripheralType",
        "networkType",
        "hostname",
        "processor",
        "ramSize",
        "storageSize",
        "operatingSystem",
        "specifications",
        "screenSize",
        "resolution",
        "printerType",
        "numberOfPorts",
        "powerSupply",
        "serverRole",
        "installedApplications",
        "imeiNumber",
        "firmwareVersion",
        "ipAddress",
        "macAddress",
        "connectionType",
      ].includes(key)
    ) {
      categories.technical.push([key, value]);
    } else if (
      [
        "assignedUser",
        "department",
        "location",
        "vendor",
        "supplierName",
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
    } else {
      categories.other.push([key, value]);
    }
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
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Eye className="w-4 h-4 mr-1.5" />
            View
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-bua-red" />
            {title}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this item including specifications,
            assignments, and important dates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
