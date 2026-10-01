import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Icons from '@/components/Global/Icons';
import './style.scss';

const STEP_ICONS = ['tent', 'person', 'form-context', 'cart', 'money', 'checkin', 'megaphone'];

const TenantTourModal = ({ show, onClose }) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [dontShow, setDontShow] = useState(false);

  const steps = t('admin.ui.tour.steps', { returnObjects: true });
  const step = { ...steps[index], icon: STEP_ICONS[index] };
  const isLast = index === steps.length - 1;

  const finish = () => {
    onClose(dontShow);
    setIndex(0);
  };

  return (
    <Modal show={show} onHide={finish} centered dialogClassName="tenant-tour">
      <Modal.Body>
        <div className="tenant-tour__body">
          <span className="tenant-tour__icon">
            <Icons typeIcon={step.icon} iconSize={40} fill="#007185" />
          </span>
          <h2 className="tenant-tour__title">{step.title}</h2>
          <p className="tenant-tour__text">{step.text}</p>

          <div className="tenant-tour__dots" aria-hidden="true">
            {steps.map((s, i) => (
              <span key={s.title} className={`tenant-tour__dot ${i === index ? 'is-active' : ''}`} />
            ))}
          </div>
        </div>

        <div className="tenant-tour__footer">
          <Form.Check
            type="checkbox"
            id="tenant-tour-dontshow"
            label={t('admin.ui.tour.dontShowAgain')}
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
          />
          <div className="tenant-tour__nav">
            {index > 0 && (
              <Button variant="outline-secondary" onClick={() => setIndex((i) => i - 1)}>
                {t('admin.ui.tour.back')}
              </Button>
            )}
            {isLast ? (
              <Button variant="teal-blue" className="fw-bold" onClick={finish}>
                {t('admin.ui.tour.start')}
              </Button>
            ) : (
              <Button variant="teal-blue" className="fw-bold" onClick={() => setIndex((i) => i + 1)}>
                {t('admin.ui.tour.next')}
              </Button>
            )}
          </div>
        </div>

        <button type="button" className="tenant-tour__skip" onClick={finish}>
          {t('admin.ui.tour.skip')}
        </button>
      </Modal.Body>
    </Modal>
  );
};

TenantTourModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default TenantTourModal;
