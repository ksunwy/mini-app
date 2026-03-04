import type { CargoType, OrderFormDraft } from '@/types/order';

export const STORAGE_KEYS = {
  ORDERS: 'delivery-orders',
  DRAFT: 'delivery-order-draft',
} as const;

export const CARGO_TYPE_LABELS: Record<CargoType, string> = {
  documents: 'Документы',
  fragile: 'Хрупкое',
  standard: 'Обычное',
};

export const STATUS_LABELS = {
  created: 'Создана',
} as const;

export const INITIAL_DRAFT: OrderFormDraft = {
  senderName: '',
  senderPhone: '',
  originCity: '',
  recipientName: '',
  destinationCity: '',
  cargoType: 'standard',
  weightKg: 1,
  agreement: false,
};
