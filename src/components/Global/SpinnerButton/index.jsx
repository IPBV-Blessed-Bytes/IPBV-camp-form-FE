import { Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const SpinnerButton = ({ loading = false, disabled = false, style, children, ...rest }) => (
  <Button disabled={loading || disabled} style={{ position: 'relative', ...style }} {...rest}>
    <span style={{ visibility: loading ? 'hidden' : 'visible' }}>{children}</span>
    {loading && (
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
      </span>
    )}
  </Button>
);

SpinnerButton.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  children: PropTypes.node,
};

export default SpinnerButton;
