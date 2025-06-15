import { useState, useEffect } from 'react';
import { Container, Accordion, Button, Card, Form, Row, Col } from 'react-bootstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import calculateAge from '../Packages/utils/calculateAge';
import { ExtraMealsSchema } from '@/form/validations/schema';
import './style.scss'
import Icons from '@/components/Global/Icons';

const mealOptions = [
  { day: 'Sábado', name: 'Sábado - almoço', price: 26, checkboxMargin: '' },
  { day: 'Sábado', name: 'Sábado - jantar', price: 26, checkboxMargin: '' },
  { day: 'Domingo', name: 'Domingo - café da manhã', price: 23, checkboxMargin: 'mb-2' },
  { day: 'Domingo', name: 'Domingo - almoço', price: 26, checkboxMargin: 'mb-2' },
  { day: 'Domingo', name: 'Domingo - jantar', price: 26, checkboxMargin: '' },
  { day: 'Segunda', name: 'Segunda - café da manhã', price: 23, checkboxMargin: 'mb-2' },
  { day: 'Segunda', name: 'Segunda - almoço', price: 26, checkboxMargin: 'mb-2' },
  { day: 'Segunda', name: 'Segunda - jantar', price: 26, checkboxMargin: '' },
  { day: 'Terça', name: 'Terça - café da manhã', price: 23, checkboxMargin: 'mb-2' },
  { day: 'Terça', name: 'Terça - almoço', price: 26, checkboxMargin: 'mb-2' },
  { day: 'Terça', name: 'Terça - jantar', price: 26, checkboxMargin: '' },
  { day: 'Quarta', name: 'Quarta - café da manhã', price: 23, checkboxMargin: '' },
];

const groupedMealOptions = mealOptions.reduce((acc, meal) => {
  if (!acc[meal.day]) {
    acc[meal.day] = [];
  }
  acc[meal.day].push(meal);
  return acc;
}, {});

const ExtraMeals = ({ birthDate, backStep, nextStep, initialValues, updateForm }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [checkboxHasError, setCheckboxHasError] = useState(false);
  const [extraMealSelected, setExtraMealSelected] = useState(false);
  const age = calculateAge(birthDate);

  const { values, handleChange, errors, submitForm, setFieldValue } = useFormik({
    initialValues: { ...initialValues, extraMeals: initialValues.extraMeals || [] },
    onSubmit: () => {
      if (values.someFood && values.extraMeals.length === 0) {
        setCheckboxHasError(true);
      } else {
        extraMealSelected &&
          toast.success(
            'Você receberá as senhas das refeições adquiridas presencialmente, no seu checkin no acampamento',
          );
        values.totalPrice = totalPrice;
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
      if (!values.someFood) {
        setTotalPrice(0);
      } else {
        const total = values.extraMeals.reduce((sum, meal) => {
          const mealOption = mealOptions.find((option) => option.name === meal);
          if (!mealOption) return sum;

          let mealPrice = mealOption.price;
          if (age <= 6) {
            mealPrice = 0;
          } else if (age >= 7 && age <= 12) {
            mealPrice *= 0.5;
          }

          return sum + mealPrice;
        }, 0);

        setTotalPrice(Math.round(total));
      }
    };

    calculateTotalPrice();
  }, [values.extraMeals, values.someFood, age]);

  const handleChangeSelect = (event) => {
    const value = event.target.value === 'true';
    handleChange({
      target: {
        name: 'someFood',
        value,
      },
    });

    if (!value) {
      setFieldValue('extraMeals', []);
      setExtraMealSelected(false);
      setCheckboxHasError(false);
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setFieldValue('extraMeals', [...values.extraMeals, name]);
      setCheckboxHasError(false);
      setExtraMealSelected(true);
    } else {
      setFieldValue(
        'extraMeals',
        values.extraMeals.filter((meal) => meal !== name),
      );
      if (values.extraMeals.length === 1) {
        setCheckboxHasError(true);
      }
      setExtraMealSelected(values.extraMeals.length > 1);
    }
  };

  return (
    <Card className="form__container__general-height">
      <Card.Body>
        <Container>
          <Card.Title>Refeição Extra</Card.Title>
          <Card.Text>
            Nesta seção, você escolhe se deseja adquirir refeições adicionais avulsas (café, almoço ou jantar). O valor
            das refeições será adicionado ao valor do seu pacote base.
          </Card.Text>
          <Card.Text>
            <i>
              Caso opte por não adquirir refeições avulsas nesta etapa, você poderá fazê-lo posteriormente no próprio
              acampamento, <b>até o dia anterior à refeição</b>, caso seja necessário.
            </i>
          </Card.Text>
          <Card.Text>
            As senhas de refeição avulsas serão entregues no ato do check-in na sua chegada ao acampamento.
          </Card.Text>
          <hr className="horizontal-line" />
          <Card.Text>
            <i>
              <b>OBS.: </b>
              Você montou seu pacote SEM alimentação na etapa anterior. Verifique se realmente não precisará de
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
                    onChange={handleChangeSelect}
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
            <Row className="mb-3">
              <Col md={8}>
                <Card.Text className="mb-3">
                  <b>Valores:</b> <br />
                  <ul>
                    <li>
                      Café da manhã:{' '}
                      <b>
                        {age < 7 ? (
                          <>
                            <span className="price-with-discount">R$23,00</span>&nbsp;⭢&nbsp;
                            <span className="text-success-custom">R$0,00</span>
                          </>
                        ) : age <= 12 ? (
                          <>
                            <span className="price-with-discount">R$23,00</span>&nbsp;⭢&nbsp;
                            <span className="text-success-custom">R$12,00</span>
                          </>
                        ) : (
                          'R$ 23,00'
                        )}{' '}
                        por refeição
                      </b>
                    </li>
                    <li>
                      Almoço:{' '}
                      <b>
                        {age < 7 ? (
                          <>
                            <span className="price-with-discount">R$26,00</span>&nbsp;⭢&nbsp;
                            <span className="text-success-custom">R$0,00</span>
                          </>
                        ) : age <= 12 ? (
                          <>
                            <span className="price-with-discount">R$26,00</span>&nbsp;⭢&nbsp;
                            <span className="text-success-custom">R$13,00</span>
                          </>
                        ) : (
                          'R$ 26,00'
                        )}{' '}
                        por refeição
                      </b>
                    </li>
                    <li>
                      Jantar:{' '}
                      <b>
                        {age < 7 ? (
                          <>
                            <span className="price-with-discount">R$26,00</span>&nbsp;⭢&nbsp;
                            <span className="text-success-custom">R$0,00</span>
                          </>
                        ) : age <= 12 ? (
                          <>
                            <span className="price-with-discount">R$26,00</span>&nbsp;⭢&nbsp;
                            <span className="text-success-custom">R$13,00</span>
                          </>
                        ) : (
                          'R$ 26,00'
                        )}{' '}
                        por refeição
                      </b>
                    </li>
                    <br />
                    <em>
                      <u className="text-success-custom">
                        {age < 7 && '⭢ Criança até 6 anos não paga alimentação'}
                        {age >= 7 && age <= 12 && '⭢ Criança de 7 a 12 anos paga apenas 50% na refeição extra'}
                      </u>
                    </em>
                  </ul>
                </Card.Text>
              </Col>
              <Col md={4} className="d-flex justify-content-center align-items-center">
                <Icons typeIcon="food" iconSize={100} fill="#0c9183" />
              </Col>
            </Row>
            {values.someFood && (
              <Accordion className="mb-5">
                {Object.entries(groupedMealOptions).map(([day, meals], index) => (
                  <Accordion.Item className={checkboxHasError && 'msg-error'} eventKey={index.toString()} key={day}>
                    <Accordion.Header>{day}</Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        {meals.map((meal) => (
                          <Col md={6} key={meal.name}>
                            <Form.Group>
                              <Form.Check
                                className={`table-checkbox checkbox-label ${meal.checkboxMargin} ${
                                  checkboxHasError && 'checkbox-error'
                                }`}
                                type="checkbox"
                                id={`meal-${meal.name}`}
                                name={meal.name}
                                isInvalid={!!errors.extraMeals}
                                onChange={handleCheckboxChange}
                                checked={values.extraMeals.includes(meal.name)}
                                label={`${meal.name} - R$ ${meal.price},00`}
                              />
                              <Form.Check.Label className="d-none" htmlFor={`meal-${meal.name}`} />
                            </Form.Group>
                          </Col>
                        ))}
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
            {checkboxHasError && (
              <div className={`invalid-feedback d-block`}>
                Selecione alguma refeição &nbsp;
                <Icons typeIcon="error" iconSize={25} fill="#c92432" />
              </div>
            )}
          </Form>
          {values.someFood && (
            <>
              <hr className="horizontal-line" />
              <Row>
                <Col>
                  <Card.Text className="d-flex justify-content-end">
                    <i>Valor Total das Refeições:</i>&nbsp;
                    <b className="text-success-custom">R$ {totalPrice.toFixed(2)}</b>
                  </Card.Text>
                </Col>
              </Row>
            </>
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
  birthDate: PropTypes.instanceOf(Date),
  backStep: PropTypes.func,
  nextStep: PropTypes.func,
  updateForm: PropTypes.func,
  initialValues: PropTypes.shape({
    someFood: PropTypes.bool,
    extraMeals: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default ExtraMeals;
