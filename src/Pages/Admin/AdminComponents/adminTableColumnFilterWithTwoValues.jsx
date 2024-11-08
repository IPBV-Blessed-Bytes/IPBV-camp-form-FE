import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

const AdminColumnFilterWithTwoValues = ({ column: { setFilter }, options }) => {
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
    <Form.Select className="form-select-lg-custom" onChange={handleChange} size="lg">
      <option value="">Todos</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};

AdminColumnFilterWithTwoValues.propTypes = {
  column: PropTypes.shape({
    setFilter: PropTypes.func,
  }),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
};

export default AdminColumnFilterWithTwoValues;
