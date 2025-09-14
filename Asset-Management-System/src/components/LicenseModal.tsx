
import React, { useState, useEffect } from "react";
import type {
  License,
  LicenseStatus,
  LicenseType,
  LicenseUser,
} from "../types/inventory";
import { Calendar } from "lucide-react";
import VolumeLicenseUserManager from "./VolumeLicenseUserManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

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
  const [formData, setFormData] = useState<Omit<License, "id">>({
    licenseName: "",
    vendor: "",
    licenseKey: "",
    licenseType: "one-off",
    seats: 1,
    purchaseDate: "",
    expiryDate: "",
    assignedUser: "",
    department: "",
    notes: "",
    status: "active",
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
        purchaseDate: license.purchaseDate,
        expiryDate: license.expiryDate,
        assignedUser: license.assignedUser,
        department: license.department,
        notes: license.notes,
        status: license.status,
        assignedUsers: license.assignedUsers || [],
      });
    } else {
      setFormData({
        licenseName: "",
        vendor: "",
        licenseKey: "",
        licenseType: "one-off",
        seats: 1,
        purchaseDate: "",
        expiryDate: "",
        assignedUser: "",
        department: "",
        notes: "",
        status: "active",
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
    } else if (formData.licenseType === "volume") {
      if (!formData.assignedUsers || formData.assignedUsers.length === 0) {
        newErrors.assignedUsers =
          "At least one user must be assigned for volume licenses";
      }
      if (
        formData.assignedUsers &&
        formData.assignedUsers.length > formData.seats
      ) {
        newErrors.assignedUsers = `Cannot assign more users than available seats (${formData.seats})`;
      }
    }

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
      [name]: name === "seats" ? parseInt(value) || 0 : value,
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

  const licenseStatuses: LicenseStatus[] = [
    "active",
    "expired",
    "expiring-soon",
  ];
  const licenseTypes: LicenseType[] = ["one-off", "volume"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {license ? "Edit License" : "Add New License"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Name *
              </label>
              <input
                type="text"
                name="licenseName"
                value={formData.licenseName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.licenseName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.licenseName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.licenseName}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Key / Activation Code *
              </label>
              <input
                type="text"
                name="licenseKey"
                value={formData.licenseKey}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.licenseKey ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.licenseKey && (
                <p className="text-red-500 text-xs mt-1">{errors.licenseKey}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Type *
              </label>
              <select
                name="licenseType"
                value={formData.licenseType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {licenseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "one-off" ? "One-Off License" : "Volume License"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Seats *
              </label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.seats ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.seats && (
                <p className="text-red-500 text-xs mt-1">{errors.seats}</p>
              )}
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
                {licenseStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("-", " ").toUpperCase()}
                  </option>
                ))}
              </select>
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
                Expiry Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.expiryDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.expiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
              )}
            </div>

            {formData.licenseType === "one-off" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned User *
                </label>
                <input
                  type="text"
                  name="assignedUser"
                  value={formData.assignedUser}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.assignedUser ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.assignedUser && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.assignedUser}
                  </p>
                )}
              </div>
            )}

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

          {formData.licenseType === "volume" && (
            <div>
              <VolumeLicenseUserManager
                assignedUsers={formData.assignedUsers || []}
                onUsersChange={handleAssignedUsersChange}
                maxSeats={formData.seats}
              />
              {errors.assignedUsers && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assignedUsers}
                </p>
              )}
            </div>
          )}

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
              ) : license ? (
                "Update License"
              ) : (
                "Add License"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseModal;
