import React from "react";
import type { UserRole } from "@/types/inventory";
import { Shield, User, FileText } from "lucide-react";

interface UserRoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({
  currentRole,
  onRoleChange,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700">Role:</span>
      <div className="flex space-x-2">
        <button
          onClick={() => onRoleChange("admin")}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
            currentRole === "admin"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Shield className="w-4 h-4 mr-1" />
          Admin
        </button>
        <button
          onClick={() => onRoleChange("user")}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
            currentRole === "user"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <User className="w-4 h-4 mr-1" />
          User
        </button>
        <button
          onClick={() => onRoleChange("auditor")}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
            currentRole === "auditor"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FileText className="w-4 h-4 mr-1" />
          Auditor
        </button>
      </div>
    </div>
  );
};

export default UserRoleSelector;
