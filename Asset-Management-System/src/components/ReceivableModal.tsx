import React, { useState, useEffect } from "react";
import type { Receivable, ReceivableStatus } from "../types/inventory";
import { CalendarIcon } from "lucide-react";
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
import { format } from "date-fns";
import { cn } from "../lib/utils";

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
    Omit<Receivable, "id" | "purchaseDate"> & { purchaseDate?: Date }
  >({
    itemName: "",
    brand: "",
    description: "",
    serialNumber: "",
    supplierName: "",
    purchaseDate: undefined,
    quantity: 1,
    warranty: "",
    notes: "",
    status: "pending",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (receivable) {
      setFormData({
        itemName: receivable.itemName,
        brand: receivable.brand,
        description: receivable.description,
        serialNumber: receivable.serialNumber,
        supplierName: receivable.supplierName,
        purchaseDate: receivable.purchaseDate
          ? (() => {
              const date = new Date(receivable.purchaseDate);
              return isNaN(date.getTime()) ? undefined : date;
            })()
          : undefined,
        quantity: receivable.quantity,
        warranty: receivable.warranty,
        notes: receivable.notes,
        status: receivable.status,
        receivedDate: receivable.receivedDate,
      });
    } else {
      setFormData({
        itemName: "",
        brand: "",
        description: "",
        serialNumber: "",
        supplierName: "",
        purchaseDate: undefined,
        quantity: 1,
        warranty: "",
        notes: "",
        status: "pending",
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
    if (!formData.purchaseDate)
      newErrors.purchaseDate = "Purchase date is required";
    if (formData.quantity < 1)
      newErrors.quantity = "Quantity must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSaving(true);
      try {
        // Convert date back to string format for saving
        const dataToSave = {
          ...formData,
          purchaseDate: formData.purchaseDate
            ? formData.purchaseDate.toISOString().split("T")[0]
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
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
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

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, purchaseDate: date }));
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
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {receivable ? "Edit Receivable" : "Add New Receivable"}
          </DialogTitle>
          <DialogDescription>
            {receivable
              ? "Update the details of this receivable item."
              : "Add a new receivable item to the inventory system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="itemName"
                  className="text-sm font-medium text-gray-700"
                >
                  Item Name *
                </Label>
                <Input
                  id="itemName"
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  className={errors.itemName ? "border-red-500" : ""}
                />
                {errors.itemName && (
                  <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="brand"
                  className="text-sm font-medium text-gray-700"
                >
                  Brand *
                </Label>
                <Input
                  id="brand"
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={errors.brand ? "border-red-500" : ""}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="serialNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Serial Number *
                </Label>
                <Input
                  id="serialNumber"
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className={errors.serialNumber ? "border-red-500" : ""}
                />
                {errors.serialNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.serialNumber}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="supplierName"
                  className="text-sm font-medium text-gray-700"
                >
                  Supplier Name *
                </Label>
                <Input
                  id="supplierName"
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                  className={errors.supplierName ? "border-red-500" : ""}
                />
                {errors.supplierName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.supplierName}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Purchase Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.purchaseDate && "text-muted-foreground",
                        errors.purchaseDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.purchaseDate &&
                      !isNaN(formData.purchaseDate.getTime())
                        ? format(formData.purchaseDate, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.purchaseDate}
                      onSelect={handleDateChange}
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

              <div>
                <Label
                  htmlFor="quantity"
                  className="text-sm font-medium text-gray-700"
                >
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className={errors.quantity ? "border-red-500" : ""}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="warranty"
                  className="text-sm font-medium text-gray-700"
                >
                  Warranty
                </Label>
                <Input
                  id="warranty"
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  placeholder="e.g., 3 years"
                />
              </div>

              <div>
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700"
                >
                  Status *
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {receivableStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
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
              ) : receivable ? (
                "Update Receivable"
              ) : (
                "Add Receivable"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReceivableModal;
