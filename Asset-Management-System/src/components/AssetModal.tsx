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
import {
  ComputeTypeField,
  ComputeAdditionalFields,
} from "./asset-form/ComputeFields";
import {
  PeripheralTypeField,
  PeripheralAdditionalFields,
  MonitorSpecifications,
} from "./asset-form/PeripheralFields";
import {
  NetworkTypeField,
  NetworkConfiguration,
} from "./asset-form/NetworkFields";
import { AccessPointFields } from "./asset-form/AccessPointFields";
import {
  ServerTypeField,
  ServerAdditionalFields,
  ServerConfiguration,
} from "./asset-form/ServerFields";

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
  staffId?: string;
  emailAddress?: string;
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

  // Access Point specific fields
  manufacturer?: string;
  modelNumber?: string;
  specificPhysicalLocation?: string;
  ipAssignment?: string;
  managementMethod?: string;
  controllerName?: string;
  controllerAddress?: string;
  powerSource?: string;
  connectedSwitchName?: string;
  connectedSwitchPort?: string;
  ssidsBroadcasted?: string;
  frequencyBands?: string;

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
  staffId: "",
  emailAddress: "",
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

  // Access Point specific fields
  manufacturer: "",
  modelNumber: "",
  specificPhysicalLocation: "",
  ipAssignment: "",
  managementMethod: "",
  controllerName: "",
  controllerAddress: "",
  powerSource: "",
  connectedSwitchName: "",
  connectedSwitchPort: "",
  ssidsBroadcasted: "",
  frequencyBands: "",

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

// Constants moved to individual field components

// connectionTypes moved to PeripheralFields component

// serverRoles moved to ServerFields component

const emailDomains = [
  { value: "@buagroup.com", label: "@buagroup.com" },
  { value: "@asrafrica.org", label: "@asrafrica.org" },
  { value: "@buafoodsplc.com", label: "@buafoodsplc.com" },
  { value: "@buacement.com", label: "@buacement.com" },
];

export const AssetFormModal = memo(function AssetFormModal({
  isOpen,
  onClose,
  onSave,
  asset,
  isRedeploying = false,
}: AssetFormModalProps) {
  const [formData, setFormData] = useState<AssetFormData>(initialFormData);
  const [emailDomain, setEmailDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Populate form when editing an asset
  useEffect(() => {
    if (asset && isOpen) {
      console.log("AssetModal: Populating form with asset data:", asset);
      setFormData({
        serialNumber: asset.serialNumber || "",
        assetType: asset.type
          ? ["laptop", "desktop", "mobile", "server"].includes(asset.type)
            ? "compute"
            : ["printer", "scanner", "monitor"].includes(asset.type)
            ? "peripheral"
            : ["router", "switch", "access_point"].includes(asset.type)
            ? "network"
            : asset.type
          : "",
        computeType:
          asset.computeType ||
          (["laptop", "desktop", "mobile", "server"].includes(asset.type || "")
            ? asset.type
            : ""),
        imeiNumber: asset.imeiNumber || "",
        peripheralType:
          asset.peripheralType ||
          (["printer", "scanner", "monitor"].includes(asset.type || "")
            ? asset.type
            : ""),
        networkType:
          asset.networkType ||
          (["router", "switch", "access_point"].includes(asset.type || "")
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
        staffId: asset.staffId || "",
        emailAddress: asset.emailAddress || "",
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
        // Access Point specific fields
        specificPhysicalLocation: asset.specificPhysicalLocation || "",
        ipAssignment: asset.ipAssignment || "",
        managementMethod: asset.managementMethod || "",
        controllerName: asset.controllerName || "",
        controllerAddress: asset.controllerAddress || "",
        powerSource: asset.powerSource || "",
        connectedSwitchName: asset.connectedSwitchName || "",
        connectedSwitchPort: asset.connectedSwitchPort || "",
        ssidsBroadcasted: asset.ssidsBroadcasted || "",
        frequencyBands: asset.frequencyBands || "",
      });

      console.log("AssetModal: Form data set for Access Point:", {
        assetType: asset.type,
        networkType: asset.networkType || asset.type,
        specificPhysicalLocation: asset.specificPhysicalLocation,
        ipAssignment: asset.ipAssignment,
        managementMethod: asset.managementMethod,
        controllerName: asset.controllerName,
        powerSource: asset.powerSource,
        connectedSwitchName: asset.connectedSwitchName,
        connectedSwitchPort: asset.connectedSwitchPort,
        ssidsBroadcasted: asset.ssidsBroadcasted,
        frequencyBands: asset.frequencyBands,
      });

      // Parse email domain from emailAddress
      if (asset.emailAddress) {
        const domainMatch = asset.emailAddress.match(/@(.+)$/);
        if (domainMatch) {
          setEmailDomain(`@${domainMatch[1]}`);
        }
      }
    } else if (isOpen) {
      setFormData(initialFormData);
      setEmailDomain("");
    }
  }, [asset, isOpen]);

  const handleInputChange = (
    field: keyof AssetFormData | string,
    value: string
  ) => {
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
        // Reset access point fields
        newData.specificPhysicalLocation = "";
        newData.ipAssignment = "";
        newData.managementMethod = "";
        newData.controllerName = "";
        newData.controllerAddress = "";
        newData.powerSource = "";
        newData.connectedSwitchName = "";
        newData.connectedSwitchPort = "";
        newData.ssidsBroadcasted = "";
        newData.frequencyBands = "";
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
        if (value !== "access_point") {
          // Reset access point specific fields
          newData.specificPhysicalLocation = "";
          newData.ipAssignment = "";
          newData.managementMethod = "";
          newData.controllerName = "";
          newData.controllerAddress = "";
          newData.powerSource = "";
          newData.connectedSwitchName = "";
          newData.connectedSwitchPort = "";
          newData.ssidsBroadcasted = "";
          newData.frequencyBands = "";
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

  const handleEmailChange = (emailPrefix: string) => {
    setFormData((prev) => ({
      ...prev,
      emailAddress:
        emailPrefix && emailDomain ? `${emailPrefix}${emailDomain}` : "",
    }));
  };

  const handleEmailDomainChange = (domain: string) => {
    setEmailDomain(domain);
    setFormData((prev) => {
      const emailPrefix = prev.emailAddress
        ? prev.emailAddress.split("@")[0]
        : "";
      return {
        ...prev,
        emailAddress: emailPrefix && domain ? `${emailPrefix}${domain}` : "",
      };
    });
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

      // Generate asset tag using the specific type (unless redeploying - then retain original)
      const assetTag =
        isRedeploying && asset
          ? asset.assetTag
          : await (
              await import("@/services/assetService")
            ).generateAssetTag(specificAssetType, formData.deployedDate);

      // Convert form data to Asset format and call onSave
      const assetData: Omit<Asset, "id"> = {
        assetTag: assetTag,
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
        staffId: formData.staffId,
        emailAddress: formData.emailAddress,
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
    onClose();
  };

  const handleClose = () => {
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
              <div className="space-y-6">
                {/* All Core Fields in One Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Serial Number */}
                  <div className="flex flex-col space-y-2">
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
                      className="border-input focus:border-ring bg-background w-full"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="flex flex-col space-y-2">
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
                      <SelectTrigger className="border-input focus:border-ring bg-background w-full">
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

                  {/* Asset Type */}
                  <div className="flex flex-col space-y-2">
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
                      <SelectTrigger className="border-input focus:border-ring bg-background w-full">
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

                  {/* Dynamic Subtype Field Based on Asset Type */}
                  <div className="flex flex-col space-y-2">
                    {formData.assetType === "compute" && (
                      <ComputeTypeField
                        formData={{ computeType: formData.computeType || "" }}
                        onInputChange={handleInputChange}
                      />
                    )}

                    {formData.assetType === "peripheral" && (
                      <PeripheralTypeField
                        formData={{
                          peripheralType: formData.peripheralType || "",
                        }}
                        onInputChange={handleInputChange}
                      />
                    )}

                    {formData.assetType === "network" && (
                      <NetworkTypeField
                        formData={{ networkType: formData.networkType || "" }}
                        onInputChange={handleInputChange}
                      />
                    )}

                    {formData.assetType === "server" && (
                      <ServerTypeField
                        formData={{ serverRole: formData.serverRole }}
                        onInputChange={handleInputChange}
                      />
                    )}

                    {/* Show placeholder when no asset type is selected */}
                    {!formData.assetType && (
                      <>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Subtype
                        </Label>
                        <div className="h-10 border border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center w-full">
                          <span className="text-sm text-muted-foreground">
                            Select asset type first
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Dynamic Fields Based on Asset Type */}
                {formData.assetType === "compute" && (
                  <ComputeAdditionalFields
                    formData={{
                      computeType: formData.computeType || "",
                      imeiNumber: formData.imeiNumber,
                      computerName: formData.computerName,
                    }}
                    onInputChange={handleInputChange}
                  />
                )}

                {formData.assetType === "peripheral" && (
                  <PeripheralAdditionalFields
                    formData={{
                      peripheralType: formData.peripheralType || "",
                      itemName: formData.itemName,
                      screenSize: formData.screenSize,
                      resolution: formData.resolution,
                      connectionType: formData.connectionType,
                    }}
                    onInputChange={handleInputChange}
                  />
                )}

                {formData.assetType === "server" && (
                  <ServerAdditionalFields
                    formData={{
                      hostname: formData.hostname,
                      serverRole: formData.serverRole,
                      processor: formData.processor,
                      ramSize: formData.ramSize,
                      storage: formData.storage,
                      operatingSystem: formData.operatingSystem,
                      productionIpAddress: formData.productionIpAddress,
                      managementMacAddress: formData.managementMacAddress,
                      powerSupply: formData.powerSupply,
                      installedApplications: formData.installedApplications,
                    }}
                    onInputChange={handleInputChange}
                  />
                )}
              </div>

              {/* Monitor specific fields */}
              {formData.assetType === "peripheral" &&
                formData.peripheralType === "monitor" && (
                  <MonitorSpecifications
                    formData={{
                      screenSize: formData.screenSize,
                      resolution: formData.resolution,
                      connectionType: formData.connectionType,
                    }}
                    onInputChange={handleInputChange}
                  />
                )}

              {/* Network Asset specific fields */}
              {(() => {
                console.log("AssetModal: Checking Access Point conditions:", {
                  assetType: formData.assetType,
                  networkType: formData.networkType,
                  shouldShowAccessPoint:
                    formData.assetType === "network" &&
                    formData.networkType === "access_point",
                });
                return (
                  formData.assetType === "network" &&
                  formData.networkType === "access_point"
                );
              })() && (
                <AccessPointFields
                  formData={{
                    macAddress: formData.macAddress,
                    specificPhysicalLocation: formData.specificPhysicalLocation,
                    ipAddress: formData.ipAddress,
                    ipAssignment: formData.ipAssignment,
                    managementMethod: formData.managementMethod,
                    controllerName: formData.controllerName,
                    controllerAddress: formData.controllerAddress,
                    powerSource: formData.powerSource,
                    connectedSwitchName: formData.connectedSwitchName,
                    connectedSwitchPort: formData.connectedSwitchPort,
                    firmwareVersion: formData.firmwareVersion,
                    ssidsBroadcasted: formData.ssidsBroadcasted,
                    frequencyBands: formData.frequencyBands,
                  }}
                  onInputChange={handleInputChange}
                />
              )}

              {formData.assetType === "network" &&
                formData.networkType &&
                formData.networkType !== "access_point" && (
                  <NetworkConfiguration
                    formData={{
                      networkType: formData.networkType,
                      firmwareVersion: formData.firmwareVersion,
                      ipAddress: formData.ipAddress,
                      macAddress: formData.macAddress,
                      numberOfPorts: formData.numberOfPorts,
                      rackPosition: formData.rackPosition,
                      configBackupLocation: formData.configBackupLocation,
                      uplinkDownlinkInfo: formData.uplinkDownlinkInfo,
                      poeSupport: formData.poeSupport,
                      stackClusterMembership: formData.stackClusterMembership,
                    }}
                    onInputChange={handleInputChange}
                  />
                )}

              {/* Server specific fields */}
              {formData.computeType === "server" && (
                <ServerConfiguration
                  formData={{
                    processor: formData.processor,
                    ramSize: formData.ramSize,
                    storage: formData.storage,
                    operatingSystem: formData.operatingSystem,
                    productionIpAddress: formData.productionIpAddress,
                    managementMacAddress: formData.managementMacAddress,
                    powerSupply: formData.powerSupply,
                    installedApplications: formData.installedApplications,
                  }}
                  onInputChange={handleInputChange}
                />
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

                {/* Hide user-specific fields for network devices */}
                {formData.assetType !== "network" && (
                  <>
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
                        htmlFor="staffId"
                        className="text-sm font-medium text-foreground"
                      >
                        Staff ID
                      </Label>
                      <Input
                        id="staffId"
                        value={formData.staffId || ""}
                        onChange={(e) =>
                          handleInputChange("staffId", e.target.value)
                        }
                        placeholder="Enter staff ID"
                        className="border-input focus:border-ring bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="emailAddress"
                        className="text-sm font-medium text-foreground"
                      >
                        Email Address
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="emailAddress"
                          value={
                            formData.emailAddress
                              ? formData.emailAddress.split("@")[0]
                              : ""
                          }
                          onChange={(e) => handleEmailChange(e.target.value)}
                          placeholder="Enter email prefix"
                          className="border-input focus:border-ring bg-background flex-1"
                        />
                        <Select
                          value={emailDomain === "" ? undefined : emailDomain}
                          onValueChange={handleEmailDomainChange}
                        >
                          <SelectTrigger className="border-input focus:border-ring bg-background w-48">
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {emailDomains.map((domain) => (
                              <SelectItem
                                key={domain.value}
                                value={domain.value}
                                className="hover:bg-accent"
                              >
                                {domain.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                  </>
                )}

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
                <div className="space-y-2 md:col-span-2">
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

                <div className="space-y-2 md:col-span-2">
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
