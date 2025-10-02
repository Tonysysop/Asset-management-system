import type { Asset, Receivable, License } from "../types/inventory";

export const exportToCSV = (
  assets: Asset[],
  filename: string = "inventory-export"
) => {
  const headers = [
    "Asset Tag",
    "Serial Number",
    "Type",
    "Brand",
    "Model",
    "Specifications",
    "Deployed Date",
    "Warranty Expiry",
    "Vendor",
    "Assigned User",
    "Department",
    "Status",
    "Location",
    "Notes",
  ];

  const csvContent = [
    headers.join(","),
    ...assets.map((asset) =>
      [
        asset.assetTag,
        asset.serialNumber,
        asset.type,
        asset.brand,
        asset.model,
        `"${asset.specifications}"`,
        asset.deployedDate,
        asset.warrantyExpiry,
        `"${asset.vendor}"`,
        `"${asset.assignedUser}"`,
        asset.department,
        asset.status,
        `"${asset.location}"`,
        `"${asset.notes}"`,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportReceivablesToCSV = (
  receivables: Receivable[],
  filename: string = "receivables-export"
) => {
  const headers = [
    "Item Name",
    "Brand",
    "Description",
    "Serial Number",
    "Supplier Name",
    "Purchase Date",
    "Quantity",
    "Warranty",
    "Status",
    "Notes",
    "Assigned Users Count",
    "Total Assigned Quantity",
  ];

  const csvContent = [
    headers.join(","),
    ...receivables.map((receivable) =>
      [
        `"${receivable.itemName}"`,
        `"${receivable.brand}"`,
        `"${receivable.description}"`,
        receivable.serialNumber,
        `"${receivable.supplierName}"`,
        receivable.purchaseDate,
        receivable.quantity,
        `"${receivable.warranty}"`,
        receivable.status,
        `"${receivable.notes}"`,
        receivable.assignedUsers?.length || 0,
        receivable.assignedUsers?.reduce(
          (sum, user) => sum + user.quantityAssigned,
          0
        ) || 0,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportLicensesToCSV = (
  licenses: License[],
  filename: string = "licenses-export"
) => {
  const headers = [
    "License Name",
    "Vendor",
    "License Key",
    "Seats",
    "Purchase Date",
    "Expiry Date",
    "Assigned User",
    "Department",
    "Status",
    "Notes",
  ];

  const csvContent = [
    headers.join(","),
    ...licenses.map((license) =>
      [
        `"${license.licenseName}"`,
        `"${license.vendor}"`,
        `"${license.licenseKey}"`,
        license.seats,
        license.purchaseDate,
        license.expiryDate,
        `"${license.assignedUser}"`,
        license.department,
        license.status,
        `"${license.notes}"`,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
