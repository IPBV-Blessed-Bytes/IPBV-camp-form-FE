import { useState, useEffect } from 'react';
import { Button, Modal, Card } from 'react-bootstrap';
import { useCart } from 'react-use-cart';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';

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

const renderUserTotalInfo = (user, age) => {
  const { accomodation, transportation, food } = getDiscountedPrices(user, age);
  const extraMeals = Number(user.extraMeals?.totalPrice || 0);

  const packageTotal =
    Number(accomodation) + Number(transportation) + Number(food) + (user.package?.food?.id ? 0 : Number(extraMeals));

  const sumBeforeDiscount = Math.max(Number(packageTotal), 0);

  return (
    <div className="cart-item">
      <div className="item-info">
        <h5 className="fw-bold d-flex justify-content-between">
          Total Acampante: <span>R$ {sumBeforeDiscount},00</span>
        </h5>
      </div>
    </div>
  );
};

const getIndividualBaseFromLot = (age, rawFee) => {
  if (age <= 8) return 0;
  if (age <= 14) return rawFee / 2;
  return rawFee;
};

const Cart = ({
  cartKey,
  formValues = [],
  goToEditStep,
  handleBasePriceChange,
  setCartTotal,
  setFormValues,
  rawFee,
}) => {
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
    const individualBase = getIndividualBaseFromLot(age, rawFee);

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
    if (!formValues.length || rawFee === undefined) return;

    const firstPayingUser = formValues.find((user) => {
      const age = calculateAge(new Date(user?.personalInformation?.birthday));
      const individualBase = getIndividualBaseFromLot(age, rawFee);
      return individualBase > 0;
    });

    const baseTotal = firstPayingUser
      ? getIndividualBaseFromLot(calculateAge(new Date(firstPayingUser.personalInformation?.birthday)), rawFee)
      : 0;

    handleBasePriceChange(baseTotal);
  }, [formValues, rawFee, handleBasePriceChange]);

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
        const individualBase = getIndividualBaseFromLot(age, rawFee);
        const itemId = user.package?.id || user.package?.accomodation?.id;

        return (
          <Card key={index} className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="cart-user-title mb-0">
                  <b>{userName}</b>
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

              {renderUserTotalInfo(user, age, individualBase)}
            </Card.Body>
          </Card>
        );
      })}

      <Modal className="custom-modal" show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="custom-modal__header--cancel">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon="info" iconSize={25} fill={'#dc3545'} />
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
          <Button variant="danger" className="btn-cancel" onClick={handleConfirmAction}>
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
  rawFee: PropTypes.number.isRequired,
};

export default Cart;
