import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

import Icons from './Icons';

const VARIANT_CONFIG = {
  cancel: {
    headerClass: 'custom-modal__header--cancel',
    defaultIcon: 'info',
    defaultIconFill: '#dc3545',
  },
  confirm: {
    headerClass: 'custom-modal__header--confirm',
    defaultIcon: 'checked',
    defaultIconFill: '#057c05',
  },
  info: {
    headerClass: 'custom-modal__header--inf',
    defaultIcon: 'info',
    defaultIconFill: '#2E5AAC',
  },
};

const CustomModal = ({
  show,
  onHide,
  variant = 'info',
  title,
  icon,
  iconSize = 25,
  iconFill,
  children,
  footer,
  centered = true,
  ...modalProps
}) => {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.info;
  const resolvedIcon = icon ?? config.defaultIcon;
  const resolvedIconFill = iconFill ?? config.defaultIconFill;

  return (
    <Modal className="custom-modal" show={show} onHide={onHide} centered={centered} {...modalProps}>
      <Modal.Header closeButton className={config.headerClass}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Icons typeIcon={resolvedIcon} iconSize={iconSize} fill={resolvedIconFill} />
          <b>{title}</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
};

CustomModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['cancel', 'confirm', 'info']),
  title: PropTypes.node,
  icon: PropTypes.string,
  iconSize: PropTypes.number,
  iconFill: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  centered: PropTypes.bool,
};

export default CustomModal;
