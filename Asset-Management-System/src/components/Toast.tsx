import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastIcons = {
  success: <CheckCircle className="w-6 h-6 text-white" />,
  error: <XCircle className="w-6 h-6 text-white" />,
  info: <Info className="w-6 h-6 text-white" />,
  warning: <AlertTriangle className="w-6 h-6 text-white" />,
};

const toastColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div 
      className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white ${toastColors[type]}`}>
      <div className="mr-3">
        {toastIcons[type]}
      </div>
      <div>
        {message}
      </div>
    </div>
  );
};

export default Toast;