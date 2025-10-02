import React, { useState, useEffect } from "react";
import type { License, LicenseType } from "../types/inventory";
import { CalendarIcon, Key, Save, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { cn } from "../lib/utils";

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (license: Omit<License, "id">) => Promise<void>;
  license?: License;
}

const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  license,
}) => {
  const [formData, setFormData] = useState<
    Omit<License, "id" | "purchaseDate" | "expiryDate" | "status"> & {
      purchaseDate?: Date;
      expiryDate?: Date;
    }
  >({
    licenseName: "",
    vendor: "",
    licenseKey: "",
    licenseType: "one-off",
    seats: 1,
    purchaseDate: undefined,
    expiryDate: undefined,
    assignedUser: "",
    department: "",
    notes: "",
    assignedUsers: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (license) {
      setFormData({
        licenseName: license.licenseName,
        vendor: license.vendor,
        licenseKey: license.licenseKey,
        licenseType: license.licenseType || "one-off",
        seats: license.seats,
        purchaseDate: license.purchaseDate
          ? (() => {
              const date = new Date(license.purchaseDate);
              return isNaN(date.getTime()) ? undefined : date;
            })()
          : undefined,
        expiryDate: license.expiryDate
          ? (() => {
              const date = new Date(license.expiryDate);
              return isNaN(date.getTime()) ? undefined : date;
            })()
          : undefined,
        assignedUser: license.assignedUser,
        department: license.department,
        notes: license.notes,
        assignedUsers: license.assignedUsers || [],
      });
    } else {
      setFormData({
        licenseName: "",
        vendor: "",
        licenseKey: "",
        licenseType: "one-off",
        seats: 1,
        purchaseDate: undefined,
        expiryDate: undefined,
        assignedUser: "",
        department: "",
        notes: "",
        assignedUsers: [],
      });
    }
    setErrors({});
  }, [license, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.licenseName.trim())
      newErrors.licenseName = "License name is required";
    if (!formData.vendor.trim()) newErrors.vendor = "Vendor is required";
    if (!formData.licenseKey.trim())
      newErrors.licenseKey = "License key is required";
    if (!formData.purchaseDate)
      newErrors.purchaseDate = "Purchase date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (formData.seats < 1) newErrors.seats = "Seats must be at least 1";

    // Validation based on license type
    if (formData.licenseType === "one-off") {
      if (!formData.assignedUser.trim())
        newErrors.assignedUser =
          "Assigned user is required for one-off licenses";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSaving(true);
      try {
        // Convert dates back to string format for saving
        const dataToSave = {
          ...formData,
          purchaseDate: formData.purchaseDate
            ? formData.purchaseDate.toISOString().split("T")[0]
            : "",
          expiryDate: formData.expiryDate
            ? formData.expiryDate.toISOString().split("T")[0]
            : "",
        };
        await onSave(dataToSave);
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "seats" ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (
    field: "purchaseDate" | "expiryDate",
    date: Date | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const licenseTypes: LicenseType[] = ["one-off", "volume"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[calc(100%-2rem)] max-h-[85vh] bg-card border-border shadow-lg flex flex-col p-0">
        <DialogHeader className="px-6 pt-4 pb-3">
          <DialogTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Key className="w-5 h-5" />
            {license ? "Edit License" : "Add New License"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {license
              ? "Update the details of this software license."
              : "Add a new software license to the inventory system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pb-3 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="licenseName"
                  className="text-sm font-medium text-foreground"
                >
                  License Name *
                </Label>
                <Input
                  id="licenseName"
                  type="text"
                  name="licenseName"
                  value={formData.licenseName}
                  onChange={handleChange}
                  className={`border-input focus:ring-1 focus:ring-ring bg-background ${
                    errors.licenseName ? "border-red-500" : ""
                  }`}
                  placeholder="Enter license name"
                />
                {errors.licenseName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.licenseName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="vendor"
                  className="text-sm font-medium text-foreground"
                >
                  Vendor *
                </Label>
                <Input
                  id="vendor"
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  className={`border-input focus:ring-1 focus:ring-ring bg-background ${
                    errors.vendor ? "border-red-500" : ""
                  }`}
                  placeholder="Enter vendor"
                />
                {errors.vendor && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">
                  License Type *
                </Label>
                <Select
                  value={formData.licenseType}
                  onValueChange={(value) =>
                    handleSelectChange("licenseType", value)
                  }
                >
                  <SelectTrigger className="border-input focus:border-ring bg-background">
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {licenseTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="hover:bg-accent"
                      >
                        {type === "one-off"
                          ? "One-Off License"
                          : "Volume License"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="seats"
                  className="text-sm font-medium text-foreground"
                >
                  Number of Seats *
                </Label>
                <Input
                  id="seats"
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                  min="1"
                  className={`border-input focus:ring-1 focus:ring-ring bg-background ${
                    errors.seats ? "border-red-500" : ""
                  }`}
                />
                {errors.seats && (
                  <p className="text-red-500 text-xs mt-1">{errors.seats}</p>
                )}
              </div>
            </div>

            {/* License Key - Full Width */}
            <div className="space-y-1">
              <Label
                htmlFor="licenseKey"
                className="text-sm font-medium text-foreground"
              >
                License Key / Activation Code *
              </Label>
              <Input
                id="licenseKey"
                type="text"
                name="licenseKey"
                value={formData.licenseKey}
                onChange={handleChange}
                className={`border-input focus:ring-1 focus:ring-ring bg-background ${
                  errors.licenseKey ? "border-red-500" : ""
                }`}
                placeholder="Enter license key or activation code"
              />
              {errors.licenseKey && (
                <p className="text-red-500 text-xs mt-1">{errors.licenseKey}</p>
              )}
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">
                  Purchase Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-input hover:bg-accent/50",
                        !formData.purchaseDate && "text-muted-foreground",
                        errors.purchaseDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.purchaseDate &&
                      !isNaN(formData.purchaseDate.getTime())
                        ? format(formData.purchaseDate, "PPP")
                        : "Select purchase date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover border-border"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={formData.purchaseDate}
                      onSelect={(date) =>
                        handleDateChange("purchaseDate", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.purchaseDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.purchaseDate}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">
                  Expiry Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-input hover:bg-accent/50",
                        !formData.expiryDate && "text-muted-foreground",
                        errors.expiryDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate &&
                      !isNaN(formData.expiryDate.getTime())
                        ? format(formData.expiryDate, "PPP")
                        : "Select expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover border-border"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) => handleDateChange("expiryDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.expiryDate}
                  </p>
                )}
              </div>
            </div>

            {/* Assignment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.licenseType === "one-off" && (
                <div className="space-y-1">
                  <Label
                    htmlFor="assignedUser"
                    className="text-sm font-medium text-foreground"
                  >
                    Assigned User *
                  </Label>
                  <Input
                    id="assignedUser"
                    type="text"
                    name="assignedUser"
                    value={formData.assignedUser}
                    onChange={handleChange}
                    className={`border-input focus:ring-1 focus:ring-ring bg-background ${
                      errors.assignedUser ? "border-red-500" : ""
                    }`}
                    placeholder="Enter assigned user"
                  />
                  {errors.assignedUser && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.assignedUser}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <Label
                  htmlFor="department"
                  className="text-sm font-medium text-foreground"
                >
                  Department *
                </Label>
                <Input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`border-input focus:ring-1 focus:ring-ring bg-background ${
                    errors.department ? "border-red-500" : ""
                  }`}
                  placeholder="Enter department"
                />
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.department}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-sm font-medium text-foreground"
              >
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="border-input focus:ring-1 focus:ring-ring bg-background"
                placeholder="Enter additional notes (optional)"
              />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-3 px-6 py-3 border-t border-border bg-card">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="border-border hover:bg-accent/50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving
                ? "Saving..."
                : license
                ? "Update License"
                : "Add License"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseModal;
