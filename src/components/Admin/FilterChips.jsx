import PropTypes from 'prop-types';
import './FilterChips.scss';

const FilterChips = ({ options, value, onChange }) => (
  <div className="filter-chips">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        className={`filter-chip ${value === opt.value ? 'is-active' : ''}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
        {opt.count != null && <span className="filter-chip__count">{opt.count}</span>}
      </button>
    ))}
  </div>
);

FilterChips.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
      count: PropTypes.number,
    }),
  ),
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterChips;
