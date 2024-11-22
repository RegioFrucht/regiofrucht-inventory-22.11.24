export interface Product {
  id: string;
  name: string;
  category: 'fruits' | 'vegetables' | 'salads';
  unit: string;
  order: number;
  kgFactor: number;
  deleted?: boolean;
  deletedAt?: string;
}

export interface InventoryEntry {
  productId: string;
  quantity: number;
  demand: number;
  date: string;
}

export interface DailyInventory {
  date: string;
  entries: InventoryEntry[];
  deleted?: boolean;
  deletedAt?: string;
}