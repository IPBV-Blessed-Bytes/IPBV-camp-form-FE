import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

const SessionCard = ({ permission, onClick, cardType, title, typeIcon, iconSize, iconFill }) => (
  <>
    {permission && (
      <Col xs={12} sm={6} lg={4} xl={3} className="mb-3">
        <Card className={`session-card session-card--${cardType}`} onClick={onClick}>
          <Card.Body className="session-card__body">
            <div className="session-card__icon-wrapper">
              <Icons typeIcon={typeIcon} iconSize={iconSize} fill={iconFill || '#fff'} />
            </div>
            <div className="session-card__content">
              <h5 className="session-card__title">{title}</h5>
              <span className="session-card__cta">Acessar →</span>
            </div>
          </Card.Body>
        </Card>
      </Col>
    )}
  </>
);

SessionCard.propTypes = {
  permission: PropTypes.bool,
  onClick: PropTypes.func,
  cardType: PropTypes.string,
  title: PropTypes.string,
  typeIcon: PropTypes.string,
  iconSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  iconFill: PropTypes.string,
};

export default SessionCard;
