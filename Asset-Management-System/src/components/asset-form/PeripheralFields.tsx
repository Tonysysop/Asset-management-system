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

interface PeripheralFieldsProps {
  formData: {
    peripheralType: string;
    itemName?: string;
    screenSize?: string;
    resolution?: string;
    connectionType?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const peripheralTypes = [
  { value: "monitor", label: "Monitor" },
  { value: "printer", label: "Printer" },
  { value: "keyboard", label: "Keyboard" },
  { value: "mouse", label: "Mouse" },
  { value: "headset", label: "Headset" },
  { value: "webcam", label: "Webcam" },
  { value: "speaker", label: "Speaker" },
  { value: "other", label: "Other" },
];

const connectionTypes = [
  { value: "hdmi", label: "HDMI" },
  { value: "displayport", label: "DisplayPort" },
  { value: "vga", label: "VGA" },
  { value: "dvi", label: "DVI" },
  { value: "usb-c", label: "USB-C" },
];

// Peripheral Type Field Component (for side-by-side layout)
export const PeripheralTypeField: React.FC<{
  formData: { peripheralType: string };
  onInputChange: (field: string, value: string) => void;
}> = ({ formData, onInputChange }) => {
  return (
    <>
      <Label
        htmlFor="peripheralType"
        className="text-sm font-medium text-foreground"
      >
        Peripheral Type *
      </Label>
      <Select
        value={
          formData.peripheralType === "" ? undefined : formData.peripheralType
        }
        onValueChange={(value) => onInputChange("peripheralType", value)}
      >
        <SelectTrigger className="border-input focus:border-ring bg-background w-full">
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
    </>
  );
};

// Additional Peripheral Fields Component (for conditional fields)
export const PeripheralAdditionalFields: React.FC<PeripheralFieldsProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <>
      {/* Item Name Field for non-monitor peripherals */}
      {formData.peripheralType && formData.peripheralType !== "monitor" && (
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
            onChange={(e) => onInputChange("itemName", e.target.value)}
            placeholder="Enter item name"
            className="border-input focus:border-ring bg-background"
          />
        </div>
      )}
    </>
  );
};

export const PeripheralFields: React.FC<PeripheralFieldsProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <>
      {/* Peripheral Type Field */}
      <div className="space-y-2">
        <Label
          htmlFor="peripheralType"
          className="text-sm font-medium text-foreground"
        >
          Peripheral Type *
        </Label>
        <Select
          value={formData.peripheralType}
          onValueChange={(value) => onInputChange("peripheralType", value)}
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

      {/* Item Name Field for non-monitor peripherals */}
      {formData.peripheralType && formData.peripheralType !== "monitor" && (
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
            onChange={(e) => onInputChange("itemName", e.target.value)}
            placeholder="Enter item name"
            className="border-input focus:border-ring bg-background"
          />
        </div>
      )}
    </>
  );
};

// Monitor Specifications Component
export const MonitorSpecifications: React.FC<{
  formData: {
    screenSize?: string;
    resolution?: string;
    connectionType?: string;
  };
  onInputChange: (field: string, value: string) => void;
}> = ({ formData, onInputChange }) => {
  return (
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
            onChange={(e) => onInputChange("screenSize", e.target.value)}
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
            onChange={(e) => onInputChange("resolution", e.target.value)}
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
            value={formData.connectionType || ""}
            onValueChange={(value) => onInputChange("connectionType", value)}
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
  );
};
