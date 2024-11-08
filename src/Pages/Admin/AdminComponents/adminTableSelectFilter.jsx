import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

const AdminTableSelectFilter = ({ column: { setFilter, filterValue }, options }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    setFilter(value === 'all' ? undefined : value);
  };

  return (
    <Form.Select className="form-select-lg-custom" value={filterValue || 'all'} onChange={handleChange} size="lg">
      <option value="all">Todos</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};

AdminTableSelectFilter.propTypes = {
  column: PropTypes.shape({
    setFilter: PropTypes.func,
    filterValue: PropTypes.string,
  }),
  options: PropTypes.shape({
    map: PropTypes.func,
  }),
};

export default AdminTableSelectFilter;
