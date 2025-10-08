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

interface AccessPointFieldsProps {
  formData: {
    macAddress?: string;
    specificPhysicalLocation?: string;
    ipAddress?: string;
    ipAssignment?: string;
    managementMethod?: string;
    controllerName?: string;
    controllerAddress?: string;
    powerSource?: string;
    connectedSwitchName?: string;
    connectedSwitchPort?: string;
    firmwareVersion?: string;
    ssidsBroadcasted?: string;
    frequencyBands?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const ipAssignmentOptions = [
  { value: "static", label: "Static" },
  { value: "dhcp", label: "DHCP" },
];

const managementMethodOptions = [
  { value: "standalone", label: "Standalone" },
  { value: "controller", label: "Controller" },
  { value: "cloud", label: "Cloud" },
];

const powerSourceOptions = [
  { value: "poe", label: "PoE (Power over Ethernet)" },
  { value: "dc_adapter", label: "DC Power Adapter" },
];

const frequencyBandOptions = [
  { value: "2.4ghz", label: "2.4 GHz" },
  { value: "5ghz", label: "5 GHz" },
  { value: "6ghz", label: "6 GHz" },
  { value: "2.4ghz_5ghz", label: "2.4 GHz + 5 GHz" },
  { value: "2.4ghz_6ghz", label: "2.4 GHz + 6 GHz" },
  { value: "5ghz_6ghz", label: "5 GHz + 6 GHz" },
  { value: "all_bands", label: "All Bands (2.4 + 5 + 6 GHz)" },
];

export const AccessPointFields: React.FC<AccessPointFieldsProps> = ({
  formData,
  onInputChange,
}) => {
  console.log("AccessPointFields: Received formData:", formData);
  return (
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
            value={formData.macAddress || ""}
            onChange={(e) => onInputChange("macAddress", e.target.value)}
            placeholder="e.g., 00:1A:2B:3C:4D:5E"
            className="border-input focus:border-ring bg-background"
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
            value={formData.specificPhysicalLocation || ""}
            onChange={(e) =>
              onInputChange("specificPhysicalLocation", e.target.value)
            }
            placeholder="e.g., Ceiling, NE corner, Room 301, Block B"
            className="border-input focus:border-ring bg-background w-full"
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
            onValueChange={(value) => onInputChange("frequencyBands", value)}
          >
            <SelectTrigger className="border-input focus:border-ring bg-background w-full">
              <SelectValue placeholder="Select frequency bands" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {frequencyBandOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="hover:bg-accent"
                >
                  {option.label}
                </SelectItem>
              ))}
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
          {/* Equal width columns with consistent spacing */}
          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="ipAddress"
              className="text-sm font-medium text-foreground"
            >
              IP Address *
            </Label>
            <Input
              id="ipAddress"
              value={formData.ipAddress || ""}
              onChange={(e) => onInputChange("ipAddress", e.target.value)}
              placeholder="e.g., 192.168.1.100"
              className="border-input focus:border-ring bg-background w-full"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="managementMethod"
              className="text-sm font-medium text-foreground"
            >
              Management Method *
            </Label>
            <Select
              value={formData.managementMethod || ""}
              onValueChange={(value) =>
                onInputChange("managementMethod", value)
              }
            >
              <SelectTrigger className="border-input focus:border-ring bg-background w-full">
                <SelectValue placeholder="Select management method" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {managementMethodOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="hover:bg-accent"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="ipAssignment"
              className="text-sm font-medium text-foreground"
            >
              IP Assignment *
            </Label>
            <Select
              value={formData.ipAssignment || ""}
              onValueChange={(value) => onInputChange("ipAssignment", value)}
            >
              <SelectTrigger className="border-input focus:border-ring bg-background w-full">
                <SelectValue placeholder="Select IP assignment method" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {ipAssignmentOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="hover:bg-accent"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="powerSource"
              className="text-sm font-medium text-foreground"
            >
              Power Source *
            </Label>
            <Select
              value={formData.powerSource || ""}
              onValueChange={(value) => onInputChange("powerSource", value)}
            >
              <SelectTrigger className="border-input focus:border-ring bg-background w-full">
                <SelectValue placeholder="Select power source" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {powerSourceOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="hover:bg-accent"
                  >
                    {option.label}
                  </SelectItem>
                ))}
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
                value={formData.controllerName || ""}
                onChange={(e) =>
                  onInputChange("controllerName", e.target.value)
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
                value={formData.controllerAddress || ""}
                onChange={(e) =>
                  onInputChange("controllerAddress", e.target.value)
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
                value={formData.connectedSwitchName || ""}
                onChange={(e) =>
                  onInputChange("connectedSwitchName", e.target.value)
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
                value={formData.connectedSwitchPort || ""}
                onChange={(e) =>
                  onInputChange("connectedSwitchPort", e.target.value)
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
              value={formData.firmwareVersion || ""}
              onChange={(e) => onInputChange("firmwareVersion", e.target.value)}
              placeholder="e.g., 15.3(3)JF7"
              className="border-input focus:border-ring bg-background"
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
              value={formData.ssidsBroadcasted || ""}
              onChange={(e) =>
                onInputChange("ssidsBroadcasted", e.target.value)
              }
              placeholder="e.g., Corporate-WiFi, Guest-Network, IoT-Devices"
              className="border-input focus:border-ring bg-background"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
