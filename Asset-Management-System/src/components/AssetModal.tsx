import { useState, useEffect, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import type { Asset, AssetType, AssetStatus } from "@/types/inventory";
import { generateAssetTag } from "@/services/assetService";

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Omit<Asset, "id">) => void;
  asset?: Asset;
  isRedeploying?: boolean;
}

interface AssetFormData {
  serialNumber: string;
  assetType: string;
  computeType?: string;
  imeiNumber?: string;
  peripheralType?: string;
  networkType?: string;
  itemName?: string;
  status: string;
  brand: string;
  model: string;
  deployedDate: Date | undefined;
  warrantyExpiration: Date | undefined;
  vendor: string;
  assignedUser: string;
  department: string;
  location: string;
  specifications: string;
  description: string;
  computerName?: string;

  // Monitor specific fields
  screenSize?: string;
  resolution?: string;
  connectionType?: string;

  // Network Asset specific fields
  firmwareVersion?: string;
  ipAddress?: string;
  macAddress?: string;
  numberOfPorts?: string;
  rackPosition?: string;
  configBackupLocation?: string;
  uplinkDownlinkInfo?: string;
  poeSupport?: string;
  stackClusterMembership?: string;

  // Server specific fields
  hostname?: string;
  processor?: string;
  ramSize?: string;
  storage?: string;
  operatingSystem?: string;
  productionIpAddress?: string;
  managementMacAddress?: string;
  powerSupply?: string;
  serverRole?: string;
  installedApplications?: string;
}

const initialFormData: AssetFormData = {
  serialNumber: "",
  assetType: "",
  computeType: "",
  imeiNumber: "",
  peripheralType: "",
  networkType: "",
  itemName: "",
  status: "",
  brand: "",
  model: "",
  deployedDate: undefined,
  warrantyExpiration: undefined,
  vendor: "",
  assignedUser: "",
  department: "",
  location: "",
  specifications: "",
  description: "",
  computerName: "",

  // Monitor specific fields
  screenSize: "",
  resolution: "",
  connectionType: "",

  // Network Asset specific fields
  firmwareVersion: "",
  ipAddress: "",
  macAddress: "",
  numberOfPorts: "",
  rackPosition: "",
  configBackupLocation: "",
  uplinkDownlinkInfo: "",
  poeSupport: "",
  stackClusterMembership: "",

  // Server specific fields
  hostname: "",
  processor: "",
  ramSize: "",
  storage: "",
  operatingSystem: "",
  productionIpAddress: "",
  managementMacAddress: "",
  powerSupply: "",
  serverRole: "",
  installedApplications: "",
};

const assetTypes = [
  { value: "compute", label: "Compute" },
  { value: "peripheral", label: "Peripheral" },
  { value: "network", label: "Network Device" },
];

const statusOptions = [
  { value: "in-use", label: "In Use" },
  { value: "repaired", label: "Repaired" },
  { value: "retired", label: "Retired" },
  { value: "spare", label: "Spare" },
];

const computeTypes = [
  { value: "laptop", label: "Laptop" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "server", label: "Server" },
];

const peripheralTypes = [
  { value: "printer", label: "Printer" },
  { value: "scanner", label: "Scanner" },
  { value: "monitor", label: "Monitor" },
];

const networkTypes = [
  { value: "router", label: "Router" },
  { value: "switch", label: "Switch" },
];

const connectionTypes = [
  { value: "hdmi", label: "HDMI" },
  { value: "displayport", label: "DisplayPort" },
  { value: "vga", label: "VGA" },
  { value: "dvi", label: "DVI" },
  { value: "usb-c", label: "USB-C" },
];

const serverRoles = [
  { value: "domain-controller", label: "Domain Controller" },
  { value: "file-server", label: "File Server" },
  { value: "web-server", label: "Web Server" },
  { value: "database-server", label: "Database Server" },
  { value: "vm-host", label: "VM Host" },
  { value: "backup-server", label: "Backup Server" },
  { value: "print-server", label: "Print Server" },
];

export const AssetFormModal = memo(function AssetFormModal({
  isOpen,
  onClose,
  onSave,
  asset,
  isRedeploying = false,
}: AssetFormModalProps) {
  const [formData, setFormData] = useState<AssetFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Populate form when editing an asset
  useEffect(() => {
    if (asset) {
      setFormData({
        serialNumber: asset.serialNumber || "",
        assetType: asset.type
          ? ["laptop", "desktop", "mobile", "server"].includes(asset.type)
            ? "compute"
            : ["printer", "scanner", "monitor"].includes(asset.type)
            ? "peripheral"
            : ["router", "switch"].includes(asset.type)
            ? "network"
            : asset.type
          : "",
        computeType:
          asset.computeType ||
          (asset.type === "laptop" ||
          asset.type === "desktop" ||
          asset.type === "mobile" ||
          asset.type === "server"
            ? asset.type
            : ""),
        imeiNumber: "",
        peripheralType:
          asset.peripheralType ||
          (asset.type === "printer" ||
          asset.type === "scanner" ||
          asset.type === "monitor"
            ? asset.type
            : ""),
        networkType:
          asset.networkType ||
          (asset.type === "router" || asset.type === "switch"
            ? asset.type
            : ""),
        itemName: asset.itemName || "",
        status: asset.status || "",
        brand: asset.brand || "",
        model: asset.model || "",
        deployedDate: asset.deployedDate
          ? (() => {
              const date = new Date(asset.deployedDate);
              return isNaN(date.getTime()) ? undefined : date;
            })()
          : undefined,
        warrantyExpiration: asset.warrantyExpiry
          ? (() => {
              const date = new Date(asset.warrantyExpiry);
              return isNaN(date.getTime()) ? undefined : date;
            })()
          : undefined,
        vendor: asset.vendor || "",
        assignedUser: asset.assignedUser || "",
        department: asset.department || "",
        location: asset.location || "",
        specifications: asset.specifications || "",
        description: asset.notes || "",
        computerName: asset.computerName || "",
        // Monitor specific fields
        screenSize: asset.screenSize || "",
        resolution: asset.resolution || "",
        connectionType: asset.connectionType || "",
        // Network Asset specific fields
        firmwareVersion: asset.firmwareVersion || "",
        ipAddress: asset.ipAddress || "",
        macAddress: asset.macAddress || "",
        numberOfPorts: asset.numberOfPorts || "",
        rackPosition: asset.rackPosition || "",
        configBackupLocation: asset.configBackupLocation || "",
        uplinkDownlinkInfo: asset.uplinkDownlinkInfo || "",
        poeSupport: asset.poeSupport || "",
        stackClusterMembership: asset.stackClusterMembership || "",
        // Server specific fields
        hostname: asset.hostname || "",
        processor: asset.processor || "",
        ramSize: asset.ramSize || "",
        storage: asset.storage || "",
        operatingSystem: asset.operatingSystem || "",
        productionIpAddress: asset.productionIpAddress || "",
        managementMacAddress: asset.managementMacAddress || "",
        powerSupply: asset.powerSupply || "",
        serverRole: asset.serverRole || "",
        installedApplications: asset.installedApplications || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [asset]);

  const handleInputChange = (field: keyof AssetFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset dependent fields when asset type changes
      if (field === "assetType") {
        newData.computeType = "";
        newData.imeiNumber = "";
        newData.peripheralType = "";
        newData.networkType = "";
        newData.itemName = "";
        newData.computerName = "";
        // Reset monitor fields
        newData.screenSize = "";
        newData.resolution = "";
        newData.connectionType = "";
        // Reset network fields
        newData.firmwareVersion = "";
        newData.ipAddress = "";
        newData.macAddress = "";
        newData.numberOfPorts = "";
        newData.rackPosition = "";
        newData.configBackupLocation = "";
        newData.uplinkDownlinkInfo = "";
        newData.poeSupport = "";
        newData.stackClusterMembership = "";
        // Reset server fields
        newData.hostname = "";
        newData.processor = "";
        newData.ramSize = "";
        newData.storage = "";
        newData.operatingSystem = "";
        newData.productionIpAddress = "";
        newData.managementMacAddress = "";
        newData.powerSupply = "";
        newData.serverRole = "";
        newData.installedApplications = "";
      }

      // Reset IMEI when compute type changes
      if (field === "computeType" && value !== "mobile") {
        newData.imeiNumber = "";
      }

      // Reset computer name when compute type changes to non-laptop/desktop
      if (
        field === "computeType" &&
        value !== "laptop" &&
        value !== "desktop"
      ) {
        newData.computerName = "";
      }

      // Reset monitor fields when peripheral type changes
      if (field === "peripheralType" && value !== "monitor") {
        newData.screenSize = "";
        newData.resolution = "";
        newData.connectionType = "";
      }

      // Reset network-specific fields when network type changes
      if (field === "networkType") {
        if (value !== "switch") {
          newData.poeSupport = "";
          newData.stackClusterMembership = "";
        }
      }

      return newData;
    });
  };

  const handleDateChange = (
    field: "deployedDate" | "warrantyExpiration",
    date: Date | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.serialNumber || !formData.assetType || !formData.status) {
        toast({
          title: "Validation Error",
          description:
            "Please fill in all required fields (Serial Number, Asset Type, Status).",
          variant: "destructive",
        });
        return;
      }

      // Asset type specific validation
      if (formData.assetType === "compute" && !formData.computeType) {
        toast({
          title: "Validation Error",
          description: "Please select a compute type.",
          variant: "destructive",
        });
        return;
      }

      if (formData.assetType === "peripheral") {
        if (!formData.peripheralType) {
          toast({
            title: "Validation Error",
            description: "Please select a peripheral type.",
            variant: "destructive",
          });
          return;
        }

        if (formData.peripheralType !== "monitor" && !formData.itemName) {
          toast({
            title: "Validation Error",
            description: "Please fill in Item Name.",
            variant: "destructive",
          });
          return;
        }
      }

      if (formData.assetType === "network" && !formData.networkType) {
        toast({
          title: "Validation Error",
          description: "Please select a network device type.",
          variant: "destructive",
        });
        return;
      }

      // Server validation (when compute type is server)
      if (formData.computeType === "server") {
        if (!formData.hostname || !formData.processor || !formData.ramSize) {
          toast({
            title: "Validation Error",
            description:
              "Please fill in Hostname, Processor, and RAM Size for servers.",
            variant: "destructive",
          });
          return;
        }
      }

      // Determine the specific asset type for tag generation and storage
      let specificAssetType = formData.assetType;
      if (formData.assetType === "compute" && formData.computeType) {
        specificAssetType = formData.computeType;
      } else if (
        formData.assetType === "peripheral" &&
        formData.peripheralType
      ) {
        specificAssetType = formData.peripheralType;
      } else if (formData.assetType === "network" && formData.networkType) {
        specificAssetType = formData.networkType;
      }

      // Generate asset tag using the specific type
      const generatedAssetTag = await generateAssetTag(
        specificAssetType,
        formData.deployedDate
      );

      // Convert form data to Asset format and call onSave
      const assetData: Omit<Asset, "id"> = {
        assetTag: generatedAssetTag,
        serialNumber: formData.serialNumber,
        type: specificAssetType as AssetType,
        brand: formData.brand,
        model: formData.model,
        specifications: formData.specifications,
        deployedDate: formData.deployedDate?.toISOString().split("T")[0] || "",
        warrantyExpiry:
          formData.warrantyExpiration?.toISOString().split("T")[0] || "",
        vendor: formData.vendor,
        assignedUser: formData.assignedUser,
        department: formData.department,
        status: formData.status as AssetStatus,
        location: formData.location,
        notes: formData.description,
        computerName: formData.computerName,
        // Monitor specific fields
        screenSize: formData.screenSize,
        resolution: formData.resolution,
        connectionType: formData.connectionType,
        // Network Asset specific fields
        firmwareVersion: formData.firmwareVersion,
        ipAddress: formData.ipAddress,
        macAddress: formData.macAddress,
        numberOfPorts: formData.numberOfPorts,
        rackPosition: formData.rackPosition,
        configBackupLocation: formData.configBackupLocation,
        uplinkDownlinkInfo: formData.uplinkDownlinkInfo,
        poeSupport: formData.poeSupport,
        stackClusterMembership: formData.stackClusterMembership,
        // Server specific fields
        hostname: formData.hostname,
        processor: formData.processor,
        ramSize: formData.ramSize,
        storage: formData.storage,
        operatingSystem: formData.operatingSystem,
        productionIpAddress: formData.productionIpAddress,
        managementMacAddress: formData.managementMacAddress,
        powerSupply: formData.powerSupply,
        serverRole: formData.serverRole,
        installedApplications: formData.installedApplications,
      };

      await onSave(assetData);

      // Reset form (modal will be closed by parent component)
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error saving asset:", error);
      toast({
        title: "Error",
        description: "Failed to save asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    onClose();
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-w-[calc(100%-2rem)] max-h-[90vh] bg-card border-border shadow-lg flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold text-card-foreground">
            {isRedeploying
              ? "Redeploy Asset"
              : asset
              ? "Edit Asset"
              : "Add New Asset"}
          </DialogTitle>
          <DialogDescription>
            {isRedeploying
              ? "Update asset details before redeploying to inventory."
              : asset
              ? "Modify the asset information below."
              : "Fill in the details to add a new asset to the inventory."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="serialNumber"
                    className="text-sm font-medium text-foreground"
                  >
                    Serial Number *
                  </Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      handleInputChange("serialNumber", e.target.value)
                    }
                    placeholder="Enter serial number"
                    className="border-input focus:border-ring bg-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="assetType"
                    className="text-sm font-medium text-foreground"
                  >
                    Asset Type *
                  </Label>
                  <Select
                    value={formData.assetType}
                    onValueChange={(value) =>
                      handleInputChange("assetType", value)
                    }
                  >
                    <SelectTrigger className="border-input focus:border-ring bg-background">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {assetTypes.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="hover:bg-accent"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium text-foreground"
                  >
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger className="border-input focus:border-ring bg-background">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {statusOptions.map((status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                          className="hover:bg-accent"
                        >
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic fields based on asset type */}
                {formData.assetType === "compute" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="computeType"
                      className="text-sm font-medium text-foreground"
                    >
                      Compute Type *
                    </Label>
                    <Select
                      value={formData.computeType}
                      onValueChange={(value) =>
                        handleInputChange("computeType", value)
                      }
                    >
                      <SelectTrigger className="border-input focus:border-ring bg-background">
                        <SelectValue placeholder="Select compute type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {computeTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="hover:bg-accent"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.assetType === "compute" &&
                  formData.computeType === "mobile" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="imeiNumber"
                        className="text-sm font-medium text-foreground"
                      >
                        IMEI Number
                      </Label>
                      <Input
                        id="imeiNumber"
                        value={formData.imeiNumber || ""}
                        onChange={(e) =>
                          handleInputChange("imeiNumber", e.target.value)
                        }
                        placeholder="Enter IMEI number"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>
                  )}

                {formData.assetType === "compute" &&
                  (formData.computeType === "laptop" ||
                    formData.computeType === "desktop") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="computerName"
                        className="text-sm font-medium text-foreground"
                      >
                        Computer Name
                      </Label>
                      <Input
                        id="computerName"
                        value={formData.computerName || ""}
                        onChange={(e) =>
                          handleInputChange("computerName", e.target.value)
                        }
                        placeholder="Enter computer name"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>
                  )}

                {formData.assetType === "peripheral" && (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="peripheralType"
                        className="text-sm font-medium text-foreground"
                      >
                        Peripheral Type *
                      </Label>
                      <Select
                        value={formData.peripheralType}
                        onValueChange={(value) =>
                          handleInputChange("peripheralType", value)
                        }
                      >
                        <SelectTrigger className="border-input focus:border-ring bg-background">
                          <SelectValue placeholder="Select peripheral type" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {peripheralTypes.map((type) => (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                              className="hover:bg-accent"
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.peripheralType !== "monitor" && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="itemName"
                          className="text-sm font-medium text-foreground"
                        >
                          Item Name *
                        </Label>
                        <Input
                          id="itemName"
                          value={formData.itemName || ""}
                          onChange={(e) =>
                            handleInputChange("itemName", e.target.value)
                          }
                          placeholder="Enter item name"
                          className="border-input focus:border-ring bg-background"
                        />
                      </div>
                    )}
                  </>
                )}

                {formData.assetType === "network" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="networkType"
                      className="text-sm font-medium text-foreground"
                    >
                      Network Device Type *
                    </Label>
                    <Select
                      value={formData.networkType}
                      onValueChange={(value) =>
                        handleInputChange("networkType", value)
                      }
                    >
                      <SelectTrigger className="border-input focus:border-ring bg-background">
                        <SelectValue placeholder="Select network device type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {networkTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="hover:bg-accent"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.assetType === "server" && (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="hostname"
                        className="text-sm font-medium text-foreground"
                      >
                        Hostname / Server Name *
                      </Label>
                      <Input
                        id="hostname"
                        value={formData.hostname || ""}
                        onChange={(e) =>
                          handleInputChange("hostname", e.target.value)
                        }
                        placeholder="Enter hostname"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="serverRole"
                        className="text-sm font-medium text-foreground"
                      >
                        Server Role / Function
                      </Label>
                      <Select
                        value={formData.serverRole}
                        onValueChange={(value) =>
                          handleInputChange("serverRole", value)
                        }
                      >
                        <SelectTrigger className="border-input focus:border-ring bg-background">
                          <SelectValue placeholder="Select server role" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {serverRoles.map((role) => (
                            <SelectItem
                              key={role.value}
                              value={role.value}
                              className="hover:bg-accent"
                            >
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* Monitor specific fields */}
              {formData.assetType === "peripheral" &&
                formData.peripheralType === "monitor" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                      Monitor Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="screenSize"
                          className="text-sm font-medium text-foreground"
                        >
                          Screen Size (inches)
                        </Label>
                        <Input
                          id="screenSize"
                          value={formData.screenSize || ""}
                          onChange={(e) =>
                            handleInputChange("screenSize", e.target.value)
                          }
                          placeholder="e.g., 24, 27, 32"
                          className="border-input focus:border-ring bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="resolution"
                          className="text-sm font-medium text-foreground"
                        >
                          Resolution
                        </Label>
                        <Input
                          id="resolution"
                          value={formData.resolution || ""}
                          onChange={(e) =>
                            handleInputChange("resolution", e.target.value)
                          }
                          placeholder="e.g., 1920x1080, 4K"
                          className="border-input focus:border-ring bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="connectionType"
                          className="text-sm font-medium text-foreground"
                        >
                          Connection Type
                        </Label>
                        <Select
                          value={formData.connectionType}
                          onValueChange={(value) =>
                            handleInputChange("connectionType", value)
                          }
                        >
                          <SelectTrigger className="border-input focus:border-ring bg-background">
                            <SelectValue placeholder="Select connection type" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {connectionTypes.map((type) => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                className="hover:bg-accent"
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

              {/* Network Asset specific fields */}
              {formData.assetType === "network" && formData.networkType && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                    {formData.networkType === "router" ? "Router" : "Switch"}{" "}
                    Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firmwareVersion"
                        className="text-sm font-medium text-foreground"
                      >
                        Firmware / OS Version
                      </Label>
                      <Input
                        id="firmwareVersion"
                        value={formData.firmwareVersion || ""}
                        onChange={(e) =>
                          handleInputChange("firmwareVersion", e.target.value)
                        }
                        placeholder="Enter firmware version"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="ipAddress"
                        className="text-sm font-medium text-foreground"
                      >
                        IP Address (Management)
                      </Label>
                      <Input
                        id="ipAddress"
                        value={formData.ipAddress || ""}
                        onChange={(e) =>
                          handleInputChange("ipAddress", e.target.value)
                        }
                        placeholder="e.g., 192.168.1.1"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="macAddress"
                        className="text-sm font-medium text-foreground"
                      >
                        MAC Address
                      </Label>
                      <Input
                        id="macAddress"
                        value={formData.macAddress || ""}
                        onChange={(e) =>
                          handleInputChange("macAddress", e.target.value)
                        }
                        placeholder="e.g., 00:1B:44:11:3A:B7"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="numberOfPorts"
                        className="text-sm font-medium text-foreground"
                      >
                        Number of Ports /{" "}
                        {formData.networkType === "router"
                          ? "Interfaces"
                          : "Speed"}
                      </Label>
                      <Input
                        id="numberOfPorts"
                        value={formData.numberOfPorts || ""}
                        onChange={(e) =>
                          handleInputChange("numberOfPorts", e.target.value)
                        }
                        placeholder={
                          formData.networkType === "router"
                            ? "e.g., 4 LAN, 1 WAN"
                            : "e.g., 24 ports 1Gbps"
                        }
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="rackPosition"
                        className="text-sm font-medium text-foreground"
                      >
                        Location / Rack Position
                      </Label>
                      <Input
                        id="rackPosition"
                        value={formData.rackPosition || ""}
                        onChange={(e) =>
                          handleInputChange("rackPosition", e.target.value)
                        }
                        placeholder="e.g., Rack 1, U5-U7"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="configBackupLocation"
                        className="text-sm font-medium text-foreground"
                      >
                        Configuration Backup Location
                      </Label>
                      <Input
                        id="configBackupLocation"
                        value={formData.configBackupLocation || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "configBackupLocation",
                            e.target.value
                          )
                        }
                        placeholder="Enter backup location"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    {formData.networkType === "router" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label
                          htmlFor="uplinkDownlinkInfo"
                          className="text-sm font-medium text-foreground"
                        >
                          Uplink / Downlink Information
                        </Label>
                        <Textarea
                          id="uplinkDownlinkInfo"
                          value={formData.uplinkDownlinkInfo || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "uplinkDownlinkInfo",
                              e.target.value
                            )
                          }
                          placeholder="Enter uplink/downlink details"
                          className="border-input focus:border-ring bg-background"
                        />
                      </div>
                    )}

                    {formData.networkType === "switch" && (
                      <>
                        <div className="space-y-2">
                          <Label
                            htmlFor="poeSupport"
                            className="text-sm font-medium text-foreground"
                          >
                            PoE Support
                          </Label>
                          <Input
                            id="poeSupport"
                            value={formData.poeSupport || ""}
                            onChange={(e) =>
                              handleInputChange("poeSupport", e.target.value)
                            }
                            placeholder="e.g., Yes - 370W budget"
                            className="border-input focus:border-ring bg-background"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="stackClusterMembership"
                            className="text-sm font-medium text-foreground"
                          >
                            Stack/Cluster Membership
                          </Label>
                          <Input
                            id="stackClusterMembership"
                            value={formData.stackClusterMembership || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "stackClusterMembership",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Stack ID 1, Member 2"
                            className="border-input focus:border-ring bg-background"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Server specific fields */}
              {formData.computeType === "server" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                    Server Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="processor"
                        className="text-sm font-medium text-foreground"
                      >
                        Processor (CPU) *
                      </Label>
                      <Input
                        id="processor"
                        value={formData.processor || ""}
                        onChange={(e) =>
                          handleInputChange("processor", e.target.value)
                        }
                        placeholder="e.g., Intel Xeon E5-2690 v4 (14 cores, 2.6GHz)"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="ramSize"
                        className="text-sm font-medium text-foreground"
                      >
                        RAM Size & Configuration *
                      </Label>
                      <Input
                        id="ramSize"
                        value={formData.ramSize || ""}
                        onChange={(e) =>
                          handleInputChange("ramSize", e.target.value)
                        }
                        placeholder="e.g., 64GB (4x16GB DDR4)"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="storage"
                        className="text-sm font-medium text-foreground"
                      >
                        Storage Configuration
                      </Label>
                      <Input
                        id="storage"
                        value={formData.storage || ""}
                        onChange={(e) =>
                          handleInputChange("storage", e.target.value)
                        }
                        placeholder="e.g., 2x500GB SSD RAID 1"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="operatingSystem"
                        className="text-sm font-medium text-foreground"
                      >
                        Operating System / Version
                      </Label>
                      <Input
                        id="operatingSystem"
                        value={formData.operatingSystem || ""}
                        onChange={(e) =>
                          handleInputChange("operatingSystem", e.target.value)
                        }
                        placeholder="e.g., Windows Server 2022, Ubuntu 22.04"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="productionIpAddress"
                        className="text-sm font-medium text-foreground"
                      >
                        Production IP Address(es)
                      </Label>
                      <Input
                        id="productionIpAddress"
                        value={formData.productionIpAddress || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "productionIpAddress",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 10.1.1.50, 192.168.1.100"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="managementMacAddress"
                        className="text-sm font-medium text-foreground"
                      >
                        MAC Address(es)
                      </Label>
                      <Input
                        id="managementMacAddress"
                        value={formData.managementMacAddress || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "managementMacAddress",
                            e.target.value
                          )
                        }
                        placeholder="Primary NIC MAC address"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="powerSupply"
                        className="text-sm font-medium text-foreground"
                      >
                        Power Supply Configuration
                      </Label>
                      <Input
                        id="powerSupply"
                        value={formData.powerSupply || ""}
                        onChange={(e) =>
                          handleInputChange("powerSupply", e.target.value)
                        }
                        placeholder="e.g., Dual 750W redundant"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor="installedApplications"
                        className="text-sm font-medium text-foreground"
                      >
                        Installed Applications / Services
                      </Label>
                      <Textarea
                        id="installedApplications"
                        value={formData.installedApplications || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "installedApplications",
                            e.target.value
                          )
                        }
                        placeholder="List key applications and services running on this server"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Device Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="brand"
                    className="text-sm font-medium text-foreground"
                  >
                    Brand / Manufacturer
                  </Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="Enter brand/manufacturer"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="model"
                    className="text-sm font-medium text-foreground"
                  >
                    Model
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="Enter model"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Deployed Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-input hover:bg-accent/50",
                          !formData.deployedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deployedDate &&
                        !isNaN(formData.deployedDate.getTime())
                          ? format(formData.deployedDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-popover border-border"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={formData.deployedDate}
                        onSelect={(date) =>
                          handleDateChange("deployedDate", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Warranty Expiration
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-input hover:bg-accent/50",
                          !formData.warrantyExpiration &&
                            "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.warrantyExpiration &&
                        !isNaN(formData.warrantyExpiration.getTime())
                          ? format(formData.warrantyExpiration, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-popover border-border"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={formData.warrantyExpiration}
                        onSelect={(date) =>
                          handleDateChange("warrantyExpiration", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Assignment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hide vendor for peripherals */}
                {formData.assetType !== "peripheral" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="vendor"
                      className="text-sm font-medium text-foreground"
                    >
                      Vendor
                    </Label>
                    <Input
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) =>
                        handleInputChange("vendor", e.target.value)
                      }
                      placeholder="Enter vendor"
                      className="border-input focus:border-ring bg-background"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="assignedUser"
                    className="text-sm font-medium text-foreground"
                  >
                    Assigned User
                  </Label>
                  <Input
                    id="assignedUser"
                    value={formData.assignedUser}
                    onChange={(e) =>
                      handleInputChange("assignedUser", e.target.value)
                    }
                    placeholder="Enter assigned user"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="department"
                    className="text-sm font-medium text-foreground"
                  >
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    placeholder="Enter department"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium text-foreground"
                  >
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Enter location"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="specifications"
                    className="text-sm font-medium text-foreground"
                  >
                    Specifications
                  </Label>
                  <Textarea
                    id="specifications"
                    value={formData.specifications}
                    onChange={(e) =>
                      handleInputChange("specifications", e.target.value)
                    }
                    placeholder="Enter technical specifications"
                    className="border-input focus:border-ring bg-background min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-foreground"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter description"
                    className="border-input focus:border-ring bg-background min-h-[120px]"
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Form Actions - Fixed Footer */}
        <div className="flex items-center justify-end space-x-4 px-6 py-4 border-t border-border bg-card">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-border hover:bg-accent/50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading
              ? "Saving..."
              : isRedeploying
              ? "Redeploy"
              : "Save Asset"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default AssetFormModal;
