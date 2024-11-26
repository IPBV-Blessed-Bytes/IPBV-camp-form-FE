import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Icons from '@/components/GlobalComponents/Icons';
import PropTypes from 'prop-types';

const AdminHeader = ({
  pageName,
  sessionTypeIcon,
  iconSize,
  fill,
  showHeaderTools,
  headerToolsCols,
  headerToolsTypeButton,
  headerToolsOpenModal,
  headerToolsClassname,
  headerToolsButtonIcon,
  headerToolsButtonSize,
  headerToolsButtonFill,
  headerToolsButtonName,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Row className="mt-3">
        <Col>
          <Button variant="danger" onClick={() => navigate('/admin')}>
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

      {showHeaderTools && (
        <Row className="mb-4">
          <Col lg={headerToolsCols?.lg || 12} md={headerToolsCols?.md || 12} xs={headerToolsCols?.xs || 12}>
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
                <span>&nbsp;{headerToolsButtonName}</span>
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

AdminHeader.propTypes = {
  pageName: PropTypes.string,
  sessionTypeIcon: PropTypes.string,
  iconSize: PropTypes.number,
  fill: PropTypes.string,
  showHeaderTools: PropTypes.bool,
  headerToolsCols: PropTypes.object,
  headerToolsTypeButton: PropTypes.string,
  headerToolsOpenModal: PropTypes.func,
  headerToolsClassname: PropTypes.string,
  headerToolsButtonIcon: PropTypes.string,
  headerToolsButtonSize: PropTypes.number,
  headerToolsButtonFill: PropTypes.string,
  headerToolsButtonName: PropTypes.string,
};

export default AdminHeader;
