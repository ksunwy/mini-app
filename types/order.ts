export const CARGO_TYPES = ['documents', 'fragile', 'standard'] as const;
export type CargoType = (typeof CARGO_TYPES)[number];

export const ORDER_STATUSES = ['created'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderFormDraft {
  senderName: string;
  senderPhone: string;
  originCity: string;
  recipientName: string;
  destinationCity: string;
  cargoType: CargoType;
  weightKg: number;
  agreement: boolean;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  status: OrderStatus;
  senderName: string;
  senderPhone: string;
  originCity: string;
  recipientName: string;
  destinationCity: string;
  cargoType: CargoType;
  weightKg: number;
}
