import React, { useState, useRef } from "react";
import type { License, UserRole } from "../types/inventory";
import {
  Edit,
  Trash2,
  Key,
  AlertTriangle,
  Upload,
  Eye,
  Plus,
} from "lucide-react";
import { addLicenses } from "../services/licenseService";
import ImportModal from "./ImportModal";
import ViewDetailsModal from "./ViewDetailsModal";
import LicenseModal from "./LicenseModal";

interface LicensesTableProps {
  licenses: License[];
  userRole: UserRole;
  onEdit: (license: License) => void;
  onDelete: (id: string) => void;
  onImport: () => void;
  onAdd: () => void;
}

const LicensesTable: React.FC<LicensesTableProps> = ({
  licenses,
  userRole,
  onEdit,
  onDelete,
  onImport,
  onAdd,
}) => {
  const [sortField, setSortField] = useState<keyof License>("licenseName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleFileImport = async (data: Omit<License, "id">[]) => {
    try {
      await addLicenses(data);
      onImport();
    } catch (error) {
      console.error("Error importing licenses:", error);
    }
  };

  const licenseSampleData = `licenseName,vendor,licenseKey,licenseType,seats,purchaseDate,expiryDate,assignedUser,department,notes,status
Microsoft Office 365,Microsoft,ABCD-EFGH-IJKL-MNOP,volume,50,2023-01-01,2024-01-01,Jane Smith,Marketing,Standard license,active`;

  const licenseInstructions = [
    "The CSV file must have the following columns: licenseName, vendor, licenseKey, licenseType, seats, purchaseDate, expiryDate, assignedUser, department, notes, status",
    "The licenseType must be one of: one-off, volume",
    "The status must be one of: active, expired, expiring-soon",
    "Dates should be in YYYY-MM-DD format.",
  ];

  const expectedLicenseHeaders = [
    "licenseName",
    "vendor",
    "licenseKey",
    "licenseType",
    "seats",
    "purchaseDate",
    "expiryDate",
    "assignedUser",
    "department",
    "notes",
    "status",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expiring-soon":
        return "bg-amber-100 text-amber-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry =
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const handleSort = (field: keyof License) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedLicenses = [...licenses].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortDirection === "asc" ? 1 : -1;
    if (bValue === undefined) return sortDirection === "asc" ? -1 : 1;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex justify-end space-x-4">
        <button
          onClick={() => onAdd()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add License
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </button>
      </div>
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleFileImport}
        sampleData={licenseSampleData}
        instructions={licenseInstructions}
        expectedHeaders={expectedLicenseHeaders}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("licenseName")}
              >
                License Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("vendor")}
              >
                Vendor
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("licenseType")}
              >
                Type
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("seats")}
              >
                Seats
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("assignedUser")}
              >
                Assigned To
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("expiryDate")}
              >
                Expiry Date
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                Status
              </th>
              {(userRole === "admin" || userRole === "auditor") && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLicenses.map((license) => (
              <tr
                key={license.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {license.licenseName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {license.department}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{license.vendor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      license.licenseType === "volume"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {license.licenseType === "volume" ? "Volume" : "One-Off"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {license.licenseType === "volume" && license.assignedUsers
                      ? `${license.assignedUsers.length}/${license.seats}`
                      : license.seats}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {license.licenseType === "volume" &&
                    license.assignedUsers &&
                    license.assignedUsers.length > 0
                      ? `${license.assignedUsers.length} user${
                          license.assignedUsers.length > 1 ? "s" : ""
                        }`
                      : license.assignedUser}
                  </div>
                  {license.licenseType === "volume" &&
                    license.assignedUsers &&
                    license.assignedUsers.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {license.assignedUsers
                          .slice(0, 2)
                          .map((user) => user.name)
                          .join(", ")}
                        {license.assignedUsers.length > 2 &&
                          ` +${license.assignedUsers.length - 2} more`}
                      </div>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm ${
                      isExpired(license.expiryDate)
                        ? "text-red-600 font-medium"
                        : isExpiringSoon(license.expiryDate)
                        ? "text-amber-600 font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    {license.expiryDate}
                  </div>
                  {(isExpired(license.expiryDate) ||
                    isExpiringSoon(license.expiryDate)) && (
                    <div className="flex items-center text-xs text-amber-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {isExpired(license.expiryDate)
                        ? "Expired"
                        : "Expiring Soon"}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      license.status
                    )}`}
                  >
                    {license.status.replace("-", " ").toUpperCase()}
                  </span>
                </td>
                {userRole === "admin" && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <ViewDetailsModal
                        item={license}
                        title="License Details"
                      />
                      <button
                        onClick={() => onEdit(license)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(license.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
                {userRole === "auditor" && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <ViewDetailsModal
                        item={license}
                        title="License Details"
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LicensesTable;
