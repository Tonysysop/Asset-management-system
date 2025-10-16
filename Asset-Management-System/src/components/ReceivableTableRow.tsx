import { memo } from "react";
import { MoreVertical, ArrowRight } from "lucide-react";
import type { IncomingStock } from "../types/inventory";
import ViewDetailsModal from "./ViewDetailsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { TableCell, TableRow } from "./ui/table";

interface ReceivableTableRowProps {
  stock: IncomingStock;
  userRole: "admin" | "auditor";
  onAssign: (stock: IncomingStock) => void;
}

const ReceivableTableRow = memo<ReceivableTableRowProps>(
  ({ stock, userRole, onAssign }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "incoming":
          return "bg-blue-100 text-blue-800";
        case "in-use":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const handleAssign = () => onAssign(stock);

    return (
      <TableRow key={stock.id}>
        <TableCell>
          <div>{stock.brand || "N/A"}</div>
        </TableCell>
        <TableCell>
          <div>{stock.model || "N/A"}</div>
        </TableCell>
        <TableCell>{stock.serialNumber || "N/A"}</TableCell>
        <TableCell>
          <div>{stock.supplier || "N/A"}</div>
          <div className="text-sm text-muted-foreground">
            Received: {stock.receivedDate || "N/A"}
          </div>
        </TableCell>
        <TableCell>
          <div>{stock.vendor || "N/A"}</div>
        </TableCell>
        <TableCell>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              stock.status
            )}`}
          >
            {stock.status.toUpperCase()}
          </span>
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
                  <ViewDetailsModal item={stock} title="Stock Item Details" />
                </DropdownMenuItem>
                {stock.status === "incoming" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleAssign();
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" /> Allocate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )}
        {userRole === "auditor" && (
          <TableCell>
            <ViewDetailsModal item={stock} title="Stock Item Details" />
          </TableCell>
        )}
      </TableRow>
    );
  }
);

ReceivableTableRow.displayName = "ReceivableTableRow";

export default ReceivableTableRow;
