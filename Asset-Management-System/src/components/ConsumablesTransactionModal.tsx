import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ArrowUp, ArrowDown } from "lucide-react";
import type {
  Consumable,
  ConsumableTransaction,
  ConsumableCategory,
} from "../types/inventory";

interface ConsumablesTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<Consumable, "id"> | Omit<ConsumableTransaction, "id">
  ) => void;
  transactionType: "receive" | "issue";
  consumable?: Consumable | null;
  existingConsumables?: Consumable[];
}

const ConsumablesTransactionModal: React.FC<
  ConsumablesTransactionModalProps
> = ({
  isOpen,
  onClose,
  onSave,
  transactionType,
  consumable,
  existingConsumables = [],
}) => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "cables" as ConsumableCategory,
    description: "",
    quantity: "",
    unitCost: "",
    supplier: "",
    issuedTo: "",
    emailAddress: "",
    department: "",
    reason: "",
    reference: "",
    notes: "",
  });

  const [isNewItem, setIsNewItem] = useState(true);
  const [selectedConsumableId, setSelectedConsumableId] = useState("");

  useEffect(() => {
    if (consumable && transactionType === "receive") {
      setFormData({
        itemName: consumable.itemName,
        category: consumable.category,
        description: consumable.description,
        quantity: "",
        unitCost: consumable.unitCost.toString(),
        supplier: consumable.supplier || "",
        issuedTo: "",
        emailAddress: "",
        department: "",
        reason: "",
        reference: "",
        notes: "",
      });
      setIsNewItem(false);
    } else if (consumable && transactionType === "issue") {
      setFormData({
        itemName: consumable.itemName,
        category: consumable.category,
        description: consumable.description,
        quantity: "",
        unitCost: consumable.unitCost.toString(),
        supplier: "",
        issuedTo: "",
        emailAddress: "",
        department: "",
        reason: "",
        reference: "",
        notes: "",
      });
      setIsNewItem(false);
      setSelectedConsumableId(consumable.id);
    } else if (transactionType === "issue" && !consumable) {
      // For issue transactions without pre-selected consumable
      setFormData({
        itemName: "",
        category: "cables" as ConsumableCategory,
        description: "",
        quantity: "",
        unitCost: "",
        supplier: "",
        issuedTo: "",
        emailAddress: "",
        department: "",
        reason: "",
        reference: "",
        notes: "",
      });
      setIsNewItem(false);
      setSelectedConsumableId("");
    } else {
      setFormData({
        itemName: "",
        category: "cables" as ConsumableCategory,
        description: "",
        quantity: "",
        unitCost: "",
        supplier: "",
        issuedTo: "",
        emailAddress: "",
        department: "",
        reason: "",
        reference: "",
        notes: "",
      });
      setIsNewItem(true);
      setSelectedConsumableId("");
    }
  }, [consumable, transactionType, isOpen]);

  const handleConsumableSelect = (consumableId: string) => {
    const selectedConsumable = existingConsumables.find(
      (c) => c.id === consumableId
    );
    if (selectedConsumable) {
      setSelectedConsumableId(consumableId);
      setFormData((prev) => ({
        ...prev,
        itemName: selectedConsumable.itemName,
        category: selectedConsumable.category,
        description: selectedConsumable.description,
        unitCost: selectedConsumable.unitCost.toString(),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (transactionType === "receive") {
      if (isNewItem) {
        // Create new consumable
        const newConsumable: Omit<Consumable, "id"> = {
          itemName: formData.itemName,
          category: formData.category,
          description: formData.description,
          currentQuantity: parseInt(formData.quantity),
          reorderPoint: 10, // Default reorder point
          unitCost: parseFloat(formData.unitCost),
          supplier: formData.supplier || undefined,
          lastReceivedDate: new Date().toISOString().split("T")[0],
          totalReceived: parseInt(formData.quantity),
          totalIssued: 0,
          notes: formData.notes || undefined,
        };
        onSave(newConsumable);
      } else {
        // Add to existing consumable
        const transaction: Omit<ConsumableTransaction, "id"> = {
          consumableId: consumable!.id,
          consumableName: consumable!.itemName,
          transactionType: "receive",
          quantity: parseInt(formData.quantity),
          unitCost: parseFloat(formData.unitCost),
          totalCost:
            parseInt(formData.quantity) * parseFloat(formData.unitCost),
          transactionDate: new Date().toISOString().split("T")[0],
          issuedBy: "store@buagroup.com", // Current user
          reference: formData.reference || undefined,
          notes: formData.notes || undefined,
        };
        onSave(transaction);
      }
    } else {
      // Issue transaction
      const targetConsumable =
        consumable ||
        existingConsumables.find((c) => c.id === selectedConsumableId);
      if (!targetConsumable) {
        alert("Please select a consumable to issue");
        return;
      }

      const transaction: Omit<ConsumableTransaction, "id"> = {
        consumableId: targetConsumable.id,
        consumableName: targetConsumable.itemName,
        transactionType: "issue",
        quantity: parseInt(formData.quantity),
        unitCost: parseFloat(formData.unitCost),
        totalCost: parseInt(formData.quantity) * parseFloat(formData.unitCost),
        transactionDate: new Date().toISOString().split("T")[0],
        issuedTo: formData.issuedTo,
        emailAddress: formData.emailAddress || undefined,
        issuedBy: "store@buagroup.com", // Current user
        department: formData.department || undefined,
        reason: formData.reason || undefined,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      };
      onSave(transaction);
    }

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      itemName: "",
      category: "cables" as ConsumableCategory,
      description: "",
      quantity: "",
      unitCost: "",
      supplier: "",
      issuedTo: "",
      emailAddress: "",
      department: "",
      reason: "",
      reference: "",
      notes: "",
    });
    setSelectedConsumableId("");
    onClose();
  };

  const targetConsumable =
    consumable ||
    existingConsumables.find((c) => c.id === selectedConsumableId);
  const maxIssueQuantity = targetConsumable
    ? targetConsumable.currentQuantity
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {transactionType === "receive" ? (
              <>
                <ArrowUp className="w-5 h-5 text-green-600" />
                Receive Consumables
              </>
            ) : (
              <>
                <ArrowDown className="w-5 h-5 text-red-600" />
                Issue Consumables
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {transactionType === "receive"
              ? "Add new consumables to inventory or receive more stock"
              : "Issue consumables to users or departments"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Consumable Selection for Issue Transactions */}
          {transactionType === "issue" && !consumable && (
            <div className="space-y-2">
              <Label htmlFor="consumableSelect">
                Select Consumable to Issue *
              </Label>
              <select
                id="consumableSelect"
                value={selectedConsumableId}
                onChange={(e) => handleConsumableSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red"
                required
              >
                <option value="">Choose a consumable...</option>
                {existingConsumables
                  .filter((c) => c.currentQuantity > 0)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} - Available: {item.currentQuantity} units
                    </option>
                  ))}
              </select>
              {targetConsumable && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {targetConsumable.itemName}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {targetConsumable.category.replace("_", " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">
                        Available: {targetConsumable.currentQuantity} units
                      </p>
                      <p className="text-xs text-gray-600">
                        ₦{targetConsumable.unitCost.toLocaleString()} per unit
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {transactionType === "receive" && isNewItem && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={formData.itemName}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                    required
                    placeholder="e.g., USB-C Cable"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ConsumableCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red"
                    required
                  >
                    <option value="cables">Cables</option>
                    <option value="peripherals">Peripherals</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="networking">Networking</option>
                    <option value="accessories">Accessories</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the item"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity *{" "}
                {transactionType === "issue" && `(Max: ${maxIssueQuantity})`}
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
                min="1"
                max={transactionType === "issue" ? maxIssueQuantity : undefined}
                placeholder="Enter quantity"
              />
            </div>

            {transactionType === "receive" && (
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (₦) *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) =>
                    setFormData({ ...formData, unitCost: e.target.value })
                  }
                  required
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {transactionType === "receive" && (
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="Supplier name"
              />
            </div>
          )}

          {transactionType === "issue" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issuedTo">Issued To *</Label>
                  <Input
                    id="issuedTo"
                    value={formData.issuedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, issuedTo: e.target.value })
                    }
                    required
                    placeholder="Employee name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, emailAddress: e.target.value })
                    }
                    placeholder="user@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Purpose or reason for issue"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="reference">Reference/PO Number</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              placeholder="Optional reference number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red"
              rows={3}
              placeholder="Additional notes"
            />
          </div>

          {transactionType === "receive" &&
            formData.quantity &&
            formData.unitCost && (
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm font-medium text-blue-900">
                  Total Cost: ₦
                  {(
                    parseInt(formData.quantity) * parseFloat(formData.unitCost)
                  ).toLocaleString()}
                </p>
              </div>
            )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-bua-red hover:bg-bua-red/90">
              {transactionType === "receive" ? "Receive Stock" : "Issue Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsumablesTransactionModal;
