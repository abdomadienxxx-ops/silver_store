export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  model: string;
  price: number;
  stock: number;
  image?: string;
  updatedBy: string;
  updatedAt: string; // ISO String
}

export interface RepairItem {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  issueDescription: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  cost: number;
  assignedTo: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface SaleItem {
  id: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  soldBy: string;
  soldAt: string; // ISO String
  customerName?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  timestamp: string; // ISO String
}
