import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
//import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServerFieldsProps {
  formData: {
    hostname?: string;
    serverRole?: string;
    processor?: string;
    ramSize?: string;
    storage?: string;
    operatingSystem?: string;
    productionIpAddress?: string;
    managementMacAddress?: string;
    powerSupply?: string;
    installedApplications?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const serverRoles = [
  { value: "web_server", label: "Web Server" },
  { value: "database_server", label: "Database Server" },
  { value: "file_server", label: "File Server" },
  { value: "mail_server", label: "Mail Server" },
  { value: "application_server", label: "Application Server" },
  { value: "backup_server", label: "Backup Server" },
  { value: "development_server", label: "Development Server" },
  { value: "test_server", label: "Test Server" },
  { value: "other", label: "Other" },
];

// Server Type Field Component (for side-by-side layout)
export const ServerTypeField: React.FC<{
  formData: { serverRole?: string };
  onInputChange: (field: string, value: string) => void;
}> = ({ formData, onInputChange }) => {
  return (
    <>
      <Label
        htmlFor="serverRole"
        className="text-sm font-medium text-foreground"
      >
        Server Role / Function
      </Label>
      <Select
        value={formData.serverRole || ""}
        onValueChange={(value) => onInputChange("serverRole", value)}
      >
        <SelectTrigger className="border-input focus:border-ring bg-background w-full">
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
    </>
  );
};

// Server Additional Fields Component (for conditional fields)
export const ServerAdditionalFields: React.FC<ServerFieldsProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <>
      {/* Hostname/Server Name Field */}
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
          onChange={(e) => onInputChange("hostname", e.target.value)}
          placeholder="Enter hostname"
          className="border-input focus:border-ring bg-background"
        />
      </div>
    </>
  );
};

export const ServerFields: React.FC<ServerFieldsProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <>
      {/* Hostname/Server Name Field */}
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
          onChange={(e) => onInputChange("hostname", e.target.value)}
          placeholder="Enter hostname"
          className="border-input focus:border-ring bg-background"
        />
      </div>

      {/* Server Role Field */}
      <div className="space-y-2">
        <Label
          htmlFor="serverRole"
          className="text-sm font-medium text-foreground"
        >
          Server Role / Function
        </Label>
        <Select
          value={formData.serverRole || ""}
          onValueChange={(value) => onInputChange("serverRole", value)}
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
  );
};

// Server Configuration Component
export const ServerConfiguration: React.FC<{
  formData: {
    processor?: string;
    ramSize?: string;
    storage?: string;
    operatingSystem?: string;
    productionIpAddress?: string;
    managementMacAddress?: string;
    powerSupply?: string;
    installedApplications?: string;
  };
  onInputChange: (field: string, value: string) => void;
}> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
        Server Configuration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="processor"
            className="text-sm font-medium text-foreground"
          >
            Processor *
          </Label>
          <Input
            id="processor"
            value={formData.processor || ""}
            onChange={(e) => onInputChange("processor", e.target.value)}
            placeholder="e.g., Intel Xeon E5-2620 v4"
            className="border-input focus:border-ring bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="ramSize"
            className="text-sm font-medium text-foreground"
          >
            RAM Size *
          </Label>
          <Input
            id="ramSize"
            value={formData.ramSize || ""}
            onChange={(e) => onInputChange("ramSize", e.target.value)}
            placeholder="e.g., 32GB DDR4"
            className="border-input focus:border-ring bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="storage"
            className="text-sm font-medium text-foreground"
          >
            Storage
          </Label>
          <Input
            id="storage"
            value={formData.storage || ""}
            onChange={(e) => onInputChange("storage", e.target.value)}
            placeholder="e.g., 2TB SSD RAID 1"
            className="border-input focus:border-ring bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="operatingSystem"
            className="text-sm font-medium text-foreground"
          >
            Operating System
          </Label>
          <Input
            id="operatingSystem"
            value={formData.operatingSystem || ""}
            onChange={(e) => onInputChange("operatingSystem", e.target.value)}
            placeholder="e.g., Ubuntu Server 20.04 LTS"
            className="border-input focus:border-ring bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="productionIpAddress"
            className="text-sm font-medium text-foreground"
          >
            Production IP Address
          </Label>
          <Input
            id="productionIpAddress"
            value={formData.productionIpAddress || ""}
            onChange={(e) =>
              onInputChange("productionIpAddress", e.target.value)
            }
            placeholder="e.g., 10.0.1.100"
            className="border-input focus:border-ring bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="managementMacAddress"
            className="text-sm font-medium text-foreground"
          >
            Management MAC Address
          </Label>
          <Input
            id="managementMacAddress"
            value={formData.managementMacAddress || ""}
            onChange={(e) =>
              onInputChange("managementMacAddress", e.target.value)
            }
            placeholder="e.g., 00:1A:2B:3C:4D:5F"
            className="border-input focus:border-ring bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="powerSupply"
            className="text-sm font-medium text-foreground"
          >
            Power Supply
          </Label>
          <Input
            id="powerSupply"
            value={formData.powerSupply || ""}
            onChange={(e) => onInputChange("powerSupply", e.target.value)}
            placeholder="e.g., 750W Redundant PSU"
            className="border-input focus:border-ring bg-background"
          />
        </div>
      </div>
    </div>
  );
};
