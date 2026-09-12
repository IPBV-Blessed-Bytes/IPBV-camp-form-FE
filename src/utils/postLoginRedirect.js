import {
  FORM_STORAGE_KEYS,
  applyInscriptionDraft,
  clearInscriptionDraftLocal,
  getInscriptionDraftLocal,
} from '@/utils/formStorage';
import { getInscriptionDraft } from '@/services/me';

export const resolvePostLoginRedirect = async (navigate) => {
  const resume = sessionStorage.getItem(FORM_STORAGE_KEYS.resumeCheckout);
  if (resume !== null) {
    sessionStorage.removeItem(FORM_STORAGE_KEYS.resumeCheckout);
    navigate('/');
    return;
  }

  const localDraft = getInscriptionDraftLocal();
  if (applyInscriptionDraft(localDraft)) {
    clearInscriptionDraftLocal();
    window.location.assign('/');
    return;
  }

  try {
    const serverDraft = await getInscriptionDraft();
    if (applyInscriptionDraft(serverDraft)) {
      window.location.assign('/');
      return;
    }
  } catch {
    /* ignore and fall through to account */
  }

  navigate('/minha-conta');
};
