import React, { useState, useEffect } from 'react';
import type { Action } from '../types/inventory';
import { getActions } from '../services/actionService';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AuditTrail: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    const fetchActions = async () => {
      const fetchedActions = await getActions();
      setActions(fetchedActions);
    };
    fetchActions();
  }, []);

  const getItemId = (action: Action) => {
    if (action.itemType === 'asset') {
      return action.assetTag;
    }
    return action.itemId;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold">Audit Trail</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Item Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Item ID / Asset Tag</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {actions.map((action) => (
              <tr key={action.id}>
                <td className="px-6 py-4 whitespace-nowrap truncate">{action.user}</td>
                <td className="px-6 py-4 whitespace-nowrap truncate">{action.actionType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{action.itemType}</td>
                <td className="px-6 py-4 whitespace-nowrap truncate">{getItemId(action)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(action.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="max-w-xs truncate" title={action.details}>
                    {action.details}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Action Details</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {Object.entries(action).map(([key, value]) => (
                          <div className="grid grid-cols-4 items-center gap-4" key={key}>
                            <p className="col-span-1 text-sm font-medium text-gray-500 capitalize">{key}</p>
                            <p className="col-span-3 text-sm text-gray-900">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;