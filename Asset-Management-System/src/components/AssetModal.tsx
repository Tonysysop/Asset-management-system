import React, { useState, useEffect } from "react";
import type { Asset, AssetType, AssetStatus } from "@/types/inventory";
import { X, AlertTriangle } from "lucide-react";

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
    type: "laptop",
    brand: "",
    model: "",
    specifications: "",
    purchaseDate: "",
    warrantyExpiry: "",
    vendor: "",
    assignedUser: "",
    department: "",
    status: "spare",
    location: "",
    notes: "",
  });

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
        purchaseDate: asset.purchaseDate,
        warrantyExpiry: asset.warrantyExpiry,
        vendor: asset.vendor,
        assignedUser: asset.assignedUser,
        department: asset.department,
        status: asset.status,
        location: asset.location,
        notes: asset.notes,
      });
    } else {
      setFormData({
        assetTag: "",
        serialNumber: "",
        type: "laptop",
        brand: "",
        model: "",
        specifications: "",
        purchaseDate: "",
        warrantyExpiry: "",
        vendor: "",
        assignedUser: "",
        department: "",
        status: "spare",
        location: "",
        notes: "",
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
    if (!formData.purchaseDate)
      newErrors.purchaseDate = "Purchase date is required";
    if (!formData.warrantyExpiry)
      newErrors.warrantyExpiry = "Warranty expiry is required";
    if (!formData.vendor.trim()) newErrors.vendor = "Vendor is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSave(formData);
        onClose();
      } catch (error: any) {
        setServerError(error.message);
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

  if (!isOpen) return null;

  const assetTypes: AssetType[] = [
    "laptop",
    "desktop",
    "printer",
    "server",
    "router",
    "switch",
    "mobile",
    "peripheral",
  ];
  const assetStatuses: AssetStatus[] = ["in-use", "spare", "repair", "retired"];

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {asset ? "Edit Asset" : "Add New Asset"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Tag *
              </label>
              <input
                type="text"
                name="assetTag"
                value={formData.assetTag}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.assetTag ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.assetTag && (
                <p className="text-red-500 text-xs mt-1">{errors.assetTag}</p>
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
                Asset Type *
              </label>
              <select
                name="type"
                value={formData.type}
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
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {assetStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("-", " ").toUpperCase()}
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
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.model ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.model && (
                <p className="text-red-500 text-xs mt-1">{errors.model}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.purchaseDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.purchaseDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.purchaseDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty Expiry *
              </label>
              <input
                type="date"
                name="warrantyExpiry"
                value={formData.warrantyExpiry}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.warrantyExpiry ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.warrantyExpiry && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.warrantyExpiry}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.vendor ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.vendor && (
                <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned User
              </label>
              <input
                type="text"
                name="assignedUser"
                value={formData.assignedUser}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.department ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specifications
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
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

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              {asset ? "Update Asset" : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;