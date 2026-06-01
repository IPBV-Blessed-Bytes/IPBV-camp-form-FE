import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import '../Style/FormStep.scss';

const FormStepLayout = ({
  title,
  description,
  children,
  onBack,
  onNext,
  backLabel = 'Voltar',
  nextLabel = 'Avançar',
  nextDisabled = false,
  footer,
  className = '',
}) => {
  const hasDefaultNav = Boolean(onBack || onNext);

  return (
    <section className={`form-step ${className}`}>
      {(title || description) && (
        <header className="form-step__head">
          {title && <h2 className="form-step__title">{title}</h2>}
          {description && <p className="form-step__desc">{description}</p>}
        </header>
      )}

      <div className="form-step__body">{children}</div>

      {(footer || hasDefaultNav) && (
        <footer className="form-step__nav">
          {footer ?? (
            <>
              {onBack ? (
                <Button variant="light" size="lg" onClick={onBack}>
                  {backLabel}
                </Button>
              ) : (
                <span />
              )}
              {onNext && (
                <Button variant="warning" size="lg" onClick={onNext} disabled={nextDisabled}>
                  {nextLabel}
                </Button>
              )}
            </>
          )}
        </footer>
      )}
    </section>
  );
};

FormStepLayout.propTypes = {
  title: PropTypes.string,
  description: PropTypes.node,
  children: PropTypes.node,
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  backLabel: PropTypes.string,
  nextLabel: PropTypes.string,
  nextDisabled: PropTypes.bool,
  footer: PropTypes.node,
  className: PropTypes.string,
};

export default FormStepLayout;
