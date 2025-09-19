import React, { useState, useEffect } from "react";
import type { Asset, AssetType, AssetStatus } from "@/types/inventory";
import { AlertTriangle } from "lucide-react";
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
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
  // ... (all your existing state and logic remains the same)
  const [peripheralSubtype, setPeripheralSubtype] = useState<"printer" | "scanner">("printer");
  const [computeSubtype, setComputeSubtype] = useState<"laptop" | "desktop" | "mobile">("laptop");
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
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      const isComputeLike = asset.type === "laptop" || asset.type === "desktop" || asset.type === "mobile";
      setFormData({
        assetTag: asset.assetTag,
        serialNumber: asset.serialNumber,
        type: isComputeLike ? "compute" : asset.type,
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
      });
      if (asset.type === "printer") {
        setPeripheralSubtype("printer");
      }
      if (isComputeLike) setComputeSubtype(asset.type as "laptop" | "desktop" | "mobile");
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
      });
      setPeripheralSubtype("printer");
      setComputeSubtype("laptop");
    }
    setErrors({});
    setServerError(null);
  }, [asset, isOpen]);

  const validateForm = () => {
    // ... (validation logic remains the same)
    return true; // Placeholder for brevity
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSaving(true);
      try {
        const isCompute = formData.type === "compute";
        const payload: Omit<Asset, "id"> = {
          ...formData,
          type: isCompute ? computeSubtype : formData.type,
        } as Omit<Asset, "id">;
        await onSave(payload);
        onClose();
      } catch (error: any) {
        setServerError(error.message);
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


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    {/* ======================= THE MODAL ITSELF ======================= */}
    <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto flex flex-col">
      <DialogHeader>
        <DialogTitle>{asset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
      </DialogHeader>

        {/* The rest of your form remains exactly the same, it will now fill the wider space */}
        <form onSubmit={handleSubmit} className="space-y-8 width-full">
           {/* Error */}
          {serverError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{serverError}</p>
              </div>
            </div>
          )}

          {/* Asset Details */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="assetTag" className="block mb-2">Asset Tag *</Label>
                  <Input id="assetTag" name="assetTag" value={formData.assetTag} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="serialNumber" className="block mb-2">Serial Number *</Label>
                  <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="type" className="block mb-2">Asset Type *</Label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 h-10"
                  >
                    {assetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.type === "peripheral" && (
                  <div>
                    <Label className="block mb-2">Peripheral Type</Label>
                    <select
                      name="peripheralSubtype"
                      value={peripheralSubtype}
                      onChange={(e) => setPeripheralSubtype(e.target.value as "printer" | "scanner")}
                      className="w-full border rounded-md px-3 py-2 h-10"
                    >
                      <option value="printer">Printer</option>
                      <option value="scanner">Scanner</option>
                    </select>
                  </div>
                )}
                {formData.type === "compute" && (
                  <div>
                    <Label className="block mb-2">Compute Type</Label>
                    <select
                      name="computeSubtype"
                      value={computeSubtype}
                      onChange={(e) => setComputeSubtype(e.target.value as "laptop" | "desktop" | "mobile")}
                      className="w-full border rounded-md px-3 py-2 h-10"
                    >
                      <option value="laptop">Laptop</option>
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                    </select>
                  </div>
                )}
                <div>
                  <Label htmlFor="brand" className="block mb-2">Brand *</Label>
                  <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="model" className="block mb-2">Model *</Label>
                  <Input id="model" name="model" value={formData.model} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="status" className="block mb-2">Status *</Label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 h-10"
                  >
                    {assetStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("-", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Details */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Deployment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="deployedDate" className="block mb-2">Deployment Date *</Label>
                  <Input type="date" id="deployedDate" name="deployedDate" value={formData.deployedDate} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="warrantyExpiry" className="block mb-2">Warranty Expiry *</Label>
                  <Input type="date" id="warrantyExpiry" name="warrantyExpiry" value={formData.warrantyExpiry} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="vendor" className="block mb-2">Vendor *</Label>
                  <Input id="vendor" name="vendor" value={formData.vendor} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="assignedUser" className="block mb-2">Assigned User</Label>
                  <Input id="assignedUser" name="assignedUser" value={formData.assignedUser} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="department" className="block mb-2">Department *</Label>
                  <Input id="department" name="department" value={formData.department} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="location" className="block mb-2">Location *</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specs + Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label htmlFor="specifications" className="block mb-2">{formData.type === "printer" ? "Description" : "Specifications"}</Label>
              <Textarea id="specifications" name="specifications" value={formData.specifications} onChange={handleChange} rows={4} className="mt-1" />
            </div>
            {formData.type !== "printer" && (
              <div>
                <Label htmlFor="notes" className="block mb-2">Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-1" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : asset ? "Update Asset" : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetModal;