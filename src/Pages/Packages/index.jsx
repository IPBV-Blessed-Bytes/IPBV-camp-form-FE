import { useEffect, useState } from 'react';
import { formatBRL } from '@/utils/formatBRL';
import { getPreSaleAmount } from '@/utils/preSale';
import { getTempData } from '@/utils/formStorage';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useCart } from 'react-use-cart';
import { loadProducts } from './utils/products';
import { loadAgePriceRules } from './utils/ageRules';
import './style.scss';
import ProductList from '@/components/Global/ProductList';
import StoreItemList from '@/components/Global/StoreItemList';
import Tips from '@/components/Global/Tips';
import getDiscountedProducts from './utils/getDiscountedProducts';
import { findActiveLot } from '@/utils/activeLot';
import { getLots } from '@/services/lots';
import { useFormState } from '@/contexts/FormStateContext';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';

const FIXED_KEYS = ['HOSPEDAGEM', 'TRANSPORTE'];
const CATEGORY_LABELS = { HOSPEDAGEM: 'Hospedagem', TRANSPORTE: 'Transporte', LOJA: 'Loja' };

const dedupeCart = (arr) => {
  const map = new Map();
  arr.forEach((x) => {
    if (!x?.categoryKey) return;
    const key = FIXED_KEYS.includes(x.categoryKey) ? x.categoryKey : `${x.categoryKey}:${x.name}`;
    map.set(key, x);
  });
  return Array.from(map.values());
};

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
  const { items, addItem, getItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [productsState, setProductsState] = useState([]);
  const [activeLot, setActiveLot] = useState(null);

  const preSaleCpf = getTempData().personalInformation?.cpf || currentFormValues?.personalInformation?.cpf;
  const isPreSale = getPreSaleAmount(preSaleCpf) > 0;

  useEffect(() => {
    const fetchLotsAndProducts = async () => {
      try {
        const updatedProducts = await loadProducts();
        await loadAgePriceRules();

        const data = await getLots();
        const foundLot = findActiveLot(data?.lots);

        if (foundLot) {
          setActiveLot(foundLot);
          setProductsState(updatedProducts);
        }
      } catch (error) {
        console.error('Erro ao buscar lotes:', error);
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
      const { accomodation, transportation, extras } = currentUser.package;

      if (accomodation?.id && !getItem(accomodation.id)) {
        addItem({ ...accomodation, category: 'Hospedagem', categoryKey: 'HOSPEDAGEM' });
      }
      if (transportation?.id && !getItem(transportation.id)) {
        addItem({ ...transportation, category: 'Transporte', categoryKey: 'TRANSPORTE' });
      }
      if (Array.isArray(extras)) {
        extras.forEach((e) => {
          if (e?.id && !getItem(e.id)) {
            addItem(
              { id: e.id, name: e.name, price: Number(e.price) || 0, category: e.category, categoryKey: e.categoryKey },
              Number(e.quantity) || 1,
            );
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFormValues, currentFormIndex]);

  useEffect(() => {
    if (hasDiscount) {
      toast.info(
        `Foi gerado um desconto no valor de R$ ${formatBRL(discount)} em seu nome. O desconto já está aplicado ao valor final dos produtos.`,
      );
    }
  }, [hasDiscount, discount]);

  useEffect(() => {
    if (isPreSale) {
      toast.info(
        'Como você já fez sua pré inscrição, o valor pago abaterá o valor da alimentação automaticamente do seu pacote.',
      );
    }
  }, [isPreSale]);

  const discounted = getDiscountedProducts(age);
  const cartItems = dedupeCart(items);

  const priceForItem = (item) => {
    const d = discounted.find((p) => p.id === item.id);
    return Number(d?.price ?? item.price ?? 0) * Number(item.quantity || 1);
  };

  const getCategoryDiscountDescription = (key) => {
    const descriptions = discounted
      .filter((p) => p.categoryKey === key && p.discountDescription && p.discountDescription.trim() !== '')
      .map((p) => `${p.discountDescription} quando opção for ${p.name}`);
    return descriptions.length > 0 ? ` ${descriptions.join(' | ')}` : '';
  };

  const hasStoreItems = discounted.some(
    (p) =>
      p.categoryKey &&
      !FIXED_KEYS.includes(p.categoryKey) &&
      productsState.find((prod) => prod.id === p.id) &&
      (p.stock === null || p.stock === undefined || p.stock > 0),
  );

  const storeCartItems = cartItems.filter((i) => i.categoryKey && !FIXED_KEYS.includes(i.categoryKey));

  const submitForm = () => {
    const missing = [];
    if (!items.some((i) => i.categoryKey === 'HOSPEDAGEM')) missing.push('Hospedagem');
    if (!items.some((i) => i.categoryKey === 'TRANSPORTE')) missing.push('Transporte');
    if (missing.length > 0) {
      toast.error(`Selecione uma opção para: ${missing.join(', ')}`);
      return;
    }

    const newPackage = {
      accomodation: { id: '', name: '', price: '' },
      transportation: { id: '', name: '', price: '' },
      food: { id: '', name: '', price: '' },
      extras: [],
      price: '',
      finalPrice: '',
      discount: 0,
    };

    cartItems.forEach((item) => {
      if (item.categoryKey === 'HOSPEDAGEM') {
        newPackage.accomodation = { id: item.id, name: item.name, price: item.price };
      } else if (item.categoryKey === 'TRANSPORTE') {
        newPackage.transportation = { id: item.id, name: item.name, price: item.price };
      } else if (item.categoryKey) {
        const unit = discounted.find((p) => p.id === item.id)?.price ?? item.price ?? 0;
        newPackage.extras.push({
          id: item.id,
          name: item.name,
          category: CATEGORY_LABELS[item.categoryKey] || item.category || '',
          categoryKey: item.categoryKey,
          price: unit,
          quantity: Number(item.quantity) || 1,
        });
      }
    });

    newPackage.price = cartItems.reduce((sum, it) => sum + priceForItem(it), 0);
    const extrasTotalSubmit = newPackage.extras.reduce((sum, e) => sum + Number(e.price) * Number(e.quantity || 1), 0);
    const discountNumeric = Number(discount) || 0;
    const discountableBase = Math.max(newPackage.price - extrasTotalSubmit, 0);
    const appliedDiscount = Math.min(discountableBase, discountNumeric);
    newPackage.finalPrice = Math.max(newPackage.price - appliedDiscount, 0);
    newPackage.discount = discountNumeric;

    updateForm(newPackage, () => {
      nextStep(true);
    });
  };

  const validRegistrations = Number(totalRegistrationsGlobal?.totalValidRegistrations || 0);
  const isChild = age < 9;
  const isRegistrationClosed = validRegistrations >= Number(totalSeats || 0) && !isChild;

  const totalBeforeDiscount = cartItems.reduce((sum, it) => sum + priceForItem(it), 0);
  const storeTotal = storeCartItems.reduce((sum, it) => sum + priceForItem(it), 0);
  const discountNumeric = Number(discount) || 0;
  const discountableTotal = Math.max(totalBeforeDiscount - storeTotal, 0);
  const finalTotal = Math.max(totalBeforeDiscount - Math.min(discountableTotal, discountNumeric), 0);
  const hospedagemItem = cartItems.find((i) => i.categoryKey === 'HOSPEDAGEM');
  const hospedagemDiscounted = hospedagemItem ? discounted.find((p) => p.id === hospedagemItem.id) : null;
  const preSaleFoodCredit = isPreSale ? Number(hospedagemDiscounted?.foodComponent || 0) : 0;
  const finalTotalWithPreSale = Math.max(finalTotal - preSaleFoodCredit, 0);

  const summaryFor = (key) => cartItems.find((i) => i.categoryKey === key);

  if (isRegistrationClosed) {
    return (
      <Container className="packages-page form__container__cart-height">
        <Row>
          <Col xs={12} className="px-0">
            <Card className="registration-closed-card mb-0">
              <Card.Body className="registration-closed form-step">
                <div className="registration-closed__icon">
                  <Icons typeIcon="camp" iconSize={44} fill="#007185" />
                </div>
                <h3 className="registration-closed__title">Vagas Esgotadas</h3>
                <p className="registration-closed__text">
                  Desculpe, as vagas para inscrições estão completas.
                  <br />
                  Para maiores dúvidas, favor contactar a secretaria da igreja.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <div className="form__container__buttons mt-0">
            <Button variant="light" onClick={backStep} size="lg">
              Voltar
            </Button>
          </div>
        </Row>
        <Loading loading={loading} />
      </Container>
    );
  }

  return (
    <Container className="packages-page form__container__cart-height">
      <Row>
        <Col xs={12} xl={8} className="px-0 mb-3 mb-xl-0">
          <>
            <Card className="mb-3">
              <Card.Body>
                <h2 className="packages-page__lot-title">{activeLot?.name}</h2>
                <Card.Title>Hospedagem</Card.Title>
                <Card.Text>
                  Vamos começar a montagem do seu pacote. A escolha da hospedagem é <strong>obrigatória</strong>. A
                  hospedagem já contempla alimentação completa!
                  <em className="discount-description text-success small">
                    {getCategoryDiscountDescription('HOSPEDAGEM')}
                  </em>
                </Card.Text>
                <ProductList
                  age={age}
                  cartKey={cartKey}
                  categoryKey="HOSPEDAGEM"
                  products={productsState}
                  packageCount={packageCount}
                />
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Transporte</Card.Title>
                <Card.Text>
                  Temos opções para todos estilos. Vá com o grupo da igreja ou tenha liberdade total com transporte
                  próprio. A escolha do transporte é <strong>obrigatória</strong>.
                  <em className="discount-description text-success small">
                    {getCategoryDiscountDescription('TRANSPORTE')}
                  </em>
                </Card.Text>
                <ProductList
                  age={age}
                  cartKey={cartKey}
                  categoryKey="TRANSPORTE"
                  products={productsState}
                  packageCount={packageCount}
                />
              </Card.Body>
            </Card>

            {hasStoreItems && (
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Loja</Card.Title>
                  <Card.Text>
                    Itens extras da loja IPBV (opcional). Escolha a quantidade de cada item, conforme a disponibilidade.{' '}
                    <b>
                      <em>Os itens serão entregues no ato do check-in durante o acampamento.</em>
                    </b>
                  </Card.Text>
                  <StoreItemList products={productsState} discounted={discounted} />
                </Card.Body>
              </Card>
            )}
          </>
        </Col>

        <Col xs={12} xl={4} className="px-0 ps-xl-3">
          <Card>
            <Card.Body>
              <Card.Title>Resumo do Pacote</Card.Title>
              <div className="summary">
                {['HOSPEDAGEM', 'TRANSPORTE'].map((key) => {
                  const item = summaryFor(key);
                  const label = key === 'HOSPEDAGEM' ? 'Hospedagem' : 'Transporte';
                  return (
                    <div className="summary__accomodation" key={key}>
                      <div className="summary__accomodation__label">{label}:</div>
                      <div className={`summary__accomodation__content ${item ? 'with-border' : 'no-border'}`}>
                        {item ? (
                          <>
                            <div>{item.name}</div>
                            <div className="summary__accomodation__value">R$ {formatBRL(priceForItem(item))}</div>
                          </>
                        ) : (
                          <small className="text-secondary">Não selecionado</small>
                        )}
                      </div>
                      <div className="packages-horizontal-line-cart"></div>
                    </div>
                  );
                })}

                {storeCartItems.length > 0 && (
                  <div className="summary__accomodation">
                    <div className="summary__accomodation__label">Loja:</div>
                    <div className="summary__accomodation__content with-border">
                      {storeCartItems.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between">
                          <div>
                            {item.name}
                            {Number(item.quantity) > 1 ? ` (x${item.quantity})` : ''}
                          </div>
                          <div className="summary__accomodation__value">R$ {formatBRL(priceForItem(item))}</div>
                        </div>
                      ))}
                    </div>
                    <div className="packages-horizontal-line-cart"></div>
                  </div>
                )}

                {hasDiscount && discountNumeric > 0 && (
                  <div className="summary__discount">
                    <div className="d-flex justify-content-between text-success">
                      <div className="d-flex align-items-center gap-1">
                        <div>Desconto:</div>
                        <Tips
                          classNameWrapper="mt-0 mb-1"
                          placement="top"
                          typeIcon="info"
                          size={15}
                          color={'#1a8a45'}
                          text="Valor de desconto aplicado diretamente ao CPF do acampante, mesmo que haja mais de um usuário no carrinho."
                        />
                      </div>
                      <div>-R$ {formatBRL(discountNumeric)}</div>
                    </div>
                    <div className="packages-horizontal-line-cart"></div>
                  </div>
                )}

                {preSaleFoodCredit > 0 && (
                  <div className="summary__discount">
                    <div className="d-flex justify-content-between text-success">
                      <div>Pago na pré-venda:</div>
                      <div>-R$ {formatBRL(preSaleFoodCredit)}</div>
                    </div>
                    <div className="packages-horizontal-line-cart"></div>
                  </div>
                )}

                <div className="summary__discount">
                  <strong className="d-flex justify-content-between">
                    <div>Total:</div>
                    <div>R$ {formatBRL(finalTotalWithPreSale)}</div>
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <div className="form__container__buttons mt-0">
          <Button variant="light" onClick={backStep} size="lg">
            Voltar
          </Button>
          <Button variant="warning" onClick={submitForm} size="lg">
            Avançar
          </Button>
        </div>
      </Row>
      <Loading loading={loading} />
    </Container>
  );
};

export default Packages;
