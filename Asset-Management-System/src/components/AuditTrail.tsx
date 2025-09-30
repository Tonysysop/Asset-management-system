import React, { useState, useEffect } from "react";
import type { Action } from "../types/inventory";
import { getActions } from "../services/actionService";
import { Eye, User, Calendar, Tag, Package, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
import { Badge } from "./ui/badge";

const AuditTrail: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    const fetchActions = async () => {
      const fetchedActions = await getActions();
      setActions(fetchedActions);
    };
    fetchActions();
  }, []);

  const getItemId = (action: Action) => {
    if (action.itemType === "asset") {
      return action.assetTag;
    }
    return action.itemId;
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

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType) {
      case "asset":
        return <Package className="w-4 h-4" />;
      case "receivable":
        return <Tag className="w-4 h-4" />;
      case "license":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
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
    // Try both formats: ". Changes:" and " Changes:"
    let parts = details.split(". Changes:");
    if (parts.length !== 2) {
      parts = details.split(" Changes:");
    }

    if (parts.length === 2) {
      const mainAction = parts[0];
      const changes = parts[1];

      // Special handling for assignedUsers in old format - convert to user-friendly format
      // Check if the changes contain assignedUsers
      if (changes.includes("assignedUsers:")) {
        // Split by assignedUsers and extract the parts
        const assignedUsersIndex = changes.indexOf("assignedUsers:");
        const afterAssignedUsers = changes.substring(assignedUsersIndex);

        // Extract the old and new values using a more flexible approach
        const arrowIndex = afterAssignedUsers.indexOf(" -> ");
        if (arrowIndex !== -1) {
          const oldValue = afterAssignedUsers.substring(12, arrowIndex).trim(); // Skip 'assignedUsers: '
          const newValue = afterAssignedUsers.substring(arrowIndex + 4).trim(); // Skip ' -> '

          // Remove any trailing commas or other changes
          const commaIndex = newValue.indexOf(", ");
          const finalNewValue =
            commaIndex !== -1 ? newValue.substring(0, commaIndex) : newValue;

          const assignedUsersMatch = [
            "assignedUsers:",
            oldValue,
            finalNewValue,
          ];

          const oldUsers = formatAssignedUsers(oldValue);
          const newUsers = formatAssignedUsers(finalNewValue);

          // Create a structured user-friendly message
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
          // Parse each change to extract field and values
          const match = change.match(/^(.+?): (.+?) -> (.+)$/);
          if (match) {
            const [, field, oldValue, newValue] = match;

            // Special handling for assignedUsers field
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
              oldValue,
              newValue,
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

    // Fallback: if the message contains assignedUsers but doesn't match the above patterns
    if (details.includes("assignedUsers:") && details.includes(" -> ")) {
      // Try to extract assignedUsers change from the entire message
      const assignedUsersIndex = details.indexOf("assignedUsers:");
      const afterAssignedUsers = details.substring(assignedUsersIndex);

      const arrowIndex = afterAssignedUsers.indexOf(" -> ");
      if (arrowIndex !== -1) {
        const oldValue = afterAssignedUsers.substring(12, arrowIndex).trim(); // Skip 'assignedUsers: '
        const newValue = afterAssignedUsers.substring(arrowIndex + 4).trim(); // Skip ' -> '

        // Remove any trailing content after the object
        const braceEnd = newValue.lastIndexOf("}");
        const finalNewValue =
          braceEnd !== -1 ? newValue.substring(0, braceEnd + 1) : newValue;

        // Extract the main action (everything before assignedUsers)
        const mainAction = details.substring(0, assignedUsersIndex).trim();

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

    return { mainAction: details, changes: [] };
  };

  const formatAssignedUsers = (value: string): any => {
    if (value === "null" || value === "") {
      return { type: "none", users: [] };
    }

    try {
      // Parse the formatted object string back to extract user information
      const users = [];

      // Extract user objects from the string
      const userMatches = value.match(/\{[^}]*\}/g);

      if (userMatches) {
        userMatches.forEach((userMatch) => {
          const userStr = userMatch.slice(1, -1); // Remove { and }

          // Extract individual fields
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
    } catch (error) {
      return { type: "error", users: [] };
    }
  };

  const extractItemName = (mainAction: string): string => {
    // Extract item name from patterns like "Updated receivable \"Item Name\" (ID: ...)"
    const quotedMatch = mainAction.match(/Updated\s+\w+\s+"([^"]+)"/);
    if (quotedMatch) {
      return quotedMatch[1];
    }

    // Fallback: try to extract from ID pattern
    const idMatch = mainAction.match(/with id (\w+)/);
    if (idMatch) {
      return `Item ID: ${idMatch[1]}`;
    }

    return "Unknown Item";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold">Audit Trail</h2>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead className="w-[120px]">Item Type</TableHead>
              <TableHead className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Item ID / Asset Tag
                </div>
              </TableHead>
              <TableHead className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timestamp
                </div>
              </TableHead>
              <TableHead className="w-auto">Details</TableHead>
              <TableHead className="w-[80px]">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action) => {
              const { mainAction, changes } = formatActionDetails(
                action.details
              );
              return (
                <TableRow key={action.id}>
                  <TableCell className="truncate font-medium">
                    {action.user}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(action.actionType)}>
                      {action.actionType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getItemTypeIcon(action.itemType)}
                      <span className="capitalize">{action.itemType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="truncate font-mono text-sm">
                    {getItemId(action)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(action.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p
                        className="text-sm font-medium truncate"
                        title={mainAction}
                      >
                        {mainAction}
                      </p>
                      {changes.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {changes.length} change{changes.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getItemTypeIcon(action.itemType)}
                            Action Details
                          </DialogTitle>
                          <DialogDescription>
                            Detailed information about this audit trail entry
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          {/* Basic Information */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-border">
                              <User className="w-4 h-4 text-bua-red" />
                              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                Basic Information
                              </h3>
                            </div>
                            <div className="grid gap-3">
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                                  <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    User
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {action.user}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                                  <Tag className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Action Type
                                  </p>
                                  <Badge
                                    variant={getActionBadgeVariant(
                                      action.actionType
                                    )}
                                  >
                                    {action.actionType}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                                  {getItemTypeIcon(action.itemType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Item Type
                                  </p>
                                  <p className="text-sm text-foreground capitalize">
                                    {action.itemType}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                                  <Tag className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Item ID
                                  </p>
                                  <p className="text-sm text-foreground font-mono">
                                    {getItemId(action)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Timestamp
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {new Date(
                                      action.timestamp
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                                  <Package className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Item Name
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {extractItemName(mainAction)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Details */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-border">
                              <AlertCircle className="w-4 h-4 text-bua-red" />
                              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                Action Details
                              </h3>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">
                                    Action Description
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 mb-1">
                                    {mainAction.split(".")[0]}
                                  </p>
                                  {mainAction.includes(".") && (
                                    <p className="text-xs text-gray-600">
                                      {mainAction
                                        .split(".")
                                        .slice(1)
                                        .join(".")
                                        .trim()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {changes.length > 0 && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-border">
                                  <AlertCircle className="w-4 h-4 text-orange-600" />
                                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                    Changes Made
                                  </h3>
                                </div>

                                {changes.map((change, index) => (
                                  <div
                                    key={index}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                                  >
                                    {/* Change Header */}
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {change.field}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Change Content */}
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
                                              {change.oldValue.type ===
                                              "none" ? (
                                                <p className="text-sm text-gray-700">
                                                  No users assigned
                                                </p>
                                              ) : change.oldValue.type ===
                                                  "users" &&
                                                change.oldValue.users.length >
                                                  0 ? (
                                                <div className="space-y-2">
                                                  {change.oldValue.users.map(
                                                    (user, userIndex) => (
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
                                              {change.newValue.type ===
                                              "none" ? (
                                                <p className="text-sm text-gray-700">
                                                  No users assigned
                                                </p>
                                              ) : change.newValue.type ===
                                                  "users" &&
                                                change.newValue.users.length >
                                                  0 ? (
                                                <div className="space-y-2">
                                                  {change.newValue.users.map(
                                                    (user, userIndex) => (
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
                                                {change.oldValue}
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
                                                {change.newValue}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuditTrail;
