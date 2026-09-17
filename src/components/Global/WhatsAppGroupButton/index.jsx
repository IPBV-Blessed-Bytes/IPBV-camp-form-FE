import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import useWhatsAppGroupLink from '@/hooks/useWhatsAppGroupLink';
import './style.scss';

const WhatsAppGroupButton = ({ size, className, label }) => {
  const link = useWhatsAppGroupLink();

  if (!link) return null;

  return (
    <Button
      as="a"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      size={size}
      className={`whatsapp-group-button ${className}`}
    >
      <Icons typeIcon="whatsapp" iconSize={22} fill="#fff" />
      {label}
    </Button>
  );
};

WhatsAppGroupButton.propTypes = {
  size: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
};

WhatsAppGroupButton.defaultProps = {
  size: 'lg',
  className: '',
  label: 'Entrar no grupo do WhatsApp',
};

export default WhatsAppGroupButton;
