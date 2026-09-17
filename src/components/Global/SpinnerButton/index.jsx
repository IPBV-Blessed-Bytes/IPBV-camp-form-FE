import { Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const SpinnerButton = ({ loading = false, disabled = false, loadingText, children, ...rest }) => (
  <Button disabled={loading || disabled} {...rest}>
    {loading && (
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
        className="me-2 align-middle"
      />
    )}
    {loading && loadingText ? loadingText : children}
  </Button>
);

SpinnerButton.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  loadingText: PropTypes.node,
  children: PropTypes.node,
};

export default SpinnerButton;
