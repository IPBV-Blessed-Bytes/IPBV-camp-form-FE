import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

const TableColumnFilterWithTwoValues = ({ column, options, onFilterChange }) => {
  const filterValue = column?.filterValue || '';
  const setFilter = column?.setFilter || (() => {});

  useEffect(() => {
    onFilterChange();
  }, [filterValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === 'sim') {
      setFilter(true);
    } else if (value === 'não') {
      setFilter(false);
    } else {
      setFilter(undefined);
    }
  };

  return (
    <Form.Select className="form-select-lg-custom" value={filterValue || ''} onChange={handleChange} size="lg">
      <option value="">Todos</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};

TableColumnFilterWithTwoValues.propTypes = {
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

export default TableColumnFilterWithTwoValues;
