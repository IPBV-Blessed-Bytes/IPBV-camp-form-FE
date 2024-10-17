import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

const AdminPackageCard = ({ title, remainingVacancies, filledVacancies, cardType, showRemainingVacancies }) => (
  <Col className="mb-4" xs={12} md={6} lg={4}>
    <Card className="admin-card">
      <Card.Body className={`card-container ${cardType}`}>
        <Card.Title className="card-container-title">{title}</Card.Title>
        <Card.Text className="card-container-content">
          <p>
            Vagas Preenchidas: <b>{filledVacancies || '0'}</b>
          </p>
          {showRemainingVacancies && <p>Vagas Restantes: {remainingVacancies || '0'}</p>}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

AdminPackageCard.propTypes = {
  title: PropTypes.string,
  remainingVacancies: PropTypes.string,
  filledVacancies: PropTypes.string,
  background: PropTypes.string,
  cardType: PropTypes.string,
  showRemainingVacancies: PropTypes.bool,
};

export default AdminPackageCard;
