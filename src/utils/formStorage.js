import { enumSteps } from '@/utils/constants';

export const FORM_STORAGE_KEYS = {
  tempData: 'formTempData',
  savedUsers: 'savedUsers',
  discountList: 'discountList',
  previousUserData: 'previousUserData',
  currentFormIndex: 'currentFormIndex',
  resumeCheckout: 'resumeCheckout',
  donation: 'donation',
};

export const getTempData = () => JSON.parse(sessionStorage.getItem(FORM_STORAGE_KEYS.tempData)) || {};

export const saveTempData = (section, data) => {
  const existing = getTempData();
  existing[section] = data;
  sessionStorage.setItem(FORM_STORAGE_KEYS.tempData, JSON.stringify(existing));
};

export const clearTempData = () => sessionStorage.removeItem(FORM_STORAGE_KEYS.tempData);

const DRAFT_KEYS = [
  FORM_STORAGE_KEYS.savedUsers,
  FORM_STORAGE_KEYS.currentFormIndex,
  FORM_STORAGE_KEYS.discountList,
  FORM_STORAGE_KEYS.donation,
  FORM_STORAGE_KEYS.resumeCheckout,
];

const LOCAL_DRAFT_KEY = 'inscriptionDraft';

export const buildInscriptionDraft = () => {
  const draft = {};
  DRAFT_KEYS.forEach((key) => {
    const value = sessionStorage.getItem(key);
    if (value !== null) draft[key] = value;
  });
  return draft;
};

export const hasInscriptionDraft = () => {
  const savedUsers = sessionStorage.getItem(FORM_STORAGE_KEYS.savedUsers);
  if (!savedUsers) return false;
  try {
    return JSON.parse(savedUsers).length > 0;
  } catch {
    return false;
  }
};

export const applyInscriptionDraft = (draft) => {
  if (!draft || typeof draft !== 'object') return false;
  const savedUsers = draft[FORM_STORAGE_KEYS.savedUsers];
  if (!savedUsers) return false;
  DRAFT_KEYS.forEach((key) => {
    if (draft[key] !== undefined && draft[key] !== null) {
      sessionStorage.setItem(key, draft[key]);
    }
  });
  if (draft[FORM_STORAGE_KEYS.resumeCheckout] === undefined) {
    sessionStorage.setItem(FORM_STORAGE_KEYS.resumeCheckout, String(enumSteps.beforePayment));
  }
  return true;
};

export const saveInscriptionDraftLocal = () => {
  if (!hasInscriptionDraft()) return;
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(buildInscriptionDraft()));
  } catch {
    /* ignore quota / unavailable storage */
  }
};

export const getInscriptionDraftLocal = () => {
  try {
    const stored = localStorage.getItem(LOCAL_DRAFT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const clearInscriptionDraftLocal = () => {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    /* ignore */
  }
};
