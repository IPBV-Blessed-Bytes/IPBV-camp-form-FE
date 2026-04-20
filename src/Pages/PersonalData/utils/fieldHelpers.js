import { format, parse } from 'date-fns';

export const extractNumbers = (value) => value.replace(/\D/g, '');

export const isUnderage = (age) => age < 18;

export const parseDate = (value) => {
  if (value instanceof Date && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const isoParsed = new Date(value);
    if (!isNaN(isoParsed)) {
      return isoParsed;
    }

    const parsed = parse(value, 'dd/MM/yyyy', new Date());
    return isNaN(parsed) ? null : parsed;
  }

  return null;
};

export const formatDate = (date) => {
  const parsed = parseDate(date);
  return parsed ? format(parsed, 'dd/MM/yyyy') : '';
};

export const restoreScrollWhenMobile = () => {
  setTimeout(() => {
    document.body.style.removeProperty('overflow');
  }, 1);
};
