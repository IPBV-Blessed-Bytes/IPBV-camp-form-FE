import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

const SessionCard = ({
  permission,
  onClick,
  cardType,
  title,
  typeIcon,
  iconSize,
  iconFill,
  accentColor,
  canEdit,
  onEdit,
}) => (
  <>
    {permission && (
      <Col xs={12} sm={6} lg={4} xl={3} className="mb-3">
        <Card
          className={`session-card session-card--${cardType}`}
          onClick={onClick}
          style={accentColor ? { '--session-accent': accentColor } : undefined}
        >
          {canEdit && (
            <button
              type="button"
              className="session-card__edit"
              aria-label="Editar sessão"
              onClick={(event) => {
                event.stopPropagation();
                onEdit?.();
              }}
            >
              <Icons typeIcon="edit" iconSize={16} fill="none" />
            </button>
          )}
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
  accentColor: PropTypes.string,
  canEdit: PropTypes.bool,
  onEdit: PropTypes.func,
};

export default SessionCard;
