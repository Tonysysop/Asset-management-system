import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type {
  IncomingStock,
  Consumable,
  ConsumableTransaction,
} from "../types/inventory";

interface BinCardDetailProps {
  incomingStock: IncomingStock[];
  consumables?: Consumable[];
  consumableTransactions?: ConsumableTransaction[];
  assetType?: string;
}

interface StockTransaction {
  date: string;
  reference: string;
  received: number;
  issued: number;
  balance: number;
  issuedTo?: string;
  issuedBy?: string;
}

const BinCardDetail: React.FC<BinCardDetailProps> = ({
  incomingStock,
  consumables = [],
  consumableTransactions = [],
  assetType,
}) => {
  const [selectedType, setSelectedType] = useState(assetType || "all");
  const [viewMode, setViewMode] = useState<"assets" | "consumables">("assets");

  // Filter stock by type if specified
  const filteredStock =
    selectedType === "all"
      ? incomingStock
      : incomingStock.filter((item) => item.assetType === selectedType);

  // Get unique asset types
  const assetTypes = Array.from(
    new Set(incomingStock.map((item) => item.assetType))
  );

  // Get unique consumable categories
  const consumableCategories = Array.from(
    new Set(consumables.map((item) => item.category))
  );

  // Calculate opening balance
  const openingBalance = 0; // Starting balance (could be from previous period)

  // Build transaction history based on view mode
  const transactions: StockTransaction[] = [];
  let runningBalance = openingBalance;

  if (viewMode === "assets") {
    // Add received items
    filteredStock.forEach((item) => {
      runningBalance++;
      transactions.push({
        date: new Date().toISOString().split("T")[0],
        reference: item.serialNumber,
        received: 1,
        issued: 0,
        balance: runningBalance,
      });

      // Add issued transaction if allocated
      if (item.status === "in-use" && item.allocatedDate) {
        runningBalance--;
        transactions.push({
          date: item.allocatedDate,
          reference: item.allocatedAssetTag || item.serialNumber,
          received: 0,
          issued: 1,
          balance: runningBalance,
          issuedTo: item.allocatedBy,
          issuedBy: item.allocatedBy,
        });
      }
    });
  } else {
    // Handle consumables transactions
    const filteredTransactions =
      selectedType === "all"
        ? consumableTransactions
        : consumableTransactions.filter(
            (t) =>
              consumables.find((c) => c.id === t.consumableId)?.category ===
              selectedType
          );

    // Add consumable transactions
    filteredTransactions.forEach((transaction) => {
      if (transaction.transactionType === "receive") {
        runningBalance += transaction.quantity;
        transactions.push({
          date: transaction.transactionDate,
          reference: transaction.reference || transaction.consumableName,
          received: transaction.quantity,
          issued: 0,
          balance: runningBalance,
          issuedBy: transaction.issuedBy,
        });
      } else if (transaction.transactionType === "issue") {
        runningBalance -= transaction.quantity;
        transactions.push({
          date: transaction.transactionDate,
          reference: transaction.reference || transaction.consumableName,
          received: 0,
          issued: transaction.quantity,
          balance: runningBalance,
          issuedTo: transaction.issuedTo,
          issuedBy: transaction.issuedBy,
        });
      }
    });
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate totals based on view mode
  let totalReceived = 0;
  let totalIssued = 0;
  let availableStock = 0;
  let isLowStock = false;

  if (viewMode === "assets") {
    totalReceived = filteredStock.length;
    totalIssued = filteredStock.filter(
      (item) => item.status === "in-use"
    ).length;
    availableStock = filteredStock.filter(
      (item) => item.status === "incoming"
    ).length;
    isLowStock = availableStock < 5;
  } else {
    const filteredConsumables =
      selectedType === "all"
        ? consumables
        : consumables.filter((item) => item.category === selectedType);

    const filteredTransactions =
      selectedType === "all"
        ? consumableTransactions
        : consumableTransactions.filter(
            (t) =>
              consumables.find((c) => c.id === t.consumableId)?.category ===
              selectedType
          );

    totalReceived = filteredTransactions
      .filter((t) => t.transactionType === "receive")
      .reduce((sum, t) => sum + t.quantity, 0);

    totalIssued = filteredTransactions
      .filter((t) => t.transactionType === "issue")
      .reduce((sum, t) => sum + t.quantity, 0);

    availableStock = filteredConsumables.reduce(
      (sum, c) => sum + c.currentQuantity,
      0
    );
    isLowStock = filteredConsumables.some(
      (c) => c.currentQuantity <= c.reorderPoint
    );
  }

  const closingBalance = openingBalance + totalReceived - totalIssued;

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ["Bin Card Report", selectedType === "all" ? "All Assets" : selectedType],
      [],
      ["Opening Balance", openingBalance],
      ["Total Received", totalReceived],
      ["Total Issued", totalIssued],
      ["Closing Balance", closingBalance],
      [],
      [
        "Date",
        "Reference",
        "Received",
        "Issued",
        "Balance",
        "Issued To",
        "Issued By",
      ],
      ...sortedTransactions.map((t) => [
        t.date,
        t.reference,
        t.received,
        t.issued,
        t.balance,
        t.issuedTo || "",
        t.issuedBy || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bin-card-${selectedType}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print bin card
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-bua-red" />
            Bin Card
          </h2>
          <p className="text-gray-600 mt-1">
            Detailed stock movement and balance tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">View Mode:</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setViewMode("assets");
                setSelectedType("all");
              }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === "assets"
                  ? "bg-bua-red text-white"
                  : "text-gray-600 hover:text-bua-red"
              }`}
            >
              Assets
            </button>
            <button
              onClick={() => {
                setViewMode("consumables");
                setSelectedType("all");
              }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === "consumables"
                  ? "bg-bua-red text-white"
                  : "text-gray-600 hover:text-bua-red"
              }`}
            >
              Consumables
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red"
          >
            <option value="all">All Types</option>
            {viewMode === "assets"
              ? assetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))
              : consumableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() +
                      category.slice(1).replace("_", " ")}
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Opening Balance
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openingBalance}</div>
            <p className="text-xs text-muted-foreground">Starting stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{totalReceived}
            </div>
            <p className="text-xs text-muted-foreground">Items received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{totalIssued}
            </div>
            <p className="text-xs text-muted-foreground">Items issued</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Closing Balance
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {closingBalance}
            </div>
            <p className="text-xs text-muted-foreground">Available stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {isLowStock && (
        <Card className="border-orange-200 bg-orange-50 print:border-orange-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">
                Low Stock Warning
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800">
              Only <span className="font-bold">{availableStock}</span> items
              remaining. Consider reordering.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transaction Table */}
      <Card className="print:shadow-none print:border-2">
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-left p-2 font-semibold">Reference</th>
                  <th className="text-right p-2 font-semibold">Received</th>
                  <th className="text-right p-2 font-semibold">Issued</th>
                  <th className="text-right p-2 font-semibold">Balance</th>
                  <th className="text-left p-2 font-semibold">Issued To</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-sm">{transaction.date}</td>
                    <td className="p-2 text-sm font-medium">
                      {transaction.reference}
                    </td>
                    <td className="p-2 text-sm text-right text-green-600">
                      {transaction.received > 0
                        ? `+${transaction.received}`
                        : "-"}
                    </td>
                    <td className="p-2 text-sm text-right text-red-600">
                      {transaction.issued > 0 ? `-${transaction.issued}` : "-"}
                    </td>
                    <td className="p-2 text-sm text-right font-semibold">
                      {transaction.balance}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {transaction.issuedTo || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={2} className="p-2">
                    Total
                  </td>
                  <td className="p-2 text-right text-green-600">
                    +{totalReceived}
                  </td>
                  <td className="p-2 text-right text-red-600">
                    -{totalIssued}
                  </td>
                  <td className="p-2 text-right">{closingBalance}</td>
                  <td className="p-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Print Footer */}
      <div className="hidden print:block text-center text-sm text-gray-600 mt-8">
        <p>
          Generated on {new Date().toLocaleDateString()} at{" "}
          {new Date().toLocaleTimeString()}
        </p>
        <p className="mt-2">BUA Group - Asset Management System</p>
      </div>
    </div>
  );
};

export default BinCardDetail;
