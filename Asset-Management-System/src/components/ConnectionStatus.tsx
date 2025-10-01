import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show status briefly when connection changes
    if (!isOnline) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnline]);

  if (!showStatus && isOnline) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-md shadow-lg transition-all duration-300 ${
        isOnline
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      {isOnline ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isOnline ? "Connection restored" : "No internet connection"}
      </span>
      {!isOnline && <AlertCircle className="w-4 h-4 text-red-600" />}
    </div>
  );
};

export default ConnectionStatus;
