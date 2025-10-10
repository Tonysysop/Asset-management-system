import React from "react";
import type { Asset } from "../types/inventory";
import {
  Monitor,
  Laptop,
  Printer,
  Server,
  Router,
  Smartphone,
  HardDrive,
  AlertTriangle,
} from "lucide-react";
import { parseDateString } from "../utils/dateUtils";

interface DashboardProps {
  assets: Asset[];
}

const Dashboard: React.FC<DashboardProps> = ({ assets }) => {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case "laptop":
        return <Laptop className="w-6 h-6" />;
      case "desktop":
        return <Monitor className="w-6 h-6" />;
      case "printer":
        return <Printer className="w-6 h-6" />;
      case "server":
        return <Server className="w-6 h-6" />;
      case "router":
        return <Router className="w-6 h-6" />;
      case "mobile":
        return <Smartphone className="w-6 h-6" />;
      default:
        return <HardDrive className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-use":
        return "text-green-600 bg-green-100";
      case "spare":
        return "text-blue-600 bg-blue-100";
      case "repair":
        return "text-amber-600 bg-amber-100";
      case "retired":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const assetCounts = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const warningAssets = assets.filter((asset) => {
    const warrantyDate = parseDateString(asset.warrantyExpiry);
    if (!warrantyDate) return false;

    const today = new Date();
    const monthsUntilExpiry =
      (warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-3xl font-bold text-gray-900">
                {assets.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Use</p>
              <p className="text-3xl font-bold text-green-600">
                {statusCounts["in-use"] || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Monitor className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-3xl font-bold text-blue-600">
                {statusCounts["spare"] || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Warranty Alerts
              </p>
              <p className="text-3xl font-bold text-amber-600">
                {warningAssets.length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Asset Types
          </h3>
          <div className="space-y-3">
            {Object.entries(assetCounts).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-600">{getAssetIcon(type)}</div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {type === "desktop" ? "Desktop PC" : type}s
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Overview
          </h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      status
                    )}`}
                  >
                    {status.replace("-", " ").toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warranty Alerts */}
      {warningAssets.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
            Warranty Expiring Soon
          </h3>
          <div className="space-y-2">
            {warningAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {asset.assetTag} - {asset.brand} {asset.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    Assigned to: {asset.assignedUser}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-600">
                    Expires: {asset.warrantyExpiry}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
