export const parseBRDate = (str) => {
  if (!str) return null;
  const [day, month, year] = str.split('/');
  return new Date(`${year}-${month}-${day}T00:00:00`);
};

export const findActiveLot = (lots, referenceDate = new Date()) => {
  if (!Array.isArray(lots) || lots.length === 0) return null;

  return (
    lots.find((lot) => {
      const start = parseBRDate(lot.startDate);
      const end = parseBRDate(lot.endDate);
      if (!start || !end) return false;

      end.setHours(23, 59, 59, 999);
      return referenceDate >= start && referenceDate <= end;
    }) || null
  );
};
