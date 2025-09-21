import React, { useState } from 'react';
import type { Receivable, UserRole } from '../types/inventory';
import { Edit, Trash2, ArrowRight, Monitor, Laptop, Printer, Server, Router, Smartphone, HardDrive, Upload, Plus, MoreVertical } from 'lucide-react';
import { addReceivables } from '../services/receivableService';
import ImportModal from './ImportModal';
import ViewDetailsModal from './ViewDetailsModal';
import { useToast } from '../contexts/ToastContext';
import { useStore } from '../store/store';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

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
    } catch {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('itemName')}>Item Name</TableHead>
                <TableHead onClick={() => handleSort('category')}>Category</TableHead>
                <TableHead onClick={() => handleSort('brand')}>Brand</TableHead>
                <TableHead onClick={() => handleSort('serialNumber')}>Serial Number</TableHead>
                <TableHead onClick={() => handleSort('supplierName')}>Supplier</TableHead>
                <TableHead onClick={() => handleSort('quantity')}>Quantity</TableHead>
                <TableHead onClick={() => handleSort('status')}>Status</TableHead>
                {(userRole === 'admin' || userRole === 'auditor') && (
                  <TableHead>Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReceivables.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell>
                    <div className="font-medium">{receivable.itemName}</div>
                    <div className="text-sm text-muted-foreground">{receivable.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="mr-2">
                        {getAssetIcon(receivable.category)}
                      </div>
                      <span className="capitalize">{receivable.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{receivable.brand}</div>
                    <div className="text-sm text-muted-foreground">{receivable.colour}</div>
                  </TableCell>
                  <TableCell>{receivable.serialNumber}</TableCell>
                  <TableCell>
                    <div>{receivable.supplierName}</div>
                    <div className="text-sm text-muted-foreground">Purchased: {receivable.purchaseDate}</div>
                  </TableCell>
                  <TableCell>{receivable.quantity}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        receivable.status
                      )}`}
                    >
                      {receivable.status.toUpperCase()}
                    </span>
                  </TableCell>
                  {userRole === 'admin' && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <ViewDetailsModal item={receivable} title="Receivable Details" />
                          </DropdownMenuItem>
                          {receivable.status === 'received' && (
                            <DropdownMenuItem onClick={() => onDeploy(receivable)}>
                              <ArrowRight className="w-4 h-4 mr-2" /> Deploy
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEdit(receivable)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(receivable.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                  {userRole === 'auditor' && (
                    <TableCell>
                      <ViewDetailsModal item={receivable} title="Receivable Details" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ReceivablesTable;