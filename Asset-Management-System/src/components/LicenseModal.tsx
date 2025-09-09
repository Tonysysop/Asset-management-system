import React, { useState, useEffect } from 'react';
import type { License, LicenseStatus } from '../types/inventory';
import { X } from 'lucide-react';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (license: Omit<License, 'id'>) => void;
  license?: License;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, onSave, license }) => {
  const [formData, setFormData] = useState<Omit<License, 'id'>>({
    licenseName: '',
    vendor: '',
    licenseKey: '',
    seats: 1,
    purchaseDate: '',
    expiryDate: '',
    assignedUser: '',
    department: '',
    notes: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (license) {
      setFormData({
        licenseName: license.licenseName,
        vendor: license.vendor,
        licenseKey: license.licenseKey,
        seats: license.seats,
        purchaseDate: license.purchaseDate,
        expiryDate: license.expiryDate,
        assignedUser: license.assignedUser,
        department: license.department,
        notes: license.notes,
        status: license.status
      });
    } else {
      setFormData({
        licenseName: '',
        vendor: '',
        licenseKey: '',
        seats: 1,
        purchaseDate: '',
        expiryDate: '',
        assignedUser: '',
        department: '',
        notes: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [license, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.licenseName.trim()) newErrors.licenseName = 'License name is required';
    if (!formData.vendor.trim()) newErrors.vendor = 'Vendor is required';
    if (!formData.licenseKey.trim()) newErrors.licenseKey = 'License key is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.assignedUser.trim()) newErrors.assignedUser = 'Assigned user is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (formData.seats < 1) newErrors.seats = 'Seats must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'seats' ? parseInt(value) || 0 : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  const licenseStatuses: LicenseStatus[] = ['active', 'expired', 'expiring-soon'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {license ? 'Edit License' : 'Add New License'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Name *
              </label>
              <input
                type="text"
                name="licenseName"
                value={formData.licenseName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.licenseName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.licenseName && <p className="text-red-500 text-xs mt-1">{errors.licenseName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.vendor ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.vendor && <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Key / Activation Code *
              </label>
              <input
                type="text"
                name="licenseKey"
                value={formData.licenseKey}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.licenseKey ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.licenseKey && <p className="text-red-500 text-xs mt-1">{errors.licenseKey}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Seats *
              </label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.seats ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.seats && <p className="text-red-500 text-xs mt-1">{errors.seats}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {licenseStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('-', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.purchaseDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned User *
              </label>
              <input
                type="text"
                name="assignedUser"
                value={formData.assignedUser}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.assignedUser ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.assignedUser && <p className="text-red-500 text-xs mt-1">{errors.assignedUser}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              {license ? 'Update License' : 'Add License'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LicenseModal;