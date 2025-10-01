export type AssetType =
  | "laptop"
  | "desktop"
  | "mobile"
  | "printer"
  | "scanner"
  | "monitor"
  | "server"
  | "router"
  | "switch";
export type AssetStatus = "in-use" | "spare" | "repair" | "retired";
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
  department: string;
  status: AssetStatus;
  location: string;
  notes: string;
  description?: string;
  peripheralType?: "printer" | "scanner" | "monitor";
  networkType?: "router" | "switch";
  itemName?: string;
  computeType?: "laptop" | "desktop" | "mobile" | "server";
  computerName?: string;
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
  status: LicenseStatus;
  assignedUsers?: LicenseUser[]; // For volume licenses
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Action {
  id: string;
  user: string;
  actionType: ActionType;
  itemType: "asset" | "receivable" | "license";
  itemId: string;
  assetTag?: string;
  timestamp: Date;
  details: string;
}
