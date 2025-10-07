import React, { useState, useMemo } from "react";
import type { Asset, Action } from "../types/inventory";
import { useActions } from "../hooks/useActions";
import {
  //Eye,
  User,
  Calendar,
  Package,
  AlertCircle,
  X,
} from "lucide-react";
import LoadingAnimation from "./LoadingAnimation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "./ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface AssetTrailModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
}

const AssetTrailModal: React.FC<AssetTrailModalProps> = ({
  asset,
  isOpen,
  onClose,
}) => {
  const { data: allActions = [], isLoading, error } = useActions();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter actions for this specific asset
  const assetActions = useMemo(() => {
    return allActions.filter((action: Action) => {
      if (action.itemType === "asset") {
        return action.assetTag === asset.assetTag;
      }
      return action.itemId === asset.id;
    });
  }, [allActions, asset.assetTag, asset.id]);

  // Pagination logic
  const totalPages = Math.ceil(assetActions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActions = useMemo(() => {
    return assetActions.slice(startIndex, endIndex);
  }, [assetActions, startIndex, endIndex]);

  // Reset to first page when asset changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [asset.id]);

  const onPageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatActionDetails = (details: string) => {
    // Check if this is the new format with user-friendly messages
    if (
      details.includes("Assigned") ||
      details.includes("Updated user assignments") ||
      details.includes("Removed all user assignments")
    ) {
      return {
        mainAction: details,
        changes: [],
      };
    }

    // Handle the old format with "Changes:" separator
    let parts = details.split(". Changes:");
    if (parts.length !== 2) {
      parts = details.split(" Changes:");
    }

    if (parts.length === 2) {
      const mainAction = parts[0];
      const changes = parts[1];

      // Special handling for assignedUsers in old format
      if (changes.includes("assignedUsers:")) {
        const assignedUsersIndex = changes.indexOf("assignedUsers:");
        const afterAssignedUsers = changes.substring(assignedUsersIndex);

        const arrowIndex = afterAssignedUsers.indexOf(" -> ");
        if (arrowIndex !== -1) {
          const oldValue = afterAssignedUsers.substring(12, arrowIndex).trim();
          const newValue = afterAssignedUsers.substring(arrowIndex + 4).trim();

          const commaIndex = newValue.indexOf(", ");
          const finalNewValue =
            commaIndex !== -1 ? newValue.substring(0, commaIndex) : newValue;

          const oldUsers = formatAssignedUsers(oldValue);
          const newUsers = formatAssignedUsers(finalNewValue);

          return {
            mainAction: mainAction,
            changes: [
              {
                field: "User Assignment",
                oldValue: oldUsers,
                newValue: newUsers,
                isAssignedUsers: true,
                isStructured: true,
              },
            ],
          };
        }
      }

      return {
        mainAction,
        changes: changes.split(", ").map((change) => {
          const match = change.match(/^(.+?): (.+?) -> (.+)$/);
          if (match) {
            const [, field, oldValue, newValue] = match;

            if (field === "assignedUsers") {
              return {
                field: "User Assignment",
                oldValue: formatAssignedUsers(oldValue),
                newValue: formatAssignedUsers(newValue),
                isAssignedUsers: true,
                isStructured: true,
              };
            }

            return {
              field: field.charAt(0).toUpperCase() + field.slice(1),
              oldValue: oldValue as string,
              newValue: newValue as string,
              isAssignedUsers: false,
              isStructured: true,
            };
          }
          return {
            field: change,
            oldValue: "",
            newValue: "",
            isAssignedUsers: false,
            isStructured: false,
          };
        }),
      };
    }

    return { mainAction: details, changes: [] };
  };

  const formatAssignedUsers = (
    value: string
  ): {
    type: string;
    users: Array<{
      name: string;
      email: string;
      department: string;
      assignedDate: string;
      quantity: string;
    }>;
  } => {
    if (value === "null" || value === "") {
      return { type: "none", users: [] };
    }

    try {
      const users: Array<{
        name: string;
        email: string;
        department: string;
        assignedDate: string;
        quantity: string;
      }> = [];
      const userMatches = value.match(/\{[^}]*\}/g);

      if (userMatches) {
        userMatches.forEach((userMatch) => {
          const userStr = userMatch.slice(1, -1);

          const nameMatch = userStr.match(/name:\s*([^,]+)/);
          const emailMatch = userStr.match(/email:\s*([^,]+)/);
          const departmentMatch = userStr.match(/department:\s*([^,]+)/);
          const dateMatch = userStr.match(/assignedDate:\s*([^,]+)/);
          const quantityMatch = userStr.match(/quantityAssigned:\s*(\d+)/);

          if (nameMatch) {
            users.push({
              name: nameMatch[1].trim(),
              email: emailMatch ? emailMatch[1].trim() : "",
              department: departmentMatch ? departmentMatch[1].trim() : "",
              assignedDate: dateMatch ? dateMatch[1].trim() : "",
              quantity: quantityMatch ? quantityMatch[1] : "0",
            });
          }
        });
      }

      return { type: "users", users };
    } catch {
      return { type: "error", users: [] };
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Audit Trail for {asset.assetTag}
            </DialogTitle>
            <DialogDescription>
              Loading audit trail for this asset...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-16">
            <LoadingAnimation
              size="lg"
              text="Loading audit trail..."
              className="py-8"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Audit Trail for {asset.assetTag}
            </DialogTitle>
            <DialogDescription>
              Error loading audit trail for this asset.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-16">
            <p className="text-red-600">
              Error loading audit trail. Please try again.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Audit Trail for {asset.assetTag}
              </DialogTitle>
              <DialogDescription>
                Complete audit trail showing all actions performed on this asset
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Asset Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {asset.assetTag} - {asset.brand} {asset.model}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {asset.type} • {asset.department} •{" "}
              {asset.assignedUser || "Unassigned"}
            </p>
          </div>

          {/* Actions Accordion */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {assetActions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Package className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No audit trail found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No actions have been recorded for this asset yet.
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {paginatedActions.map((action) => {
                  const { mainAction, changes } = formatActionDetails(
                    action.details
                  );
                  return (
                    <AccordionItem key={action.id} value={action.id}>
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{action.user}</span>
                            </div>
                            <Badge
                              variant={getActionBadgeVariant(action.actionType)}
                            >
                              {action.actionType}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {new Date(action.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                              {mainAction}
                            </p>
                            {changes.length > 0 && (
                              <p className="text-xs text-gray-500">
                                {changes.length} change
                                {changes.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-4 pt-2">
                          {/* Basic Information */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle className="w-4 h-4 text-bua-red" />
                              <h4 className="text-sm font-semibold text-gray-900">
                                Action Details
                              </h4>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-sm text-gray-900">
                                {mainAction}
                              </p>
                            </div>
                          </div>

                          {/* Changes Made */}
                          {changes.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Changes Made
                                </h4>
                              </div>
                              <div className="space-y-3">
                                {changes.map((change, index) => (
                                  <div
                                    key={index}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                                  >
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {change.field}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="p-4">
                                      {change.isAssignedUsers ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                                                Before
                                              </span>
                                            </div>
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                              {typeof change.oldValue ===
                                                "object" &&
                                              change.oldValue.type ===
                                                "none" ? (
                                                <p className="text-sm text-gray-700">
                                                  No users assigned
                                                </p>
                                              ) : typeof change.oldValue ===
                                                  "object" &&
                                                change.oldValue.type ===
                                                  "users" &&
                                                change.oldValue.users.length >
                                                  0 ? (
                                                <div className="space-y-2">
                                                  {change.oldValue.users.map(
                                                    (
                                                      user: {
                                                        name: string;
                                                        email: string;
                                                        department: string;
                                                        assignedDate: string;
                                                        quantity: string;
                                                      },
                                                      userIndex: number
                                                    ) => (
                                                      <div
                                                        key={userIndex}
                                                        className="space-y-1"
                                                      >
                                                        <p className="text-sm font-medium text-gray-900">
                                                          User {userIndex + 1}:
                                                        </p>
                                                        <div className="ml-2 space-y-1 text-xs text-gray-700">
                                                          <p>
                                                            <span className="font-medium">
                                                              Name:
                                                            </span>{" "}
                                                            {user.name}
                                                          </p>
                                                          <p>
                                                            <span className="font-medium">
                                                              Email:
                                                            </span>{" "}
                                                            {user.email}
                                                          </p>
                                                          <p>
                                                            <span className="font-medium">
                                                              Department:
                                                            </span>{" "}
                                                            {user.department}
                                                          </p>
                                                          <p>
                                                            <span className="font-medium">
                                                              Assigned Date:
                                                            </span>{" "}
                                                            {user.assignedDate}
                                                          </p>
                                                          <p>
                                                            <span className="font-medium">
                                                              Quantity:
                                                            </span>{" "}
                                                            {user.quantity}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="text-sm text-gray-700">
                                                  No users assigned
                                                </p>
                                              )}
                                            </div>
                                          </div>

                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                                After
                                              </span>
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                              {typeof change.newValue ===
                                                "object" &&
                                              change.newValue.type ===
                                                "none" ? (
                                                <p className="text-sm text-gray-700">
                                                  No users assigned
                                                </p>
                                              ) : typeof change.newValue ===
                                                  "object" &&
                                                change.newValue.type ===
                                                  "users" &&
                                                change.newValue.users.length >
                                                  0 ? (
                                                <div className="space-y-2">
                                                  {change.newValue.users.map(
                                                    (
                                                      user: {
                                                        name: string;
                                                        email: string;
                                                        department: string;
                                                        assignedDate: string;
                                                        quantity: string;
                                                      },
                                                      userIndex: number
                                                    ) => (
                                                      <div
                                                        key={userIndex}
                                                        className="space-y-1"
                                                      >
                                                        <p className="text-sm font-medium text-gray-900">
                                                          User {userIndex + 1}:
                                                        </p>
                                                        <div className="ml-2 space-y-1 text-xs text-gray-700">
                                                          <p>
                                                            <span className="font-medium">
                                                              Name:
                                                            </span>{" "}
                                                            {user.name}
                                                          </p>
                                                          <p>
                                                            <span className="font-medium">
                                                              Email:
                                                            </span>{" "}
                                                            {user.email}
                                                          </p>
                                                          <p>
                                                            <span className="font-medium">
                                                              Department:
                                                            </span>{" "}
                                                            {user.department}
                                                          </p>
                                                          <p>
                                                            <span className="font-medium">
                                                              Assigned Date:
                                                            </span>{" "}
                                                            {user.assignedDate}
                                                          </p>
                                                          <p>
                                                            <span className="font-medium">
                                                              Quantity:
                                                            </span>{" "}
                                                            {user.quantity}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="text-sm text-gray-700">
                                                  No users assigned
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                                                Previous Value
                                              </span>
                                            </div>
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                              <p className="text-sm font-mono text-gray-700">
                                                {change.oldValue as string}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                                New Value
                                              </span>
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                              <p className="text-sm font-mono text-gray-700">
                                                {change.newValue as string}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, assetActions.length)} of{" "}
                {assetActions.length} actions
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPageChange(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => onPageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => onPageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Total Actions: {assetActions.length}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Last updated:{" "}
                {assetActions.length > 0
                  ? new Date(assetActions[0].timestamp).toLocaleString()
                  : "Never"}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetTrailModal;
