import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import '../Style/style.scss';
import Icons from '@/components/Global/Icons';

const Tips = ({ placement, text, typeIcon, size, colour }) => {
  return (
    <OverlayTrigger placement={(placement && placement) || 'top'} overlay={<Tooltip>{text}</Tooltip>}>
      <div>
        <Icons
          typeIcon={(typeIcon && typeIcon) || 'info'}
          iconSize={(size && size) || 20}
          fill={(colour && colour) || '#000'}
        />
      </div>
    </OverlayTrigger>
  );
};

Tips.propTypes = {
  text: PropTypes.string,
};

export default Tips;
