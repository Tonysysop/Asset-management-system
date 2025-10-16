import React, { useState, useMemo, useCallback } from "react";
import type { IncomingStock, UserRole } from "../types/inventory";
import { Package, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { incomingStockKeys } from "../hooks/useIncomingStock";
import { receivableKeys } from "../hooks/useReceivables";
import ReceivableTableRow from "./ReceivableTableRow";
import BatchHistoryAccordion from "./BatchHistoryAccordion";
import ReceivablesSearchBar from "./ReceivablesSearchBar";
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
  incomingStock: IncomingStock[];
  userRole: UserRole;
  onAssign: (stock: IncomingStock) => void;
}

const ReceivablesTable: React.FC<ReceivablesTableProps> = ({
  incomingStock,
  userRole,
  onAssign,
}) => {
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<keyof IncomingStock>("itemName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState<"management" | "history">(
    "management"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Handle individual assignment
  const handleAssign = useCallback(
    (stock: IncomingStock) => {
      onAssign(stock);
    },
    [onAssign]
  );

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate and refetch all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: incomingStockKeys.all }),
        queryClient.invalidateQueries({ queryKey: receivableKeys.all }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const handleSort = useCallback(
    (field: keyof IncomingStock) => {
      if (field === sortField) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  const sortedIncomingStock = useMemo(() => {
    if (!incomingStock || !Array.isArray(incomingStock)) {
      return [];
    }

    // Filter out allocated items (status === "in-use") and items already assigned to sheets
    let unallocatedItems = incomingStock.filter(
      (item) => item.status !== "in-use" && !item.sheetId
    );

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      unallocatedItems = unallocatedItems.filter((item) => {
        return (
          item.serialNumber?.toLowerCase().includes(searchLower) ||
          item.brand?.toLowerCase().includes(searchLower) ||
          item.model?.toLowerCase().includes(searchLower) ||
          item.vendor?.toLowerCase().includes(searchLower) ||
          item.supplier?.toLowerCase().includes(searchLower) ||
          item.assetType?.toLowerCase().includes(searchLower) ||
          item.assetSubtype?.toLowerCase().includes(searchLower)
        );
      });
    }

    return [...unallocatedItems].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [incomingStock, sortField, sortDirection, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(sortedIncomingStock.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIncomingStock = sortedIncomingStock.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when incoming stock changes or search term changes
  const incomingStockLength = incomingStock?.length || 0;
  React.useEffect(() => {
    setCurrentPage(1);
  }, [incomingStockLength, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {userRole === "admin" && (
        <div className="p-4">
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-bua-red" />
              <h2 className="text-lg font-semibold">Receivables</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-bua-red transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              {/* Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView("management")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "management"
                      ? "bg-white text-bua-red shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Asset Sheet Management
                </button>
                <button
                  onClick={() => setCurrentView("history")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "history"
                      ? "bg-white text-bua-red shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Batch History
                </button>
              </div>
            </div>
          </div>

          {/* Management View Header */}
          {currentView === "management" && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  ({sortedIncomingStock.length} items available)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Management View */}
      {currentView === "management" && (
        <>
          {/* Search Bar */}
          <div className="p-4 border-b">
            <ReceivablesSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>

          {/* Results Count */}
          <div className="px-4 py-2 bg-gray-50 border-b">
            <span className="text-sm text-gray-500">
              {searchTerm.trim()
                ? `${sortedIncomingStock.length} items found for "${searchTerm}"`
                : `${sortedIncomingStock.length} items available`}
            </span>
          </div>

          <div className="overflow-x-auto">
            {paginatedIncomingStock.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">
                  {searchTerm.trim()
                    ? `No items found matching "${searchTerm}"`
                    : "No unallocated stock items found."}
                </p>
                <p className="text-sm text-gray-400">
                  {searchTerm.trim()
                    ? "Try adjusting your search terms or clear the search to see all items."
                    : "All stock items have been allocated or are already in sheets. New items added by the store keeper will appear here for allocation."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort("brand")}>
                      Brand
                    </TableHead>
                    <TableHead onClick={() => handleSort("model")}>
                      Model
                    </TableHead>
                    <TableHead onClick={() => handleSort("serialNumber")}>
                      Serial Number
                    </TableHead>
                    <TableHead onClick={() => handleSort("supplier")}>
                      Supplier
                    </TableHead>
                    <TableHead onClick={() => handleSort("vendor")}>
                      Vendor
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
                  {paginatedIncomingStock.map((stock) => (
                    <ReceivableTableRow
                      key={stock.id}
                      stock={stock}
                      userRole={userRole as "admin" | "auditor"}
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
                {Math.min(endIndex, sortedIncomingStock.length)} of{" "}
                {sortedIncomingStock.length} items
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
        </>
      )}

      {/* History View */}
      {currentView === "history" && (
        <div className="p-4">
          <BatchHistoryAccordion incomingStock={incomingStock || []} />
        </div>
      )}
    </div>
  );
};

export default ReceivablesTable;
