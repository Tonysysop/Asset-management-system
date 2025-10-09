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

interface ComputeFieldsProps {
  formData: {
    computeType: string;
    imeiNumber?: string;
    computerName?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const computeTypes = [
  { value: "laptop", label: "Laptop" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile Device" },
  { value: "tablet", label: "Tablet" },
  { value: "server", label: "Server" },
];

// Compute Type Field Component (for side-by-side layout)
export const ComputeTypeField: React.FC<{
  formData: { computeType: string };
  onInputChange: (field: string, value: string) => void;
}> = ({ formData, onInputChange }) => {
  return (
    <>
      <Label
        htmlFor="computeType"
        className="text-sm font-medium text-foreground"
      >
        Compute Type *
      </Label>
      <Select
        value={formData.computeType || ""}
        onValueChange={(value) => onInputChange("computeType", value)}
      >
        <SelectTrigger className="border-input focus:border-ring bg-background w-full">
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
    </>
  );
};

// Additional Compute Fields Component (for conditional fields)
export const ComputeAdditionalFields: React.FC<ComputeFieldsProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <>
      {/* Mobile-specific IMEI Field */}
      {formData.computeType === "mobile" && (
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
            onChange={(e) => onInputChange("imeiNumber", e.target.value)}
            placeholder="Enter IMEI number"
            className="border-input focus:border-ring bg-background"
          />
        </div>
      )}

      {/* Laptop/Desktop-specific Computer Name Field */}
      {(formData.computeType === "laptop" ||
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
            onChange={(e) => onInputChange("computerName", e.target.value)}
            placeholder="Enter computer name"
            className="border-input focus:border-ring bg-background"
          />
        </div>
      )}
    </>
  );
};

export const ComputeFields: React.FC<ComputeFieldsProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <>
      {/* Compute Type Field */}
      <div className="space-y-2">
        <Label
          htmlFor="computeType"
          className="text-sm font-medium text-foreground"
        >
          Compute Type *
        </Label>
        <Select
          value={formData.computeType}
          onValueChange={(value) => onInputChange("computeType", value)}
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

      {/* Mobile-specific IMEI Field */}
      {formData.computeType === "mobile" && (
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
            onChange={(e) => onInputChange("imeiNumber", e.target.value)}
            placeholder="Enter IMEI number"
            className="border-input focus:border-ring bg-background"
          />
        </div>
      )}

      {/* Laptop/Desktop-specific Computer Name Field */}
      {(formData.computeType === "laptop" ||
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
            onChange={(e) => onInputChange("computerName", e.target.value)}
            placeholder="Enter computer name"
            className="border-input focus:border-ring bg-background"
          />
        </div>
      )}
    </>
  );
};
