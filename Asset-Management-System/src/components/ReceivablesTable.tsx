import React, { useState, useMemo, useCallback } from "react";
import type { Receivable, UserRole } from "../types/inventory";
import { Upload, Plus } from "lucide-react";
import ReceivableTableRow from "./ReceivableTableRow";
import { useAddReceivables } from "../hooks/useReceivables";
import ImportModal from "./ImportModal";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "./ui/table";

interface ReceivablesTableProps {
  receivables: Receivable[];
  userRole: UserRole;
  onEdit: (receivable: Receivable) => void;
  onDelete: (id: string) => void;
  onAssign: (receivable: Receivable) => void;
  onImport: () => void;
  onAdd: () => void;
}

const ReceivablesTable: React.FC<ReceivablesTableProps> = ({
  receivables,
  userRole,
  onEdit,
  onDelete,
  onAssign,
  onImport,
  onAdd,
}) => {
  const [sortField, setSortField] = useState<keyof Receivable>("itemName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const addReceivablesMutation = useAddReceivables();

  const handleFileImport = useCallback(
    async (data: unknown[]) => {
      try {
        await addReceivablesMutation.mutateAsync({
          receivables: data as Omit<Receivable, "id">[],
          user: currentUser?.email || "unknown",
        });
        onImport();
        toast({
          title: "Import Success",
          description: "Receivables imported successfully",
        });
      } catch {
        toast({
          title: "Import Error",
          description: "Error importing receivables",
          variant: "destructive",
        });
      }
    },
    [addReceivablesMutation, currentUser?.email, onImport, toast]
  );

  const receivableSampleData = `itemName,brand,description,serialNumber,supplierName,purchaseDate,quantity,warranty,notes,status
Laptop,Apple,MacBook Pro 16,C02Z1234ABCD,Apple Inc.,2023-10-26,1,1 Year,New laptop for design team,pending`;

  const receivableInstructions = [
    "The CSV file must have the following columns: itemName, brand, description, serialNumber, supplierName, purchaseDate, quantity, warranty, notes, status",
    "The status must be one of: pending, received, deployed",
    "Dates can be in any format (MM/DD/YYYY, YYYY-MM-DD, etc.) and will be automatically converted to 'October 15th, 2025' format.",
  ];

  const expectedReceivableHeaders = [
    "itemName",
    "brand",
    "description",
    "serialNumber",
    "supplierName",
    "purchaseDate",
    "quantity",
    "warranty",
    "notes",
    "status",
  ];

  // Memoized handlers to prevent unnecessary re-renders
  const handleEdit = useCallback(
    (receivable: Receivable) => {
      onEdit(receivable);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  const handleAssign = useCallback(
    (receivable: Receivable) => {
      onAssign(receivable);
    },
    [onAssign]
  );

  const handleSort = useCallback(
    (field: keyof Receivable) => {
      if (field === sortField) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

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
      {userRole === "admin" && (
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
      )}
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
            {userRole === "admin" && (
              <button
                onClick={() => onAdd()}
                className="flex items-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Receivable
              </button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("itemName")}>
                  Item Name
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
                <ReceivableTableRow
                  key={receivable.id}
                  receivable={receivable}
                  userRole={userRole as "admin" | "auditor"}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAssign={handleAssign}
                />
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
