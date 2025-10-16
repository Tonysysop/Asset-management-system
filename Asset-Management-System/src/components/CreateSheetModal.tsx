import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { IncomingStock } from "../types/inventory";

interface CreateSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSheet: (sheetData: {
    name: string;
    description: string;
    items: IncomingStock[];
  }) => void;
  selectedItems: IncomingStock[];
}

const CreateSheetModal: React.FC<CreateSheetModalProps> = ({
  isOpen,
  onClose,
  onCreateSheet,
  selectedItems,
}) => {
  const [sheetName, setSheetName] = useState("");
  const [sheetDescription, setSheetDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sheetName.trim() && selectedItems.length > 0) {
      onCreateSheet({
        name: sheetName.trim(),
        description: sheetDescription.trim(),
        items: selectedItems,
      });
      setSheetName("");
      setSheetDescription("");
      onClose();
    }
  };

  const handleClose = () => {
    setSheetName("");
    setSheetDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Asset Sheet</DialogTitle>
          <DialogDescription>
            Create a new sheet with {selectedItems.length} selected items for
            assignment to inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheetName">Sheet Name *</Label>
            <Input
              id="sheetName"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="e.g., Q1 2024 Laptop Deployment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheetDescription">Description</Label>
            <Textarea
              id="sheetDescription"
              value={sheetDescription}
              onChange={(e) => setSheetDescription(e.target.value)}
              placeholder="Brief description of this sheet..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Selected Items ({selectedItems.length})</Label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {selectedItems.map((item) => (
                <div key={item.id} className="text-sm py-1">
                  • {item.itemName} - {item.brand}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-bua-red hover:bg-bua-red/90">
              Create Sheet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSheetModal;
