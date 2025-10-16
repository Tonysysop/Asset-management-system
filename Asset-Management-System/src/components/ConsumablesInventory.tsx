import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Package,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  TrendingUp,
  Download,
  Search,
} from "lucide-react";
import ConsumablesTransactionModal from "./ConsumablesTransactionModal";
import type { Consumable, ConsumableTransaction } from "../types/inventory";

interface ConsumablesInventoryProps {
  consumables: Consumable[];
  onReceiveStock: (consumable: Omit<Consumable, "id">) => void;
  onIssueStock: (transaction: Omit<ConsumableTransaction, "id">) => void;
  onExport: () => void;
}

const ConsumablesInventory: React.FC<ConsumablesInventoryProps> = ({
  consumables,
  onReceiveStock,
  onIssueStock,
  onExport,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedConsumable, setSelectedConsumable] =
    useState<Consumable | null>(null);

  // Filter consumables
  const filteredConsumables = useMemo(() => {
    return consumables.filter((item) => {
      const matchesSearch = item.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [consumables, searchTerm, selectedCategory]);

  // Get categories
  const categories = useMemo(() => {
    return Array.from(new Set(consumables.map((item) => item.category)));
  }, [consumables]);

  // Calculate metrics
  const totalItems = consumables.length;
  const lowStockItems = consumables.filter(
    (item) => item.currentQuantity <= item.reorderPoint
  ).length;
  const totalValue = consumables.reduce(
    (sum, item) => sum + item.currentQuantity * item.unitCost,
    0
  );

  // Handle receive
  const handleReceive = (consumable: Consumable) => {
    setSelectedConsumable(consumable);
    setShowReceiveModal(true);
  };

  // Handle issue
  const handleIssue = (consumable: Consumable) => {
    setSelectedConsumable(consumable);
    setShowIssueModal(true);
  };

  // Handle receive data
  const handleReceiveData = (
    data: Omit<Consumable, "id"> | Omit<ConsumableTransaction, "id">
  ) => {
    if ("itemName" in data) {
      onReceiveStock(data);
    } else {
      onIssueStock(data);
    }
  };

  // Handle issue data
  const handleIssueData = (
    data: Omit<Consumable, "id"> | Omit<ConsumableTransaction, "id">
  ) => {
    onIssueStock(data as Omit<ConsumableTransaction, "id">);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-bua-red" />
            Consumables Inventory
          </h2>
          <p className="text-gray-600 mt-1">
            Manage bulk consumables - cables, peripherals, and supplies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              Total Inventory Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₦{totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
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
            <p className="text-orange-800">
              <span className="font-bold">{lowStockItems}</span> consumable
              items are below their reorder point and need to be restocked.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search consumables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Consumables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Consumables Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConsumables.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No consumables found</p>
              <p className="text-sm">
                Add your first consumable to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Item Name</th>
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-center p-3 font-semibold">
                      Current Stock
                    </th>
                    <th className="text-center p-3 font-semibold">
                      Reorder Point
                    </th>
                    <th className="text-right p-3 font-semibold">Unit Cost</th>
                    <th className="text-right p-3 font-semibold">
                      Total Value
                    </th>
                    <th className="text-center p-3 font-semibold">Status</th>
                    <th className="text-center p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsumables.map((item) => {
                    const isLowStock =
                      item.currentQuantity <= item.reorderPoint;
                    const totalValue = item.currentQuantity * item.unitCost;

                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600 capitalize">
                            {item.category.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-semibold">
                            {item.currentQuantity}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-sm text-gray-600">
                            {item.reorderPoint}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm">
                            ₦{item.unitCost.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-semibold">
                            ₦{totalValue.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {isLowStock ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() => handleReceive(item)}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <ArrowUp className="w-3 h-3" />
                              Receive
                            </Button>
                            <Button
                              onClick={() => handleIssue(item)}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={item.currentQuantity === 0}
                            >
                              <ArrowDown className="w-3 h-3" />
                              Issue
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Button */}
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={() => setShowReceiveModal(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-bua-red hover:bg-bua-red/90"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Modals */}
      <ConsumablesTransactionModal
        isOpen={showReceiveModal}
        onClose={() => {
          setShowReceiveModal(false);
          setSelectedConsumable(null);
        }}
        onSave={handleReceiveData}
        transactionType="receive"
        consumable={selectedConsumable}
        existingConsumables={consumables}
      />

      <ConsumablesTransactionModal
        isOpen={showIssueModal}
        onClose={() => {
          setShowIssueModal(false);
          setSelectedConsumable(null);
        }}
        onSave={handleIssueData}
        transactionType="issue"
        consumable={selectedConsumable}
        existingConsumables={consumables}
      />
    </div>
  );
};

export default ConsumablesInventory;
