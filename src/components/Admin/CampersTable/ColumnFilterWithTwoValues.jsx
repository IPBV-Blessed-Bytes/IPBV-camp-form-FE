import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

const ColumnFilterWithTwoValues = ({ column, options, onFilterChange }) => {
  const filterValue = column?.filterValue;
  const setFilter = column?.setFilter ?? (() => {});

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === 'sim') {
      setFilter(true);
    } else if (value === 'não') {
      setFilter(false);
    } else {
      setFilter(undefined);
    }

    onFilterChange?.(value);
  };

  const selectValue = filterValue === true ? 'sim' : filterValue === false ? 'não' : '';

  return (
    <div className="d-flex position-relative">
      <Form.Select
        className={`form-select-lg-custom ${selectValue && 'actived-filter'}`}
        value={selectValue}
        onChange={handleChange}
        size="lg"
      >
        <option value="">Todos</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
      {selectValue && <Icons className="filter-icon" typeIcon="filter" iconSize={24} fill="#4267a7" />}
    </div>
  );
};

ColumnFilterWithTwoValues.propTypes = {
  column: PropTypes.shape({
    setFilter: PropTypes.func,
    filterValue: PropTypes.any,
  }),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  onFilterChange: PropTypes.func,
};

export default ColumnFilterWithTwoValues;
