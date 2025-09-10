import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ViewDetailsModalProps {
  item: any;
  title: string;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ item, title }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(item).map(([key, value]) => (
            <div className="grid grid-cols-4 items-center gap-4" key={key}>
              <p className="col-span-1 text-sm font-medium text-gray-500 capitalize">{key}</p>
              <p className="col-span-3 text-sm text-gray-900">{String(value)}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;