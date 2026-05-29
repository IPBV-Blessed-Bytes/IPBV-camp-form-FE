import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Card, ProgressBar } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../Style/style.scss';

const PackageCard = ({ title, remainingVacancies, filledVacancies, cardType, showRemainingVacancies }) => {
  const filled = Number(filledVacancies || 0);
  const remaining = Number(remainingVacancies || 0);
  const total = showRemainingVacancies ? filled + remaining : 0;
  const percentage = total > 0 ? Math.min((filled / total) * 100, 100) : 0;

  return (
    <Col className="mb-3" xs={12} sm={6} lg={4} xl={3}>
      <Card className={`admin-card admin-card--${cardType}`}>
        <Card.Body className="admin-card__body">
          <span className="admin-card__title">{title}</span>
          <div className="admin-card__metric">
            <span className="admin-card__value">{filled}</span>
            {showRemainingVacancies && total > 0 && (
              <span className="admin-card__total">/ {total}</span>
            )}
          </div>
          {showRemainingVacancies && (
            <>
              <ProgressBar
                now={percentage}
                className="admin-card__progress"
                visuallyHidden
              />
              <div className="admin-card__footer">
                <span>Restantes</span>
                <strong>{remaining}</strong>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

PackageCard.propTypes = {
  title: PropTypes.string,
  remainingVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  filledVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  background: PropTypes.string,
  cardType: PropTypes.string,
  showRemainingVacancies: PropTypes.bool,
};

export default PackageCard;
