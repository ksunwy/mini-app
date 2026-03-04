'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ZodIssue } from 'zod';
import { CARGO_TYPE_LABELS, INITIAL_DRAFT, STATUS_LABELS } from '@/lib/constants';
import { clearDraft, createOrder, getDraft, saveDraft } from '@/lib/storage';
import { agreementSchema, fullFormSchema, stepOneSchema, stepTwoSchema } from '@/lib/validation';
import type { CargoType, OrderFormDraft, OrderRecord } from '@/types/order';
import { Dialog } from '@/components/Dialog';
import { Stepper } from '@/components/Stepper';

type Step = 1 | 2 | 3;
type ErrorState = Partial<Record<keyof OrderFormDraft, string>>;

const fieldClass =
  'mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]';

export function OrderForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<OrderFormDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<ErrorState>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);

  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      setForm({ ...INITIAL_DRAFT, ...draft });
    }
  }, []);

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  const summaryRows = useMemo(
    () => [
      { label: 'Отправитель', value: form.senderName },
      { label: 'Телефон', value: form.senderPhone },
      { label: 'Город отправления', value: form.originCity },
      { label: 'Получатель', value: form.recipientName },
      { label: 'Город назначения', value: form.destinationCity },
      { label: 'Тип груза', value: CARGO_TYPE_LABELS[form.cargoType] },
      { label: 'Вес', value: `${form.weightKg} кг` },
      { label: 'Статус', value: STATUS_LABELS.created },
    ],
    [form],
  );

  const setField = <K extends keyof OrderFormDraft>(key: K, value: OrderFormDraft[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const applyIssues = (issues: ZodIssue[]): void => {
    const nextErrors: ErrorState = {};

    for (const issue of issues) {
      const key = issue.path[0] as keyof OrderFormDraft | undefined;
      if (key && !nextErrors[key]) {
        nextErrors[key] = issue.message;
      }
    }

    setErrors(nextErrors);
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      const result = stepOneSchema.safeParse(form);
      if (!result.success) {
        applyIssues(result.error.issues);
        return false;
      }
      return true;
    }

    if (step === 2) {
      const result = stepTwoSchema
        .refine(
          (data) => data.destinationCity.toLowerCase() !== form.originCity.toLowerCase(),
          {
            path: ['destinationCity'],
            message: 'Город назначения не должен совпадать с городом отправления',
          },
        )
        .safeParse(form);

      if (!result.success) {
        applyIssues(result.error.issues);
        return false;
      }

      return true;
    }

    const result = agreementSchema.safeParse({ agreement: form.agreement });
    if (!result.success) {
      applyIssues(result.error.issues);
      return false;
    }

    const fullResult = fullFormSchema.safeParse(form);
    if (!fullResult.success) {
      applyIssues(fullResult.error.issues);
      return false;
    }

    return true;
  };

  const handleNext = (): void => {
    if (!validateStep()) {
      return;
    }

    setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev));
  };

  const handleBack = (): void => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!validateStep()) {
      return;
    }

    const newOrder: OrderRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'created',
      senderName: form.senderName,
      senderPhone: form.senderPhone,
      originCity: form.originCity,
      recipientName: form.recipientName,
      destinationCity: form.destinationCity,
      cargoType: form.cargoType,
      weightKg: form.weightKg,
    };

    createOrder(newOrder);
    clearDraft();
    setForm(INITIAL_DRAFT);
    setStep(1);
    setErrors({});
    setShowSuccessDialog(true);
  };

  return (
    <>
      <section className="space-y-5">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
            Оформление заявки
          </p>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Новая отправка</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Заполните форму из трех шагов. Все данные можно изменить до отправки.
          </p>
        </header>

        <Stepper currentStep={step} />

        <form className="surface p-5 sm:p-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="grid gap-4">
              <label className="text-sm font-semibold">
                Имя отправителя *
                <input
                  className={fieldClass}
                  value={form.senderName}
                  onChange={(event) => setField('senderName', event.target.value)}
                  placeholder="Например, Анна"
                />
                {errors.senderName ? (
                  <span className="mt-1 block text-xs text-[var(--danger)]">{errors.senderName}</span>
                ) : null}
              </label>

              <label className="text-sm font-semibold">
                Телефон *
                <input
                  className={fieldClass}
                  value={form.senderPhone}
                  onChange={(event) => setField('senderPhone', event.target.value)}
                  placeholder="+7 (900) 123-45-67"
                />
                {errors.senderPhone ? (
                  <span className="mt-1 block text-xs text-[var(--danger)]">{errors.senderPhone}</span>
                ) : null}
              </label>

              <label className="text-sm font-semibold">
                Город отправления *
                <input
                  className={fieldClass}
                  value={form.originCity}
                  onChange={(event) => setField('originCity', event.target.value)}
                  placeholder="Москва"
                />
                {errors.originCity ? (
                  <span className="mt-1 block text-xs text-[var(--danger)]">{errors.originCity}</span>
                ) : null}
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4">
              <label className="text-sm font-semibold">
                Имя получателя *
                <input
                  className={fieldClass}
                  value={form.recipientName}
                  onChange={(event) => setField('recipientName', event.target.value)}
                  placeholder="Сергей"
                />
                {errors.recipientName ? (
                  <span className="mt-1 block text-xs text-[var(--danger)]">{errors.recipientName}</span>
                ) : null}
              </label>

              <label className="text-sm font-semibold">
                Город назначения *
                <input
                  className={fieldClass}
                  value={form.destinationCity}
                  onChange={(event) => setField('destinationCity', event.target.value)}
                  placeholder="Санкт-Петербург"
                />
                {errors.destinationCity ? (
                  <span className="mt-1 block text-xs text-[var(--danger)]">{errors.destinationCity}</span>
                ) : null}
              </label>

              <label className="text-sm font-semibold">
                Тип груза
                <select
                  className={fieldClass}
                  value={form.cargoType}
                  onChange={(event) => setField('cargoType', event.target.value as CargoType)}
                >
                  <option value="documents">Документы</option>
                  <option value="fragile">Хрупкое</option>
                  <option value="standard">Обычное</option>
                </select>
              </label>

              <label className="text-sm font-semibold">
                Вес, кг (0.1–30) *
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="30"
                  className={fieldClass}
                  value={Number.isNaN(form.weightKg) ? '' : form.weightKg}
                  onChange={(event) => {
                    const value =
                      event.target.value.trim() === '' ? Number.NaN : Number(event.target.value);
                    setField('weightKg', value);
                  }}
                />
                {errors.weightKg ? (
                  <span className="mt-1 block text-xs text-[var(--danger)]">{errors.weightKg}</span>
                ) : null}
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="grid gap-2 rounded-xl bg-slate-50 p-4">
                {summaryRows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2 text-sm last:border-none last:pb-0">
                    <span className="font-semibold text-[var(--text-muted)]">{row.label}</span>
                    <span className="text-right font-medium">{row.value || '-'}</span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--accent)]"
                  checked={form.agreement}
                  onChange={(event) => setField('agreement', event.target.checked)}
                />
                <span>
                  Подтверждаю согласие с условиями отправки и обработкой персональных данных.
                </span>
              </label>
              {errors.agreement ? (
                <span className="block text-xs text-[var(--danger)]">{errors.agreement}</span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Назад
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Далее
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Отправить
                </button>
              )}
            </div>

            <Link
              href="/orders"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-slate-50"
            >
              Перейти в историю
            </Link>
          </div>
        </form>
      </section>

      <Dialog
        isOpen={showSuccessDialog}
        title="Заявка сохранена"
        description="Новая заявка успешно добавлена в историю отправлений."
        confirmText="Открыть историю"
        cancelText="Остаться"
        onCancel={() => setShowSuccessDialog(false)}
        onConfirm={() => {
          setShowSuccessDialog(false);
          router.push('/orders');
        }}
      />
    </>
  );
}
