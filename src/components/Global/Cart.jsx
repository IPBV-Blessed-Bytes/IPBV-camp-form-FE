import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useCart } from 'react-use-cart';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import Tips from './Tips';

const getIndividualBase = (age) => {
  if (age <= 5) return 0;
  if (age <= 10) return 50;
  return 100;
};

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
        <h5>Hospedagem: {user.package?.accomodation.name}</h5>
        <p>Preço: R$ {accomodation}</p>
        <h5>Transporte: {user.package?.transportation.name}</h5>
        <p>Preço: R$ {transportation}</p>
        {user.package?.food?.name && (
          <>
            <h5>Alimentação: {user.package.food.name.split(' (')[0]}</h5>
            <p>Preço: R$ {food}</p>
          </>
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

  const discount = Number(user.package?.discount || 0);
  const sumBeforeDiscount = Math.max(Number(packageTotal) + Number(individualBase), 0);
  const sumAfterDiscount = Math.max(sumBeforeDiscount - discount, 0);

  return (
    <div className="cart-item">
      <div className="item-info">
        <p>Total do Pacote: R$ {packageTotal}</p>
        <p>
          <em>= R$ {sumBeforeDiscount}</em>
        </p>
        {discount > 0 && <p className="text-success">Desconto aplicado: -R$ {discount}</p>}
        <p>Total do Usuário: R$ {sumAfterDiscount}</p>
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
    const individualBase = getIndividualBase(age);

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
      const individualBase = getIndividualBase(age);
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
        const individualBase = getIndividualBase(age);
        const itemId = user.package?.id || user.package?.accomodation?.id;

        return (
          <div key={index} className="cart-user-group">
            <div className="d-flex justify-content-between">
              <h4 className="cart-user-title">
                <b>{userName}:</b>
              </h4>
              <div className="d-flex gap-2">
                <Button variant="secondary" size="md" onClick={() => goToEditStep(index)} className="ms-2">
                  <Icons typeIcon="edit" iconSize={30} />
                  <span className="edit-user-btn">&nbsp;Editar Usuário</span>
                </Button>

                <Button variant="danger" size="md" onClick={() => openConfirmationModal('removeUser', index, itemId)}>
                  <Icons typeIcon="delete" iconSize={30} fill="#fff" />
                  <span className="remove-user-btn">&nbsp;Remover Usuário</span>
                </Button>
              </div>
            </div>

            {renderPackageDetails(user, age)}

            {!user.package?.food?.id &&
              Array.isArray(user.extraMeals?.extraMeals) &&
              user.extraMeals.extraMeals.some((item) => item?.trim()) && (
                <div className="cart-item">
                  <div className="item-info">
                    <h5>Refeições Extras:</h5>
                    <p>Preço: R$ {Number(user.extraMeals?.totalPrice || 0)}</p>
                  </div>
                </div>
              )}

            <div className="cart-item">
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
            </div>

            {renderUserTotalInfo(user, age, individualBase)}

            <hr className="horizontal-line" />
          </div>
        );
      })}

      <div className="cart-total">
        <strong>Total Geral: R$ {finalTotal}</strong>
      </div>
      <div className="mt-4">
        <Button
          variant="danger"
          size="lg"
          onClick={() => openConfirmationModal('clearCart')}
          className="cart-btn-responsive"
        >
          <Icons typeIcon="close" iconSize={30} fill="#fff" /> &nbsp;Esvaziar Carrinho
        </Button>
      </div>

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
