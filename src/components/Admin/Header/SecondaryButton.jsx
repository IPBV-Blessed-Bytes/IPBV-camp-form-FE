import { useEffect } from 'react';
import { Col, Button } from 'react-bootstrap';
import Icons from '@/components/Global/Icons';
import PropTypes from 'prop-types';

const SecondaryButton = ({
  showSecondaryButton,
  secondaryButtonCols,
  secondaryButtonTypeButton,
  secondaryButtonOpenModal,
  secondaryButtonClassname,
  secondaryButtonIcon,
  secondaryButtonSize,
  secondaryButtonFill,
  secondaryButtonName,
}) => {
  const hasProps =
    secondaryButtonCols ||
    secondaryButtonTypeButton ||
    secondaryButtonOpenModal ||
    secondaryButtonClassname ||
    secondaryButtonIcon ||
    secondaryButtonSize ||
    secondaryButtonFill ||
    secondaryButtonName;

  useEffect(() => {
    if (showSecondaryButton) {
      showSecondaryButton(!!hasProps);
    }
  }, [showSecondaryButton, hasProps]);

  return (
    <>
      {hasProps && (
        <Col
          xl={secondaryButtonCols?.xl || 12}
          lg={secondaryButtonCols?.lg || 12}
          md={secondaryButtonCols?.md || 12}
          xs={secondaryButtonCols?.xs || 12}
        >
          <div className={secondaryButtonClassname}>
            <Button
              variant={secondaryButtonTypeButton}
              onClick={secondaryButtonOpenModal}
              className="d-flex align-items-center justify-content-center"
              size="lg"
            >
              <Icons
                typeIcon={secondaryButtonIcon}
                iconSize={secondaryButtonSize || 30}
                fill={secondaryButtonFill || '#fff'}
              />
              <span className="table-tools__button-name">&nbsp;{secondaryButtonName}</span>
            </Button>
          </div>
        </Col>
      )}
    </>
  );
};

SecondaryButton.propTypes = {
  showSecondaryButton: PropTypes.func,
  secondaryButtonCols: PropTypes.shape({
    xl: PropTypes.number,
    lg: PropTypes.number,
    md: PropTypes.number,
    xs: PropTypes.number,
  }),
  secondaryButtonTypeButton: PropTypes.string,
  secondaryButtonOpenModal: PropTypes.func,
  secondaryButtonClassname: PropTypes.string,
  secondaryButtonIcon: PropTypes.string,
  secondaryButtonSize: PropTypes.number,
  secondaryButtonFill: PropTypes.string,
  secondaryButtonName: PropTypes.string,
};

export default SecondaryButton;
