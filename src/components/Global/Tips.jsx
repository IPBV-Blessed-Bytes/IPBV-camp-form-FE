import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import '../Style/style.scss';
import Icons from '@/components/Global/Icons';

const Tips = ({ classNameWrapper, colour, placement, size, text, typeIcon }) => {
  return (
    <OverlayTrigger placement={(placement && placement) || 'top'} overlay={<Tooltip>{text}</Tooltip>}>
      <div className={classNameWrapper}>
        <Icons
          typeIcon={(typeIcon && typeIcon) || 'rounded-question'}
          iconSize={(size && size) || 20}
          fill={(colour && colour) || '#000'}
        />
      </div>
    </OverlayTrigger>
  );
};

Tips.propTypes = {
  classNameWrapper: PropTypes.string,
  colour: PropTypes.string,
  placement: PropTypes.string,
  size: PropTypes.number,
  text: PropTypes.string,
  typeIcon: PropTypes.string,
};

export default Tips;
