import { Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Icons from '@/components/Global/Icons';
import { formatPrice } from './packagePricing';
import '@/components/Style/ProductList.scss';
import './WorkshopStep.scss';

const overlaps = (a, b) => {
  if (!a.startsAt || !a.endsAt || !b.startsAt || !b.endsAt) return false;
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
};

const formatSchedule = (startsAt, endsAt) => {
  if (!startsAt) return '';
  const [datePart, startTime] = startsAt.split('T');
  const endTime = (endsAt || '').split('T')[1];
  if (!datePart) return '';
  const [year, month, day] = datePart.split('-');
  const date = `${day}/${month}/${year}`;
  if (!startTime) return date;
  return endTime ? `${date} ${startTime}–${endTime}` : `${date} ${startTime}`;
};

const WorkshopStep = ({ workshops, minChoices, maxChoices, value, onChange }) => {
  const { t } = useTranslation();
  const selection = Array.isArray(value) ? value : [];
  const selectedWorkshops = workshops.filter((w) => selection.includes(w.id));

  const conflictsWith = (workshop) =>
    selectedWorkshops.some((selected) => selected.id !== workshop.id && overlaps(workshop, selected));

  const toggle = (workshop) => {
    const isSelected = selection.includes(workshop.id);
    if (isSelected) {
      onChange(selection.filter((id) => id !== workshop.id));
      return;
    }
    if (workshop.soldOut) {
      toast.error(t('form.dynamic.workshops.soldOutError'));
      return;
    }
    if (maxChoices && selection.length >= maxChoices) {
      toast.error(t('form.dynamic.workshops.maxError', { count: maxChoices }));
      return;
    }
    if (conflictsWith(workshop)) {
      toast.error(t('form.dynamic.workshops.conflictError'));
      return;
    }
    onChange([...selection, workshop.id]);
  };

  const instruction = (() => {
    if (minChoices && maxChoices) {
      return minChoices === maxChoices
        ? t('form.dynamic.workshops.chooseExactly', { count: minChoices })
        : t('form.dynamic.workshops.chooseRange', { min: minChoices, max: maxChoices });
    }
    if (minChoices) return t('form.dynamic.workshops.chooseMin', { count: minChoices });
    if (maxChoices) return t('form.dynamic.workshops.chooseMax', { count: maxChoices });
    return t('form.dynamic.workshops.chooseFree');
  })();

  return (
    <Row className="workshop-step">
      <Col xs={12} xl={8} className="mb-3 mb-xl-0">
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>{t('form.dynamic.workshops.stepTitle')}</Card.Title>
            <Card.Text className="text-secondary">{instruction}</Card.Text>

            {workshops.length === 0 ? (
              <p className="text-muted mb-0">{t('form.dynamic.workshops.empty')}</p>
            ) : (
              <div className="product-grid">
                {workshops.map((workshop) => {
                  const isSelected = selection.includes(workshop.id);
                  const inConflict = !isSelected && conflictsWith(workshop);
                  const disabled = !isSelected && (workshop.soldOut || inConflict);
                  const isFree = Number(workshop.price || 0) === 0;

                  return (
                    <div
                      key={workshop.id}
                      className={`product-card workshop-card ${isSelected ? 'product-card-is-active' : ''} ${
                        disabled ? 'product-card-unavailable' : ''
                      }`}
                    >
                      <div className="workshop-card__badges">
                        <span className={`workshop-badge ${isFree ? 'workshop-badge--free' : 'workshop-badge--price'}`}>
                          {isFree ? t('form.dynamic.workshops.free') : formatPrice(workshop.price)}
                        </span>
                        {workshop.soldOut ? (
                          <span className="workshop-badge workshop-badge--soldout">
                            {t('form.dynamic.workshops.soldOut')}
                          </span>
                        ) : (
                          workshop.remaining != null && (
                            <span className="workshop-badge workshop-badge--seats">
                              {t('form.dynamic.workshops.seatsLeft', { count: workshop.remaining })}
                            </span>
                          )
                        )}
                      </div>

                      <h3 className="product-title">{workshop.title}</h3>
                      {workshop.sessionLabel && (
                        <p className="workshop-card__session mb-1">{workshop.sessionLabel}</p>
                      )}
                      <p className="workshop-card__time mb-2">{formatSchedule(workshop.startsAt, workshop.endsAt)}</p>
                      {workshop.description && (
                        <p className="discount-description small mb-4">{workshop.description}</p>
                      )}
                      {inConflict && (
                        <p className="workshop-card__conflict small mb-3">{t('form.dynamic.workshops.conflictHint')}</p>
                      )}

                      <button
                        type="button"
                        className={`product-button ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggle(workshop)}
                        disabled={disabled}
                      >
                        {isSelected && <Icons typeIcon="checked" iconSize={18} fill="#fff" />}
                        {isSelected ? t('form.dynamic.workshops.selected') : t('form.dynamic.workshops.select')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} xl={4} className="ps-xl-3">
        <Card className="workshop-summary">
          <Card.Body>
            <Card.Title>{t('form.dynamic.workshops.summaryTitle')}</Card.Title>
            {selectedWorkshops.length === 0 ? (
              <small className="text-secondary fst-italic">{t('form.dynamic.workshops.noneSelected')}</small>
            ) : (
              selectedWorkshops.map((workshop) => (
                <div key={workshop.id} className="workshop-summary__row">
                  <span>{workshop.title}</span>
                  <span>
                    {Number(workshop.price || 0) === 0
                      ? t('form.dynamic.workshops.free')
                      : formatPrice(workshop.price)}
                  </span>
                </div>
              ))
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

WorkshopStep.propTypes = {
  workshops: PropTypes.array.isRequired,
  minChoices: PropTypes.number,
  maxChoices: PropTypes.number,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

export default WorkshopStep;
