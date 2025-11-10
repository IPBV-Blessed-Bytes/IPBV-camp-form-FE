import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import Icons from '@/components/Global/Icons';

const ColumnFilterWithSelect = ({ column, options, onFilterChange }) => {
  const filterValue = column?.filterValue || '';
  const setFilter = column?.setFilter || (() => {});

  useEffect(() => {
    onFilterChange();
  }, [filterValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    setFilter(value === 'all' ? undefined : value);
  };

  return (
    <div className="d-flex position-relative">
      <Form.Select
        className={`form-select-lg-custom ${filterValue && 'actived-filter'}`}
        value={filterValue || 'all'}
        onChange={handleChange}
        size="lg"
      >
        <option value="all">Todos</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
      {filterValue && <Icons className="filter-icon" typeIcon="filter" iconSize={24} fill="#4267a7" />}
    </div>
  );
};

ColumnFilterWithSelect.propTypes = {
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

export default ColumnFilterWithSelect;
