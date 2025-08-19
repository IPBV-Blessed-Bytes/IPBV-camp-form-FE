import { useState, useEffect } from 'react';
import { Button, Modal, Card } from 'react-bootstrap';
import { useCart } from 'react-use-cart';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';
import getIndividualBaseValue from '@/Pages/Packages/utils/getIndividualBaseValue';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import Tips from './Tips';

const getDiscountedPrices = (user, age) => {
  const discounted = getDiscountedProducts(age);
  const getPrice = (id, fallback = 0) => discounted.find((p) => p.id === id)?.price ?? fallback;

  const accomodationId = user.package?.accomodation?.id;
  const transportationId = user.package?.transportation?.id;
  const foodId = user.package?.food?.id;

  return {
    accomodation: getPrice(accomodationId, user.package?.accomodation?.price),
    transportation: getPrice(transportationId, user.package?.transportation?.price),
    food: getPrice(foodId, user.package?.food?.price),
  };
};

const renderPackageDetails = (user, age) => {
  const { accomodation, transportation, food } = getDiscountedPrices(user, age);

  return (
    <div className="cart-item">
      <div className="item-info">
        <div className="item-accomodation mb-3">
          <div className="d-flex justify-content-between">
            <h5>Hospedagem:</h5>
            <br />
            <h5>R$ {accomodation},00</h5>
          </div>
          <p>{user.package?.accomodation.name}</p>
        </div>

        <div className="item-transportation mb-3">
          <div className="d-flex justify-content-between">
            <h5>Transporte:</h5>
            <br />
            <h5>R$ {transportation},00</h5>
          </div>
          <p>{user.package?.transportation.name}</p>
        </div>

        {user.package?.food?.name && (
          <div className="item-food mb-3">
            <div className="d-flex justify-content-between">
              <h5>Alimentação:</h5>
              <br />
              <h5>R$ {food},00</h5>
            </div>
            <p>{user.package.food.name.split(' (')[0]}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const renderUserTotalInfo = (user, age, individualBase) => {
  const { accomodation, transportation, food } = getDiscountedPrices(user, age);
  const extraMeals = Number(user.extraMeals?.totalPrice || 0);

  const packageTotal =
    Number(accomodation) + Number(transportation) + Number(food) + (user.package?.food?.id ? 0 : Number(extraMeals));

  // const discount = Number(user.package?.discount || 0);
  const sumBeforeDiscount = Math.max(Number(packageTotal), 0);
  // const sumAfterDiscount = Math.max(sumBeforeDiscount - discount, 0);

  return (
    <div className="cart-item">
      <div className="item-info">
        {/* <p>Total do Pacote: R$ {packageTotal}</p>
        <p>
          <em>= R$ {sumBeforeDiscount}</em>
        </p>
        {discount > 0 && <p className="text-success">Desconto aplicado: -R$ {discount}</p>} */}

        <h5 className="fw-bold d-flex justify-content-between">
          Total Acampante: <span>R$ {sumBeforeDiscount},00</span>
        </h5>
      </div>
    </div>
  );
};

const Cart = ({ cartKey, formValues = [], goToEditStep, handleBasePriceChange, setCartTotal, setFormValues }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [targetIndex, setTargetIndex] = useState(null);
  const [targetItemId, setTargetItemId] = useState(null);

  const { removeItem, emptyCart } = useCart();

  const handleRemoveUser = (index, itemId) => {
    setFormValues((prev) => prev.filter((_, i) => i !== index));
    if (itemId) removeItem(itemId);
  };

  const validUsers = formValues.filter((user) => user?.personalInformation?.name?.trim());

  const finalTotal = validUsers.reduce((acc, user) => {
    const age = calculateAge(new Date(user.personalInformation.birthday));
    const { accomodation, transportation, food } = getDiscountedPrices(user, age);
    const extraMeals = Number(user.extraMeals?.totalPrice || 0);
    const discount = Number(user.package?.discount || 0);
    const individualBase = getIndividualBaseValue(age);

    const total = Math.max(
      Number(accomodation) +
        Number(transportation) +
        Number(food) +
        (user.package?.food?.id ? 0 : Number(extraMeals)) +
        Number(individualBase) -
        Number(discount),
      0,
    );
    return acc + total;
  }, 0);

  useEffect(() => {
    if (setCartTotal) {
      setCartTotal(finalTotal);
    }
  }, [finalTotal, setCartTotal]);

  useEffect(() => {
    const baseTotal = formValues.reduce((acc, user) => {
      const age = calculateAge(new Date(user?.personalInformation?.birthday));
      const individualBase = getIndividualBaseValue(age);
      const accomodation = Number(user?.package?.accomodation?.price || 0);
      const transportation = Number(user?.package?.transportation?.price || 0);
      const food = Number(user?.package?.food?.price || 0);
      const extraMeals = Number(user?.extraMeals?.totalPrice || 0);
      const discount = Number(user?.package?.discount || 0);

      const totalBeforeDiscount = accomodation + transportation + food + extraMeals + individualBase;
      if (discount >= totalBeforeDiscount) return acc;
      return acc + individualBase;
    }, 0);

    handleBasePriceChange?.(baseTotal);
  }, [formValues, handleBasePriceChange]);

  const clearCart = () => {
    emptyCart();
    setFormValues([]);
    sessionStorage.removeItem('savedUsers');
    sessionStorage.removeItem(cartKey);
  };

  const openConfirmationModal = (type, index = null, itemId = null) => {
    setModalType(type);
    setTargetIndex(index);
    setTargetItemId(itemId);
    setShowModal(true);
  };

  const handleConfirmAction = () => {
    if (modalType === 'removeUser') {
      handleRemoveUser(targetIndex, targetItemId);
    } else if (modalType === 'clearCart') {
      clearCart();
    }
    setShowModal(false);
  };

  if (!validUsers.length) {
    return <p className="empty-cart">Nenhum usuário adicionado ao carrinho</p>;
  }

  return (
    <div className="cart-container">
      {validUsers.map((user, index) => {
        const userName = user.personalInformation.name || `Pessoa ${index + 1}`;
        const age = calculateAge(new Date(user.personalInformation.birthday));
        const individualBase = getIndividualBaseValue(age);
        const itemId = user.package?.id || user.package?.accomodation?.id;

        return (
          <Card key={index} className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="cart-user-title mb-0">
                  <b>{userName}:</b>
                </h4>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="md" onClick={() => goToEditStep(index)}>
                    <Icons typeIcon="edit" iconSize={30} />
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="md"
                    onClick={() => openConfirmationModal('removeUser', index, itemId)}
                  >
                    <Icons typeIcon="delete" iconSize={30} fill="#dc3545" />
                  </Button>
                </div>
              </div>
              <div className="packages-horizontal-line-cart"></div>

              {renderPackageDetails(user, age)}

              {!user.package?.food?.id &&
                Array.isArray(user.extraMeals?.extraMeals) &&
                user.extraMeals.extraMeals.some((item) => item?.trim()) && (
                  <div className="cart-item">
                    <div className="item-info">
                      <div className="item-extra-meals mb-3">
                        <div className="d-flex justify-content-between">
                          <h5>Refeições Extras:</h5>
                          <h5>R$ {Number(user.extraMeals?.totalPrice || 0)},00</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <div className="packages-horizontal-line-cart"></div>

              {/* <div className="cart-item">
                <div className="item-info">
                  <div className="d-flex align-items-center gap-2">
                    <p>Valor Base Individual: R$ {individualBase}</p>
                    <Tips
                      placement="top"
                      typeIcon="info"
                      size={15}
                      colour={'#000'}
                      text="Valor base conforme a idade: até 5 anos = R$ 0, até 10 = R$ 50, acima de 10 = R$ 100"
                    />
                  </div>
                </div>
              </div> */}

              {renderUserTotalInfo(user, age, individualBase)}
            </Card.Body>
          </Card>
        );
      })}

      <div className="cart-total">
        <strong>Total Geral: R$ {finalTotal}</strong>
      </div>
      {/* <div className="mt-4">
        <Button
          variant="danger"
          size="lg"
          onClick={() => openConfirmationModal('clearCart')}
          className="cart-btn-responsive"
        >
          <Icons typeIcon="close" iconSize={30} fill="#fff" /> &nbsp;Esvaziar Carrinho
        </Button>
      </div> */}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Confirmação de {modalType === 'removeUser' ? 'Exclusão' : 'Limpeza'}</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'removeUser' && <p>Tem certeza que deseja remover este usuário?</p>}
          {modalType === 'clearCart' && <p>Tem certeza que deseja esvaziar o carrinho?</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmAction}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

Cart.propTypes = {
  cartKey: PropTypes.string.isRequired,
  formValues: PropTypes.array.isRequired,
  goToEditStep: PropTypes.func.isRequired,
  handleBasePriceChange: PropTypes.func,
  setCartTotal: PropTypes.func.isRequired,
  setFormValues: PropTypes.func.isRequired,
};

export default Cart;
