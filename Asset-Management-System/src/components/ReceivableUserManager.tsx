import React, { useState } from "react";
import type { ReceivableUser } from "../types/inventory";
import { Plus, Trash2, Edit2, Calendar } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface ReceivableUserManagerProps {
  assignedUsers: ReceivableUser[];
  onUsersChange: (users: ReceivableUser[]) => void;
  maxQuantity: number;
  totalAssignedQuantity: number;
}

const ReceivableUserManager: React.FC<ReceivableUserManagerProps> = ({
  assignedUsers,
  onUsersChange,
  maxQuantity,
  totalAssignedQuantity,
}) => {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<ReceivableUser | null>(null);
  const [newUser, setNewUser] = useState<Omit<ReceivableUser, "id">>({
    name: "",
    email: "",
    department: "",
    assignedDate: new Date().toISOString().split("T")[0],
    quantityAssigned: 1,
  });

  const availableQuantity = maxQuantity - totalAssignedQuantity;

  const handleAddUser = () => {
    if (availableQuantity <= 0) {
      alert(
        `Cannot assign more items. Available quantity: ${availableQuantity}`
      );
      return;
    }

    if (newUser.quantityAssigned > availableQuantity) {
      alert(
        `Cannot assign ${newUser.quantityAssigned} items. Only ${availableQuantity} available.`
      );
      return;
    }

    const user: ReceivableUser = {
      ...newUser,
      id: Date.now().toString(), // Simple ID generation for now
    };

    onUsersChange([...assignedUsers, user]);
    setNewUser({
      name: "",
      email: "",
      department: "",
      assignedDate: new Date().toISOString().split("T")[0],
      quantityAssigned: 1,
    });
    setIsAddingUser(false);
  };

  const handleEditUser = (user: ReceivableUser) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      department: user.department,
      assignedDate: user.assignedDate,
      quantityAssigned: user.quantityAssigned,
    });
    setIsAddingUser(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    // Calculate available quantity excluding the user being edited
    const otherUsersTotal = assignedUsers
      .filter((user) => user.id !== editingUser.id)
      .reduce((sum, user) => sum + user.quantityAssigned, 0);
    const availableForEdit = maxQuantity - otherUsersTotal;

    if (newUser.quantityAssigned > availableForEdit) {
      alert(
        `Cannot assign ${newUser.quantityAssigned} items. Only ${availableForEdit} available.`
      );
      return;
    }

    const updatedUsers = assignedUsers.map((user) =>
      user.id === editingUser.id ? { ...newUser, id: editingUser.id } : user
    );

    onUsersChange(updatedUsers);
    setEditingUser(null);
    setNewUser({
      name: "",
      email: "",
      department: "",
      assignedDate: new Date().toISOString().split("T")[0],
      quantityAssigned: 1,
    });
    setIsAddingUser(false);
  };

  const handleDeleteUser = (userId: string) => {
    onUsersChange(assignedUsers.filter((user) => user.id !== userId));
  };

  const handleCancel = () => {
    setIsAddingUser(false);
    setEditingUser(null);
    setNewUser({
      name: "",
      email: "",
      department: "",
      assignedDate: new Date().toISOString().split("T")[0],
      quantityAssigned: 1,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-base font-medium text-gray-900">
          Assigned Users ({totalAssignedQuantity}/{maxQuantity} items assigned)
        </h3>
        {availableQuantity > 0 && !isAddingUser && (
          <Button type="button" onClick={() => setIsAddingUser(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </Button>
        )}
      </div>

      {/* User List */}
      <div className="space-y-1">
        {assignedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-start sm:items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="text-xs text-gray-500 flex flex-wrap gap-1 sm:gap-2">
                  <span className="font-medium">{user.department}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-medium">
                    Qty: {user.quantityAssigned}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs">
                    {new Date(user.assignedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleEditUser(user)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(user.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit User Form */}
      {isAddingUser && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {editingUser ? "Edit User Assignment" : "Add New User Assignment"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label
                htmlFor="userName"
                className="text-xs font-medium text-gray-700"
              >
                Name *
              </Label>
              <Input
                id="userName"
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, name: e.target.value }))
                }
                className="text-sm"
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label
                htmlFor="userEmail"
                className="text-xs font-medium text-gray-700"
              >
                Email *
              </Label>
              <Input
                id="userEmail"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
                className="text-sm"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label
                htmlFor="userDepartment"
                className="text-xs font-medium text-gray-700"
              >
                Department *
              </Label>
              <Input
                id="userDepartment"
                type="text"
                value={newUser.department}
                onChange={(e) =>
                  setNewUser((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="text-sm"
                placeholder="Enter department"
              />
            </div>
            <div>
              <Label
                htmlFor="quantityAssigned"
                className="text-xs font-medium text-gray-700"
              >
                Quantity to Assign * (Max:{" "}
                {editingUser
                  ? maxQuantity -
                    assignedUsers
                      .filter((u) => u.id !== editingUser.id)
                      .reduce((sum, u) => sum + u.quantityAssigned, 0)
                  : availableQuantity}
                )
              </Label>
              <Input
                id="quantityAssigned"
                type="number"
                value={newUser.quantityAssigned}
                onChange={(e) =>
                  setNewUser((prev) => ({
                    ...prev,
                    quantityAssigned: parseInt(e.target.value) || 1,
                  }))
                }
                min="1"
                max={
                  editingUser
                    ? maxQuantity -
                      assignedUsers
                        .filter((u) => u.id !== editingUser.id)
                        .reduce((sum, u) => sum + u.quantityAssigned, 0)
                    : availableQuantity
                }
                className="text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="assignedDate"
                className="text-xs font-medium text-gray-700"
              >
                Assigned Date *
              </Label>
              <div className="relative">
                <Input
                  id="assignedDate"
                  type="date"
                  value={newUser.assignedDate}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      assignedDate: e.target.value,
                    }))
                  }
                  className="text-sm pr-8"
                />
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={editingUser ? handleUpdateUser : handleAddUser}
              disabled={
                !newUser.name ||
                !newUser.email ||
                !newUser.department ||
                newUser.quantityAssigned < 1
              }
              className="w-full sm:w-auto"
            >
              {editingUser ? "Update User" : "Add User"}
            </Button>
          </div>
        </div>
      )}

      {assignedUsers.length === 0 && !isAddingUser && (
        <div className="text-center py-6 text-gray-500">
          <p>No users assigned to this receivable yet.</p>
          <p className="text-sm">
            Click "Add User" to assign quantities to users.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceivableUserManager;
