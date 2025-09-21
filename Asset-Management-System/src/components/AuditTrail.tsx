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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/table';

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Item Type</TableHead>
              <TableHead>Item ID / Asset Tag</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="truncate">{action.user}</TableCell>
                <TableCell className="truncate">{action.actionType}</TableCell>
                <TableCell>{action.itemType}</TableCell>
                <TableCell className="truncate">{getItemId(action)}</TableCell>
                <TableCell>{new Date(action.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={action.details}>
                    {action.details}
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuditTrail;
