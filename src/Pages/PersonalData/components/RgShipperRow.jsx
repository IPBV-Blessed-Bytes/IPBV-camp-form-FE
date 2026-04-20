import { Row, Col, Form } from 'react-bootstrap';
import { useFormikContext } from 'formik';

import { issuingState, rgShipper } from '@/utils/constants';

const RgShipperRow = () => {
  const { values, errors, handleChange } = useFormikContext();

  return (
    <Row>
      <Col md={6} className="mb-3">
        <Form.Group>
          <Form.Label>
            <b>Órgão Expedidor RG:</b>
          </Form.Label>
          <Form.Select
            isInvalid={!!errors.rgShipper}
            value={values.rgShipper}
            name="rgShipper"
            id="rgShipper"
            onChange={handleChange}
          >
            <option value="" disabled>
              Selecione uma opção
            </option>
            {rgShipper.map((org) => (
              <option key={org.value} value={org.value}>
                {org.label}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.rgShipper}</Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col md={6} className="mb-3">
        <Form.Group>
          <Form.Label>
            <b>Estado de emissão órgão Exp.:</b>
          </Form.Label>
          <Form.Select
            value={values.rgShipperState}
            isInvalid={!!errors.rgShipperState}
            name="rgShipperState"
            id="rgShipperState"
            onChange={handleChange}
          >
            <option value="" disabled>
              Selecione uma opção
            </option>
            {issuingState.map((orgState) => (
              <option key={orgState.value} value={orgState.value}>
                {orgState.label}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.rgShipperState}</Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default RgShipperRow;
