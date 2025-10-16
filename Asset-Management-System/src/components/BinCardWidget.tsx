import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, Package, AlertCircle } from "lucide-react";
import type { IncomingStock } from "../types/inventory";

interface BinCardWidgetProps {
  incomingStock: IncomingStock[];
}

interface StockMovement {
  type: "in" | "out";
  date: string;
  quantity: number;
  reference: string;
  user?: string;
}

const BinCardWidget: React.FC<BinCardWidgetProps> = ({ incomingStock }) => {
  // Calculate stock movements
  const totalIn = incomingStock.length;
  const totalOut = incomingStock.filter(
    (item) => item.status === "in-use"
  ).length;
  const currentBalance = totalIn - totalOut;

  // Calculate stock by type
  const stockByType = incomingStock.reduce((acc, item) => {
    const type = item.assetType;
    if (!acc[type]) {
      acc[type] = { total: 0, in: 0, out: 0 };
    }
    acc[type].total++;
    if (item.status === "incoming") {
      acc[type].in++;
    } else {
      acc[type].out++;
    }
    return acc;
  }, {} as Record<string, { total: number; in: number; out: number }>);

  // Get recent movements (last 10)
  const recentMovements: StockMovement[] = [
    ...incomingStock
      .filter((item) => item.status === "incoming")
      .map((item) => ({
        type: "in" as const,
        date: new Date().toISOString().split("T")[0],
        quantity: 1,
        reference: item.serialNumber,
      })),
    ...incomingStock
      .filter((item) => item.status === "in-use" && item.allocatedDate)
      .map((item) => ({
        type: "out" as const,
        date: item.allocatedDate!,
        quantity: 1,
        reference: item.allocatedAssetTag || item.serialNumber,
        user: item.allocatedBy,
      })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Check for low stock (less than 5 items)
  const lowStockTypes = Object.entries(stockByType)
    .filter(([_, data]) => data.in < 5)
    .map(([type]) => type);

  return (
    <div className="space-y-6">
      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIn}</div>
            <p className="text-xs text-muted-foreground">Items received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalOut}</div>
            <p className="text-xs text-muted-foreground">Items allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Balance on Hand
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentBalance}
            </div>
            <p className="text-xs text-muted-foreground">Available stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockTypes.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800">
              The following asset types are running low on stock:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium capitalize"
                >
                  {type}: {stockByType[type].in} remaining
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Stock by Asset Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stockByType).map(([type, data]) => {
              const balance = data.in;
              const percentage =
                data.total > 0
                  ? ((data.in / data.total) * 100).toFixed(0)
                  : "0";

              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium">{type}</span>
                      <span className="text-xs text-gray-500">
                        ({data.total} total)
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 text-xs">
                        +{data.in} IN
                      </span>
                      <span className="text-red-600 text-xs">
                        -{data.out} OUT
                      </span>
                      <span className="font-semibold text-blue-600">
                        {balance} Balance
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMovements.length > 0 ? (
            <div className="space-y-2">
              {recentMovements.map((movement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {movement.type === "in" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {movement.type === "in" ? "Received" : "Issued"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Ref: {movement.reference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {movement.type === "in" ? "+" : "-"}
                      {movement.quantity}
                    </p>
                    <p className="text-xs text-gray-600">{movement.date}</p>
                    {movement.user && (
                      <p className="text-xs text-gray-500">{movement.user}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent movements</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BinCardWidget;
