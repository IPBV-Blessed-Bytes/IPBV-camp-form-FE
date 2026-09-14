export const FORM_STORAGE_KEYS = {
  tempData: 'formTempData',
  savedUsers: 'savedUsers',
  discountList: 'discountList',
  previousUserData: 'previousUserData',
  currentFormIndex: 'currentFormIndex',
};

export const getTempData = () => JSON.parse(sessionStorage.getItem(FORM_STORAGE_KEYS.tempData)) || {};

export const saveTempData = (section, data) => {
  const existing = getTempData();
  existing[section] = data;
  sessionStorage.setItem(FORM_STORAGE_KEYS.tempData, JSON.stringify(existing));
};

export const clearTempData = () => sessionStorage.removeItem(FORM_STORAGE_KEYS.tempData);

// --- Rascunho da inscrição em andamento (retomada após login) ---
// Ponte em localStorage: sobrevive ao ida-e-volta do e-mail de confirmação
// quando ele abre em OUTRA ABA do mesmo navegador (sessionStorage é por-aba).
// O draft carrega o slug do evento para validação na retomada.
const DRAFT_LOCAL_KEY = 'inscriptionDraftLocal';

export const buildInscriptionDraft = (slug, people, answers) => ({ slug, people, answers });

export const draftHasContent = (draft) => {
  if (!draft) return false;
  const hasPeople = Array.isArray(draft.people) && draft.people.length > 0;
  const hasAnswers = draft.answers && Object.keys(draft.answers).length > 0;
  return hasPeople || hasAnswers;
};

export const saveInscriptionDraftLocal = (draft) => {
  try {
    if (draftHasContent(draft)) {
      localStorage.setItem(DRAFT_LOCAL_KEY, JSON.stringify(draft));
    }
  } catch {
    // localStorage indisponível (aba privada, bloqueado) — ignora.
  }
};

export const getInscriptionDraftLocal = () => {
  try {
    const raw = localStorage.getItem(DRAFT_LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearInscriptionDraftLocal = () => {
  try {
    localStorage.removeItem(DRAFT_LOCAL_KEY);
  } catch {
    // ignora
  }
};
