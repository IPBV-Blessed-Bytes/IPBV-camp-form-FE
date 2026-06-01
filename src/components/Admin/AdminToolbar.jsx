import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

const AdminToolbar = ({ buttons = [] }) => {
  const visibleButtons = buttons.filter((btn) => btn.condition === undefined || btn.condition);

  if (!visibleButtons.length) return null;

  return (
    <div className="admin-toolbar">
      {visibleButtons.map((btn, index) => (
        <Button
          key={btn.id || index}
          variant={btn.typeButton || 'primary'}
          onClick={btn.onClick}
          className={btn.buttonClassName || ''}
        >
          {btn.typeIcon && <Icons typeIcon={btn.typeIcon} iconSize={btn.iconSize || 22} fill={btn.fill} />}
          <span>{btn.name}</span>
        </Button>
      ))}
    </div>
  );
};

AdminToolbar.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      onClick: PropTypes.func,
      typeButton: PropTypes.string,
      buttonClassName: PropTypes.string,
      typeIcon: PropTypes.string,
      iconSize: PropTypes.number,
      fill: PropTypes.string,
      condition: PropTypes.bool,
    }),
  ),
};

export default AdminToolbar;
