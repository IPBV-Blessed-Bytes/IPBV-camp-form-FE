import { Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

const Tools = ({ buttons = [], flexType }) => {
  if (!buttons.length) return null;

  const renderButton = (btn, index) => {
    if (btn.condition !== undefined && !btn.condition) return null;

    return (
      <Col key={btn.id || index} {...btn.cols}>
        <div className={btn.className}>
          <Button variant={btn.typeButton || 'primary'} onClick={btn.onClick} className={btn.buttonClassName || ''}>
            {btn.typeIcon && <Icons typeIcon={btn.typeIcon} iconSize={btn.iconSize} fill={btn.fill} />}
            <b className="mt-2">{btn.name}</b>
          </Button>
        </div>
      </Col>
    );
  };

  if (flexType) {
    return <div className={`d-flex ${flexType} align-items-center mb-4`}>{buttons.map(renderButton)}</div>;
  }

  return <Row className="align-items-center mb-4">{buttons.map(renderButton)}</Row>;
};

Tools.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      cols: PropTypes.object,
      className: PropTypes.string,
      typeButton: PropTypes.string,
      onClick: PropTypes.func,
      buttonClassName: PropTypes.string,
      typeIcon: PropTypes.string,
      iconSize: PropTypes.number,
      fill: PropTypes.string,
      name: PropTypes.string,
      condition: PropTypes.bool,
    }),
  ),
  flexType: PropTypes.string,
};

export default Tools;
