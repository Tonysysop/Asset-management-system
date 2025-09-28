import React, { useState, useMemo } from "react";
import type { Receivable, UserRole } from "../types/inventory";
import {
  Edit,
  Trash2,
  ArrowRight,
  Monitor,
  Laptop,
  Printer,
  Server,
  Router,
  Smartphone,
  HardDrive,
  Upload,
  Plus,
  MoreVertical,
} from "lucide-react";
import { addReceivables } from "../services/receivableService";
import ImportModal from "./ImportModal";
import ViewDetailsModal from "./ViewDetailsModal";
import { useToast } from "../contexts/ToastContext";
import { useStore } from "../store/store";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
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

interface ReceivablesTableProps {
  userRole: UserRole;
  onEdit: (receivable: Receivable) => void;
  onDelete: (id: string) => void;
  onDeploy: (receivable: Receivable) => void;
  onImport: () => void;
  onAdd: () => void;
}

const ReceivablesTable: React.FC<ReceivablesTableProps> = ({
  userRole,
  onEdit,
  onDelete,
  onDeploy,
  onImport,
  onAdd,
}) => {
  const receivables = useStore((state) => state.receivables);
  const [sortField, setSortField] = useState<keyof Receivable>("itemName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showToast } = useToast();

  const handleFileImport = async (data: Omit<Receivable, "id">[]) => {
    try {
      await addReceivables(data);
      onImport();
      showToast("Receivables imported successfully", "success");
    } catch {
      showToast("Error importing receivables", "error");
    }
  };

  const receivableSampleData = `itemName,category,brand,description,serialNumber,colour,supplierName,purchaseDate,quantity,warranty,notes,status
Laptop,laptop,Apple,MacBook Pro 16,C02Z1234ABCD,Space Gray,Apple Inc.,2023-10-26,1,1 Year,New laptop for design team,pending`;

  const receivableInstructions = [
    "The CSV file must have the following columns: itemName, category, brand, description, serialNumber, colour, supplierName, purchaseDate, quantity, warranty, notes, status",
    "The category must be one of: laptop, desktop, printer, server, router, switch, mobile, peripheral",
    "The status must be one of: pending, received, deployed",
    "Dates can be in any format (MM/DD/YYYY, YYYY-MM-DD, etc.) and will be automatically converted to 'October 15th, 2025' format.",
  ];

  const expectedReceivableHeaders = [
    "itemName",
    "category",
    "brand",
    "description",
    "serialNumber",
    "colour",
    "supplierName",
    "purchaseDate",
    "quantity",
    "warranty",
    "notes",
    "status",
  ];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "laptop":
        return <Laptop className="w-4 h-4" />;
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "printer":
        return <Printer className="w-4 h-4" />;
      case "server":
        return <Server className="w-4 h-4" />;
      case "router":
        return <Router className="w-4 h-4" />;
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <HardDrive className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "deployed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSort = (field: keyof Receivable) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedReceivables = useMemo(() => {
    return [...receivables].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [receivables, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedReceivables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReceivables = sortedReceivables.slice(startIndex, endIndex);

  // Reset to first page when receivables change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [receivables.length]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex justify-end space-x-4">
        <button
          onClick={() => onAdd()}
          className="flex items-center px-4 py-2 bg-bua-red text-white rounded-md hover:bg-bua-dark-red"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Receivable
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center px-4 py-2 bg-bua-red text-white rounded-md hover:bg-bua-dark-red"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </button>
      </div>
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleFileImport}
        sampleData={receivableSampleData}
        instructions={receivableInstructions}
        expectedHeaders={expectedReceivableHeaders}
        importType="receivables"
      />
      <div className="overflow-x-auto">
        {paginatedReceivables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No receivables found.</p>
            <button
              onClick={() => onAdd()}
              className="flex items-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Receivable
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("itemName")}>
                  Item Name
                </TableHead>
                <TableHead onClick={() => handleSort("category")}>
                  Category
                </TableHead>
                <TableHead onClick={() => handleSort("brand")}>Brand</TableHead>
                <TableHead onClick={() => handleSort("serialNumber")}>
                  Serial Number
                </TableHead>
                <TableHead onClick={() => handleSort("supplierName")}>
                  Supplier
                </TableHead>
                <TableHead onClick={() => handleSort("quantity")}>
                  Quantity
                </TableHead>
                <TableHead>Assigned Users</TableHead>
                <TableHead onClick={() => handleSort("status")}>
                  Status
                </TableHead>
                {(userRole === "admin" || userRole === "auditor") && (
                  <TableHead>Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReceivables.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell>
                    <div className="font-medium">{receivable.itemName}</div>
                    <div className="text-sm text-muted-foreground">
                      {receivable.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="mr-2">
                        {getAssetIcon(receivable.category)}
                      </div>
                      <span className="capitalize">{receivable.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{receivable.brand}</div>
                    <div className="text-sm text-muted-foreground">
                      {receivable.colour}
                    </div>
                  </TableCell>
                  <TableCell>{receivable.serialNumber}</TableCell>
                  <TableCell>
                    <div>{receivable.supplierName}</div>
                    <div className="text-sm text-muted-foreground">
                      Purchased: {receivable.purchaseDate}
                    </div>
                  </TableCell>
                  <TableCell>{receivable.quantity}</TableCell>
                  <TableCell>
                    <div>
                      {receivable.assignedUsers &&
                      receivable.assignedUsers.length > 0
                        ? `${receivable.assignedUsers.length} user${
                            receivable.assignedUsers.length > 1 ? "s" : ""
                          }`
                        : "No users assigned"}
                    </div>
                    {receivable.assignedUsers &&
                      receivable.assignedUsers.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {receivable.assignedUsers
                            .slice(0, 2)
                            .map((user) => user.name)
                            .join(", ")}
                          {receivable.assignedUsers.length > 2 &&
                            ` +${receivable.assignedUsers.length - 2} more`}
                        </div>
                      )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        receivable.status
                      )}`}
                    >
                      {receivable.status.toUpperCase()}
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
                            <ViewDetailsModal
                              item={receivable}
                              title="Receivable Details"
                            />
                          </DropdownMenuItem>
                          {receivable.status === "received" && (
                            <DropdownMenuItem
                              onClick={() => onDeploy(receivable)}
                            >
                              <ArrowRight className="w-4 h-4 mr-2" /> Deploy
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEdit(receivable)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(receivable.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                  {userRole === "auditor" && (
                    <TableCell>
                      <ViewDetailsModal
                        item={receivable}
                        title="Receivable Details"
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, sortedReceivables.length)} of{" "}
            {sortedReceivables.length} receivables
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ReceivablesTable;
