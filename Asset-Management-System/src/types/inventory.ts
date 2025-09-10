export type AssetType = 'laptop' | 'desktop' | 'printer' | 'server' | 'router' | 'switch' | 'mobile' | 'peripheral';
export type AssetStatus = 'in-use' | 'spare' | 'repair' | 'retired';
export type UserRole = 'admin' | 'auditor';
export type ReceivableStatus = 'pending' | 'received' | 'deployed';
export type LicenseStatus = 'active' | 'expired' | 'expiring-soon';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface Asset {
  id: string;
  assetTag: string;
  serialNumber: string;
  type: AssetType;
  brand: string;
  model: string;
  specifications: string;
  purchaseDate: string;
  warrantyExpiry: string;
  vendor: string;
  assignedUser: string;
  department: string;
  status: AssetStatus;
  location: string;
  notes: string;
}

export interface Receivable {
  id: string;
  itemName: string;
  category: AssetType;
  brand: string;
  description: string;
  serialNumber: string;
  colour: string;
  supplierName: string;
  purchaseDate: string;
  quantity: number;
  warranty: string;
  notes: string;
  status: ReceivableStatus;
  receivedDate?: string;
}

export interface License {
  id: string;
  licenseName: string;
  vendor: string;
  licenseKey: string;
  seats: number;
  purchaseDate: string;
  expiryDate: string;
  assignedUser: string;
  department: string;
  notes: string;
  status: LicenseStatus;
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
  itemType: 'asset' | 'receivable' | 'license';
  itemId: string;
  assetTag?: string;
  timestamp: Date;
  details: string;
}
