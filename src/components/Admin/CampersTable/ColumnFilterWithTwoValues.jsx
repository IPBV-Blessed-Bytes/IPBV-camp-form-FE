import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Icons from '@/components/Global/Icons';

const ColumnFilterWithTwoValues = ({ column, options, onFilterChange }) => {
  const [localFilterValue, setLocalFilterValue] = useState(column?.filterValue || '');
  const setFilter = column?.setFilter || (() => {});

  useEffect(() => {
    onFilterChange();
  }, [localFilterValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalFilterValue(value);
    if (value === 'sim') {
      setFilter(true);
    } else if (value === 'não') {
      setFilter(false);
    } else {
      setFilter(undefined);
    }
  };

  return (
    <div className="d-flex position-relative">
      <Form.Select
        className={`form-select-lg-custom ${localFilterValue && 'actived-filter'}`}
        value={localFilterValue}
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
      {localFilterValue && <Icons className="filter-icon" typeIcon="filter" iconSize={24} fill="#4267a7" />}
    </div>
  );
};

ColumnFilterWithTwoValues.propTypes = {
  column: PropTypes.shape({
    setFilter: PropTypes.func,
    filterValue: PropTypes.string,
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
