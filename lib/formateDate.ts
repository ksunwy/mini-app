export const formatDate = (value: string): string => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
};