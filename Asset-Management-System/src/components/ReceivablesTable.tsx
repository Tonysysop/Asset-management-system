import React, { useState, useRef } from 'react';
import type { Receivable, UserRole } from '../types/inventory';
import { Edit, Trash2, Package, ArrowRight, Monitor, Laptop, Printer, Server, Router, Smartphone, HardDrive, Upload, Eye, Plus } from 'lucide-react';
import { addReceivables } from '../services/receivableService';
import ImportModal from './ImportModal';
import ViewDetailsModal from './ViewDetailsModal';
import ReceivableModal from './ReceivableModal';
import { useToast } from '../contexts/ToastContext';
import { useStore } from '../store/store';

interface ReceivablesTableProps {
  userRole: UserRole;
  onEdit: (receivable: Receivable) => void;
  onDelete: (id: string) => void;
  onDeploy: (receivable: Receivable) => void;
  onImport: () => void;
  onAdd: () => void;
}

const ReceivablesTable: React.FC<ReceivablesTableProps> = ({ userRole, onEdit, onDelete, onDeploy, onImport, onAdd }) => {
  const receivables = useStore((state) => state.receivables);
  const [sortField, setSortField] = useState<keyof Receivable>('itemName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleFileImport = async (data: Omit<Receivable, 'id'>[]) => {
    try {
      await addReceivables(data);
      onImport();
      showToast('Receivables imported successfully', 'success');
    } catch (error) {
      showToast('Error importing receivables', 'error');
    }
  };

  const receivableSampleData = `itemName,category,brand,description,serialNumber,colour,supplierName,purchaseDate,quantity,warranty,notes,status
Laptop,laptop,Apple,MacBook Pro 16,C02Z1234ABCD,Space Gray,Apple Inc.,2023-10-26,1,1 Year,New laptop for design team,pending`;

  const receivableInstructions = [
    'The CSV file must have the following columns: itemName, category, brand, description, serialNumber, colour, supplierName, purchaseDate, quantity, warranty, notes, status',
    'The category must be one of: laptop, desktop, printer, server, router, switch, mobile, peripheral',
    'The status must be one of: pending, received, deployed',
    'Dates should be in YYYY-MM-DD format.',
  ];

  const expectedReceivableHeaders = ['itemName', 'category', 'brand', 'description', 'serialNumber', 'colour', 'supplierName', 'purchaseDate', 'quantity', 'warranty', 'notes', 'status'];

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
      case 'received': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (field: keyof Receivable) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedReceivables = [...receivables].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

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
          Add Receivable
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
        sampleData={receivableSampleData} 
        instructions={receivableInstructions} 
        expectedHeaders={expectedReceivableHeaders}
      />
      <div className="overflow-x-auto">
        {sortedReceivables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No receivables found.</p>
            <button
              onClick={() => onAdd()}
              className="flex items-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Receivable
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('itemName')}
                >
                  Item Name
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  Category
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('brand')}
                >
                  Brand
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('serialNumber')}
                >
                  Serial Number
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('supplierName')}
                >
                  Supplier
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                {(userRole === 'admin' || userRole === 'auditor') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedReceivables.map((receivable) => (
                <tr
                  key={receivable.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {receivable.itemName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {receivable.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-gray-600 mr-2">
                        {getAssetIcon(receivable.category)}
                      </div>
                      <span className="text-sm text-gray-900 capitalize">
                        {receivable.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {receivable.brand}
                    </div>
                    <div className="text-sm text-gray-500">
                      {receivable.colour}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {receivable.serialNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {receivable.supplierName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Purchased: {receivable.purchaseDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {receivable.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        receivable.status
                      )}`}
                    >
                      {receivable.status.toUpperCase()}
                    </span>
                  </td>
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <ViewDetailsModal item={receivable} title="Receivable Details" />
                        {receivable.status === 'received' && (
                          <button
                            onClick={() => onDeploy(receivable)}
                            className="text-green-600 hover:text-green-900 transition-colors duration-150"
                            title="Deploy to Inventory"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(receivable)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(receivable.id)}
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
                        <ViewDetailsModal item={receivable} title="Receivable Details" />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReceivablesTable;
