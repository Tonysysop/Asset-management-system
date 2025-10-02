import  { memo } from "react";
import { Edit, Trash2, MoreVertical, UserPlus } from "lucide-react";
import type { Receivable } from "../types/inventory";
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
  receivable: Receivable;
  userRole: "admin" | "auditor";
  onEdit: (receivable: Receivable) => void;
  onDelete: (id: string) => void;
  onAssign: (receivable: Receivable) => void;
}

const ReceivableTableRow = memo<ReceivableTableRowProps>(
  ({ receivable, userRole, onEdit, onDelete, onAssign }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "received":
          return "bg-green-100 text-green-800";
        case "pending":
          return "bg-amber-100 text-amber-800";
        case "deployed":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const handleEdit = () => onEdit(receivable);
    const handleDelete = () => onDelete(receivable.id);
    const handleAssign = () => onAssign(receivable);

    return (
      <TableRow key={receivable.id}>
        <TableCell>
          <div className="font-medium">{receivable.itemName}</div>
          <div className="text-sm text-muted-foreground">
            {receivable.description}
          </div>
        </TableCell>
        <TableCell>
          <div>{receivable.brand}</div>
        </TableCell>
        <TableCell>{receivable.serialNumber}</TableCell>
        <TableCell>
          <div>{receivable.supplierName}</div>
          <div className="text-sm text-muted-foreground">
            Purchased: {receivable.purchaseDate}
          </div>
        </TableCell>
        <TableCell>{receivable.quantity}</TableCell>
        <TableCell>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              receivable.status
            )}`}
          >
            {receivable.status.toUpperCase()}
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
                  <ViewDetailsModal
                    item={receivable}
                    title="Receivable Details"
                  />
                </DropdownMenuItem>
                {receivable.status === "received" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleAssign();
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Assign
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    handleEdit();
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
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
            <ViewDetailsModal item={receivable} title="Receivable Details" />
          </TableCell>
        )}
      </TableRow>
    );
  }
);

ReceivableTableRow.displayName = "ReceivableTableRow";

export default ReceivableTableRow;
