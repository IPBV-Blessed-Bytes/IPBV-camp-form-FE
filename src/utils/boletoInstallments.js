const parseLocalDate = (value) => {
  if (value instanceof Date) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (!match) return new Date(NaN);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const monthIndex = (date) => date.getFullYear() * 12 + date.getMonth();

export const getMaxBoletoInstallments = (eventDate, maxCap, now = new Date()) => {
  if (!eventDate) return 0;

  const event = parseLocalDate(eventDate);
  if (Number.isNaN(event.getTime())) return 0;

  const cap = Number(maxCap) > 0 ? Number(maxCap) : 0;
  if (cap <= 0) return 0;

  const monthsUntilEvent = monthIndex(event) - monthIndex(now);
  if (monthsUntilEvent <= 0) return 0;

  return Math.min(cap, monthsUntilEvent);
};
