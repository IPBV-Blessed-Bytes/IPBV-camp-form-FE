import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useCart } from 'react-use-cart';
import { loadProducts } from './utils/products';
import './style.scss';
import ProductList from '@/components/Global/ProductList';
import Tips from '@/components/Global/Tips';
import getDiscountedProducts from './utils/getDiscountedProducts';
import { calculateRegistrationFee } from '@/utils/calculateRegistrationFee';
import { findActiveLot } from '@/utils/activeLot';
import { getLots } from '@/services/lots';
import { useFormState } from '@/contexts/FormStateContext';
import Loading from '@/components/Global/Loading';

const Packages = () => {
  const {
    age,
    backStep,
    cartKey,
    currentFormIndex,
    currentFormValues,
    discount,
    hasDiscount,
    nextStep,
    packageCount,
    totalRegistrations: totalRegistrationsGlobal,
    totalSeats,
    updateFormValues,
  } = useFormState();
  const updateForm = updateFormValues('package');
  const productListRef = useRef();
  const { items, addItem } = useCart();
  const [individualBase, setIndividualBase] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productsState, setProductsState] = useState([]);
  const [vacancies, setVacancies] = useState({});
  const [activeLot, setActiveLot] = useState(null);

  useEffect(() => {
    const fetchLotsAndProducts = async () => {
      try {
        const updatedProducts = await loadProducts();

        const data = await getLots();
        const foundLot = findActiveLot(data?.lots);

        if (foundLot) {
          setActiveLot(foundLot);

          const registrationFee = calculateRegistrationFee(Number(foundLot.price.registrationFee || 0), age);

          setIndividualBase(registrationFee);

          const updatedWithLotPrices = updatedProducts.map((prod) => {
            if (prod.category === 'Hospedagem') {
              if (prod.id === 'host-seminario') return { ...prod, price: foundLot.price.seminary };
              if (prod.id.startsWith('host-college')) return { ...prod, price: foundLot.price.school };
              if (prod.id === 'host-external') return { ...prod, price: foundLot.price.otherAccomodation };
            }
            if (prod.category === 'Transporte' && prod.id === 'bus-yes') {
              return { ...prod, price: foundLot.price.bus };
            }
            if (prod.category === 'Alimentação' && prod.id.startsWith('food')) {
              return { ...prod, price: foundLot.price.food };
            }
            return prod;
          });

          setProductsState(updatedWithLotPrices);
          setVacancies(foundLot.vacancies);
        }
      } catch (error) {
        console.error('Erro ao buscar lotes:', error);
        setIndividualBase(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLotsAndProducts();
  }, [age]);

  useEffect(() => {
    const currentUser = currentFormValues;
    const cartIsEmpty = items.length === 0;

    if (cartIsEmpty && currentUser?.package) {
      const { accomodation, transportation, food } = currentUser.package;

      if (accomodation?.id) {
        addItem({ ...accomodation, category: 'Hospedagem' });
      }
      if (transportation?.id) {
        addItem({ ...transportation, category: 'Transporte' });
      }
      if (food?.id) {
        addItem({ ...food, category: 'Alimentação' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFormValues, currentFormIndex]);

  useEffect(() => {
    if (hasDiscount) {
      toast.info(
        `Foi gerado um desconto no valor de R$ ${discount} em seu nome. O desconto já está aplicado ao valor final dos produtos.`,
      );
    }
  }, [hasDiscount, discount]);

  const submitForm = () => {
    const isValid = productListRef.current?.checkRequiredPackages();

    if (!isValid) return;

    const newPackage = {
      accomodation: { id: '', name: '', price: '' },
      transportation: { id: '', name: '', price: '' },
      food: { id: '', name: '', price: '' },
      price: '',
      finalPrice: '',
      discount: 0,
    };

    items.forEach((item) => {
      if (item.category === 'Hospedagem') {
        newPackage.accomodation = { id: item.id, name: item.name, price: item.price };
      }
      if (item.category === 'Transporte') {
        newPackage.transportation = { id: item.id, name: item.name, price: item.price };
      }
      if (item.category === 'Alimentação') {
        newPackage.food = { id: item.id, name: item.name, price: item.price };
      }
    });

    newPackage.price =
      Number(newPackage.accomodation.price || 0) +
      Number(newPackage.transportation.price || 0) +
      Number(newPackage.food.price || 0);

    const discountNumeric = Number(discount) || 0;
    newPackage.finalPrice = Math.max(newPackage.price - discountNumeric, 0);
    newPackage.discount = discountNumeric;

    updateForm(newPackage, () => {
      const hasFood = true;
      const skipToReview = hasFood;
      nextStep(skipToReview);
    });
  };

  const validRegistrations = totalRegistrationsGlobal.totalValidRegistrationsGlobal;
  const isChild = age < 9;
  const isRegistrationClosed = validRegistrations >= totalSeats && !isChild;

  const discounted = getDiscountedProducts(age);

  const getCategoryDiscountDescription = (category) => {
    const productsInCategory = discounted.filter((p) => p.category === category);
    const descriptions = productsInCategory
      .filter((p) => p.discountDescription && p.discountDescription.trim() !== '')
      .map((p) => `${p.discountDescription} quando opção for ${p.name}`);

    return descriptions.length > 0 ? ` ${descriptions.join(' | ')}` : '';
  };

  const getDiscountedPrice = (category) => {
    const item = items.find((i) => i.category === category);
    if (!item) return 0;

    const discountedItem = discounted.find((d) => d.id === item.id);
    return discountedItem?.price ?? item.price ?? 0;
  };

  const accomodationPrice = getDiscountedPrice('Hospedagem');
  const transportationPrice = getDiscountedPrice('Transporte');
  const foodPrice = getDiscountedPrice('Alimentação');

  const totalBeforeDiscount = accomodationPrice + transportationPrice + foodPrice;
  const discountNumeric = Number(discount) || 0;
  const finalTotal = Math.max(totalBeforeDiscount + individualBase - discountNumeric, 0);

  const rawFee = Number(activeLot?.price?.registrationFee || 0);

  const getFeeByAge = (ageValue) => (rawFee > 0 ? calculateRegistrationFee(rawFee, ageValue) : 0);

  const dynamicFeeTip = `
Valor da taxa de inscrição conforme a idade:
até 8 anos = ${getFeeByAge(8)} reais,
9 a 14 anos = ${getFeeByAge(10)} reais,
acima de 15 anos = ${getFeeByAge(20)} reais
`;

  return (
    <Container className="packages-page form__container__cart-height">
      <Row>
        <Col xs={12} xl={8} className="px-0 mb-3 mb-xl-0">
          {!isRegistrationClosed ? (
            <>
              <Card className="mb-3">
                <Card.Body>
                  <h2 className="packages-page__lot-title">{activeLot?.name}</h2>
                  <Card.Title>Hospedagem</Card.Title>
                  <Card.Text>
                    Vamos começar a montagem do seu pacote. A escolha da hospedagem é <strong>obrigatória</strong>.
                    <em className="discount-description text-success small">
                      {getCategoryDiscountDescription('Hospedagem')}
                    </em>
                  </Card.Text>
                  <ProductList
                    age={age}
                    cartKey={cartKey}
                    category="Hospedagem"
                    products={productsState}
                    ref={productListRef}
                    packageCount={packageCount}
                    vacancies={vacancies}
                  />
                </Card.Body>
              </Card>

              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Transporte</Card.Title>
                  <Card.Text>
                    Temos opções para todos estilos. Vá com o grupo da igreja ou tenha liberdate total com transporte
                    próprio. A escolha do transporte é <strong>obrigatória</strong>.
                    <em className="discount-description text-success small">
                      {getCategoryDiscountDescription('Transporte')}
                    </em>
                  </Card.Text>
                  <ProductList
                    age={age}
                    cartKey={cartKey}
                    category="Transporte"
                    products={productsState}
                    ref={productListRef}
                    packageCount={packageCount}
                    vacancies={vacancies}
                  />
                </Card.Body>
              </Card>

              <Card className="mb-3 mb-sm-0">
                <Card.Body>
                  <Card.Title>Alimentação</Card.Title>
                  <Card.Text>
                    Você pode optar por todas as refeições ou nenhuma refeição.{' '}
                    <strong>Não teremos vendas de refeições avulsas</strong>. A escolha do alimentação é{' '}
                    <strong>obrigatória</strong>.
                    <em className="discount-description text-success small">
                      {getCategoryDiscountDescription('Alimentação')}
                    </em>
                  </Card.Text>
                  <ProductList
                    age={age}
                    cartKey={cartKey}
                    category="Alimentação"
                    products={productsState}
                    ref={productListRef}
                    packageCount={packageCount}
                    vacancies={vacancies}
                  />
                </Card.Body>
              </Card>
            </>
          ) : (
            <div className="registration-closed-message">
              <p>
                Desculpe, as vagas para inscrições estão completas. <br />
                Para maiores dúvidas, favor contactar a secretaria da igreja.
              </p>
            </div>
          )}
        </Col>

        {!isRegistrationClosed && (
          <Col xs={12} xl={4} className="px-0 ps-xl-3">
            <Card>
              <Card.Body>
                <Card.Title>Resumo do Pacote</Card.Title>
                <div className="summary">
                  <div className="summary__accomodation">
                    <div className="summary__accomodation__label">Hospedagem:</div>
                    <div
                      className={`summary__accomodation__content ${
                        items.find((i) => i.category === 'Hospedagem') ? 'with-border' : 'no-border'
                      }`}
                    >
                      {items.find((i) => i.category === 'Hospedagem') ? (
                        <div>{items.find((i) => i.category === 'Hospedagem')?.name}</div>
                      ) : (
                        <small className="text-secondary">Não selecionado</small>
                      )}
                      {items.find((i) => i.category === 'Hospedagem') && (
                        <div className="summary__accomodation__value">R$ {accomodationPrice},00</div>
                      )}
                    </div>
                    <div className="packages-horizontal-line-cart"></div>
                  </div>

                  <div className="summary__transportation">
                    <div className="summary__accomodation__label">Transporte:</div>
                    <div
                      className={`summary__accomodation__content ${
                        items.find((i) => i.category === 'Transporte') ? 'with-border' : 'no-border'
                      }`}
                    >
                      {items.find((i) => i.category === 'Transporte') ? (
                        <div>{items.find((i) => i.category === 'Transporte')?.name}</div>
                      ) : (
                        <small className="text-secondary">Não selecionado</small>
                      )}
                      {items.find((i) => i.category === 'Transporte') && (
                        <div className="summary__accomodation__value">R$ {transportationPrice},00</div>
                      )}
                    </div>
                    <div className="packages-horizontal-line-cart"></div>
                  </div>

                  <div className="summary__food">
                    <div className="summary__accomodation__label">Alimentação:</div>
                    <div
                      className={`summary__accomodation__content ${
                        items.find((i) => i.category === 'Alimentação') ? 'with-border' : 'no-border'
                      }`}
                    >
                      {items.find((i) => i.category === 'Alimentação') ? (
                        <div>{items.find((i) => i.category === 'Alimentação')?.name}</div>
                      ) : (
                        <small className="text-secondary">Não selecionado</small>
                      )}
                      {items.find((i) => i.category === 'Alimentação') && (
                        <div className="summary__accomodation__value">R$ {foodPrice},00</div>
                      )}
                    </div>
                    <div className="packages-horizontal-line-cart"></div>
                  </div>

                  <div className="summary__individual-base">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex align-items-center gap-1">
                        <div className="summary-individual-base-label">Taxa de Inscrição:</div>
                        <Tips
                          classNameWrapper="mt-0 mb-2"
                          placement="top"
                          typeIcon="info"
                          size={15}
                          color={'#7f7878'}
                          text={dynamicFeeTip}
                        />
                      </div>
                      <div className="summary-individual-base-value"> R$ {individualBase},00 </div>
                    </div>
                    <div className="packages-horizontal-line-cart"></div>
                  </div>

                  {hasDiscount && discountNumeric > 0 && (
                    <div className="summary__discount">
                      <div className="d-flex justify-content-between">
                        <div className="d-flex align-items-center gap-1">
                          <div>Desconto:</div>
                          <Tips
                            classNameWrapper="mt-0 mb-1"
                            placement="top"
                            typeIcon="info"
                            size={15}
                            color={'#7f7878'}
                            text="Valor de desconto aplicado diretamente ao CPF do acampante, mesmo que haja mais de um usuário no carrinho."
                          />
                        </div>
                        <div className="summary-discount-value">-R$ {discountNumeric},00</div>
                      </div>
                      <div className="packages-horizontal-line-cart"></div>
                    </div>
                  )}

                  <div className="summary__discount">
                    <strong className="d-flex justify-content-between">
                      <div>Total:</div>
                      <div>R$ {finalTotal},00</div>
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Row>
        <div className="form__container__buttons mt-0">
          <Button variant="light" onClick={backStep} size="lg">
            Voltar
          </Button>
          {!isRegistrationClosed && (
            <Button variant="warning" onClick={submitForm} size="lg">
              Avançar
            </Button>
          )}
        </div>
      </Row>
      <Loading loading={loading} />
    </Container>
  );
};

export default Packages;
