import { Row, Col, Form, Card } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';

import { extractNumbers } from '../utils/fieldHelpers';

const NameAndRgRow = ({ onPersistName }) => {
  const { values, errors, handleChange } = useFormikContext();

  return (
    <Row>
      <Col md={6} className="mb-3">
        <Form.Group>
          <Form.Label>
            <b>Nome Completo:</b>
          </Form.Label>
          <Form.Control
            type="text"
            id="name"
            isInvalid={!!errors.name}
            value={values.name}
            onChange={(e) => {
              handleChange(e);
              onPersistName({ ...values, name: e.target.value });
            }}
          />
          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col md={6} className="mb-3">
        <Form.Group className="info-text-wrapper">
          <Form.Label>
            <b>RG:</b>
          </Form.Label>
          <Form.Control
            isInvalid={!!errors.rg}
            id="rg"
            name="rg"
            value={values.rg}
            onChange={(event) =>
              handleChange({
                target: {
                  name: 'rg',
                  value: extractNumbers(event.target.value),
                },
              })
            }
            title="Preencher RG válido. Caso não possua, preencher 0000000!"
          />
          <Form.Control.Feedback type="invalid">{errors.rg}</Form.Control.Feedback>
          <Card.Text className="mt-2 mb-0">
            <em>Caso não possua RG, preencher 0000000</em>
          </Card.Text>
        </Form.Group>
      </Col>
    </Row>
  );
};

NameAndRgRow.propTypes = {
  onPersistName: PropTypes.func.isRequired,
};

export default NameAndRgRow;
