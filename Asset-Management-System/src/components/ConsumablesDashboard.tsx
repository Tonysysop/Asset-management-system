import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign,
  ArrowRight,
  Plus,
  ArrowDown,
} from "lucide-react";
import type { Consumable, ConsumableTransaction } from "../types/inventory";

interface ConsumablesDashboardProps {
  consumables: Consumable[];
  transactions: ConsumableTransaction[];
  onNavigateToInventory: () => void;
  onReceiveStock: () => void;
  onIssueStock: () => void;
}

const ConsumablesDashboard: React.FC<ConsumablesDashboardProps> = ({
  consumables,
  transactions,
  onNavigateToInventory,
  onReceiveStock,
  onIssueStock,
}) => {
  // Calculate metrics
  const totalItems = consumables.length;
  const lowStockItems = consumables.filter(
    (item) => item.currentQuantity <= item.reorderPoint
  ).length;
  const totalValue = consumables.reduce(
    (sum, item) => sum + item.currentQuantity * item.unitCost,
    0
  );

  // Recent transactions (last 10)
  const recentTransactions = transactions
    .sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    )
    .slice(0, 10);

  // Transactions this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.transactionDate);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const receivedThisMonth = thisMonthTransactions
    .filter((t) => t.transactionType === "receive")
    .reduce((sum, t) => sum + t.quantity, 0);

  const issuedThisMonth = thisMonthTransactions
    .filter((t) => t.transactionType === "issue")
    .reduce((sum, t) => sum + t.quantity, 0);

  // Low stock items
  const lowStockItemsList = consumables.filter(
    (item) => item.currentQuantity <= item.reorderPoint
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-bua-red" />
            Consumables Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Overview of consumables inventory and transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onReceiveStock}
            className="bg-bua-red hover:bg-bua-red/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Receive Stock
          </Button>
          <Button
            onClick={onIssueStock}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowDown className="w-4 h-4" />
            Issue Stock
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Consumable types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₦{totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +{receivedThisMonth} / -{issuedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">Received / Issued</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-800">
                  <span className="font-bold">{lowStockItems}</span> consumable
                  items are below their reorder point.
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  Click below to view and restock these items.
                </p>
              </div>
              <Button
                onClick={onNavigateToInventory}
                className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                View Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Items List */}
      {lowStockItemsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items Needing Reorder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItemsList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.itemName}</p>
                    <p className="text-xs text-gray-600 capitalize">
                      {item.category.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600">
                      {item.currentQuantity} / {item.reorderPoint}
                    </p>
                    <p className="text-xs text-gray-600">Current / Reorder</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {transaction.transactionType === "receive" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.transactionType === "receive"
                          ? "Received"
                          : "Issued"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {transaction.consumableName}
                        {transaction.issuedTo && ` → ${transaction.issuedTo}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {transaction.transactionType === "receive" ? "+" : "-"}
                      {transaction.quantity}
                    </p>
                    <p className="text-xs text-gray-600">
                      {transaction.transactionDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent transactions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={onNavigateToInventory}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Package className="w-8 h-8 text-bua-red" />
              <span className="font-medium">View Inventory</span>
              <span className="text-xs text-gray-500">
                Browse all consumables
              </span>
            </Button>
            <Button
              onClick={onReceiveStock}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Plus className="w-8 h-8 text-bua-red" />
              <span className="font-medium">Receive Stock</span>
              <span className="text-xs text-gray-500">Add new items</span>
            </Button>
            <Button
              onClick={onIssueStock}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <ArrowDown className="w-8 h-8 text-bua-red" />
              <span className="font-medium">Issue Stock</span>
              <span className="text-xs text-gray-500">Issue to users</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumablesDashboard;
