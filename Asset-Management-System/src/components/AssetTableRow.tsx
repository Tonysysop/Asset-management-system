import { memo, useState } from "react";
import { safeFormatDate, isValidDate } from "../utils/dateUtils";
import {
  Edit,
  Trash2,
  Archive,
  MoreVertical,
  HardDrive,
  Laptop,
  Monitor,
  Printer,
  Smartphone,
  Server,
  Router,
  Tablet,
  Eye,
  History,
  Wifi,
} from "lucide-react";
import type { Asset } from "../types/inventory";
import ViewDetailsModal from "./ViewDetailsModal";
import AssetTrailModal from "./AssetTrailModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { TableCell, TableRow } from "./ui/table";

interface AssetTableRowProps {
  asset: Asset;
  userRole: "admin" | "auditor";
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onRetrieve?: (asset: Asset) => void;
  isRetrievedView?: boolean;
}

const AssetTableRow = memo<AssetTableRowProps>(
  ({
    asset,
    userRole,
    onEdit,
    onDelete,
    onRetrieve,
    isRetrievedView = false,
  }) => {
    const [isTrailModalOpen, setIsTrailModalOpen] = useState(false);
    const getAssetIcon = (type: string) => {
      switch (type.toLowerCase()) {
        case "laptop":
          return <Laptop className="w-4 h-4" />;
        case "desktop":
          return <Monitor className="w-4 h-4" />;
        case "printer":
          return <Printer className="w-4 h-4" />;
        case "server":
          return <Server className="w-4 h-4" />;
        case "router":
          return <Router className="w-4 h-4" />;
        case "access_point":
          return <Wifi className="w-4 h-4" />;
        case "mobile":
          return <Smartphone className="w-4 h-4" />;
        case "tablet":
          return <Tablet className="w-4 h-4" />;
        default:
          return <HardDrive className="w-4 h-4" />;
      }
    };

    const formatAssetType = (type: string) => {
      return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "in-use":
          return "bg-green-100 text-green-800";
        case "spare":
          return "bg-blue-100 text-blue-800";
        case "repair":
          return "bg-amber-100 text-amber-800";
        case "retired":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const isWarrantyExpiring = (warrantyDate: string) => {
      if (!isValidDate(warrantyDate)) return false;

      const warranty = new Date(warrantyDate);
      const today = new Date();
      const monthsUntilExpiry =
        (warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
    };

    const handleEdit = () => onEdit(asset);
    const handleDelete = () => onDelete(asset.id);
    const handleRetrieve = () => onRetrieve?.(asset);

    return (
      <TableRow key={asset.id}>
        <TableCell className="pl-6">
          <div className="flex items-center gap-2">
            {getAssetIcon(asset.type)}
            <div>
              <div className="font-medium">{asset.assetTag}</div>
              <div className="text-sm text-muted-foreground">
                {asset.serialNumber}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            <div className="mr-2">{getAssetIcon(asset.type)}</div>
            <span>{formatAssetType(asset.type)}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{asset.brand}</div>
          <div className="text-sm text-muted-foreground">{asset.model}</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{asset.assignedUser}</div>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">
            {asset.department}
          </div>
        </TableCell>
        <TableCell>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              asset.status
            )}`}
          >
            {asset.status.toUpperCase()}
          </span>
        </TableCell>
        <TableCell>
          {asset.warrantyExpiry && (
            <div className="text-sm">
              {safeFormatDate(asset.warrantyExpiry)}
              {isWarrantyExpiring(asset.warrantyExpiry) && (
                <span className="ml-2 text-amber-600 text-xs">⚠️ Expiring</span>
              )}
            </div>
          )}
        </TableCell>
        {userRole === "admin" && (
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                }}
              >
                <DropdownMenuItem>
                  <ViewDetailsModal item={asset} title="Asset Details" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    handleEdit();
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                {onRetrieve && !isRetrievedView && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleRetrieve();
                    }}
                  >
                    <Archive className="w-4 h-4 mr-2" /> Retrieve
                  </DropdownMenuItem>
                )}
                {onRetrieve && isRetrievedView && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleRetrieve();
                    }}
                  >
                    <Archive className="w-4 h-4 mr-2" /> Redeploy
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )}
        {userRole === "auditor" && (
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                }}
              >
                <DropdownMenuItem>
                  <ViewDetailsModal item={asset} title="Asset Details" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setIsTrailModalOpen(true);
                  }}
                >
                  <History className="w-4 h-4 mr-2" /> Trail
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AssetTrailModal
              asset={asset}
              isOpen={isTrailModalOpen}
              onClose={() => setIsTrailModalOpen(false)}
            />
          </TableCell>
        )}
      </TableRow>
    );
  }
);

AssetTableRow.displayName = "AssetTableRow";

export default AssetTableRow;
