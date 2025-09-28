import React, { useState, useEffect } from "react";
import type {
  Receivable,
  AssetType,
  ReceivableStatus,
} from "../types/inventory";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

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
  const [formData, setFormData] = useState<Omit<Receivable, "id">>({
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
        await onSave(formData);
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

  const assetTypes: AssetType[] = [
    "laptop",
    "desktop",
    "printer",
    "server",
    "router",
    "switch",
    "mobile",
    "scanner",
    "monitor",
  ];
  const receivableStatuses: ReceivableStatus[] = [
    "pending",
    "received",
    "deployed",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {receivable ? "Edit Receivable" : "Add New Receivable"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.itemName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.itemName && (
                <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {assetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.brand ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.brand && (
                <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.serialNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.serialNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.serialNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colour
              </label>
              <input
                type="text"
                name="colour"
                value={formData.colour}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.supplierName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.supplierName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.supplierName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.purchaseDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.purchaseDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.purchaseDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.quantity ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty
              </label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                placeholder="e.g., 3 years"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {receivableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
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
