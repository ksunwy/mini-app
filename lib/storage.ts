import { STORAGE_KEYS } from '@/lib/constants';
import type { OrderFormDraft, OrderRecord } from '@/types/order';

const hasWindow = (): boolean => typeof window !== 'undefined';

export const getOrders = (): OrderRecord[] => {
  if (!hasWindow()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as OrderRecord[];
  } catch {
    return [];
  }
};

export const saveOrders = (orders: OrderRecord[]): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const createOrder = (order: OrderRecord): void => {
  const existing = getOrders();
  saveOrders([order, ...existing]);
};

export const removeOrder = (id: string): void => {
  const next = getOrders().filter((order) => order.id !== id);
  saveOrders(next);
};

export const getOrderById = (id: string): OrderRecord | undefined => {
  return getOrders().find((order) => order.id === id);
};

export const saveDraft = (draft: OrderFormDraft): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
};

export const getDraft = (): OrderFormDraft | null => {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.DRAFT);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed as OrderFormDraft;
  } catch {
    return null;
  }
};

export const clearDraft = (): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.DRAFT);
};
