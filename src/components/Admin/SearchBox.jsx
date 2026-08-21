import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import './SearchBox.scss';

const SearchBox = ({ value, onChange, placeholder = 'Buscar...' }) => (
  <div className="search-box">
    <Icons typeIcon="m-glass" iconSize={18} fill="#8a8a8a" />
    <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </div>
);

SearchBox.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default SearchBox;
