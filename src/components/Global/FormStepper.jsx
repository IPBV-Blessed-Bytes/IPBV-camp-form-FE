import PropTypes from 'prop-types';
import Icons from './Icons';
import '../Style/FormStepper.scss';

const FormStepper = ({ steps, current, maxReached = 0, lockedIndexes = [], onSelect }) => {
  return (
    <nav className="form-stepper" aria-label="Progresso da inscrição">
      <ol className="form-stepper__list">
        {steps.map((label, index) => {
          const isCompleted = index < current;
          const isActive = index === current;
          const isLocked = lockedIndexes.includes(index);
          const isReachable = index <= maxReached && !isLocked && !isActive;

          const state = isActive ? 'active' : isCompleted ? 'completed' : 'upcoming';

          return (
            <li
              key={label}
              className={`form-stepper__item form-stepper__item--${state} ${
                isReachable ? 'is-clickable' : ''
              } ${isLocked ? 'is-locked' : ''}`}
            >
              <button
                type="button"
                className="form-stepper__node"
                onClick={() => isReachable && onSelect?.(index)}
                disabled={!isReachable}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="form-stepper__bullet">
                  {isCompleted ? <Icons typeIcon="checked" iconSize={16} fill="#fff" /> : index + 1}
                </span>
                <span className="form-stepper__label">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

FormStepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  current: PropTypes.number.isRequired,
  maxReached: PropTypes.number,
  lockedIndexes: PropTypes.arrayOf(PropTypes.number),
  onSelect: PropTypes.func,
};

export default FormStepper;
