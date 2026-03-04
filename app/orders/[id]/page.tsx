'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CARGO_TYPE_LABELS, STATUS_LABELS } from '@/lib/constants';
import { getOrderById } from '@/lib/storage';
import type { OrderRecord } from '@/types/order';
import { DetailProps } from '@/app/interfaces/interfaces';
import { formatDate } from '@/lib/formateDate';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [order, setOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (!id) {
      setOrder(null);
      return;
    }

    const found = getOrderById(id);
    setOrder(found ?? null);
  }, [id]);

  if (!order) {
    return (
      <section className="space-y-4">
        <div className="surface p-6">
          <h1 className="text-2xl font-bold">Заявка не найдена</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Возможно, заявка была удалена из localStorage или ID указан неверно.
          </p>
        </div>

        <Link
          href="/orders"
          className="inline-flex rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
        >
          Вернуться к истории
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
          Детали заявки
        </p>
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {order.originCity} → {order.destinationCity}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">ID: {order.id}</p>
      </header>

      <article className="surface grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        <Detail label="Отправитель" value={order.senderName} />
        <Detail label="Телефон отправителя" value={order.senderPhone} />
        <Detail label="Город отправления" value={order.originCity} />
        <Detail label="Получатель" value={order.recipientName} />
        <Detail label="Город назначения" value={order.destinationCity} />
        <Detail label="Тип груза" value={CARGO_TYPE_LABELS[order.cargoType]} />
        <Detail label="Вес" value={`${order.weightKg} кг`} />
        <Detail label="Статус" value={STATUS_LABELS[order.status]} />
        <Detail label="Дата создания" value={formatDate(order.createdAt)} />
      </article>

      <div className="flex gap-3">
        <Link
          href="/orders"
          className="inline-flex rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
        >
          К истории
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white! transition hover:opacity-90"
        >
          Новая заявка
        </Link>
      </div>
    </section>
  );
}

function Detail({ label, value }: DetailProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
