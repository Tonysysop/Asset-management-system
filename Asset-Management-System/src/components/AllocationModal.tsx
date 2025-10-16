import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import type { IncomingStock, Asset } from "../types/inventory";
import { generateAssetTag } from "../services/assetService";

const connectionTypes = [
  { value: "hdmi", label: "HDMI" },
  { value: "displayport", label: "DisplayPort" },
  { value: "vga", label: "VGA" },
  { value: "dvi", label: "DVI" },
  { value: "usb-c", label: "USB-C" },
];

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: IncomingStock, assetData: Omit<Asset, "id">) => void;
  stock: IncomingStock | null;
}

const AllocationModal: React.FC<AllocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  stock,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    specifications: "",
    deployedDate: undefined as Date | undefined,
    warrantyExpiry: undefined as Date | undefined,
    vendor: "",
    assignedUser: "",
    staffId: "",
    emailAddress: "",
    department: "",
    location: "",
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
    // Access Point specific fields
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
  });

  useEffect(() => {
    if (stock) {
      // Pre-fill form with existing stock data
      setFormData((prev) => ({
        ...prev,
        specifications: stock.specifications || "",
        vendor: stock.vendor || "",
        assignedUser: stock.assignedUser || "",
        staffId: stock.staffId || "",
        emailAddress: stock.emailAddress || "",
        department: stock.department || "",
        location: stock.location || "",
        description: stock.description || "",
        computerName: stock.computerName || "",
        // Monitor specific fields
        screenSize: stock.screenSize || "",
        resolution: stock.resolution || "",
        connectionType: stock.connectionType || "",
        // Network Asset specific fields
        firmwareVersion: stock.firmwareVersion || "",
        ipAddress: stock.ipAddress || "",
        macAddress: stock.macAddress || "",
        numberOfPorts: stock.numberOfPorts || "",
        rackPosition: stock.rackPosition || "",
        configBackupLocation: stock.configBackupLocation || "",
        uplinkDownlinkInfo: stock.uplinkDownlinkInfo || "",
        poeSupport: stock.poeSupport || "",
        stackClusterMembership: stock.stackClusterMembership || "",
        // Server specific fields
        hostname: stock.hostname || "",
        processor: stock.processor || "",
        ramSize: stock.ramSize || "",
        storage: stock.storage || "",
        operatingSystem: stock.operatingSystem || "",
        productionIpAddress: stock.productionIpAddress || "",
        managementMacAddress: stock.managementMacAddress || "",
        powerSupply: stock.powerSupply || "",
        serverRole: stock.serverRole || "",
        installedApplications: stock.installedApplications || "",
        // Access Point specific fields
        specificPhysicalLocation: stock.specificPhysicalLocation || "",
        ipAssignment: stock.ipAssignment || "",
        managementMethod: stock.managementMethod || "",
        controllerName: stock.controllerName || "",
        controllerAddress: stock.controllerAddress || "",
        powerSource: stock.powerSource || "",
        connectedSwitchName: stock.connectedSwitchName || "",
        connectedSwitchPort: stock.connectedSwitchPort || "",
        ssidsBroadcasted: stock.ssidsBroadcasted || "",
        frequencyBands: stock.frequencyBands || "",
      }));
    }
  }, [stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Generate asset tag
      const generatedAssetTag = await generateAssetTag(
        stock.assetType,
        stock.assetSubtype,
        formData.deployedDate
      );

      const assetData: Omit<Asset, "id"> = {
        assetTag: generatedAssetTag,
        serialNumber: stock.serialNumber,
        type: stock.assetType,
        brand: stock.brand,
        model: stock.model,
        specifications: formData.specifications,
        deployedDate: formData.deployedDate
          ? format(formData.deployedDate, "yyyy-MM-dd")
          : "",
        warrantyExpiry: formData.warrantyExpiry
          ? format(formData.warrantyExpiry, "yyyy-MM-dd")
          : "",
        vendor: stock.vendor || formData.vendor,
        assignedUser: formData.assignedUser,
        staffId: formData.staffId || "",
        emailAddress: formData.emailAddress || "",
        department: formData.department,
        status: "in-use",
        location: formData.location,
        description: formData.description || "",
        notes: stock.notes || "",
        // Batch tracking (preserved from incoming stock)
        batchTag: stock.batchTag,
        batchName: stock.batchName,
        batchDescription: stock.batchDescription,
        batchCreatedDate: stock.batchCreatedDate,
        batchCreatedBy: stock.batchCreatedBy,
        peripheralType:
          stock.assetType === "peripheral"
            ? (stock.assetSubtype as "printer" | "scanner" | "monitor")
            : undefined,
        networkType:
          stock.assetType === "network"
            ? (stock.assetSubtype as "router" | "switch" | "access_point")
            : undefined,
        itemName: stock.itemName || "",
        computeType:
          stock.assetType === "compute"
            ? (stock.assetSubtype as "laptop" | "desktop" | "mobile" | "server")
            : undefined,
        computerName: formData.computerName || "",
        imeiNumber: stock.imeiNumber || "",
        // Monitor specific fields
        screenSize: formData.screenSize || "",
        resolution: formData.resolution || "",
        connectionType: formData.connectionType || "",
        // Network Asset specific fields
        firmwareVersion: formData.firmwareVersion || "",
        ipAddress: formData.ipAddress || "",
        macAddress: formData.macAddress || "",
        numberOfPorts: formData.numberOfPorts || "",
        rackPosition: formData.rackPosition || "",
        configBackupLocation: formData.configBackupLocation || "",
        uplinkDownlinkInfo: formData.uplinkDownlinkInfo || "",
        poeSupport: formData.poeSupport || "",
        stackClusterMembership: formData.stackClusterMembership || "",
        // Server specific fields
        hostname: formData.hostname || "",
        processor: formData.processor || "",
        ramSize: formData.ramSize || "",
        storage: formData.storage || "",
        operatingSystem: formData.operatingSystem || "",
        productionIpAddress: formData.productionIpAddress || "",
        managementMacAddress: formData.managementMacAddress || "",
        powerSupply: formData.powerSupply || "",
        serverRole: formData.serverRole || "",
        installedApplications: formData.installedApplications || "",
        // Access Point specific fields
        specificPhysicalLocation: formData.specificPhysicalLocation || "",
        ipAssignment: formData.ipAssignment || "",
        managementMethod: formData.managementMethod || "",
        controllerName: formData.controllerName || "",
        controllerAddress: formData.controllerAddress || "",
        powerSource: formData.powerSource || "",
        connectedSwitchName: formData.connectedSwitchName || "",
        connectedSwitchPort: formData.connectedSwitchPort || "",
        ssidsBroadcasted: formData.ssidsBroadcasted || "",
        frequencyBands: formData.frequencyBands || "",
      };

      await onSave(stock, assetData);
      // Modal will be closed by parent component after successful save
    } catch (error) {
      console.error("Error during allocation:", error);
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | Date | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!stock) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-w-[calc(100%-2rem)] max-h-[90vh] bg-card border-border shadow-lg flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Allocate Asset</DialogTitle>
          <DialogDescription>
            Complete the allocation details for this incoming stock item.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 px-6 pb-6 overflow-y-auto flex-1"
        >
          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label className="text-gray-600">Serial Number</Label>
              <Input
                value={stock.serialNumber}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Status</Label>
              <Input
                value={stock.status.toUpperCase()}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Asset Type</Label>
              <Input
                value={stock.assetType}
                disabled
                className="bg-gray-100 capitalize"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Asset Subtype</Label>
              <Input
                value={stock.assetSubtype.replace("_", " ")}
                disabled
                className="bg-gray-100 capitalize"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Brand</Label>
              <Input value={stock.brand} disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Model</Label>
              <Input value={stock.model} disabled className="bg-gray-100" />
            </div>
          </div>

          {/* Monitor Specifications - Show before Allocation Details for monitors */}
          {stock.assetType === "peripheral" &&
            stock.assetSubtype === "monitor" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Monitor Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="screenSize"
                      className="text-sm font-medium text-gray-700"
                    >
                      Screen Size (inches)
                    </Label>
                    <Input
                      id="screenSize"
                      value={formData.screenSize}
                      onChange={(e) =>
                        handleInputChange("screenSize", e.target.value)
                      }
                      placeholder="e.g., 24, 27, 32"
                      className="border-gray-300 focus:border-bua-red focus:ring-bua-red"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="resolution"
                      className="text-sm font-medium text-gray-700"
                    >
                      Resolution
                    </Label>
                    <Input
                      id="resolution"
                      value={formData.resolution}
                      onChange={(e) =>
                        handleInputChange("resolution", e.target.value)
                      }
                      placeholder="e.g., 1920x1080, 4K"
                      className="border-gray-300 focus:border-bua-red focus:ring-bua-red"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="connectionType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Connection Type
                    </Label>
                    <Select
                      value={formData.connectionType || ""}
                      onValueChange={(value) =>
                        handleInputChange("connectionType", value)
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-bua-red focus:ring-bua-red">
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectionTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="hover:bg-gray-100"
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

          {/* Access Point Configuration - Show before Allocation Details for access points */}
          {stock.assetType === "network" &&
            stock.assetSubtype === "access_point" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                  Access Point Configuration
                </h3>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="macAddress"
                      className="text-sm font-medium text-foreground"
                    >
                      MAC Address (BSSID) *
                    </Label>
                    <Input
                      id="macAddress"
                      value={formData.macAddress}
                      onChange={(e) =>
                        handleInputChange("macAddress", e.target.value)
                      }
                      placeholder="e.g., 00:1A:2B:3C:4D:5E"
                      className="border-input focus:border-ring bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="specificPhysicalLocation"
                      className="text-sm font-medium text-foreground"
                    >
                      Specific Physical Location *
                    </Label>
                    <Input
                      id="specificPhysicalLocation"
                      value={formData.specificPhysicalLocation}
                      onChange={(e) =>
                        handleInputChange(
                          "specificPhysicalLocation",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Ceiling, NE corner, Room 301, Block B"
                      className="border-input focus:border-ring bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="frequencyBands"
                      className="text-sm font-medium text-foreground"
                    >
                      Frequency Bands in Use *
                    </Label>
                    <Select
                      value={formData.frequencyBands || ""}
                      onValueChange={(value) =>
                        handleInputChange("frequencyBands", value)
                      }
                    >
                      <SelectTrigger className="border-input focus:border-ring bg-background">
                        <SelectValue placeholder="Select frequency bands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2.4ghz">2.4 GHz</SelectItem>
                        <SelectItem value="5ghz">5 GHz</SelectItem>
                        <SelectItem value="6ghz">6 GHz</SelectItem>
                        <SelectItem value="2.4ghz_5ghz">
                          2.4 GHz + 5 GHz
                        </SelectItem>
                        <SelectItem value="2.4ghz_6ghz">
                          2.4 GHz + 6 GHz
                        </SelectItem>
                        <SelectItem value="5ghz_6ghz">5 GHz + 6 GHz</SelectItem>
                        <SelectItem value="all_bands">
                          All Bands (2.4 + 5 + 6 GHz)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Horizontal Rule */}
                <hr className="border-border" />

                {/* Network / Power Configuration */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground">
                    Network / Power Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="ipAddress"
                        className="text-sm font-medium text-foreground"
                      >
                        IP Address *
                      </Label>
                      <Input
                        id="ipAddress"
                        value={formData.ipAddress}
                        onChange={(e) =>
                          handleInputChange("ipAddress", e.target.value)
                        }
                        placeholder="e.g., 192.168.1.100"
                        className="border-input focus:border-ring bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="managementMethod"
                        className="text-sm font-medium text-foreground"
                      >
                        Management Method *
                      </Label>
                      <Select
                        value={formData.managementMethod || ""}
                        onValueChange={(value) =>
                          handleInputChange("managementMethod", value)
                        }
                      >
                        <SelectTrigger className="border-input focus:border-ring bg-background">
                          <SelectValue placeholder="Select management method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standalone">Standalone</SelectItem>
                          <SelectItem value="controller">Controller</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="ipAssignment"
                        className="text-sm font-medium text-foreground"
                      >
                        IP Assignment *
                      </Label>
                      <Select
                        value={formData.ipAssignment || ""}
                        onValueChange={(value) =>
                          handleInputChange("ipAssignment", value)
                        }
                      >
                        <SelectTrigger className="border-input focus:border-ring bg-background">
                          <SelectValue placeholder="Select IP assignment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="static">Static</SelectItem>
                          <SelectItem value="dhcp">DHCP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="powerSource"
                        className="text-sm font-medium text-foreground"
                      >
                        Power Source *
                      </Label>
                      <Select
                        value={formData.powerSource || ""}
                        onValueChange={(value) =>
                          handleInputChange("powerSource", value)
                        }
                      >
                        <SelectTrigger className="border-input focus:border-ring bg-background">
                          <SelectValue placeholder="Select power source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poe">
                            PoE (Power over Ethernet)
                          </SelectItem>
                          <SelectItem value="dc_adapter">
                            DC Power Adapter
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Controller fields - only show if management method is controller */}
                  {formData.managementMethod === "controller" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="controllerName"
                          className="text-sm font-medium text-foreground"
                        >
                          Controller Name
                        </Label>
                        <Input
                          id="controllerName"
                          value={formData.controllerName}
                          onChange={(e) =>
                            handleInputChange("controllerName", e.target.value)
                          }
                          placeholder="e.g., WLC-5508"
                          className="border-input focus:border-ring bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="controllerAddress"
                          className="text-sm font-medium text-foreground"
                        >
                          Controller Address
                        </Label>
                        <Input
                          id="controllerAddress"
                          value={formData.controllerAddress}
                          onChange={(e) =>
                            handleInputChange(
                              "controllerAddress",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 192.168.1.10"
                          className="border-input focus:border-ring bg-background"
                        />
                      </div>
                    </div>
                  )}

                  {/* Switch connection fields - only show if power source is PoE */}
                  {formData.powerSource === "poe" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="connectedSwitchName"
                          className="text-sm font-medium text-foreground"
                        >
                          Connected Switch Name
                        </Label>
                        <Input
                          id="connectedSwitchName"
                          value={formData.connectedSwitchName}
                          onChange={(e) =>
                            handleInputChange(
                              "connectedSwitchName",
                              e.target.value
                            )
                          }
                          placeholder="e.g., SW-Core-01"
                          className="border-input focus:border-ring bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="connectedSwitchPort"
                          className="text-sm font-medium text-foreground"
                        >
                          Connected Switch Port
                        </Label>
                        <Input
                          id="connectedSwitchPort"
                          value={formData.connectedSwitchPort}
                          onChange={(e) =>
                            handleInputChange(
                              "connectedSwitchPort",
                              e.target.value
                            )
                          }
                          placeholder="e.g., GigabitEthernet0/1/0/24"
                          className="border-input focus:border-ring bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Horizontal Rule */}
                <hr className="border-border" />

                {/* Software and Configuration */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground">
                    Software and Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firmwareVersion"
                        className="text-sm font-medium text-foreground"
                      >
                        Firmware Version *
                      </Label>
                      <Input
                        id="firmwareVersion"
                        value={formData.firmwareVersion}
                        onChange={(e) =>
                          handleInputChange("firmwareVersion", e.target.value)
                        }
                        placeholder="e.g., 15.3(3)JF7"
                        className="border-input focus:border-ring bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="ssidsBroadcasted"
                        className="text-sm font-medium text-foreground"
                      >
                        SSIDs Broadcasted *
                      </Label>
                      <Input
                        id="ssidsBroadcasted"
                        value={formData.ssidsBroadcasted}
                        onChange={(e) =>
                          handleInputChange("ssidsBroadcasted", e.target.value)
                        }
                        placeholder="e.g., Corporate-WiFi, Guest-Network, IoT-Devices"
                        className="border-input focus:border-ring bg-background"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Router Configuration - Show before Allocation Details for routers */}
          {stock.assetType === "network" && stock.assetSubtype === "router" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Router Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="firmwareVersion"
                    className="text-sm font-medium text-foreground"
                  >
                    Firmware Version
                  </Label>
                  <Input
                    id="firmwareVersion"
                    value={formData.firmwareVersion}
                    onChange={(e) =>
                      handleInputChange("firmwareVersion", e.target.value)
                    }
                    placeholder="e.g., 12.2(55)SE"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="ipAddress"
                    className="text-sm font-medium text-foreground"
                  >
                    IP Address
                  </Label>
                  <Input
                    id="ipAddress"
                    value={formData.ipAddress}
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
                    value={formData.macAddress}
                    onChange={(e) =>
                      handleInputChange("macAddress", e.target.value)
                    }
                    placeholder="e.g., 00:1A:2B:3C:4D:5E"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="numberOfPorts"
                    className="text-sm font-medium text-foreground"
                  >
                    Number of Ports
                  </Label>
                  <Input
                    id="numberOfPorts"
                    value={formData.numberOfPorts}
                    onChange={(e) =>
                      handleInputChange("numberOfPorts", e.target.value)
                    }
                    placeholder="e.g., 24, 48"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="rackPosition"
                    className="text-sm font-medium text-foreground"
                  >
                    Rack Position
                  </Label>
                  <Input
                    id="rackPosition"
                    value={formData.rackPosition}
                    onChange={(e) =>
                      handleInputChange("rackPosition", e.target.value)
                    }
                    placeholder="e.g., Rack 1, U15"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="configBackupLocation"
                    className="text-sm font-medium text-foreground"
                  >
                    Config Backup Location
                  </Label>
                  <Input
                    id="configBackupLocation"
                    value={formData.configBackupLocation}
                    onChange={(e) =>
                      handleInputChange("configBackupLocation", e.target.value)
                    }
                    placeholder="e.g., /backup/switch-configs/"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>

                {/* Uplink/Downlink Info for routers (non-switch devices) */}
                <div className="space-y-2">
                  <Label
                    htmlFor="uplinkDownlinkInfo"
                    className="text-sm font-medium text-foreground"
                  >
                    Uplink/Downlink Info
                  </Label>
                  <Input
                    id="uplinkDownlinkInfo"
                    value={formData.uplinkDownlinkInfo}
                    onChange={(e) =>
                      handleInputChange("uplinkDownlinkInfo", e.target.value)
                    }
                    placeholder="e.g., Connected to Core Switch"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Editable allocation fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Allocation Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hide user-specific fields for network devices */}
              {stock.assetType !== "network" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="assignedUser">Assigned User *</Label>
                    <Input
                      id="assignedUser"
                      value={formData.assignedUser}
                      onChange={(e) =>
                        handleInputChange("assignedUser", e.target.value)
                      }
                      placeholder="Enter assigned user"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input
                      id="staffId"
                      value={formData.staffId}
                      onChange={(e) =>
                        handleInputChange("staffId", e.target.value)
                      }
                      placeholder="Enter staff ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) =>
                        handleInputChange("emailAddress", e.target.value)
                      }
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      placeholder="Enter department"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={stock.vendor || formData.vendor}
                  onChange={(e) => handleInputChange("vendor", e.target.value)}
                  placeholder="Enter vendor"
                  disabled={!!stock.vendor}
                  className={stock.vendor ? "bg-gray-100" : ""}
                />
              </div>

              {/* Computer Name - Only for laptops and desktops */}
              {stock.assetType === "compute" &&
                (stock.assetSubtype === "laptop" ||
                  stock.assetSubtype === "desktop") && (
                  <div className="space-y-2">
                    <Label htmlFor="computerName">Computer Name</Label>
                    <Input
                      id="computerName"
                      value={formData.computerName}
                      onChange={(e) =>
                        handleInputChange("computerName", e.target.value)
                      }
                      placeholder="Enter computer name"
                    />
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deployed Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.deployedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deployedDate
                        ? format(formData.deployedDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.deployedDate}
                      onSelect={(date) =>
                        handleInputChange("deployedDate", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Warranty Expiry</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.warrantyExpiry && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.warrantyExpiry
                        ? format(formData.warrantyExpiry, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.warrantyExpiry}
                      onSelect={(date) =>
                        handleInputChange("warrantyExpiry", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specifications">Specifications</Label>
              <Textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) =>
                  handleInputChange("specifications", e.target.value)
                }
                placeholder="Enter specifications"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter description"
                rows={2}
              />
            </div>
          </div>

          {/* Type-specific fields */}
          {stock.assetType === "compute" && stock.assetSubtype === "server" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Server Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hostname">Hostname</Label>
                  <Input
                    id="hostname"
                    value={formData.hostname}
                    onChange={(e) =>
                      handleInputChange("hostname", e.target.value)
                    }
                    placeholder="Enter hostname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processor">Processor</Label>
                  <Input
                    id="processor"
                    value={formData.processor}
                    onChange={(e) =>
                      handleInputChange("processor", e.target.value)
                    }
                    placeholder="Enter processor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ramSize">RAM Size</Label>
                  <Input
                    id="ramSize"
                    value={formData.ramSize}
                    onChange={(e) =>
                      handleInputChange("ramSize", e.target.value)
                    }
                    placeholder="Enter RAM size"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storage">Storage</Label>
                  <Input
                    id="storage"
                    value={formData.storage}
                    onChange={(e) =>
                      handleInputChange("storage", e.target.value)
                    }
                    placeholder="Enter storage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatingSystem">Operating System</Label>
                  <Input
                    id="operatingSystem"
                    value={formData.operatingSystem}
                    onChange={(e) =>
                      handleInputChange("operatingSystem", e.target.value)
                    }
                    placeholder="Enter operating system"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serverRole">Server Role</Label>
                  <Input
                    id="serverRole"
                    value={formData.serverRole}
                    onChange={(e) =>
                      handleInputChange("serverRole", e.target.value)
                    }
                    placeholder="Enter server role"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-bua-red hover:bg-bua-red/90"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Allocating..." : "Save & Allocate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AllocationModal;
