import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Icons from '@/components/Global/Icons';
import PropTypes from 'prop-types';

const AdminHeader = ({
  pageName,
  sessionTypeIcon,
  iconSize,
  fill,
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
