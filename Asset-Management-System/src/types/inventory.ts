export type AssetType = "compute" | "peripheral" | "network";
export type AssetStatus = "in-use" | "spare" | "repair" | "retired";
export type IncomingStockStatus = "incoming" | "in-use";
export type UserRole = "admin" | "user" | "auditor";
export type ReceivableStatus = "pending" | "received" | "deployed";
export type LicenseStatus = "active" | "expired" | "expiring-soon";
export type LicenseType = "one-off" | "volume";
export type ActionType = "CREATE" | "UPDATE" | "DELETE";

export interface LicenseUser {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedDate: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  serialNumber: string;
  type: AssetType;
  brand: string;
  model: string;
  specifications: string;
  deployedDate: string;
  warrantyExpiry: string;
  vendor: string;
  assignedUser: string;
  staffId?: string;
  emailAddress?: string;
  department: string;
  status: AssetStatus;
  location: string;
  notes: string;
  createdAt?: string; // Timestamp when asset was added to the system
  // Batch tracking (inherited from incoming stock)
  batchTag?: string;
  batchName?: string;
  batchDescription?: string;
  batchCreatedDate?: string;
  batchCreatedBy?: string;
  description?: string;
  peripheralType?: "printer" | "scanner" | "monitor";
  networkType?: "router" | "switch" | "access_point";
  itemName?: string;
  computeType?: "laptop" | "desktop" | "mobile" | "server";
  computerName?: string;
  imeiNumber?: string;
  // Monitor specific fields
  screenSize?: string;
  resolution?: string;
  connectionType?: string;
  // Network Asset specific fields
  firmwareVersion?: string;
  ipAddress?: string;
  macAddress?: string;
  numberOfPorts?: string;
  rackPosition?: string;
  configBackupLocation?: string;
  uplinkDownlinkInfo?: string;
  poeSupport?: string;
  stackClusterMembership?: string;
  // Server specific fields
  hostname?: string;
  processor?: string;
  ramSize?: string;
  storage?: string;
  operatingSystem?: string;
  productionIpAddress?: string;
  managementMacAddress?: string;
  powerSupply?: string;
  serverRole?: string;
  installedApplications?: string;
  // Access Point specific fields
  specificPhysicalLocation?: string;
  ipAssignment?: string;
  managementMethod?: string;
  controllerName?: string;
  controllerAddress?: string;
  powerSource?: string;
  connectedSwitchName?: string;
  connectedSwitchPort?: string;
  ssidsBroadcasted?: string;
  frequencyBands?: string;
}

export interface RetrievedAsset extends Asset {
  retrievedDate: string;
  retrievedBy: string;
  retrieveReason?: string;
}

export interface ReceivableUser {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedDate: string;
  quantityAssigned: number;
}

export interface Receivable {
  id: string;
  itemName: string;
  brand: string;
  description: string;
  serialNumber: string;
  supplierName: string;
  purchaseDate: string;
  quantity: number;
  warranty: string;
  notes: string;
  status: ReceivableStatus;
  receivedDate?: string;
  assignedUsers?: ReceivableUser[];
}

export interface License {
  id: string;
  licenseName: string;
  vendor: string;
  licenseKey: string;
  licenseType: LicenseType;
  seats: number;
  purchaseDate: string;
  expiryDate: string;
  assignedUser: string; // For one-off licenses
  department: string;
  notes: string;
  status?: LicenseStatus; // Optional, calculated from expiry date
  assignedUsers?: LicenseUser[]; // For volume licenses
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface IncomingStock {
  id: string;
  serialNumber: string;
  status: IncomingStockStatus;
  assetType: AssetType;
  assetSubtype: string;
  brand: string;
  model: string;
  supplier?: string;
  receivedDate?: string;
  sheetId?: string;
  // Batch/Tag tracking
  batchTag?: string;
  batchName?: string;
  batchDescription?: string;
  batchCreatedDate?: string;
  batchCreatedBy?: string;
  // Allocation tracking
  allocatedDate?: string;
  allocatedBy?: string;
  allocatedAssetTag?: string;
  // Additional fields for allocation
  assetTag?: string;
  specifications?: string;
  deployedDate?: string;
  warrantyExpiry?: string;
  vendor?: string;
  assignedUser?: string;
  staffId?: string;
  emailAddress?: string;
  department?: string;
  location?: string;
  notes?: string;
  description?: string;
  peripheralType?: "printer" | "scanner" | "monitor";
  networkType?: "router" | "switch" | "access_point";
  itemName?: string;
  computeType?: "laptop" | "desktop" | "mobile" | "server";
  computerName?: string;
  imeiNumber?: string;
  // Monitor specific fields
  screenSize?: string;
  resolution?: string;
  connectionType?: string;
  // Network Asset specific fields
  firmwareVersion?: string;
  ipAddress?: string;
  macAddress?: string;
  numberOfPorts?: string;
  rackPosition?: string;
  configBackupLocation?: string;
  uplinkDownlinkInfo?: string;
  poeSupport?: string;
  stackClusterMembership?: string;
  // Server specific fields
  hostname?: string;
  processor?: string;
  ramSize?: string;
  storage?: string;
  operatingSystem?: string;
  productionIpAddress?: string;
  managementMacAddress?: string;
  powerSupply?: string;
  serverRole?: string;
  installedApplications?: string;
  // Access Point specific fields
  specificPhysicalLocation?: string;
  ipAssignment?: string;
  managementMethod?: string;
  controllerName?: string;
  controllerAddress?: string;
  powerSource?: string;
  connectedSwitchName?: string;
  connectedSwitchPort?: string;
  ssidsBroadcasted?: string;
  frequencyBands?: string;
}

export interface Action {
  id: string;
  user: string;
  actionType: ActionType;
  itemType:
  | "asset"
  | "receivable"
  | "license"
  | "incoming-stock"
  | "consumable";
  itemId: string;
  assetTag?: string;
  timestamp: Date;
  details: string;
}

export type ConsumableCategory =
  | "cables"
  | "peripherals"
  | "office_supplies"
  | "networking"
  | "accessories"
  | "other";

export interface Consumable {
  id: string;
  itemName: string;
  category: ConsumableCategory;
  description: string;
  currentQuantity: number;
  reorderPoint: number;
  unitCost: number;
  supplier?: string;
  lastReceivedDate?: string;
  lastIssuedDate?: string;
  totalReceived: number;
  totalIssued: number;
  notes?: string;
}

export interface ConsumableTransaction {
  id: string;
  consumableId: string;
  consumableName: string;
  transactionType: "receive" | "issue";
  quantity: number;
  unitCost: number;
  totalCost: number;
  transactionDate: string;
  issuedTo?: string;
  emailAddress?: string;
  issuedBy: string;
  department?: string;
  reason?: string;
  reference?: string;
  notes?: string;
}
