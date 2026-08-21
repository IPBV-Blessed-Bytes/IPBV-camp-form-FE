import PropTypes from 'prop-types';
import './StatCards.scss';

const StatCards = ({ items }) => (
  <div className="stat-cards">
    {items.map((item) => (
      <div key={item.label} className={`stat-card stat-card--${item.tone || 'default'}`}>
        <span className="stat-card__value">{item.value}</span>
        <span className="stat-card__label">{item.label}</span>
      </div>
    ))}
  </div>
);

StatCards.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.node,
      tone: PropTypes.string,
    }),
  ),
};

export default StatCards;
