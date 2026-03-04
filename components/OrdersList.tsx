'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CARGO_TYPE_LABELS, STATUS_LABELS } from '@/lib/constants';
import { getOrders, removeOrder } from '@/lib/storage';
import type { CargoType, OrderRecord } from '@/types/order';
import { Dialog } from '@/components/Dialog';

const fieldClass =
  'w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]';

const formatDate = (value: string): string => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export function OrdersList() {
  const [orders, setOrders] = useState<OrderRecord[]>(() => getOrders());
  const [search, setSearch] = useState<string>('');
  const [cargoFilter, setCargoFilter] = useState<'all' | CargoType>('all');
  const [toDelete, setToDelete] = useState<OrderRecord | null>(null);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const byCargo = cargoFilter === 'all' ? true : order.cargoType === cargoFilter;
      const bySearch =
        normalizedSearch.length === 0
          ? true
          : order.recipientName.toLowerCase().includes(normalizedSearch) ||
            order.destinationCity.toLowerCase().includes(normalizedSearch);

      return byCargo && bySearch;
    });
  }, [orders, search, cargoFilter]);

  const handleDelete = (): void => {
    if (!toDelete) {
      return;
    }

    removeOrder(toDelete.id);
    setOrders((prev) => prev.filter((order) => order.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <>
      <section className="space-y-5">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
            История заявок
          </p>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Оформленные отправления</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Ищите по имени получателя и городу назначения, фильтруйте по типу груза.
          </p>
        </header>

        <div className="surface grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          <label className="space-y-1 text-sm font-semibold">
            Поиск
            <input
              className={fieldClass}
              placeholder="Имя получателя или город назначения"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="space-y-1 text-sm font-semibold">
            Фильтр по типу груза
            <select
              className={fieldClass}
              value={cargoFilter}
              onChange={(event) => setCargoFilter(event.target.value as 'all' | CargoType)}
            >
              <option value="all">Все типы</option>
              <option value="documents">Документы</option>
              <option value="fragile">Хрупкое</option>
              <option value="standard">Обычное</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="surface p-5 text-sm text-[var(--text-muted)]">
              По выбранным условиям ничего не найдено.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <article key={order.id} className="surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold">
                      {order.originCity} → {order.destinationCity}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Отправитель: {order.senderName} | Получатель: {order.recipientName}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Тип груза: {CARGO_TYPE_LABELS[order.cargoType]} | Статус: {STATUS_LABELS[order.status]}
                    </p>
                    <p className="text-xs text-slate-500">Создана: {formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold transition hover:bg-slate-50"
                    >
                      Открыть
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(order)}
                      className="rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)] transition hover:opacity-90"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
          >
            Создать новую заявку
          </Link>
        </div>
      </section>

      <Dialog
        isOpen={Boolean(toDelete)}
        title="Удалить заявку?"
        description="Это действие нельзя отменить. Заявка будет удалена из истории без возможности восстановления."
        confirmText="Удалить"
        cancelText="Отмена"
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        tone="danger"
      />
    </>
  );
}
