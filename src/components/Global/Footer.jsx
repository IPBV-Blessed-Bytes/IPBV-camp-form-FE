import { PropTypes } from 'prop-types';
import '../Style/Footer.scss';
import logoFooter from '../../../public/Images/logo.png';
import Icons from '@/components/Global/Icons';
import { useEventBranding } from '@/contexts/EventBrandingContext';

const SOCIAL_NETWORKS = [
  { key: 'instagram', icon: 'instagram', label: 'Instagram' },
  { key: 'youtube', icon: 'youtube', label: 'YouTube' },
  { key: 'spotify', icon: 'spotify', label: 'Spotify' },
  { key: 'facebook', icon: 'facebook', label: 'Facebook' },
  { key: 'twitter', icon: 'twitter', label: 'Twitter / X' },
  { key: 'email', icon: 'email', label: 'E-mail' },
];

const parseSocial = (value) => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const socialHref = (key, value) => {
  if (key === 'email') return `mailto:${value}`;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const Footer = ({ handleAdminClick }) => {
  const currentYear = new Date().getFullYear();
  const { socialLinks } = useEventBranding();
  const social = parseSocial(socialLinks);
  const links = SOCIAL_NETWORKS.filter((network) => (social[network.key] || '').trim());

  return (
    <footer className="form__footer">
      <a className="form__footer__admin" onClick={handleAdminClick}>
        <img src={logoFooter} className="form__footer-logo" alt="logo" />
      </a>

      <div className="form__footer__end">
        {links.length > 0 && (
          <div className="form__footer__social">
            {links.map((network) => (
              <a
                key={network.key}
                href={socialHref(network.key, social[network.key].trim())}
                target={network.key === 'email' ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={network.label}
                title={network.label}
              >
                <Icons typeIcon={network.icon} iconSize={22} fill="#555050" />
              </a>
            ))}
          </div>
        )}

        <div className="form__footer__credits">
          <p className="form__footer__powered">
            <a className="mail-to" href="mailto:alvinho.leal@live.com">
              Powered by Blessed Bytes Team
            </a>
            <span className="form__footer__sep"> • </span>
            <em>
              <b>1 Coríntios 15:58</b>
            </em>
          </p>
          <p className="form__footer__copyright">
            © {currentYear} Igreja Presbiteriana de Boa Viagem • Todos os Direitos Reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  handleAdminClick: PropTypes.func,
};

export default Footer;
