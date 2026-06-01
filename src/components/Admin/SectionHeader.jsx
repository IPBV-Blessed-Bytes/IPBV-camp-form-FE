import PropTypes from 'prop-types';
import '../Style/SectionHeader.scss';

const SectionHeader = ({ title, count }) => (
  <div className="admin-section-header">
    <h4 className="admin-section-header__title">{title}</h4>
    {typeof count === 'number' && (
      <span className="admin-section-header__count">{count} itens</span>
    )}
    <div className="admin-section-header__line" />
  </div>
);

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
};

export default SectionHeader;
