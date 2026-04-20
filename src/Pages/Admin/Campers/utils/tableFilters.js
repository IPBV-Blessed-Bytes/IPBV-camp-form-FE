import calculateAge from '@/Pages/Packages/utils/calculateAge';

export const alphabeticalSort = (rowA, rowB, columnId) => {
  const a = rowA.values[columnId].toLowerCase();
  const b = rowB.values[columnId].toLowerCase();
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
};

export const ageFilterFn = (rows, id, filterValue) => {
  if (!filterValue) return rows;

  return rows.filter((row) => {
    const birthday = row.values[id];
    const age = calculateAge(birthday);
    return String(age).includes(String(filterValue));
  });
};

export const selectWithRide = (rows, id, filterValue) =>
  rows.filter((row) => filterValue === undefined || row.values[id].car === filterValue);

export const selectWithCellphone = (rows, id, filterValue) =>
  rows.filter((row) => filterValue === undefined || row.values[id].isWhatsApp === filterValue);

export const selectWithDiscount = (rows, id, filterValue) =>
  rows.filter((row) => filterValue === undefined || row.values[id].discountCoupon === filterValue);

export const selectWithCheckin = (rows, id, filterValue) =>
  rows.filter((row) => filterValue === undefined || row.values[id].checkin === filterValue);

export const selectWithManualRegistration = (rows, id, filterValue) =>
  rows.filter((row) => filterValue === undefined || row.values[id] === filterValue);

export const selectWithPastoralFamily = (rows, id, filterValue) =>
  rows.filter((row) => filterValue === undefined || row.values[id] === filterValue);

export const selectWithConfirmationUserData = (rows, id, filterValue) =>
  rows.filter((row) => filterValue === undefined || row.values[id] === filterValue);

export const filterTypes = {
  selectWithRide,
  selectWithCellphone,
  selectWithDiscount,
  selectWithCheckin,
  selectWithManualRegistration,
  selectWithPastoralFamily,
  selectWithConfirmationUserData,
};
