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
  ctaText,
  locked,
  lockHint,
  lockCta,
  draggable,
  dragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => (
  <>
    {permission && (
      <Col xs={12} sm={6} lg={4} xl={3} className="mb-3">
        <Card
          className={`session-card session-card--${cardType}${dragging ? ' session-card--dragging' : ''}${
            draggable ? ' session-card--draggable' : ''
          }${locked ? ' session-card--locked' : ''}`}
          onClick={onClick}
          title={locked ? lockHint || 'Desbloqueie este evento para usar este recurso' : undefined}
          style={accentColor ? { '--session-accent': accentColor } : undefined}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
        >
          {locked ? (
            <span className="session-card__lock" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          ) : (
            canEdit && (
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
            )
          )}
          <Card.Body className="session-card__body">
            <div className="session-card__icon-wrapper">
              <Icons typeIcon={typeIcon} iconSize={iconSize} fill={iconFill || '#fff'} />
            </div>
            <div className="session-card__content">
              <h5 className="session-card__title">{title}</h5>
              <span className="session-card__cta">{locked ? lockCta || 'Desbloquear →' : ctaText || 'Acessar →'}</span>
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
  ctaText: PropTypes.string,
  locked: PropTypes.bool,
  lockHint: PropTypes.string,
  lockCta: PropTypes.string,
  draggable: PropTypes.bool,
  dragging: PropTypes.bool,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  onDragEnd: PropTypes.func,
};

export default SessionCard;
