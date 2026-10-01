import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const useDocumentTitle = (titleKey) => {
  const { t } = useTranslation();

  useEffect(() => {
    const base = t('site.nav.brand');
    const title = titleKey ? t(titleKey) : '';
    const previous = document.title;
    document.title = title ? `${title} — ${base}` : base;
    return () => {
      document.title = previous;
    };
  }, [titleKey, t]);
};

export default useDocumentTitle;
