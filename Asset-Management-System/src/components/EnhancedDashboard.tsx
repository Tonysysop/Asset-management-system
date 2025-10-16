import React, { useMemo } from "react";
import type { Asset, License, IncomingStock } from "../types/inventory";
import { isValidDate, parseDateString } from "../utils/dateUtils";
import {
  Monitor,
  Laptop,
  Printer,
  Server,
  Router,
  Smartphone,
  HardDrive,
  AlertTriangle,
  Package,
  Key,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
// import { addAsset } from '../services/assetService';
// import { addLicense } from '../services/licenseService';
// import { addReceivable } from '../services/receivableService';
// import { useAuth } from '../contexts/AuthContext';

interface EnhancedDashboardProps {
  assets: Asset[];
  licenses: License[];
  incomingStock: IncomingStock[];
  onAssetAdded?: () => void;
  onLicenseAdded?: () => void;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  assets,
  licenses,
  incomingStock,
  // onAssetAdded,
  // onLicenseAdded,
}) => {
  // const { currentUser } = useAuth();

  // These handlers are kept for potential future use
  // const handleAddAsset = async (asset: Omit<Asset, 'id'>) => {
  //   if (currentUser) {
  //     await addAsset(asset, currentUser.email || 'unknown');
  //     onAssetAdded();
  //   }
  // };

  // const handleAddLicense = async (license: Omit<License, 'id'>) => {
  //   if (currentUser) {
  //     await addLicense(license, currentUser.email || 'unknown');
  //     onLicenseAdded();
  //   }
  // };

  // const handleAddReceivable = async (receivable: Omit<Receivable, 'id'>) => {
  //   if (currentUser) {
  //     await addReceivable(receivable, currentUser.email || 'unknown');
  //     onReceivableAdded();
  //   }
  // };

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

  // Memoized asset calculations
  const assetCounts = useMemo(() => {
    return assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [assets]);

  const warningAssets = useMemo(() => {
    return assets.filter((asset) => {
      const warrantyDate = parseDateString(asset.warrantyExpiry);
      if (!warrantyDate) return false;

      const today = new Date();
      const monthsUntilExpiry =
        (warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
    });
  }, [assets]);

  // Memoized receivables calculations (using incomingStock as receivables)
  const receivableStatusCounts = useMemo(() => {
    return incomingStock.reduce((acc, stock) => {
      acc[stock.status] = (acc[stock.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [incomingStock]);

  const totalReceivableQuantity = useMemo(() => {
    return incomingStock.length;
  }, [incomingStock]);

  // Memoized license calculations
  const expiredLicenses = useMemo(() => {
    return licenses.filter((license) => {
      if (!isValidDate(license.expiryDate)) return false;

      const expiryDate = new Date(license.expiryDate);
      const today = new Date();
      return expiryDate < today;
    });
  }, [licenses]);

  const expiringSoonLicenses = useMemo(() => {
    return licenses.filter((license) => {
      if (!isValidDate(license.expiryDate)) return false;

      const expiryDate = new Date(license.expiryDate);
      const today = new Date();
      const daysUntilExpiry =
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });
  }, [licenses]);

  const totalLicenseSeats = useMemo(() => {
    return licenses.reduce((sum, license) => sum + license.seats, 0);
  }, [licenses]);

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
              <p className="text-sm font-medium text-gray-600">
                Pending Allocation
              </p>
              <p className="text-3xl font-bold text-amber-600">
                {receivableStatusCounts["incoming"] || 0}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Licenses
              </p>
              <p className="text-3xl font-bold text-green-600">
                {licenses.filter((l) => l.status === "active").length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Key className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Critical Alerts
              </p>
              <p className="text-3xl font-bold text-red-600">
                {warningAssets.length +
                  expiredLicenses.length +
                  expiringSoonLicenses.length +
                  (receivableStatusCounts["incoming"] || 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
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

        {/* Receivables Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Receivables Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  Pending Allocation
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {receivableStatusCounts["incoming"] || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  Allocated
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {receivableStatusCounts["in-use"] || 0}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Total Items
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {totalReceivableQuantity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* License Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            License Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  Active
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {licenses.filter((l) => l.status === "active").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-900">
                  Expiring Soon
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {expiringSoonLicenses.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-900">
                  Expired
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {expiredLicenses.length}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Total Seats
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {totalLicenseSeats}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(warningAssets.length > 0 ||
        expiredLicenses.length > 0 ||
        expiringSoonLicenses.length > 0 ||
        (receivableStatusCounts["incoming"] || 0) > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Critical Alerts
          </h3>

          <div className="space-y-4">
            {/* Warranty Alerts */}
            {warningAssets.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-amber-600 mb-2">
                  Asset Warranties Expiring Soon
                </h4>
                <div className="space-y-2">
                  {warningAssets.slice(0, 3).map((asset) => (
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
                  {warningAssets.length > 3 && (
                    <p className="text-sm text-gray-500">
                      ...and {warningAssets.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* License Alerts */}
            {(expiredLicenses.length > 0 ||
              expiringSoonLicenses.length > 0) && (
              <div>
                <h4 className="text-md font-medium text-red-600 mb-2">
                  License Renewals Required
                </h4>
                <div className="space-y-2">
                  {[...expiredLicenses, ...expiringSoonLicenses]
                    .slice(0, 3)
                    .map((license) => (
                      <div
                        key={license.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {license.licenseName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {license.vendor} - {license.seats} seats
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              expiredLicenses.includes(license)
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {expiredLicenses.includes(license)
                              ? "Expired"
                              : "Expires Soon"}
                            : {license.expiryDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  {expiredLicenses.length + expiringSoonLicenses.length > 3 && (
                    <p className="text-sm text-gray-500">
                      ...and{" "}
                      {expiredLicenses.length + expiringSoonLicenses.length - 3}{" "}
                      more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Receivables Alerts */}
            {(receivableStatusCounts["incoming"] || 0) > 0 && (
              <div>
                <h4 className="text-md font-medium text-amber-600 mb-2">
                  Items Pending Allocation
                </h4>
                <div className="space-y-2">
                  {incomingStock
                    .filter((stock) => stock.status === "incoming")
                    .slice(0, 3)
                    .map((stock) => (
                      <div
                        key={stock.id}
                        className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {stock.itemName} - {stock.brand} {stock.model}
                          </p>
                          <p className="text-sm text-gray-600">
                            Serial: {stock.serialNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-amber-600">
                            Status: {stock.status.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  {(receivableStatusCounts["incoming"] || 0) > 3 && (
                    <p className="text-sm text-gray-500">
                      ...and {(receivableStatusCounts["incoming"] || 0) - 3}{" "}
                      more items pending allocation
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboard;
