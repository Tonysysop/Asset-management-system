import React, { useState } from "react";
import ConsumablesDashboard from "./ConsumablesDashboard";
import ConsumablesInventory from "./ConsumablesInventory";
import ConsumablesTransactionModal from "./ConsumablesTransactionModal";
import type { Consumable, ConsumableTransaction } from "../types/inventory";

interface ConsumablesViewProps {
  consumables: Consumable[];
  transactions: ConsumableTransaction[];
  onReceiveStock: (consumable: Omit<Consumable, "id">) => void;
  onIssueStock: (transaction: Omit<ConsumableTransaction, "id">) => void;
  onUpdateConsumable: (transaction: Omit<ConsumableTransaction, "id">) => void;
}

const ConsumablesView: React.FC<ConsumablesViewProps> = ({
  consumables,
  transactions,
  onReceiveStock,
  onIssueStock,
  onUpdateConsumable,
}) => {
  const [currentView, setCurrentView] = useState<"dashboard" | "inventory">(
    "dashboard"
  );
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedConsumable, setSelectedConsumable] =
    useState<Consumable | null>(null);

  const handleReceiveStock = (
    data: Omit<Consumable, "id"> | Omit<ConsumableTransaction, "id">
  ) => {
    if ("currentQuantity" in data) {
      // New consumable
      onReceiveStock(data as Omit<Consumable, "id">);
    } else {
      // Transaction for existing consumable
      onUpdateConsumable(data as Omit<ConsumableTransaction, "id">);
    }
  };

  const handleIssueStock = (data: Omit<ConsumableTransaction, "id">) => {
    onIssueStock(data);
  };

  const handleExport = () => {
    const csvContent = [
      [
        "Item Name",
        "Category",
        "Current Stock",
        "Reorder Point",
        "Unit Cost",
        "Total Value",
        "Status",
      ],
      ...consumables.map((item) => [
        item.itemName,
        item.category,
        item.currentQuantity.toString(),
        item.reorderPoint.toString(),
        item.unitCost.toString(),
        (item.currentQuantity * item.unitCost).toString(),
        item.currentQuantity <= item.reorderPoint ? "Low Stock" : "In Stock",
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
      `consumables-inventory-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setCurrentView("dashboard")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            currentView === "dashboard"
              ? "border-bua-red text-bua-red"
              : "border-transparent text-gray-500 hover:text-bua-red"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentView("inventory")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            currentView === "inventory"
              ? "border-bua-red text-bua-red"
              : "border-transparent text-gray-500 hover:text-bua-red"
          }`}
        >
          Inventory
        </button>
      </div>

      {/* Content */}
      {currentView === "dashboard" ? (
        <ConsumablesDashboard
          consumables={consumables}
          transactions={transactions}
          onNavigateToInventory={() => setCurrentView("inventory")}
          onReceiveStock={() => {
            setSelectedConsumable(null);
            setShowReceiveModal(true);
          }}
          onIssueStock={() => {
            setSelectedConsumable(null);
            setShowIssueModal(true);
          }}
        />
      ) : (
        <ConsumablesInventory
          consumables={consumables}
          onReceiveStock={handleReceiveStock}
          onIssueStock={handleIssueStock}
          onExport={handleExport}
        />
      )}

      {/* Modals */}
      <ConsumablesTransactionModal
        isOpen={showReceiveModal}
        onClose={() => {
          setShowReceiveModal(false);
          setSelectedConsumable(null);
        }}
        onSave={handleReceiveStock}
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
        onSave={handleIssueStock}
        transactionType="issue"
        consumable={selectedConsumable}
        existingConsumables={consumables}
      />
    </div>
  );
};

export default ConsumablesView;
