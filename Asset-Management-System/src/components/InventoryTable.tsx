import React, { useState } from 'react';
import type { Asset, UserRole } from '../types/inventory';
import { Edit, Trash2, Monitor, Laptop, Printer, Server, Router, Smartphone, HardDrive } from 'lucide-react';

interface InventoryTableProps {
  assets: Asset[];
  userRole: UserRole;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ assets, userRole, onEdit, onDelete }) => {
  const [sortField, setSortField] = useState<keyof Asset>('assetTag');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'printer': return <Printer className="w-4 h-4" />;
      case 'server': return <Server className="w-4 h-4" />;
      case 'router': return <Router className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <HardDrive className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-use': return 'bg-green-100 text-green-800';
      case 'spare': return 'bg-blue-100 text-blue-800';
      case 'repair': return 'bg-amber-100 text-amber-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isWarrantyExpiring = (warrantyDate: string) => {
    const warranty = new Date(warrantyDate);
    const today = new Date();
    const monthsUntilExpiry = (warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  };

  const handleSort = (field: keyof Asset) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
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
                onClick={() => handleSort('assetTag')}
              >
                Asset Tag
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                Type
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('brand')}
              >
                Brand/Model
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('assignedUser')}
              >
                Assigned User
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department')}
              >
                Department
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('warrantyExpiry')}
              >
                Warranty
              </th>
              {userRole === 'admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{asset.assetTag}</div>
                  <div className="text-sm text-gray-500">{asset.serialNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-gray-600 mr-2">
                      {getAssetIcon(asset.type)}
                    </div>
                    <span className="text-sm text-gray-900 capitalize">{asset.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{asset.brand}</div>
                  <div className="text-sm text-gray-500">{asset.model}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{asset.assignedUser}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{asset.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                    {asset.status.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isWarrantyExpiring(asset.warrantyExpiry) ? 'text-amber-600 font-medium' : 'text-gray-900'}`}>
                    {asset.warrantyExpiry}
                  </div>
                  {isWarrantyExpiring(asset.warrantyExpiry) && (
                    <div className="text-xs text-amber-600">Expiring Soon</div>
                  )}
                </td>
                {userRole === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(asset)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(asset.id)}
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

export default InventoryTable;