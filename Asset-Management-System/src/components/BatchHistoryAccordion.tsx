import React, { useState, useMemo } from "react";
import type { IncomingStock } from "../types/inventory";
import {
  ChevronDown,
  ChevronRight,
  Package,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface BatchHistoryAccordionProps {
  incomingStock: IncomingStock[];
}

interface BatchGroup {
  batchTag: string;
  batchName?: string;
  batchDescription?: string;
  batchCreatedDate?: string;
  batchCreatedBy?: string;
  items: IncomingStock[];
  totalItems: number;
  allocatedItems: number;
  pendingItems: number;
}

const BatchHistoryAccordion: React.FC<BatchHistoryAccordionProps> = ({
  incomingStock,
}) => {
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(
    new Set()
  );

  const batchGroups = useMemo(() => {
    const groups: { [key: string]: BatchGroup } = {};

    incomingStock.forEach((item) => {
      const batchTag = item.batchTag || "No Batch";

      if (!groups[batchTag]) {
        groups[batchTag] = {
          batchTag,
          batchName: item.batchName,
          batchDescription: item.batchDescription,
          batchCreatedDate: item.batchCreatedDate,
          batchCreatedBy: item.batchCreatedBy,
          items: [],
          totalItems: 0,
          allocatedItems: 0,
          pendingItems: 0,
        };
      }

      groups[batchTag].items.push(item);
      groups[batchTag].totalItems++;

      if (item.status === "in-use") {
        groups[batchTag].allocatedItems++;
      } else {
        groups[batchTag].pendingItems++;
      }
    });

    return Object.values(groups).sort((a, b) => {
      // Sort by batch created date (newest first)
      if (a.batchCreatedDate && b.batchCreatedDate) {
        return (
          new Date(b.batchCreatedDate).getTime() -
          new Date(a.batchCreatedDate).getTime()
        );
      }
      return 0;
    });
  }, [incomingStock]);

  const toggleBatch = (batchTag: string) => {
    setExpandedBatches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(batchTag)) {
        newSet.delete(batchTag);
      } else {
        newSet.add(batchTag);
      }
      return newSet;
    });
  };

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

  if (batchGroups.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Package className="w-4 h-4" />
          <span className="text-sm">No batch history available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-bua-red" />
        Batch History ({batchGroups.length} batches)
      </h3>

      {batchGroups.map((batch) => (
        <div key={batch.batchTag} className="border rounded-lg overflow-hidden">
          <div
            className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleBatch(batch.batchTag)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {expandedBatches.has(batch.batchTag) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}

                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">{batch.batchTag}</span>
                  {batch.batchName && (
                    <span className="text-gray-600">- {batch.batchName}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {batch.totalItems} items
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {batch.allocatedItems} allocated
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {batch.pendingItems} pending
                  </Badge>
                </div>

                <div className="text-sm text-gray-500">
                  {batch.batchCreatedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(batch.batchCreatedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {batch.batchDescription && (
              <div className="mt-2 ml-7 text-sm text-gray-600">
                {batch.batchDescription}
              </div>
            )}

            {batch.batchCreatedBy && (
              <div className="mt-1 ml-7 text-xs text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                Created by: {batch.batchCreatedBy}
              </div>
            )}
          </div>

          {expandedBatches.has(batch.batchTag) && (
            <div className="bg-white border-t">
              <div className="p-4">
                <div className="space-y-2">
                  {batch.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">
                            {item.itemName || item.brand} {item.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            Serial: {item.serialNumber}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>

                        {item.allocatedAssetTag && (
                          <Badge variant="outline" className="text-xs">
                            Asset: {item.allocatedAssetTag}
                          </Badge>
                        )}

                        {item.allocatedDate && (
                          <div className="text-xs text-gray-500">
                            Allocated:{" "}
                            {new Date(item.allocatedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BatchHistoryAccordion;
