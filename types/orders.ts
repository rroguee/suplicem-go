import { Address } from "./users";

export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "requested"
  | "on_the_way"
  | "delivered"
  | "accepted"
  | "in_progress"
  | "completed"
  | "canceled";

export interface DeliveryDetail {
  id?: string;
  productId: string;
  productName?: string;
  address?: Address;
  quantity: number;
  unit: string;
  status?: "pending" | "delivered" | string;
  delivered?: boolean;
  images?: string[];
  imageUrl?: string;
  comment?: string;
  availableAddresses?: Address[];
}

export interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  price?: number;
}

export interface Order {
  id: string;
  orderNumber: string | number;
  userId: string;
  deliveryType: "almacen" | "domicilio" | string;
  deliveryAddress?: Address;
  deliveries: DeliveryDetail[];
  items: OrderItem[];
  comments?: string;
  receiptImage?: string;
  status: OrderStatus;
  createdAt: string;
  paymentMethod?: "transfer" | "credit";
  bankAccountId?: string;
  creditNote?: string;
  declineReason?: string;
  rejectionReason?: string;
  userPhone?: string;
  userNames?: string;
  userLastNames?: string;
  userEmail?: string;
  userAddresses?: Address[];
  clientAddresses?: Address[];
  tripId?: string;
  driverId?: string;
  trackingEnabled?: any;
  aiRiskFlag?: boolean;
  aiRiskScore?: number;
  aiRiskReason?: string;
  totalTons?: number;
  pendingBalance?: number;
  deliveredTons?: number;
}

export interface OrderFilters {
  status?: string;
  deliveryType?: string;
  userId?: string;
  withoutTrip?: boolean;
}
