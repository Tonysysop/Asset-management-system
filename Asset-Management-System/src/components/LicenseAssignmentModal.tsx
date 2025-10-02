import React, { useState, useEffect } from "react";
import type { License, LicenseUser } from "../types/inventory";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Plus, Trash2, Edit2, Calendar as CalendarLucide } from "lucide-react";
import { format } from "date-fns";

interface LicenseAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (licenseId: string, assignedUsers: LicenseUser[]) => Promise<void>;
  license?: License;
}

const LicenseAssignmentModal: React.FC<LicenseAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  license,
}) => {
  const [assignedUsers, setAssignedUsers] = useState<LicenseUser[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<LicenseUser | null>(null);
  const [newUser, setNewUser] = useState<
    Omit<LicenseUser, "id" | "assignedDate"> & { assignedDate: Date }
  >({
    name: "",
    email: "",
    department: "",
    assignedDate: new Date(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (license) {
      setAssignedUsers(license.assignedUsers || []);
    } else {
      setAssignedUsers([]);
    }
    setIsAddingUser(false);
    setEditingUser(null);
    setNewUser({
      name: "",
      email: "",
      department: "",
      assignedDate: new Date(),
    });
    setErrors({});
  }, [license, isOpen]);

  if (!license) return null;

  // Only allow assignment for volume licenses
  if (license.licenseType !== "volume") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              License Assignment
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600">
              Only volume licenses can have multiple users assigned.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This license is a one-off license.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const maxSeats = license.seats;
  const totalAssignedUsers = assignedUsers.length;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (totalAssignedUsers > maxSeats) {
      newErrors.assignedUsers = `Total assigned users (${totalAssignedUsers}) cannot exceed available seats (${maxSeats})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSaving(true);
      try {
        await onSave(license.id, assignedUsers);
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddUser = () => {
    if (totalAssignedUsers >= maxSeats) {
      alert(
        `Cannot assign more users. Available seats: ${
          maxSeats - totalAssignedUsers
        }`
      );
      return;
    }

    const user: LicenseUser = {
      ...newUser,
      assignedDate: newUser.assignedDate.toISOString().split("T")[0],
      id: Date.now().toString(),
    };

    setAssignedUsers([...assignedUsers, user]);
    setNewUser({
      name: "",
      email: "",
      department: "",
      assignedDate: new Date(),
    });
    setIsAddingUser(false);
  };

  const handleEditUser = (user: LicenseUser) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      department: user.department,
      assignedDate: new Date(user.assignedDate),
    });
    setIsAddingUser(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const otherUsersCount = assignedUsers.filter(
      (user) => user.id !== editingUser.id
    ).length;
    const availableForEdit = maxSeats - otherUsersCount;

    if (availableForEdit < 1) {
      alert("Cannot update user assignment. Maximum seats reached.");
      return;
    }

    const updatedUsers = assignedUsers.map((user) =>
      user.id === editingUser.id
        ? {
            ...newUser,
            assignedDate: newUser.assignedDate.toISOString().split("T")[0],
            id: editingUser.id,
          }
        : user
    );

    setAssignedUsers(updatedUsers);
    setEditingUser(null);
    setNewUser({
      name: "",
      email: "",
      department: "",
      assignedDate: new Date(),
    });
    setIsAddingUser(false);
  };

  const handleDeleteUser = (userId: string) => {
    setAssignedUsers(assignedUsers.filter((user) => user.id !== userId));
  };

  const handleCancel = () => {
    setIsAddingUser(false);
    setEditingUser(null);
    setNewUser({
      name: "",
      email: "",
      department: "",
      assignedDate: new Date(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Users to {license.licenseName}
          </DialogTitle>
          <DialogDescription>
            Assign users to this volume license. You can assign up to{" "}
            {license.seats} users total.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 p-1">
            {/* License Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                License Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">License:</span>{" "}
                  {license.licenseName}
                </div>
                <div>
                  <span className="font-medium">Vendor:</span> {license.vendor}
                </div>
                <div>
                  <span className="font-medium">Type:</span> Volume License
                </div>
                <div>
                  <span className="font-medium">Total Seats:</span>{" "}
                  {license.seats}
                </div>
              </div>
            </div>

            {/* Assignment Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-medium text-gray-900">
                  Assignment Summary ({totalAssignedUsers}/{maxSeats} users
                  assigned)
                </h3>
                {totalAssignedUsers < maxSeats && !isAddingUser && (
                  <Button
                    type="button"
                    onClick={() => setIsAddingUser(true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add User
                  </Button>
                )}
              </div>
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
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-1 sm:gap-2">
                        <span className="font-medium">{user.department}</span>
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
                  {editingUser
                    ? "Edit User Assignment"
                    : "Add New User Assignment"}
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
                        setNewUser((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
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
                        setNewUser((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
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
                    <Label className="text-xs font-medium text-gray-700">
                      Assigned Date *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-sm"
                        >
                          <CalendarLucide className="mr-2 h-4 w-4" />
                          {newUser.assignedDate ? (
                            format(newUser.assignedDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newUser.assignedDate}
                          onSelect={(date) => {
                            if (date) {
                              setNewUser((prev) => ({
                                ...prev,
                                assignedDate: date,
                              }));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      !newUser.name || !newUser.email || !newUser.department
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
                <p>No users assigned to this license yet.</p>
                <p className="text-sm">
                  Click "Add User" to assign users to this license.
                </p>
              </div>
            )}

            {errors.assignedUsers && (
              <p className="text-red-500 text-xs mt-1">
                {errors.assignedUsers}
              </p>
            )}
          </div>
          <DialogFooter className="flex-shrink-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Assignments"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseAssignmentModal;
