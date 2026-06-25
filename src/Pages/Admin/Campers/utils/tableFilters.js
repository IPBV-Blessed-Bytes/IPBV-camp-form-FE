import calculateAge from '@/Pages/Packages/utils/calculateAge';

export const normalizeText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

export const toBool = (value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false' || normalized === '' || normalized === '0') return false;
    return true;
  }
  return Boolean(value);
};

export const alphabeticalSort = (rowA, rowB, columnId) => {
  const a = rowA.values[columnId].toLowerCase();
  const b = rowB.values[columnId].toLowerCase();
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
};

export const textFilterFn = (rows, ids, filterValue) => {
  if (!filterValue) return rows;
  const needle = normalizeText(filterValue);
  return rows.filter((row) => ids.some((id) => normalizeText(row.values[id]).includes(needle)));
};

export const ageFilterFn = (rows, id, filterValue) => {
  if (!filterValue) return rows;

  return rows.filter((row) => {
    const birthday = row.values[id];
    const age = calculateAge(birthday);
    return String(age).includes(String(filterValue));
  });
};

const booleanFilter = (getValue) => (rows, id, filterValue) =>
  filterValue === undefined ? rows : rows.filter((row) => toBool(getValue(row.values[id])) === filterValue);

export const foodFilterFn = (rows, id, filterValue) => {
  if (!filterValue) return rows;
  const wantsComplete = !normalizeText(filterValue).includes('sem');
  return rows.filter((row) => {
    const food = normalizeText(row.values[id]);
    const hasFood = food !== '' && !food.includes('sem aliment');
    return hasFood === wantsComplete;
  });
};

export const selectWithRide = booleanFilter((value) => value.car);
export const selectWithCellphone = booleanFilter((value) => value.isWhatsApp);
export const selectWithDiscount = booleanFilter((value) => value.discountCoupon);
export const selectWithCheckin = booleanFilter((value) => value.checkin);
export const selectWithManualRegistration = booleanFilter((value) => value);
export const selectWithPastoralFamily = booleanFilter((value) => value);
export const selectWithConfirmationUserData = booleanFilter((value) => value);

export const filterTypes = {
  text: textFilterFn,
  food: foodFilterFn,
  selectWithRide,
  selectWithCellphone,
  selectWithDiscount,
  selectWithCheckin,
  selectWithManualRegistration,
  selectWithPastoralFamily,
  selectWithConfirmationUserData,
};
