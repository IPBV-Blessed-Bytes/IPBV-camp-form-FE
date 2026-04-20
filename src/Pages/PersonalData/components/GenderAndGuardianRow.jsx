import { Row, Col, Form } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import InputMask from 'react-input-mask';
import PropTypes from 'prop-types';

import Tips from '@/components/Global/Tips';
import { extractNumbers } from '../utils/fieldHelpers';

const GenderAndGuardianRow = ({ showLegalGuardianFields, onPersistGuardianName }) => {
  const { values, errors, handleChange } = useFormikContext();

  return (
    <>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>
              <b>Categoria de Acampante:</b>
            </Form.Label>
            <Form.Select
              isInvalid={!!errors.gender}
              value={values.gender}
              name="gender"
              id="gender"
              onChange={handleChange}
            >
              <option value="" disabled>
                Selecione uma opção
              </option>
              <option value="Crianca">Criança (até 10 anos)</option>
              <option value="Homem">Adulto Masculino</option>
              <option value="Mulher">Adulto Feminimo</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        {showLegalGuardianFields && (
          <Col md={6} className="mb-3">
            <Form.Group>
              <div className="d-flex gap-2">
                <Form.Label>
                  <b>Nome do Responsável Legal:</b>
                </Form.Label>
                <Tips
                  placement="top"
                  typeIcon="info"
                  size={18}
                  color={'#7f7878'}
                  text="Como a idade informada é menor que 18 anos, é necessário informar os dados de um responsável legal QUE ESTARÁ NO ACAMPAMENTO"
                />
              </div>
              <Form.Control
                type="text"
                id="legalGuardianName"
                isInvalid={!!errors.legalGuardianName}
                value={values.legalGuardianName}
                onChange={(e) => {
                  handleChange(e);
                  onPersistGuardianName({ ...values, legalGuardianName: e.target.value });
                }}
              />
              <Form.Control.Feedback style={{ display: 'block' }} type="invalid">
                {errors.legalGuardianName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}
      </Row>

      {showLegalGuardianFields && (
        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>
                <b>CPF do Responsável Legal:</b>
              </Form.Label>
              <Form.Control
                as={InputMask}
                isInvalid={!!errors.legalGuardianCpf}
                mask="999.999.999-99"
                name="legalGuardianCpf"
                id="legalGuardianCpf"
                className="cpf-container"
                value={values.legalGuardianCpf}
                onChange={(event) =>
                  handleChange({
                    target: {
                      name: 'legalGuardianCpf',
                      value: extractNumbers(event.target.value),
                    },
                  })
                }
                placeholder="000.000000-00"
                title="Preencher CPF válido"
              />
              <Form.Control.Feedback type="invalid">{errors.legalGuardianCpf}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>
                <b>Telefone do Responsável Legal:</b>
              </Form.Label>
              <Form.Control
                type="text"
                as={InputMask}
                isInvalid={!!errors.legalGuardianCellPhone}
                mask="(99) 99999-9999"
                id="legalGuardianCellPhone"
                value={values.legalGuardianCellPhone}
                onChange={(event) => {
                  handleChange({
                    target: {
                      name: 'legalGuardianCellPhone',
                      value: extractNumbers(event.target.value),
                    },
                  });
                }}
                placeholder="(00) 00000-0000"
              />
              <Form.Control.Feedback type="invalid">{errors.legalGuardianCellPhone}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      )}
    </>
  );
};

GenderAndGuardianRow.propTypes = {
  showLegalGuardianFields: PropTypes.bool,
  onPersistGuardianName: PropTypes.func.isRequired,
};

export default GenderAndGuardianRow;
