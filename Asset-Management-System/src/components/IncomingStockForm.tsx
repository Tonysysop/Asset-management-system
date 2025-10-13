import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus } from "lucide-react";
import type { IncomingStock, AssetType } from "../types/inventory";

interface IncomingStockFormProps {
  onSubmit: (stock: Omit<IncomingStock, "id">) => void;
}

const IncomingStockForm: React.FC<IncomingStockFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    serialNumber: "",
    assetType: "compute" as AssetType,
    assetSubtype: "",
    brand: "",
    model: "",
  });

  const assetTypeOptions = [
    { value: "compute", label: "Compute" },
    { value: "peripheral", label: "Peripheral" },
    { value: "network", label: "Network" },
  ];

  const getSubtypeOptions = (assetType: AssetType) => {
    switch (assetType) {
      case "compute":
        return [
          { value: "laptop", label: "Laptop" },
          { value: "desktop", label: "Desktop" },
          { value: "mobile", label: "Mobile" },
          { value: "server", label: "Server" },
        ];
      case "peripheral":
        return [
          { value: "printer", label: "Printer" },
          { value: "scanner", label: "Scanner" },
          { value: "monitor", label: "Monitor" },
        ];
      case "network":
        return [
          { value: "router", label: "Router" },
          { value: "switch", label: "Switch" },
          { value: "access_point", label: "Access Point" },
        ];
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serialNumber || !formData.assetSubtype || !formData.brand || !formData.model) {
      return;
    }

    const newStock: Omit<IncomingStock, "id"> = {
      ...formData,
      status: "incoming",
    };

    onSubmit(newStock);
    setFormData({
      serialNumber: "",
      assetType: "compute",
      assetSubtype: "",
      brand: "",
      model: "",
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset subtype when asset type changes
      ...(field === "assetType" && { assetSubtype: "" }),
    }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Incoming Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                placeholder="Enter serial number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type *</Label>
              <select
                id="assetType"
                value={formData.assetType}
                onChange={(e) => handleInputChange("assetType", e.target.value as AssetType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red focus:border-transparent"
                required
              >
                {assetTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetSubtype">Asset Subtype *</Label>
              <select
                id="assetSubtype"
                value={formData.assetSubtype}
                onChange={(e) => handleInputChange("assetSubtype", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red focus:border-transparent"
                required
                disabled={!formData.assetType}
              >
                <option value="">Select subtype</option>
                {getSubtypeOptions(formData.assetType).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="Enter brand"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                placeholder="Enter model"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-bua-red hover:bg-bua-red/90">
              Add to Incoming Stock
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncomingStockForm;
