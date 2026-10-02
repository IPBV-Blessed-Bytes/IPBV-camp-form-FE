import { JWT_LOCAL_STORAGE_KEY } from '@/config';

export const IMPERSONATION_KEY = 'impersonation';

export const getImpersonation = () => {
  try {
    const raw = localStorage.getItem(IMPERSONATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isImpersonating = () => Boolean(getImpersonation());

export const beginImpersonation = (session) => {
  try {
    const ownerToken = localStorage.getItem(JWT_LOCAL_STORAGE_KEY) || '';
    const meta = {
      logId: session.logId,
      organizationName: session.organizationName,
      targetDisplayName: session.targetDisplayName || session.targetLogin,
      targetLogin: session.targetLogin,
      ownerToken,
    };
    localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(meta));
    localStorage.setItem(JWT_LOCAL_STORAGE_KEY, session.token);
  } catch {
    /* ignore storage errors */
  }
};

export const endImpersonation = () => {
  const meta = getImpersonation();
  try {
    if (meta?.ownerToken) {
      localStorage.setItem(JWT_LOCAL_STORAGE_KEY, meta.ownerToken);
    }
    localStorage.removeItem(IMPERSONATION_KEY);
  } catch {
    /* ignore storage errors */
  }
  return meta;
};
