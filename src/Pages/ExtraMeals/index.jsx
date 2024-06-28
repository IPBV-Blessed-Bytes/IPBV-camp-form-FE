import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { Container, Button, Card, Form, Row, Col } from 'react-bootstrap';
import Icons from '../../components/Icons';
import { ExtraMealsSchema } from '../../form/validations/schema';

const mealOptions = [
  { name: 'Sábado - almoço', price: 26 },
  { name: 'Sábado - jantar', price: 26 },
  { name: 'Domingo - café da manhã', price: 23 },
  { name: 'Domingo - almoço', price: 26 },
  { name: 'Domingo - jantar', price: 26 },
  { name: 'Segunda - café da manhã', price: 23 },
  { name: 'Segunda - almoço', price: 26 },
  { name: 'Segunda - jantar', price: 26 },
  { name: 'Terça - café da manhã', price: 23 },
  { name: 'Terça - almoço', price: 26 },
  { name: 'Terça - jantar', price: 26 },
  { name: 'Quarta - café da manhã', price: 23 },
  { name: 'Quarta - almoço', price: 26 },
  { name: 'Quarta - jantar', price: 26 },
  { name: 'Quinta - café da manhã', price: 23 },
];

const ExtraMeals = ({ backStep, nextStep, initialValues, updateForm }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [checkboxHasError, setCheckboxHasError] = useState(false);

  const { values, handleChange, errors, submitForm, setFieldValue } = useFormik({
    initialValues: { ...initialValues, extraMeals: initialValues.extraMeals || [] },
    onSubmit: () => {
      if (values.someFood && values.extraMeals.length === 0) {
        setCheckboxHasError(true);
      } else {
        nextStep();
        updateForm(values);
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: ExtraMealsSchema,
  });

  useEffect(() => {
    const calculateTotalPrice = () => {
      const total = values.extraMeals.reduce((sum, meal) => {
        const mealOption = mealOptions.find((option) => option.name === meal);
        return sum + (mealOption ? mealOption.price : 0);
      }, 0);
      setTotalPrice(total);
    };

    calculateTotalPrice();
  }, [values.extraMeals]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setFieldValue('extraMeals', [...values.extraMeals, name]);
      setCheckboxHasError(false);
    } else {
      setFieldValue(
        'extraMeals',
        values.extraMeals.filter((meal) => meal !== name),
      );
      if (values.extraMeals.length === 1) {
        setCheckboxHasError(true);
      }
    }
  };

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Card.Title>Alimentação Extra</Card.Title>
          <Card.Text>
            Nesta seção, você escolhe se deseja adquirir refeições adicionais avulsas (café, almoço ou jantar). O valor
            das refeições será adicionado ao valor do seu pacote base.
          </Card.Text>
          <Card.Text>
            <i>
              Caso opte por não adquirir refeições avulsas nesta etapa, você poderá fazê-lo posteriormente entrando em
              contato com a secretaria ou pessoalmente no acampamento, até o dia anterior à refeição, caso seja
              necessário.{' '}
            </i>
          </Card.Text>
          <hr className="horizontal-line" />
          <Card.Text>
            <i>
              <b>OBS.: </b>
              Você selecionou um pacote SEM alimentação na etapa anterior. Verifique se realmente não precisará de
              alimentação. Caso precise de alguma refeição avulsa, selecione aqui (ou deixe para comprar
              presencialmente, se preferir).
            </i>
          </Card.Text>
          <hr className="horizontal-line" />
          <Form>
            <Row>
              <Col md={7} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <b>Deseja adquirir alguma refeição extra?</b>
                  </Form.Label>

                  <Form.Select
                    className="mb-3"
                    name="someFood"
                    isInvalid={!!errors.someFood}
                    value={values.someFood}
                    onChange={(event) =>
                      handleChange({
                        target: {
                          name: 'someFood',
                          value: event.target.value === 'true',
                        },
                      })
                    }
                  >
                    <option value="" disabled>
                      Selecione uma opção
                    </option>
                    <option value={true}>Sim</option>
                    <option value={false}>Não</option>
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">{errors.someFood}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Card.Text className="mb-3">
                <b>Valores:</b> <br />
                <ul>
                  <li>
                    Café da manhã: <b>R$ 23,00 por refeição</b>
                  </li>
                  <li>
                    Almoço: <b>R$ 26,00 por refeição</b>
                  </li>
                  <li>
                    Jantar: <b>R$ 26,00 por refeição</b>
                  </li>
                </ul>
              </Card.Text>
            </Row>
            {values.someFood && (
              <Row className="mb-3">
                <Form.Label>
                  <b>Selecione as refeições:</b>
                </Form.Label>
                {mealOptions.map((meal) => (
                  <Col md={6} className="mb-3" key={meal.name}>
                    <Form.Group>
                      <Form.Check
                        className={`table-checkbox ${checkboxHasError && 'checkbox-error'}`}
                        type="checkbox"
                        name={meal.name}
                        isInvalid={!!errors.extraMeals}
                        onChange={handleCheckboxChange}
                        checked={values.extraMeals.includes(meal.name)}
                        label={`${meal.name} - R$ ${meal.price},00`}
                      ></Form.Check>
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            )}
            {checkboxHasError && (
              <div className={`invalid-feedback d-block`}>
                Selecione alguma refeição &nbsp;
                <Icons typeIcon="error" iconSize={25} fill="#c92432" />
              </div>
            )}
          </Form>
          {values.someFood && (
            <Row>
              <Col>
                <Card.Text className="d-flex justify-content-end">
                  <i>Valor total das refeições selecionadas:</i> &nbsp;
                  <b className="text-success">R$ {totalPrice},00</b>
                </Card.Text>
              </Col>
            </Row>
          )}
        </Container>
      </Card.Body>

      <div className="form__container__buttons">
        <Button variant="light" onClick={backStep} size="lg">
          Voltar
        </Button>
        <Button variant="warning" onClick={submitForm} size="lg">
          Avançar
        </Button>
      </div>
    </Card>
  );
};

ExtraMeals.propTypes = {
  backStep: PropTypes.func,
  nextStep: PropTypes.func,
  updateForm: PropTypes.func,
  initialValues: PropTypes.shape({
    someFood: PropTypes.bool,
    extraMeals: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default ExtraMeals;
