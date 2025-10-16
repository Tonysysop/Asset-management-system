import React, { useState, useCallback, useMemo } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, X } from "lucide-react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import type { IncomingStock } from "../types/inventory";

interface IncomingStockImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stockItems: Omit<IncomingStock, "id">[]) => void;
}

const IncomingStockImportModal: React.FC<IncomingStockImportModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [transformedData, setTransformedData] = useState<
    Omit<IncomingStock, "id">[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchDetails, setBatchDetails] = useState({
    batchTag: "",
    batchName: "",
    batchDescription: "",
  });

  const expectedHeaders = useMemo(
    () => [
      "Serial Number",
      "Asset Type",
      "Asset Subtype",
      "Brand",
      "Model",
      "Vendor",
    ],
    []
  );

  const sampleData = `Serial Number,Asset Type,Asset Subtype,Brand,Model,Vendor
SN001,compute,laptop,Dell,Latitude 7420,Dell Inc.
SN002,peripheral,monitor,Samsung,24" FHD Monitor,Samsung Electronics
SN003,network,router,Cisco,ISR 4331,Cisco Systems`;

  const handleFileParse = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      setTransformedData(null);

      try {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError(
                `Parse errors: ${results.errors
                  .map((e) => e.message)
                  .join(", ")}`
              );
              setIsLoading(false);
              return;
            }

            const data = results.data as Record<string, string>[];

            // Validate headers
            const headers = Object.keys(data[0] || {});
            const missingHeaders = expectedHeaders.filter(
              (h) => !headers.includes(h)
            );

            if (missingHeaders.length > 0) {
              setError(
                `Missing required headers: ${missingHeaders.join(", ")}`
              );
              setIsLoading(false);
              return;
            }

            // Transform data
            const transformed = data.map((row, index) => {
              const stock: Omit<IncomingStock, "id"> = {
                serialNumber: row["Serial Number"]?.toString().trim() || "",
                status: "incoming",
                assetType: row["Asset Type"]
                  ?.toString()
                  .trim()
                  .toLowerCase() as "compute" | "peripheral" | "network",
                assetSubtype:
                  row["Asset Subtype"]?.toString().trim().toLowerCase() || "",
                brand: row["Brand"]?.toString().trim() || "",
                model: row["Model"]?.toString().trim() || "",
                vendor: row["Vendor"]?.toString().trim() || "",
              };

              // Validate required fields
              if (
                !stock.serialNumber ||
                !stock.assetType ||
                !stock.assetSubtype ||
                !stock.brand ||
                !stock.model ||
                !stock.vendor
              ) {
                throw new Error(`Row ${index + 2}: Missing required fields`);
              }

              // Validate asset type
              if (
                !["compute", "peripheral", "network"].includes(stock.assetType)
              ) {
                throw new Error(
                  `Row ${index + 2}: Invalid asset type "${stock.assetType}"`
                );
              }

              return stock;
            });

            setTransformedData(transformed);
            setShowBatchForm(true);
            setIsLoading(false);
          },
          error: (error) => {
            setError(`Parse error: ${error.message}`);
            setIsLoading(false);
          },
        });
      } catch (err) {
        setError(
          `File processing error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setIsLoading(false);
      }
    },
    [expectedHeaders]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(
      (file) => file.type === "text/csv" || file.name.endsWith(".csv")
    );

    if (csvFile) {
      handleFileParse(csvFile);
    } else {
      setError("Please drop a CSV file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileParse(file);
    }
  };

  const handleClose = () => {
    setTransformedData(null);
    setError(null);
    setIsLoading(false);
    setShowBatchForm(false);
    setBatchDetails({
      batchTag: "",
      batchName: "",
      batchDescription: "",
    });
    onClose();
  };

  const handleImportWithBatch = () => {
    if (!transformedData) return;

    const finalData = transformedData.map((item) => ({
      ...item,
      batchTag: batchDetails.batchTag || "",
      batchName: batchDetails.batchName || "",
      batchDescription: batchDetails.batchDescription || "",
      batchCreatedDate: new Date().toISOString(),
      batchCreatedBy: "store@buagroup.com",
    }));

    onSave(finalData);
    handleClose();
  };

  const downloadSample = () => {
    const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "incoming-stock-sample.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Incoming Stock</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple incoming stock items at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              CSV Format Requirements:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Required headers: {expectedHeaders.join(", ")}</li>
              <li>• Asset Type must be: compute, peripheral, or network</li>
              <li>
                • Asset Subtype must match the asset type (e.g., laptop, desktop
                for compute)
              </li>
              <li>• All fields are required</li>
            </ul>
          </div>

          {/* Sample Download */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900">Sample CSV File</h4>
              <p className="text-sm text-gray-600">
                Download a sample file to see the correct format
              </p>
            </div>
            <Button onClick={downloadSample} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Download Sample
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-bua-red bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Only CSV files are supported
              </p>
            </label>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bua-red"></div>
              <span className="ml-2 text-gray-600">Processing file...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900">Import Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {transformedData && !error && (
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900">
                    File Processed Successfully
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Found {transformedData.length} valid incoming stock items
                    ready to import.
                  </p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-semibold text-gray-900">
                    Preview (First 5 items)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Serial Number</th>
                        <th className="px-3 py-2 text-left">Asset Type</th>
                        <th className="px-3 py-2 text-left">Subtype</th>
                        <th className="px-3 py-2 text-left">Brand</th>
                        <th className="px-3 py-2 text-left">Model</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transformedData.slice(0, 5).map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2">{item.serialNumber}</td>
                          <td className="px-3 py-2 capitalize">
                            {item.assetType}
                          </td>
                          <td className="px-3 py-2 capitalize">
                            {item.assetSubtype.replace("_", " ")}
                          </td>
                          <td className="px-3 py-2">{item.brand}</td>
                          <td className="px-3 py-2">{item.model}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Batch Details Form */}
        {showBatchForm && transformedData && !error && (
          <div className="space-y-4 pt-4 border-t">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Batch Information (Optional)
              </h4>
              <p className="text-sm text-blue-800">
                You can optionally add batch information that will be applied to
                all {transformedData.length} items.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Tag
                </label>
                <input
                  type="text"
                  value={batchDetails.batchTag}
                  onChange={(e) =>
                    setBatchDetails((prev) => ({
                      ...prev,
                      batchTag: e.target.value,
                    }))
                  }
                  placeholder="e.g., BATCH-2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={batchDetails.batchName}
                  onChange={(e) =>
                    setBatchDetails((prev) => ({
                      ...prev,
                      batchName: e.target.value,
                    }))
                  }
                  placeholder="e.g., Q1 2024 Laptop Delivery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Description
              </label>
              <textarea
                value={batchDetails.batchDescription}
                onChange={(e) =>
                  setBatchDetails((prev) => ({
                    ...prev,
                    batchDescription: e.target.value,
                  }))
                }
                placeholder="e.g., New laptops for Q1 deployment"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bua-red focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          {showBatchForm && transformedData && !error && (
            <Button
              onClick={handleImportWithBatch}
              className="bg-bua-red hover:bg-bua-red/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import {transformedData.length} Items
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { IncomingStockImportModal };
