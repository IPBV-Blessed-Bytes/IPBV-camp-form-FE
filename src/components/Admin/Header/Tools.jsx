import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Icons from '@/components/Global/Icons';
import PropTypes from 'prop-types';
import SecondaryButton from './SecondaryButton';

const Tools = ({
  headerToolsCols,
  headerToolsTypeButton,
  headerToolsOpenModal,
  headerToolsClassname,
  headerToolsButtonIcon,
  headerToolsButtonSize,
  headerToolsButtonFill,
  headerToolsButtonName,
  secondaryButtonCols,
  secondaryButtonTypeButton,
  secondaryButtonOpenModal,
  secondaryButtonClassname,
  secondaryButtonIcon,
  secondaryButtonSize,
  secondaryButtonFill,
  secondaryButtonName,
}) => {
  const [showSecondaryButton, setShowSecondaryButton] = useState(false);

  const showHeaderTools = () => {
    if (
      headerToolsCols ||
      headerToolsTypeButton ||
      headerToolsOpenModal ||
      headerToolsClassname ||
      headerToolsButtonIcon ||
      headerToolsButtonSize ||
      headerToolsButtonFill ||
      headerToolsButtonName
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleShowSecondaryButton = (value) => {
    setShowSecondaryButton(value);
  };

  return (
    <>
      {showHeaderTools() && (
        <Row className="mb-4">
          <Col
            className={showSecondaryButton && 'mb-3 mb-xl-0'}
            xl={headerToolsCols?.xl || 12}
            lg={headerToolsCols?.lg || 12}
            md={headerToolsCols?.md || 12}
            xs={headerToolsCols?.xs || 12}
          >
            <div className={headerToolsClassname}>
              <Button
                variant={headerToolsTypeButton}
                onClick={headerToolsOpenModal}
                className="d-flex align-items-center"
                size="lg"
              >
                <Icons
                  typeIcon={headerToolsButtonIcon}
                  iconSize={headerToolsButtonSize || 30}
                  fill={headerToolsButtonFill || '#fff'}
                />
                <span className="table-tools__button-name">&nbsp;{headerToolsButtonName}</span>
              </Button>
            </div>
          </Col>

          <SecondaryButton
            showSecondaryButton={handleShowSecondaryButton}
            secondaryButtonCols={secondaryButtonCols}
            secondaryButtonTypeButton={secondaryButtonTypeButton}
            secondaryButtonOpenModal={secondaryButtonOpenModal}
            secondaryButtonClassname={secondaryButtonClassname}
            secondaryButtonIcon={secondaryButtonIcon}
            secondaryButtonSize={secondaryButtonSize}
            secondaryButtonFill={secondaryButtonFill}
            secondaryButtonName={secondaryButtonName}
          />
        </Row>
      )}
    </>
  );
};

Tools.propTypes = {
  headerToolsCols: PropTypes.shape({
    xl: PropTypes.number,
    lg: PropTypes.number,
    md: PropTypes.number,
    xs: PropTypes.number,
  }),
  headerToolsTypeButton: PropTypes.string,
  headerToolsOpenModal: PropTypes.func,
  headerToolsClassname: PropTypes.string,
  headerToolsButtonIcon: PropTypes.string,
  headerToolsButtonSize: PropTypes.number,
  headerToolsButtonFill: PropTypes.string,
  headerToolsButtonName: PropTypes.string,
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

export default Tools;
