import { z } from 'zod';
import { CARGO_TYPES } from '@/types/order';

const phoneRegex = /^\+?[0-9\s()-]{10,18}$/;

export const stepOneSchema = z.object({
  senderName: z.string().trim().min(2, 'Имя отправителя: минимум 2 символа'),
  senderPhone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Введите корректный телефон (например, +7 (900) 000-00-00)'),
  originCity: z.string().trim().min(2, 'Укажите город отправления'),
});

export const stepTwoSchema = z.object({
  recipientName: z.string().trim().min(2, 'Имя получателя: минимум 2 символа'),
  destinationCity: z.string().trim().min(2, 'Укажите город назначения'),
  cargoType: z.enum(CARGO_TYPES),
  weightKg: z
    .number({ invalid_type_error: 'Вес должен быть числом' })
    .min(0.1, 'Минимальный вес: 0.1 кг')
    .max(30, 'Максимальный вес: 30 кг'),
});

export const agreementSchema = z.object({
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласиться с условиями' }),
  }),
});

export const fullFormSchema = stepOneSchema
  .merge(stepTwoSchema)
  .merge(agreementSchema)
  .refine((data) => data.originCity.toLowerCase() !== data.destinationCity.toLowerCase(), {
    path: ['destinationCity'],
    message: 'Город назначения не должен совпадать с городом отправления',
  });
