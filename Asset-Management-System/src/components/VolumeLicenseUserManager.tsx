import React, { useState } from "react";
import type { LicenseUser } from "../types/inventory";
import { Plus, Trash2, Edit2, Calendar } from "lucide-react";

interface VolumeLicenseUserManagerProps {
  assignedUsers: LicenseUser[];
  onUsersChange: (users: LicenseUser[]) => void;
  maxSeats: number;
}

const VolumeLicenseUserManager: React.FC<VolumeLicenseUserManagerProps> = ({
  assignedUsers,
  onUsersChange,
  maxSeats,
}) => {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<LicenseUser | null>(null);
  const [newUser, setNewUser] = useState<Omit<LicenseUser, "id">>({
    name: "",
    email: "",
    department: "",
    assignedDate: new Date().toISOString().split("T")[0],
  });

  const handleAddUser = () => {
    if (assignedUsers.length >= maxSeats) {
      alert(`Cannot add more users. Maximum seats: ${maxSeats}`);
      return;
    }

    const user: LicenseUser = {
      ...newUser,
      id: Date.now().toString(), // Simple ID generation for now
    };

    onUsersChange([...assignedUsers, user]);
    setNewUser({
      name: "",
      email: "",
      department: "",
      assignedDate: new Date().toISOString().split("T")[0],
    });
    setIsAddingUser(false);
  };

  const handleEditUser = (user: LicenseUser) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      department: user.department,
      assignedDate: user.assignedDate,
    });
    setIsAddingUser(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

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
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Assigned Users ({assignedUsers.length}/{maxSeats})
        </h3>
        {assignedUsers.length < maxSeats && !isAddingUser && (
          <button
            type="button"
            onClick={() => setIsAddingUser(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </button>
        )}
      </div>

      {/* User List */}
      <div className="space-y-2">
        {assignedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{user.department}</span>
                  <span className="mx-2">•</span>
                  <span>
                    Assigned: {new Date(user.assignedDate).toLocaleDateString()}
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
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {editingUser ? "Edit User" : "Add New User"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter user name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                value={newUser.department}
                onChange={(e) =>
                  setNewUser((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter department"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assigned Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={newUser.assignedDate}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      assignedDate: e.target.value,
                    }))
                  }
                  className="w-full px-2 py-1 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={editingUser ? handleUpdateUser : handleAddUser}
              disabled={!newUser.name || !newUser.email || !newUser.department}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingUser ? "Update User" : "Add User"}
            </button>
          </div>
        </div>
      )}

      {assignedUsers.length === 0 && !isAddingUser && (
        <div className="text-center py-6 text-gray-500">
          <p>No users assigned to this volume license yet.</p>
          <p className="text-sm">
            Click "Add User" to assign users to this license.
          </p>
        </div>
      )}
    </div>
  );
};

export default VolumeLicenseUserManager;
