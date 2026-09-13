import {
  FORM_STORAGE_KEYS,
  clearInscriptionDraftLocal,
  getInscriptionDraftLocal,
  stashPendingRestore,
} from '@/utils/formStorage';
import { getInscriptionDraft } from '@/services/me';

export const resolvePostLoginRedirect = async (navigate) => {
  const resume = sessionStorage.getItem(FORM_STORAGE_KEYS.resumeCheckout);
  if (resume !== null) {
    sessionStorage.removeItem(FORM_STORAGE_KEYS.resumeCheckout);
    navigate('/');
    return;
  }

  if (stashPendingRestore(getInscriptionDraftLocal())) {
    clearInscriptionDraftLocal();
    window.location.assign('/');
    return;
  }

  try {
    const serverDraft = await getInscriptionDraft();
    if (stashPendingRestore(serverDraft)) {
      window.location.assign('/');
      return;
    }
  } catch {
    /* ignore and fall through to account */
  }

  navigate('/minha-conta');
};
