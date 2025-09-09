import React, { useState } from 'react';
import type { License, UserRole } from '../types/inventory';
import { Edit, Trash2, Key, AlertTriangle } from 'lucide-react';

interface LicensesTableProps {
  licenses: License[];
  userRole: UserRole;
  onEdit: (license: License) => void;
  onDelete: (id: string) => void;
}

const LicensesTable: React.FC<LicensesTableProps> = ({ 
  licenses, 
  userRole, 
  onEdit, 
  onDelete 
}) => {
  const [sortField, setSortField] = useState<keyof License>('licenseName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring-soon': return 'bg-amber-100 text-amber-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const handleSort = (field: keyof License) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLicenses = [...licenses].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('licenseName')}
              >
                License Name
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('vendor')}
              >
                Vendor
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('seats')}
              >
                Seats
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('assignedUser')}
              >
                Assigned To
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('expiryDate')}
              >
                Expiry Date
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status
              </th>
              {userRole === 'admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLicenses.map((license) => (
              <tr key={license.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{license.licenseName}</div>
                      <div className="text-sm text-gray-500">{license.department}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{license.vendor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{license.seats}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{license.assignedUser}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${
                    isExpired(license.expiryDate) 
                      ? 'text-red-600 font-medium' 
                      : isExpiringSoon(license.expiryDate) 
                        ? 'text-amber-600 font-medium' 
                        : 'text-gray-900'
                  }`}>
                    {license.expiryDate}
                  </div>
                  {(isExpired(license.expiryDate) || isExpiringSoon(license.expiryDate)) && (
                    <div className="flex items-center text-xs text-amber-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {isExpired(license.expiryDate) ? 'Expired' : 'Expiring Soon'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(license.status)}`}>
                    {license.status.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                {userRole === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(license)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(license.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LicensesTable;