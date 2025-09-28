import React, { useState, useEffect } from "react";
import type {
  Receivable,
  AssetType,
  ReceivableStatus,
  LicenseUser,
} from "../types/inventory";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import ReceivableUserManager from "./ReceivableUserManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (receivable: Omit<Receivable, "id">) => Promise<void>;
  receivable?: Receivable;
}

const ReceivableModal: React.FC<ReceivableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  receivable,
}) => {
  const [formData, setFormData] = useState<
    Omit<Receivable, "id"> & {
      purchaseDateObj: Date | undefined;
    }
  >({
    itemName: "",
    category: "laptop", // Default value for backend compatibility
    brand: "",
    description: "",
    serialNumber: "",
    colour: "",
    supplierName: "",
    purchaseDate: "",
    purchaseDateObj: undefined,
    quantity: 1,
    warranty: "",
    notes: "",
    status: "pending",
    assignedUsers: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (receivable) {
      setFormData({
        itemName: receivable.itemName,
        category: receivable.category,
        brand: receivable.brand,
        description: receivable.description,
        serialNumber: receivable.serialNumber,
        colour: receivable.colour,
        supplierName: receivable.supplierName,
        purchaseDate: receivable.purchaseDate,
        quantity: receivable.quantity,
        warranty: receivable.warranty,
        notes: receivable.notes,
        status: receivable.status,
        receivedDate: receivable.receivedDate,
        assignedUsers: receivable.assignedUsers || [],
        purchaseDateObj: receivable.purchaseDate
          ? (() => {
              const date = new Date(receivable.purchaseDate);
              return isNaN(date.getTime()) ? undefined : date;
            })()
          : undefined,
      });
    } else {
      setFormData({
        itemName: "",
        category: "laptop",
        brand: "",
        description: "",
        serialNumber: "",
        colour: "",
        supplierName: "",
        purchaseDate: "",
        quantity: 1,
        warranty: "",
        notes: "",
        status: "pending",
        assignedUsers: [],
        purchaseDateObj: undefined,
      });
    }
    setErrors({});
  }, [receivable, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) newErrors.itemName = "Item name is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.serialNumber.trim())
      newErrors.serialNumber = "Serial number is required";
    if (!formData.supplierName.trim())
      newErrors.supplierName = "Supplier name is required";
    if (!formData.purchaseDateObj)
      newErrors.purchaseDate = "Purchase date is required";
    if (formData.quantity < 1)
      newErrors.quantity = "Quantity must be at least 1";

    // Validate assigned users don't exceed quantity
    if (
      formData.assignedUsers &&
      formData.assignedUsers.length > formData.quantity
    ) {
      newErrors.assignedUsers = `Cannot assign more users than available quantity (${formData.quantity})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSaving(true);
      try {
        // Convert date object back to string for saving
        const { purchaseDateObj, ...saveData } = formData;
        const receivableData = {
          ...saveData,
          purchaseDate: purchaseDateObj?.toISOString().split("T")[0] || "",
        };
        await onSave(receivableData);
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
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAssignedUsersChange = (users: LicenseUser[]) => {
    setFormData((prev) => ({ ...prev, assignedUsers: users }));
    if (errors.assignedUsers) {
      setErrors((prev) => ({ ...prev, assignedUsers: "" }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, purchaseDateObj: date }));
    if (errors.purchaseDate) {
      setErrors((prev) => ({ ...prev, purchaseDate: "" }));
    }
  };

  const receivableStatuses: ReceivableStatus[] = [
    "pending",
    "received",
    "deployed",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-w-[calc(100%-2rem)] max-h-[90vh] bg-card border-border shadow-lg flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold text-card-foreground">
            {receivable ? "Edit Receivable" : "Add New Receivable"}
          </DialogTitle>
          <DialogDescription>
            {receivable
              ? "Modify the receivable information below."
              : "Fill in the details to add a new receivable to the inventory."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="itemName"
                    className="text-sm font-medium text-foreground"
                  >
                    Item Name *
                  </Label>
                  <Input
                    id="itemName"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Enter item name"
                    className={`border-input focus:border-ring bg-background ${
                      errors.itemName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.itemName && (
                    <p className="text-red-500 text-xs">{errors.itemName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="brand"
                    className="text-sm font-medium text-foreground"
                  >
                    Brand *
                  </Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter brand"
                    className={`border-input focus:border-ring bg-background ${
                      errors.brand ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.brand && (
                    <p className="text-red-500 text-xs">{errors.brand}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="serialNumber"
                    className="text-sm font-medium text-foreground"
                  >
                    Serial Number *
                  </Label>
                  <Input
                    id="serialNumber"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    className={`border-input focus:border-ring bg-background ${
                      errors.serialNumber ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.serialNumber && (
                    <p className="text-red-500 text-xs">
                      {errors.serialNumber}
                    </p>
                  )}
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
                      setFormData((prev) => ({
                        ...prev,
                        status: value as ReceivableStatus,
                      }))
                    }
                  >
                    <SelectTrigger className="border-input focus:border-ring bg-background">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {receivableStatuses.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="hover:bg-accent"
                        >
                          {status.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="supplierName"
                    className="text-sm font-medium text-foreground"
                  >
                    Supplier Name *
                  </Label>
                  <Input
                    id="supplierName"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    placeholder="Enter supplier name"
                    className={`border-input focus:border-ring bg-background ${
                      errors.supplierName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.supplierName && (
                    <p className="text-red-500 text-xs">
                      {errors.supplierName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Purchase Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-input hover:bg-accent/50",
                          !formData.purchaseDateObj && "text-muted-foreground",
                          errors.purchaseDate && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.purchaseDateObj &&
                        !isNaN(formData.purchaseDateObj.getTime())
                          ? format(formData.purchaseDateObj, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-popover border-border"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={formData.purchaseDateObj}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.purchaseDate && (
                    <p className="text-red-500 text-xs">
                      {errors.purchaseDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="quantity"
                    className="text-sm font-medium text-foreground"
                  >
                    Quantity *
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    className={`border-input focus:border-ring bg-background ${
                      errors.quantity ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs">{errors.quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="warranty"
                    className="text-sm font-medium text-foreground"
                  >
                    Warranty
                  </Label>
                  <Input
                    id="warranty"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    placeholder="e.g., 3 years"
                    className="border-input focus:border-ring bg-background"
                  />
                </div>
              </div>

              {/* Description and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-foreground"
                  >
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    className={`border-input focus:border-ring bg-background ${
                      errors.description ? "border-red-500" : ""
                    }`}
                    rows={3}
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                  )}
                </div>

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
                    placeholder="Enter additional notes"
                    className="border-input focus:border-ring bg-background"
                    rows={3}
                  />
                </div>
              </div>

              {/* User Assignment Section */}
              <div>
                <ReceivableUserManager
                  assignedUsers={formData.assignedUsers || []}
                  onUsersChange={handleAssignedUsersChange}
                  maxQuantity={formData.quantity}
                />
                {errors.assignedUsers && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.assignedUsers}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Form Actions - Fixed Footer */}
        <div className="flex items-center justify-end space-x-4 px-6 py-4 border-t border-border bg-card">
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
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 shadow-lg transition-all duration-200"
          >
            {isSaving ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {receivable ? "Update Receivable" : "Add Receivable"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceivableModal;
