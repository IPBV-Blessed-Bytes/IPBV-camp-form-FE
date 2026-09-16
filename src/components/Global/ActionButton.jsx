import PropTypes from 'prop-types';

import Icons from '@/components/Global/Icons';
import './ActionButton.scss';

const ACTIONS = {
  edit: { color: '#0c9183', icon: 'edit', stroke: true },
  delete: { color: '#dc3545', icon: 'delete' },
  refund: { color: '#d69300', icon: 'money' },
  restore: { color: '#198754', icon: 'refresh' },
  add: { color: '#0d6efd', icon: 'add-person' },
  reissue: { color: '#155a9b', icon: 'refresh' },
};

const ActionButton = ({ action, typeIcon, iconSize, onClick, disabled, title, label, children }) => {
  const preset = ACTIONS[action] || ACTIONS.edit;
  const accessibleName = label || title;

  return (
    <button
      type="button"
      className={`action-btn action-btn--${action}${children ? ' action-btn--with-text' : ''}`}
      style={{ '--action-color': preset.color }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={accessibleName}
    >
      <Icons typeIcon={typeIcon || preset.icon} iconSize={iconSize || 19} fill={preset.stroke ? undefined : preset.color} />
      {children && <span className="action-btn__text">{children}</span>}
    </button>
  );
};

ActionButton.propTypes = {
  action: PropTypes.oneOf(['edit', 'delete', 'refund', 'restore', 'add', 'reissue']).isRequired,
  typeIcon: PropTypes.string,
  iconSize: PropTypes.number,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node,
};

export default ActionButton;
