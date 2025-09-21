import React, { useState, useEffect } from "react";
import type { Asset, AssetType, AssetStatus } from "@/types/inventory";
import { Calendar, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, "id">) => Promise<void>;
  asset?: Asset;
}

const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  asset,
}) => {
  const [formData, setFormData] = useState<Omit<Asset, "id">>({
    assetTag: "",
    serialNumber: "",
    type: "compute",
    brand: "",
    model: "",
    specifications: "",
    deployedDate: "",
    warrantyExpiry: "",
    vendor: "",
    assignedUser: "",
    department: "",
    status: "spare",
    location: "",
    notes: "",
    description: "",
    peripheralType: "printer",
    itemName: "",
    computeType: "laptop",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setFormData({
        assetTag: asset.assetTag,
        serialNumber: asset.serialNumber,
        type: asset.type,
        brand: asset.brand,
        model: asset.model,
        specifications: asset.specifications,
        deployedDate: asset.deployedDate,
        warrantyExpiry: asset.warrantyExpiry,
        vendor: asset.vendor,
        assignedUser: asset.assignedUser,
        department: asset.department,
        status: asset.status,
        location: asset.location,
        notes: asset.notes,
        description: asset.description || "",
        peripheralType: asset.peripheralType || "printer",
        itemName: asset.itemName || "",
        computeType: asset.computeType || "laptop",
      });
    } else {
      setFormData({
        assetTag: "",
        serialNumber: "",
        type: "compute",
        brand: "",
        model: "",
        specifications: "",
        deployedDate: "",
        warrantyExpiry: "",
        vendor: "",
        assignedUser: "",
        department: "",
        status: "spare",
        location: "",
        notes: "",
        description: "",
        peripheralType: "printer",
        itemName: "",
        computeType: "laptop",
      });
    }
    setErrors({});
    setServerError(null);
  }, [asset, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assetTag.trim()) newErrors.assetTag = "Asset tag is required";
    if (!formData.serialNumber.trim())
      newErrors.serialNumber = "Serial number is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (formData.type === "compute") {
      if (!formData.deployedDate)
        newErrors.deployedDate = "Deployed date is required";
      if (!formData.warrantyExpiry)
        newErrors.warrantyExpiry = "Warranty expiry is required";
      if (!formData.vendor.trim()) newErrors.vendor = "Vendor is required";
    } else if (formData.type === "peripheral") {
      if (!formData.itemName.trim()) newErrors.itemName = "Item name is required";
    }
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

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
      } catch (error: unknown) {
        setServerError((error as Error).message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError(null);
  };

  const assetTypes: AssetType[] = [
    "compute",
    "server",
    "router",
    "switch",
    "peripheral",
  ];
  const assetStatuses: AssetStatus[] = ["in-use", "spare", "repair", "retired"];
  const peripheralTypes = ["printer", "scanner"];
  const computeTypes = ["laptop", "desktop", "mobile"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-lg w-full p-8">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <div className="flex">
                <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4" /></div>
                <div>
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{serverError}</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto p-1">
            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Tag *</Label>
              <Input
                id="assetTag"
                name="assetTag"
                value={formData.assetTag}
                onChange={handleChange}
                className={errors.assetTag ? "border-red-500" : ""}
              />
              {errors.assetTag && (
                <p className="text-red-500 text-xs mt-1">{errors.assetTag}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
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

            <div className="space-y-2">
              <Label htmlFor="type">Asset Type *</Label>
              <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "peripheral" && (
              <div className="space-y-2">
                <Label htmlFor="peripheralType">Peripheral Type *</Label>
                <Select name="peripheralType" value={formData.peripheralType} onValueChange={(value) => handleSelectChange("peripheralType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a peripheral type" />
                  </SelectTrigger>
                  <SelectContent>
                    {peripheralTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === "compute" && (
              <div className="space-y-2">
                <Label htmlFor="computeType">Compute Type *</Label>
                <Select name="computeType" value={formData.computeType} onValueChange={(value) => handleSelectChange("computeType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a compute type" />
                  </SelectTrigger>
                  <SelectContent>
                    {computeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {assetStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("-", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand / Manufacturer *</Label>
              <Input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={errors.brand ? "border-red-500" : ""}
              />
              {errors.brand && (
                <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={errors.model ? "border-red-500" : ""}
              />
              {errors.model && (
                <p className="text-red-500 text-xs mt-1">{errors.model}</p>
              )}
            </div>

            {formData.type === "compute" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="deployedDate">Deployed Date *</Label>
                  <div className="relative">
                    <Input
                      id="deployedDate"
                      type="date"
                      name="deployedDate"
                      value={formData.deployedDate}
                      onChange={handleChange}
                      className={errors.deployedDate ? "border-red-500" : ""}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.deployedDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.deployedDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiry">Warranty Expiry *</Label>
                  <div className="relative">
                    <Input
                      id="warrantyExpiry"
                      type="date"
                      name="warrantyExpiry"
                      value={formData.warrantyExpiry}
                      onChange={handleChange}
                      className={errors.warrantyExpiry ? "border-red-500" : ""}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.warrantyExpiry && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.warrantyExpiry}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    className={errors.vendor ? "border-red-500" : ""}
                  />
                  {errors.vendor && (
                    <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="assignedUser">Assigned User</Label>
              <Input
                id="assignedUser"
                name="assignedUser"
                value={formData.assignedUser}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={errors.department ? "border-red-500" : ""}
              />
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {formData.type === "peripheral" && (
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  className={errors.itemName ? "border-red-500" : ""}
                />
                {errors.itemName && (
                  <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
                )}
              </div>
            )}

            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="specifications">Specifications</Label>
              <Textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
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
              ) : asset ? (
                "Update Asset"
              ) : (
                "Add Asset"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetModal;
