import React from 'react';
import { Form } from 'react-bootstrap';

const AdminTableSelectFilter = ({ column: { setFilter, filterValue }, options }) => {
  return (
    <Form.Select
      className="form-select-lg-custom"
      value={filterValue || 'all'}
      onChange={(e) => {
        const value = e.target.value;
        setFilter(value === 'all' ? undefined : value);
      }}
      size="lg"
    >
      <option value="all">Todos</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};

export default AdminTableSelectFilter;
