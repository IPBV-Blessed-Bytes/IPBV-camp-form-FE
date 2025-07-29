import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useCart } from 'react-use-cart';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import Tips from './Tips';

const getIndividualBase = (age) => {
  if (age <= 5) return 0;
  if (age <= 10) return 50;
  return 100;
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

  const validUsers = formValues.filter(
    (user) =>
      user && user.personalInformation && user.personalInformation.name && user.personalInformation.name.trim() !== '',
  );

  const finalTotalRaw = validUsers.reduce((acc, user) => {
    const userPackage = user?.package || {};
    const userExtraMeals = user?.extraMeals || {};

    const accomodationPrice = Number(userPackage?.accomodation?.price || 0);
    const transportationPrice = Number(userPackage?.transportation?.price || 0);
    const foodPrice = Number(userPackage?.food?.price || 0);
    const extraMealsPrice = Number(userExtraMeals?.totalPrice || 0);
    const discount = Number(userPackage?.discount || 0);

    const individualBase = getIndividualBase(calculateAge(new Date(user?.personalInformation?.birthday)));

    const totalUser = Math.max(
      accomodationPrice + transportationPrice + foodPrice + extraMealsPrice + individualBase - discount,
      0,
    );

    return acc + totalUser;
  }, 0);

  const finalTotal = Math.max(finalTotalRaw, 0);

  useEffect(() => {
    if (setCartTotal) {
      setCartTotal(finalTotal);
    }
  }, [finalTotal, setCartTotal]);

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

  useEffect(() => {
    const baseTotal = formValues.reduce((acc, user) => {
      const birthDate = new Date(user?.personalInformation?.birthday);
      const age = calculateAge(birthDate);
      const individualBase = getIndividualBase(age);

      const accomodation = Number(user?.package?.accomodation?.price || 0);
      const transportation = Number(user?.package?.transportation?.price || 0);
      const food = Number(user?.package?.food?.price || 0);
      const extraMeals = Number(user?.extraMeals?.totalPrice || 0);
      const discount = Number(user?.package?.discount || 0);

      const totalBeforeDiscount = accomodation + transportation + food + extraMeals + individualBase;

      if (discount >= totalBeforeDiscount) {
        return acc;
      }

      return acc + individualBase;
    }, 0);

    handleBasePriceChange?.(baseTotal);
  }, [formValues, handleBasePriceChange]);

  if (!validUsers.length) {
    return <p className="empty-cart">Nenhum usuário adicionado ao carrinho</p>;
  }

  return (
    <div className="cart-container">
      {validUsers.map((user, index) => {
        const userName = user?.personalInformation?.name || `Pessoa ${index + 1}`;
        const userPackage = user?.package;
        const userExtraMeals = user?.extraMeals;
        const itemId = userPackage?.id || userPackage?.accomodation?.id;

        const birthDate = new Date(user?.personalInformation?.birthday);
        const age = calculateAge(birthDate);
        const individualBase = getIndividualBase(age);

        const discount = Number(userPackage?.discount || 0);
        const packageRaw =
          Number(userPackage?.accomodation?.price || 0) +
          Number(userPackage?.transportation?.price || 0) +
          Number(userPackage?.food?.price || 0);

        const totalPackage = packageRaw + Number(userExtraMeals?.totalPrice || 0);

        const userTotalValueRaw = totalPackage + individualBase - discount;
        const userTotalValue = Math.max(userTotalValueRaw, 0);

        return (
          <div key={index} className="cart-user-group">
            {userName && (
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
            )}

            {userPackage && (
              <div className="cart-item">
                <div className="item-info">
                  <h5>Hospedagem: {userPackage?.accomodation.name}</h5>
                  <p>Preço: R$ {Number(userPackage?.accomodation.price || 0)}</p>

                  <h5>Transporte: {userPackage?.transportation.name}</h5>
                  <p>Preço: R$ {Number(userPackage?.transportation.price || 0)}</p>

                  <h5>Alimentação: {userPackage?.food.name.split(' (')[0]}</h5>
                  <p>Preço: R$ {Number(userPackage?.food.price || 0)}</p>
                </div>
              </div>
            )}

            {Array.isArray(userExtraMeals?.extraMeals) &&
              userExtraMeals.extraMeals.some((item) => item && item.trim() !== '') && (
                <div className="cart-item">
                  <div className="item-info">
                    <h5>Refeições Extras:</h5>
                    <p>Preço: R$ {Number(userExtraMeals?.totalPrice || 0)}</p>
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
                {userPackage && (
                  <>
                    <p>Total do Pacote: R$ {totalPackage}</p>
                    <p>
                      <em>= R$ {individualBase + totalPackage}</em>
                    </p>
                    {discount > 0 && <p className="text-success">Desconto aplicado: -R$ {discount}</p>}
                    <br />
                    <p>Total do Usuário: R$ {Number(userTotalValue)}</p>
                  </>
                )}
              </div>
            </div>

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
  formValues: PropTypes.arrayOf(
    PropTypes.shape({
      personalInformation: PropTypes.shape({
        name: PropTypes.string,
      }),
      package: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        finalPrice: PropTypes.number,
        accomodation: PropTypes.shape({
          id: PropTypes.string,
        }),
      }),
      extraMeals: PropTypes.shape({
        extraMeals: PropTypes.string,
        totalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    }),
  ),
  goToEditStep: PropTypes.func.isRequired,
  handleBasePriceChange: PropTypes.func,
  setFormValues: PropTypes.func.isRequired,
};

export default Cart;
