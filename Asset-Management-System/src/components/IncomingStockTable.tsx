import React, { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { IncomingStock } from "../types/inventory";

interface IncomingStockTableProps {
  incomingStock: IncomingStock[];
  onAllocate: (stock: IncomingStock) => void;
}

type SortField =
  | "serialNumber"
  | "status"
  | "assetType"
  | "assetSubtype"
  | "brand"
  | "model"
  | "allocatedDate"
  | "allocatedBy"
  | "allocatedAssetTag";
type SortDirection = "asc" | "desc";

const IncomingStockTable: React.FC<IncomingStockTableProps> = ({
  incomingStock,
  onAllocate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllocated, setShowAllocated] = useState(false);
  const [sortField, setSortField] = useState<SortField>("serialNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const itemsPerPage = 10;

  const incomingItems = incomingStock.filter(
    (item) => item.status === "incoming"
  );

  const allocatedItems = incomingStock.filter(
    (item) => item.status === "in-use"
  );

  // Sorting logic
  const sortedItems = useMemo(() => {
    const items = showAllocated ? allocatedItems : incomingItems;
    return [...items].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "serialNumber":
          aValue = a.serialNumber.toLowerCase();
          bValue = b.serialNumber.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "assetType":
          aValue = a.assetType.toLowerCase();
          bValue = b.assetType.toLowerCase();
          break;
        case "assetSubtype":
          aValue = a.assetSubtype.toLowerCase();
          bValue = b.assetSubtype.toLowerCase();
          break;
        case "brand":
          aValue = a.brand.toLowerCase();
          bValue = b.brand.toLowerCase();
          break;
        case "model":
          aValue = a.model.toLowerCase();
          bValue = b.model.toLowerCase();
          break;
        case "allocatedDate":
          aValue = a.allocatedDate || "";
          bValue = b.allocatedDate || "";
          break;
        case "allocatedBy":
          aValue = (a.allocatedBy || "").toLowerCase();
          bValue = (b.allocatedBy || "").toLowerCase();
          break;
        case "allocatedAssetTag":
          aValue = (a.allocatedAssetTag || "").toLowerCase();
          bValue = (b.allocatedAssetTag || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [incomingItems, allocatedItems, showAllocated, sortField, sortDirection]);

  const displayItems = sortedItems;

  // Reset to page 1 when data changes or view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [incomingStock.length, showAllocated, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = displayItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  if (displayItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {showAllocated ? "Allocated Stock History" : "Incoming Stock"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>
              No {showAllocated ? "allocated" : "incoming"} stock items found.
            </p>
            <p className="text-sm">
              {showAllocated
                ? "Allocated items will appear here after allocation."
                : "Add new items using the form above."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {showAllocated ? "Allocated Stock History" : "Incoming Stock"}
            <span className="text-sm font-normal text-gray-500">
              ({displayItems.length} items)
            </span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={!showAllocated ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllocated(false)}
              className={!showAllocated ? "bg-bua-red hover:bg-bua-red/90" : ""}
            >
              Incoming ({incomingItems.length})
            </Button>
            <Button
              variant={showAllocated ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllocated(true)}
              className={showAllocated ? "bg-bua-red hover:bg-bua-red/90" : ""}
            >
              Allocated ({allocatedItems.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("serialNumber")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Serial Number
                  {getSortIcon("serialNumber")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Status
                  {getSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("assetType")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Asset Type
                  {getSortIcon("assetType")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("assetSubtype")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Subtype
                  {getSortIcon("assetSubtype")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("brand")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Brand
                  {getSortIcon("brand")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("model")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Model
                  {getSortIcon("model")}
                </Button>
              </TableHead>
              {showAllocated && (
                <>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("allocatedAssetTag")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Asset Tag
                      {getSortIcon("allocatedAssetTag")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("allocatedDate")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Allocated Date
                      {getSortIcon("allocatedDate")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("allocatedBy")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Allocated By
                      {getSortIcon("allocatedBy")}
                    </Button>
                  </TableHead>
                </>
              )}
              {!showAllocated && <TableHead>Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.serialNumber}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === "incoming"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.status === "incoming" ? "INCOMING" : "ALLOCATED"}
                  </span>
                </TableCell>
                <TableCell className="capitalize">{item.assetType}</TableCell>
                <TableCell className="capitalize">
                  {item.assetSubtype.replace("_", " ")}
                </TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.model}</TableCell>
                {showAllocated && (
                  <>
                    <TableCell className="font-medium text-bua-red">
                      {item.allocatedAssetTag || "N/A"}
                    </TableCell>
                    <TableCell>{item.allocatedDate || "N/A"}</TableCell>
                    <TableCell>{item.allocatedBy || "N/A"}</TableCell>
                  </>
                )}
                {!showAllocated && (
                  <TableCell>
                    <Button
                      onClick={() => onAllocate(item)}
                      size="sm"
                      className="bg-bua-red hover:bg-bua-red/90 flex items-center gap-1"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Allocate
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, displayItems.length)} of{" "}
                {displayItems.length} items
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 p-0 ${
                        currentPage === page
                          ? "bg-bua-red hover:bg-bua-red/90 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomingStockTable;
