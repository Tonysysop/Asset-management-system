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

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  requireAssetTag?: boolean;
  assetTag?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  requireAssetTag = false,
  assetTag = "",
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [typedAssetTag, setTypedAssetTag] = useState("");

  const handleConfirm = async () => {
    if (requireAssetTag && typedAssetTag !== assetTag) {
      return; // Don't proceed if asset tag doesn't match
    }

    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      setTypedAssetTag(""); // Reset the input
      onClose();
    }
  };

  const handleClose = () => {
    setTypedAssetTag(""); // Reset the input when closing
    onClose();
  };

  const isConfirmDisabled =
    isConfirming || (requireAssetTag && typedAssetTag !== assetTag);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {requireAssetTag && (
          <div className="py-4">
            <Label htmlFor="assetTag" className="text-sm font-medium">
              To confirm deletion, type the asset tag:{" "}
              <span className="font-bold text-bua-red">{assetTag}</span>
            </Label>
            <Input
              id="assetTag"
              value={typedAssetTag}
              onChange={(e) => setTypedAssetTag(e.target.value)}
              placeholder="Enter asset tag"
              className="mt-2"
              autoComplete="off"
            />
            {typedAssetTag && typedAssetTag !== assetTag && (
              <p className="text-sm text-red-600 mt-1">
                Asset tag does not match
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isConfirming ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
