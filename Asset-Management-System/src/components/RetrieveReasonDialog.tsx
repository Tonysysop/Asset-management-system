import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArchiveRestore } from "lucide-react";

interface RetrieveReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: "spare" | "repair") => void;
  assetTag: string;
}

const RetrieveReasonDialog: React.FC<RetrieveReasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assetTag,
}) => {
  const [selectedReason, setSelectedReason] = useState<"spare" | "repair" | "">(
    ""
  );

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason);
      setSelectedReason("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArchiveRestore className="w-5 h-5 text-bua-red" />
            Retrieve Asset
          </DialogTitle>
          <DialogDescription>
            Please select the reason for retrieving asset{" "}
            <strong>{assetTag}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="retrieve-reason" className="text-sm font-medium">
              Retrieval Reason
            </Label>
            <Select
              value={selectedReason}
              onValueChange={(value: "spare" | "repair") =>
                setSelectedReason(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spare">Spare</SelectItem>
                <SelectItem value="repair">Out for Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Spare:</strong> Asset will be available for future
              deployment
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Out for Repair:</strong> Asset is being repaired or
              maintained
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedReason}
            className="bg-bua-red hover:bg-bua-dark-red"
          >
            Retrieve Asset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RetrieveReasonDialog;
