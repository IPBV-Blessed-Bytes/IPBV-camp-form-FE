import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../Style/style.scss';

const PackageCard = ({ title, remainingVacancies, filledVacancies, cardType, showRemainingVacancies }) => (
  <Col className="mb-4" xs={12} md={6} lg={4}>
    <Card className="admin-card">
      <Card.Body className={`card-container ${cardType}`}>
        <Card.Title className="card-container-title">{title}</Card.Title>
        <Card.Text className="card-container-content">
          Vagas Preenchidas: <b>{filledVacancies || '0'}</b>
          <br />
          <br />
          {showRemainingVacancies && <>Vagas Restantes: {remainingVacancies || '0'}</>}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

PackageCard.propTypes = {
  title: PropTypes.string,
  remainingVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  filledVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  background: PropTypes.string,
  cardType: PropTypes.string,
  showRemainingVacancies: PropTypes.bool,
};

export default PackageCard;
