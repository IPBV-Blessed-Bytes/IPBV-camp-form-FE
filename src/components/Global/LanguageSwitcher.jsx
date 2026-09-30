import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import './LanguageSwitcher.scss';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current = SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'pt';

  return (
    <label className="language-switcher">
      <span className="visually-hidden">{t('language.label')}</span>
      <select
        className="language-switcher__select"
        value={current}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
        aria-label={t('language.label')}
      >
        {SUPPORTED_LANGUAGES.map((lng) => (
          <option key={lng} value={lng}>
            {lng.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSwitcher;
