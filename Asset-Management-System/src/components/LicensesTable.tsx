import React, { useState } from "react";
import type { License, UserRole } from "../types/inventory";
import {
  Edit,
  Trash2,
  Key,
  AlertTriangle,
  Upload,
  Plus,
  MoreVertical,
} from "lucide-react";
import { addLicenses } from "../services/licenseService";
import ImportModal from "./ImportModal";
import ViewDetailsModal from "./ViewDetailsModal";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

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
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [sortField, setSortField] = useState<keyof License>("licenseName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleFileImport = async (data: Omit<License, "id">[]) => {
    try {
      if (!currentUser) {
        throw new Error("User is not authenticated.");
      }
      await addLicenses(data, currentUser.email || "");
      onImport();
      showToast("Licenses imported successfully", "success");
    } catch {
      showToast("Error importing licenses", "error");
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

    if (sortField === 'seats') {
      const aSeats = typeof aValue === 'number' ? aValue : 0;
      const bSeats = typeof bValue === 'number' ? bValue : 0;
      if (aSeats < bSeats) return sortDirection === "asc" ? -1 : 1;
      if (aSeats > bSeats) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("licenseName")}>License Name</TableHead>
              <TableHead onClick={() => handleSort("vendor")}>Vendor</TableHead>
              <TableHead onClick={() => handleSort("licenseType")}>Type</TableHead>
              <TableHead onClick={() => handleSort("seats")}>Seats</TableHead>
              <TableHead onClick={() => handleSort("assignedUser")}>Assigned To</TableHead>
              <TableHead onClick={() => handleSort("expiryDate")}>Expiry Date</TableHead>
              <TableHead onClick={() => handleSort("status")}>Status</TableHead>
              {(userRole === "admin" || userRole === "auditor") && (
                <TableHead>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLicenses.map((license) => (
              <TableRow key={license.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Key className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <div className="font-medium">{license.licenseName}</div>
                      <div className="text-sm text-muted-foreground">{license.department}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{license.vendor}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      license.licenseType === "volume"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {license.licenseType === "volume" ? "Volume" : "One-Off"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {license.licenseType === "volume" && license.assignedUsers
                      ? `${license.assignedUsers.length}/${license.seats}`
                      : license.seats}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
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
                      <div className="text-xs text-muted-foreground">
                        {license.assignedUsers
                          .slice(0, 2)
                          .map((user) => user.name)
                          .join(", ")}
                        {license.assignedUsers.length > 2 &&
                          ` +${license.assignedUsers.length - 2} more`}
                      </div>
                    )}
                </TableCell>
                <TableCell>
                  <div
                    className={`${isExpired(license.expiryDate)
                        ? "text-red-600 font-medium"
                        : isExpiringSoon(license.expiryDate)
                        ? "text-amber-600 font-medium"
                        : ""}`}>
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
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      license.status
                    )}`}
                  >
                    {license.status.replace("-", " ").toUpperCase()}
                  </span>
                </TableCell>
                {userRole === "admin" && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <ViewDetailsModal item={license} title="License Details" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(license)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(license.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
                {userRole === "auditor" && (
                  <TableCell>
                    <ViewDetailsModal item={license} title="License Details" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LicensesTable;
