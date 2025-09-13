import React, { useState, useRef } from 'react';
import type { Asset, UserRole } from '../types/inventory';
import { Edit, Trash2, Monitor, Laptop, Printer, Server, Router, Smartphone, HardDrive, Upload, Eye, Plus } from 'lucide-react';
import { addAssets } from '../services/assetService';
import ImportModal from './ImportModal';
import type { ToastType } from './Toast';
import ViewDetailsModal from './ViewDetailsModal';
import AssetModal from './AssetModal';

interface InventoryTableProps {
  assets: Asset[];
  userRole: UserRole;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onImport: () => void;
  onAdd: () => void;
  showToast: (message: string, type: ToastType) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ assets, userRole, onEdit, onDelete, onImport, onAdd, showToast }) => {
  const [sortField, setSortField] = useState<keyof Asset>('assetTag');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleFileImport = async (data: Omit<Asset, 'id'>[]) => {
    try {
      const skippedAssetTags = await addAssets(data);
      onImport();
      if (skippedAssetTags.length > 0) {
        showToast(`Skipped duplicate asset tags: ${skippedAssetTags.join(', ')}`, 'warning');
      } else {
        showToast('All assets imported successfully', 'success');
      }
    } catch (error) {
      showToast('Error importing assets', 'error');
    }
  };

  const assetSampleData = `assetTag,serialNumber,type,brand,model,specifications,purchaseDate,warrantyExpiry,vendor,assignedUser,department,status,location,notes
AST-001,SN-001,laptop,Dell,XPS 15,"i7, 16GB RAM, 512GB SSD",2023-01-15,2026-01-14,Dell Inc.,John Doe,Engineering,in-use,Building A,Room 101`;

  const assetInstructions = [
    'The CSV file must have the following columns: assetTag, serialNumber, type, brand, model, specifications, purchaseDate, warrantyExpiry, vendor, assignedUser, department, status, location, notes',
    'The type must be one of: laptop, desktop, printer, server, router, switch, mobile, peripheral',
    'The status must be one of: in-use, spare, repair, retired',
    'Dates should be in YYYY-MM-DD format.',
  ];

  const expectedAssetHeaders = ['assetTag', 'serialNumber', 'type', 'brand', 'model', 'specifications', 'purchaseDate', 'warrantyExpiry', 'vendor', 'assignedUser', 'department', 'status', 'location', 'notes'];

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
      <div className="p-4 flex justify-end space-x-4">
        <button
          onClick={() => onAdd()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </button>
      </div>
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleFileImport} 
        sampleData={assetSampleData} 
        instructions={assetInstructions} 
        expectedHeaders={expectedAssetHeaders}
      />
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
              {(userRole === 'admin' || userRole === 'auditor') && (
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
                      <ViewDetailsModal item={asset} title="Asset Details" />
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
                {userRole === 'auditor' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <ViewDetailsModal item={asset} title="Asset Details" />
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