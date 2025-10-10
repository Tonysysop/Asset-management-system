import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NetworkFieldsProps {
  formData: {
    networkType: string;
    firmwareVersion?: string;
    ipAddress?: string;
    macAddress?: string;
    numberOfPorts?: string;
    rackPosition?: string;
    configBackupLocation?: string;
    uplinkDownlinkInfo?: string;
    poeSupport?: string;
    stackClusterMembership?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const networkTypes = [
  { value: "router", label: "Router" },
  { value: "switch", label: "Switch" },
  { value: "access_point", label: "Access Point" },
  { value: "firewall", label: "Firewall" },
  { value: "other", label: "Other Network Device" },
];

// Network Type Field Component (for side-by-side layout)
export const NetworkTypeField: React.FC<{
  formData: { networkType: string };
  onInputChange: (field: string, value: string) => void;
}> = ({ formData, onInputChange }) => {
  return (
    <>
      <Label
        htmlFor="networkType"
        className="text-sm font-medium text-foreground"
      >
        Network Device Type *
      </Label>
      <Select
        value={formData.networkType || ""}
        onValueChange={(value) => onInputChange("networkType", value)}
      >
        <SelectTrigger className="border-input focus:border-ring bg-background w-full">
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
    </>
  );
};

export const NetworkFields: React.FC<NetworkFieldsProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <>
      {/* Network Device Type Field */}
      <div className="space-y-2">
        <Label
          htmlFor="networkType"
          className="text-sm font-medium text-foreground"
        >
          Network Device Type *
        </Label>
        <Select
          value={formData.networkType}
          onValueChange={(value) => onInputChange("networkType", value)}
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
    </>
  );
};

// Network Configuration Component
export const NetworkConfiguration: React.FC<{
  formData: {
    networkType: string;
    firmwareVersion?: string;
    ipAddress?: string;
    macAddress?: string;
    numberOfPorts?: string;
    rackPosition?: string;
    configBackupLocation?: string;
    uplinkDownlinkInfo?: string;
    poeSupport?: string;
    stackClusterMembership?: string;
  };
  onInputChange: (field: string, value: string) => void;
}> = ({ formData, onInputChange }) => {
  if (!formData.networkType) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
        {formData.networkType === "router" ? "Router" : "Switch"} Configuration
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
            value={formData.firmwareVersion || ""}
            onChange={(e) => onInputChange("firmwareVersion", e.target.value)}
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
            value={formData.ipAddress || ""}
            onChange={(e) => onInputChange("ipAddress", e.target.value)}
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
            onChange={(e) => onInputChange("macAddress", e.target.value)}
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
            value={formData.numberOfPorts || ""}
            onChange={(e) => onInputChange("numberOfPorts", e.target.value)}
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
            value={formData.rackPosition || ""}
            onChange={(e) => onInputChange("rackPosition", e.target.value)}
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
            value={formData.configBackupLocation || ""}
            onChange={(e) =>
              onInputChange("configBackupLocation", e.target.value)
            }
            placeholder="e.g., /backup/switch-configs/"
            className="border-input focus:border-ring bg-background"
          />
        </div>

        {/* Uplink/Downlink Info for non-switch devices */}
        {formData.networkType !== "switch" && (
          <div className="space-y-2">
            <Label
              htmlFor="uplinkDownlinkInfo"
              className="text-sm font-medium text-foreground"
            >
              Uplink/Downlink Info
            </Label>
            <Input
              id="uplinkDownlinkInfo"
              value={formData.uplinkDownlinkInfo || ""}
              onChange={(e) =>
                onInputChange("uplinkDownlinkInfo", e.target.value)
              }
              placeholder="e.g., Connected to Core Switch"
              className="border-input focus:border-ring bg-background"
            />
          </div>
        )}
      </div>

      {/* Switch-specific fields - All three on same row with equal width */}
      {formData.networkType === "switch" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="uplinkDownlinkInfo"
              className="text-sm font-medium text-foreground"
            >
              Uplink/Downlink Info
            </Label>
            <Input
              id="uplinkDownlinkInfo"
              value={formData.uplinkDownlinkInfo || ""}
              onChange={(e) =>
                onInputChange("uplinkDownlinkInfo", e.target.value)
              }
              placeholder="e.g., Connected to Core Switch"
              className="border-input focus:border-ring bg-background w-full"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="poeSupport"
              className="text-sm font-medium text-foreground"
            >
              PoE Support
            </Label>
            <Select
              value={formData.poeSupport || ""}
              onValueChange={(value) => onInputChange("poeSupport", value)}
            >
              <SelectTrigger className="border-input focus:border-ring bg-background w-full">
                <SelectValue placeholder="Select PoE support" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none" className="hover:bg-accent">
                  None
                </SelectItem>
                <SelectItem value="poe" className="hover:bg-accent">
                  PoE
                </SelectItem>
                <SelectItem value="poe+" className="hover:bg-accent">
                  PoE+
                </SelectItem>
                <SelectItem value="poe++" className="hover:bg-accent">
                  PoE++
                </SelectItem>
              </SelectContent>
            </Select>
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
                onInputChange("stackClusterMembership", e.target.value)
              }
              placeholder="e.g., Stack Member 1"
              className="border-input focus:border-ring bg-background w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
