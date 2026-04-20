export const FORM_STORAGE_KEYS = {
  tempData: 'formTempData',
  savedUsers: 'savedUsers',
  discountList: 'discountList',
  previousUserData: 'previousUserData',
};

export const getTempData = () => JSON.parse(sessionStorage.getItem(FORM_STORAGE_KEYS.tempData)) || {};

export const saveTempData = (section, data) => {
  const existing = getTempData();
  existing[section] = data;
  sessionStorage.setItem(FORM_STORAGE_KEYS.tempData, JSON.stringify(existing));
};

export const clearTempData = () => sessionStorage.removeItem(FORM_STORAGE_KEYS.tempData);
