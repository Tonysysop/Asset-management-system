import type { Asset, Receivable, License } from "../types/inventory";

export const exportToCSV = (
  assets: Asset[],
  filename: string = "inventory-export"
) => {
  const headers = [
    "serialNumber",
    "type",
    "computeType",
    "peripheralType",
    "networkType",
    "brand",
    "model",
    "specifications",
    "warrantyExpiry",
    "vendor",
    "assignedUser",
    "staffId",
    "emailAddress",
    "department",
    "status",
    "location",
    "notes",
    "deployedDate",
    "imeiNumber",
    "computerName",
    "itemName",
    "screenSize",
    "resolution",
    "connectionType",
    "firmwareVersion",
    "ipAddress",
    "macAddress",
    "numberOfPorts",
    "rackPosition",
    "configBackupLocation",
    "uplinkDownlinkInfo",
    "poeSupport",
    "stackClusterMembership",
    "powerSupply",
    "serverRole",
    "installedApplications",
    "hostname",
    "processor",
    "ramSize",
    "storage",
    "operatingSystem",
    "productionIpAddress",
    "managementMacAddress",
    "specificPhysicalLocation",
    "ipAssignment",
    "managementMethod",
    "controllerName",
    "controllerAddress",
    "powerSource",
    "connectedSwitchName",
    "connectedSwitchPort",
    "ssidsBroadcasted",
    "frequencyBands",
  ];

  const csvContent = [
    headers.join(","),
    ...assets.map((asset) =>
      [
        asset.serialNumber || "",
        asset.type || "",
        asset.computeType || "",
        asset.peripheralType || "",
        asset.networkType || "",
        asset.brand || "",
        asset.model || "",
        `"${asset.specifications || ""}"`,
        asset.warrantyExpiry || "",
        `"${asset.vendor || ""}"`,
        `"${asset.assignedUser || ""}"`,
        asset.staffId || "",
        asset.emailAddress || "",
        asset.department || "",
        asset.status || "",
        `"${asset.location || ""}"`,
        `"${asset.notes || ""}"`,
        asset.deployedDate || "",
        asset.imeiNumber || "",
        asset.computerName || "",
        asset.itemName || "",
        asset.screenSize || "",
        asset.resolution || "",
        asset.connectionType || "",
        asset.firmwareVersion || "",
        asset.ipAddress || "",
        asset.macAddress || "",
        asset.numberOfPorts || "",
        asset.rackPosition || "",
        asset.configBackupLocation || "",
        asset.uplinkDownlinkInfo || "",
        asset.poeSupport || "",
        asset.stackClusterMembership || "",
        asset.powerSupply || "",
        asset.serverRole || "",
        `"${asset.installedApplications || ""}"`,
        asset.hostname || "",
        asset.processor || "",
        asset.ramSize || "",
        asset.storage || "",
        asset.operatingSystem || "",
        asset.productionIpAddress || "",
        asset.managementMacAddress || "",
        asset.specificPhysicalLocation || "",
        asset.ipAssignment || "",
        asset.managementMethod || "",
        asset.controllerName || "",
        asset.controllerAddress || "",
        asset.powerSource || "",
        asset.connectedSwitchName || "",
        asset.connectedSwitchPort || "",
        asset.ssidsBroadcasted || "",
        asset.frequencyBands || "",
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
    "itemName",
    "brand",
    "description",
    "serialNumber",
    "supplierName",
    "purchaseDate",
    "quantity",
    "warranty",
    "notes",
    "status",
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
        `"${receivable.notes}"`,
        receivable.status,
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
