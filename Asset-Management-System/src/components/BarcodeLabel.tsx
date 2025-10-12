import React, { useRef } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "./ui/button";
import { Printer, Barcode as BarcodeIcon, QrCode } from "lucide-react";
import type { Asset } from "../types/inventory";

interface BarcodeLabelProps {
  asset: Asset;
  showPrintButton?: boolean;
}

const BarcodeLabel: React.FC<BarcodeLabelProps> = ({
  asset,
  showPrintButton = true,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate comprehensive QR code data
  const generateQRData = () => {
    const qrData = {
      assetTag: asset.assetTag,
      serialNumber: asset.serialNumber,
      brand: asset.brand,
      model: asset.model,
      type: asset.type,
      ...(asset.computeType && { computeType: asset.computeType }),
      ...(asset.peripheralType && { peripheralType: asset.peripheralType }),
      ...(asset.networkType && { networkType: asset.networkType }),
      assignedUser: asset.assignedUser,
      department: asset.department,
      status: asset.status,
      location: asset.location,
      deployedDate: asset.deployedDate,
      warrantyExpiry: asset.warrantyExpiry,
      ...(asset.staffId && { staffId: asset.staffId }),
      ...(asset.emailAddress && { emailAddress: asset.emailAddress }),
      ...(asset.computerName && { computerName: asset.computerName }),
    };
    return JSON.stringify(qrData);
  };

  const handlePrint = (type: "both" | "barcode" | "qr" = "both") => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let content = "";

    if (type === "barcode") {
      content = barcodeRef.current?.innerHTML || "";
    } else if (type === "qr") {
      content = qrRef.current?.innerHTML || "";
    } else {
      content = printRef.current?.innerHTML || "";
    }

    if (!content) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ${
            type === "barcode" ? "Barcode" : type === "qr" ? "QR Code" : "Label"
          } - ${asset.assetTag}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: auto;
              margin: 15mm;
            }
            
            html, body {
              height: auto;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
              padding: 20px;
            }
            
            .print-container {
              max-width: 100%;
              page-break-inside: avoid;
              page-break-after: avoid;
            }
            
            /* Red dotted border for QR code container */
            .border-bua-red {
              border: 2px dashed #991B1E !important;
            }
            
            /* Preserve other styling */
            .border-dashed {
              border-style: dashed !important;
            }
            
            .rounded-lg {
              border-radius: 8px;
            }
            
            .p-6 {
              padding: 1.5rem;
            }
            
            .bg-white {
              background-color: white;
            }
            
            /* Prevent page breaks */
            * {
              page-break-inside: avoid;
              page-break-after: avoid;
            }
            
            svg {
              display: block;
              max-width: 100%;
            }
            
            /* Container styling */
            .flex {
              display: flex;
            }
            
            .flex-col {
              flex-direction: column;
            }
            
            .items-center {
              align-items: center;
            }
            
            .justify-center {
              justify-content: center;
            }
            
            .space-y-2 > * + * {
              margin-top: 0.5rem;
            }
            
            .space-y-3 > * + * {
              margin-top: 0.75rem;
            }
            
            .text-center {
              text-align: center;
            }
            
            .text-xs {
              font-size: 0.75rem;
            }
            
            .text-sm {
              font-size: 0.875rem;
            }
            
            .font-semibold {
              font-weight: 600;
            }
            
            .font-medium {
              font-weight: 500;
            }
            
            .text-bua-red {
              color: #991B1E;
            }
            
            .text-gray-500 {
              color: #6b7280;
            }
            
            .text-gray-600 {
              color: #4b5563;
            }
            
            .text-gray-700 {
              color: #374151;
            }
            
            .mb-1 {
              margin-bottom: 0.25rem;
            }
            
            .mt-1 {
              margin-top: 0.25rem;
            }
            
            .pt-2 {
              padding-top: 0.5rem;
            }
            
            .p-4 {
              padding: 1rem;
            }
            
            .shadow-sm {
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            
            .capitalize {
              text-transform: capitalize;
            }
            
            .w-full {
              width: 100%;
            }
            
            .max-w-full {
              max-width: 100%;
            }
            
            .overflow-hidden {
              overflow: hidden;
            }
            
            .print-label {
              width: 4in;
              height: 2in;
              border: 2px dashed #ccc;
              padding: 0.25in;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              background: white;
              page-break-after: always;
            }
            
            .label-header {
              margin-bottom: 8px;
            }
            
            .company-name {
              font-size: 14px;
              font-weight: bold;
              color: #991B1E;
              margin: 0;
            }
            
            .asset-info {
              margin: 8px 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 2px;
            }
            
            .asset-tag {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              margin: 0;
            }
            
            .asset-details {
              font-size: 10px;
              color: #666;
              margin: 0;
            }
            
            .codes-container {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin: 10px 0;
              width: 100%;
            }
            
            .barcode-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 12px;
              background: #fafafa;
            }
            
            .barcode-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 6px;
            }
            
            .barcode-container svg {
              max-width: 100%;
              height: auto;
            }
            
            .qr-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2px solid #991B1E;
              border-radius: 8px;
              padding: 16px;
              background: white;
            }
            
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
            }
            
            .section-label {
              font-size: 9px;
              color: #666;
              text-align: center;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .qr-section .section-label {
              color: #991B1E;
            }
            
            @media screen {
              .print-label {
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              .qr-section {
                box-shadow: 0 2px 8px rgba(153, 27, 30, 0.15);
              }
              
              .barcode-section {
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
              }
            }
            
            @media print {
              @page {
                size: 4in 2in;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container" style="max-width: 600px; margin: 0 auto;">
            ${content}
          </div>
          <script>
            // Remove any empty elements that might cause extra pages
            document.querySelectorAll('*').forEach(el => {
              if (el.offsetHeight === 0 && el.children.length === 0 && !el.textContent.trim()) {
                el.remove();
              }
            });
            
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 300);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Preview - Side by Side Containers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Barcode Preview Container */}
        <div className="space-y-2">
          {showPrintButton && (
            <Button
              onClick={() => handlePrint("barcode")}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              title="Print Barcode Only"
            >
              <Printer className="w-4 h-4" />
              Print Barcode
            </Button>
          )}
          <div
            ref={barcodeRef}
            className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-white flex flex-col items-center justify-center space-y-3 overflow-hidden"
          >
            <div className="flex flex-col items-center space-y-2 w-full max-w-full">
              <div className="max-w-full overflow-hidden flex justify-center items-center">
                <Barcode
                  value={asset.assetTag}
                  format="CODE128"
                  width={1.2}
                  height={50}
                  fontSize={12}
                  margin={0}
                />
              </div>
            </div>
            <div className="text-center pt-2">
              <p className="text-xs text-gray-600">
                {asset.brand} {asset.model}
              </p>
              {asset.type && (
                <p className="text-xs text-gray-500 capitalize">
                  {asset.type}
                  {asset.computeType && ` - ${asset.computeType}`}
                  {asset.peripheralType && ` - ${asset.peripheralType}`}
                  {asset.networkType && ` - ${asset.networkType}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Preview Container */}
        <div className="space-y-2">
          {showPrintButton && (
            <Button
              onClick={() => handlePrint("qr")}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              title="Print QR Code Only"
            >
              <Printer className="w-4 h-4" />
              Print QR Code
            </Button>
          )}
          <div
            ref={qrRef}
            className="border-2 border-dashed border-bua-red rounded-lg p-6 bg-white flex flex-col items-center justify-center space-y-3"
          >
            <div className="text-center">
              <p className="text-xs font-semibold text-bua-red mb-1">QR CODE</p>
            </div>
            <div className="flex flex-col items-center space-y-2 bg-white p-4 rounded-lg shadow-sm">
              <QRCodeSVG
                value={generateQRData()}
                size={160}
                level="M"
                includeMargin={true}
              />
            </div>
            <div className="text-center pt-2">
              <p className="text-sm font-medium text-bua-red">
                {asset.assetTag}
              </p>
              <p className="text-xs text-gray-600">
                {asset.brand} {asset.model}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden print template */}
      <div className="hidden">
        <div ref={printRef}>
          <div className="print-label">
            <div className="label-header">
              <p className="company-name">BUA Group</p>
            </div>

            <div className="asset-info">
              <p className="asset-tag">{asset.assetTag}</p>
              <p className="asset-details">
                {asset.brand} {asset.model}
              </p>
              {asset.type && (
                <p
                  className="asset-details"
                  style={{ textTransform: "capitalize" }}
                >
                  {asset.type}
                  {asset.computeType && ` - ${asset.computeType}`}
                  {asset.peripheralType && ` - ${asset.peripheralType}`}
                  {asset.networkType && ` - ${asset.networkType}`}
                </p>
              )}
            </div>

            <div className="codes-container">
              <div className="barcode-section">
                <div className="barcode-container">
                  <Barcode
                    value={asset.assetTag}
                    format="CODE128"
                    width={1.5}
                    height={40}
                    fontSize={12}
                    margin={0}
                    displayValue={false}
                  />
                </div>
                <p className="section-label">Quick Scan</p>
              </div>
              <div className="qr-section">
                <div className="qr-container">
                  <QRCodeSVG
                    value={generateQRData()}
                    size={85}
                    level="M"
                    includeMargin={false}
                  />
                  <p className="section-label">Full Details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          <strong>Barcode (CODE128):</strong> Quick scan to identify asset tag.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>QR Code:</strong> Stores comprehensive asset information
          including serial number, brand, model, assigned user, department,
          location, and more.
        </p>
        <p className="text-xs text-muted-foreground">
          Click "Print Label" to print a physical label with both codes for
          attachment to the asset.
        </p>
      </div>
    </div>
  );
};

export default BarcodeLabel;
