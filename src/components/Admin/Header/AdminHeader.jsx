import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Icons from '@/components/Global/Icons';
import PropTypes from 'prop-types';
import Tools from './Tools';

const AdminHeader = ({
  pageName,
  sessionTypeIcon,
  iconSize,
  fill,
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
  const navigate = useNavigate();

  return (
    <>
      <Row className="mt-3">
        <Col>
          <Button variant="secondary" onClick={() => navigate('/admin')}>
            <Icons typeIcon="arrow-left" iconSize={30} fill="#fff" />
            &nbsp;Voltar
          </Button>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <h4 className="fw-bold m-0">{pageName}</h4>
          <Icons className="m-left" typeIcon={sessionTypeIcon} iconSize={iconSize} fill={fill} />
        </Col>
      </Row>
      <hr className="horizontal-line" />

      <Tools
        headerToolsCols={headerToolsCols}
        headerToolsTypeButton={headerToolsTypeButton}
        headerToolsOpenModal={headerToolsOpenModal}
        headerToolsClassname={headerToolsClassname}
        headerToolsButtonIcon={headerToolsButtonIcon}
        headerToolsButtonSize={headerToolsButtonSize}
        headerToolsButtonFill={headerToolsButtonFill}
        headerToolsButtonName={headerToolsButtonName}
        secondaryButtonCols={secondaryButtonCols}
        secondaryButtonTypeButton={secondaryButtonTypeButton}
        secondaryButtonOpenModal={secondaryButtonOpenModal}
        secondaryButtonClassname={secondaryButtonClassname}
        secondaryButtonIcon={secondaryButtonIcon}
        secondaryButtonSize={secondaryButtonSize}
        secondaryButtonFill={secondaryButtonFill}
        secondaryButtonName={secondaryButtonName}
      />
    </>
  );
};

AdminHeader.propTypes = {
  pageName: PropTypes.string,
  sessionTypeIcon: PropTypes.string,
  iconSize: PropTypes.number,
  fill: PropTypes.string,
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

export default AdminHeader;
