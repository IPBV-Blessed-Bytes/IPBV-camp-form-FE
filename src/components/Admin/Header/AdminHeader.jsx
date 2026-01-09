import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import Icons from '@/components/Global/Icons';
import PropTypes from 'prop-types';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';

const AdminHeader = ({ pageName, sessionTypeIcon, iconSize, fill }) => {
  const navigate = useNavigate();
  const { formContext } = useContext(AuthContext);

  return (
    <>
      <Row className="mt-3">
        <Col>
          <Button
            variant="secondary"
            onClick={formContext === 'maintenance' ? () => navigate('/dev') : () => navigate('/admin')}
          >
            <Icons typeIcon="arrow-left" iconSize={30} fill="#fff" />
            &nbsp;Voltar
          </Button>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <h4 className="admin-header-title fw-bold m-0">{pageName}</h4>
          <Icons className="m-left" typeIcon={sessionTypeIcon} iconSize={iconSize} fill={fill} />
        </Col>
      </Row>
      <hr className="horizontal-line" />
    </>
  );
};

AdminHeader.propTypes = {
  pageName: PropTypes.string,
  sessionTypeIcon: PropTypes.string,
  iconSize: PropTypes.number,
  fill: PropTypes.string,
};

export default AdminHeader;
