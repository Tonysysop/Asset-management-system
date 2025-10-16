import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Package,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Upload,
  Download,
  AlertCircle,
  FileText,
} from "lucide-react";
import BinCardWidget from "./BinCardWidget";
import type { IncomingStock } from "../types/inventory";

interface StoreKeeperDashboardProps {
  incomingStock: IncomingStock[];
  onNavigateToStock: () => void;
  onNavigateToBinCard: () => void;
  onAddStock: () => void;
  onImportStock: () => void;
  onExportStock: () => void;
}

const StoreKeeperDashboard: React.FC<StoreKeeperDashboardProps> = ({
  incomingStock,
  onNavigateToStock,
  onNavigateToBinCard,
  onAddStock,
  onImportStock,
  onExportStock,
}) => {
  // Calculate metrics
  const totalStock = incomingStock.length;
  const incomingCount = incomingStock.filter(
    (item) => item.status === "incoming"
  ).length;
  const allocatedCount = incomingStock.filter(
    (item) => item.status === "in-use"
  ).length;
  const allocationRate =
    totalStock > 0 ? ((allocatedCount / totalStock) * 100).toFixed(1) : "0";

  // Get recent allocations (last 10)
  const recentAllocations = incomingStock
    .filter((item) => item.status === "in-use")
    .sort((a, b) => {
      const dateA = a.allocatedDate ? new Date(a.allocatedDate).getTime() : 0;
      const dateB = b.allocatedDate ? new Date(b.allocatedDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  // Get stock by asset type
  const stockByType = incomingStock.reduce((acc, item) => {
    const type = item.assetType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get pending stock (incoming)
  const pendingStock = incomingStock.filter(
    (item) => item.status === "incoming"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-bua-red" />
            Store Keeper Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Overview of incoming stock and allocation status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddStock}
            className="bg-bua-red hover:bg-bua-red/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </Button>
          <Button
            onClick={onImportStock}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button
            onClick={onExportStock}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">
              All incoming stock items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Allocation
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {incomingCount}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allocatedCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully allocated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Allocation Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {allocationRate}%
            </div>
            <p className="text-xs text-muted-foreground">Of total stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock by Type and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Asset Type */}
        <Card>
          <CardHeader>
            <CardTitle>Stock by Asset Type</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stockByType).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stockByType).map(([type, count]) => {
                  const percentage =
                    totalStock > 0
                      ? ((count / totalStock) * 100).toFixed(1)
                      : "0";
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{type}</span>
                        <span className="text-gray-600">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-bua-red h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No stock data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Allocations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAllocations.length > 0 ? (
              <div className="space-y-3">
                {recentAllocations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.serialNumber}</p>
                      <p className="text-xs text-gray-600">
                        {item.brand} {item.model}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {item.allocatedDate || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.allocatedBy || "Unknown"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent allocations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Stock Alert */}
      {pendingStock.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">
                Pending Allocation Alert
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800">
                  You have{" "}
                  <span className="font-bold">{pendingStock.length}</span>{" "}
                  incoming stock items awaiting allocation.
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Click below to view and allocate these items.
                </p>
              </div>
              <Button
                onClick={onNavigateToStock}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                View Stock
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bin Card Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bin Card Overview</CardTitle>
            <Button
              onClick={onNavigateToBinCard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Detailed Bin Card
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BinCardWidget incomingStock={incomingStock} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={onNavigateToStock}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Package className="w-8 h-8 text-bua-red" />
              <span className="font-medium">View All Stock</span>
              <span className="text-xs text-gray-500">
                Browse all incoming stock
              </span>
            </Button>
            <Button
              onClick={onNavigateToBinCard}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <FileText className="w-8 h-8 text-bua-red" />
              <span className="font-medium">Bin Card</span>
              <span className="text-xs text-gray-500">
                Stock movement tracking
              </span>
            </Button>
            <Button
              onClick={onAddStock}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Plus className="w-8 h-8 text-bua-red" />
              <span className="font-medium">Add New Stock</span>
              <span className="text-xs text-gray-500">Add single item</span>
            </Button>
            <Button
              onClick={onImportStock}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-bua-red" />
              <span className="font-medium">Import Stock</span>
              <span className="text-xs text-gray-500">
                Bulk import from CSV
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreKeeperDashboard;
