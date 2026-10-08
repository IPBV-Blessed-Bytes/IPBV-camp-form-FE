import { useState, useEffect } from 'react';
import { formatBRL } from '@/utils/formatBRL';
import { Button, Card } from 'react-bootstrap';
import { useCart } from 'react-use-cart';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';
import { getPreSaleFoodCredit } from '@/utils/preSale';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import CustomModal from '@/components/Global/CustomModal';
import '../Style/Cart.scss';

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

const getExtrasList = (user, age) => {
  const discounted = getDiscountedProducts(age);
  return (user.package?.extras || []).map((e) => {
    const unit = discounted.find((p) => p.id === e.id)?.price ?? Number(e.price) ?? 0;
    const quantity = Number(e.quantity) || 1;
    return { id: e.id, name: e.name, quantity, total: Number(unit) * quantity };
  });
};

const getExtrasTotal = (user, age) => getExtrasList(user, age).reduce((sum, e) => sum + e.total, 0);

const renderPackageDetails = (user, age) => {
  const { accomodation, transportation, food } = getDiscountedPrices(user, age);
  const extras = getExtrasList(user, age);

  return (
    <div className="cart-item">
      <div className="item-info">
        <div className="item-accomodation mb-3">
          <h5 className="mb-2">Hospedagem:</h5>
          <div className="d-flex justify-content-between">
            <p className="mb-1">{user.package?.accomodation.name}</p>
            <p className="mb-1 cart-item__value">R$ {formatBRL(accomodation)}</p>
          </div>
        </div>

        <div className="item-transportation mb-3">
          <h5 className="mb-2">Transporte:</h5>
          <div className="d-flex justify-content-between">
            <p className="mb-1">{user.package?.transportation.name}</p>
            <p className="mb-1 cart-item__value">R$ {formatBRL(transportation)}</p>
          </div>
        </div>

        {user.package?.food?.name && (
          <div className="item-food mb-3">
            <h5 className="mb-2">Alimentação:</h5>
            <div className="d-flex justify-content-between">
              <p className="mb-1">{user.package.food.name.split(' (')[0]}</p>
              <p className="mb-1 cart-item__value">R$ {formatBRL(food)}</p>
            </div>
          </div>
        )}

        {extras.length > 0 && (
          <div className="item-store mb-3">
            <h5 className="mb-2">Loja:</h5>
            {extras.map((extra) => (
              <div className="d-flex justify-content-between" key={extra.id}>
                <p className="mb-1">
                  {extra.name}
                  {extra.quantity > 1 ? ` (x${extra.quantity})` : ''}
                </p>
                <p className="mb-1 cart-item__value">R$ {formatBRL(extra.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const renderUserTotalInfo = (user, age) => {
  const { accomodation, transportation, food } = getDiscountedPrices(user, age);
  const extraMeals = Number(user.extraMeals?.totalPrice || 0);
  const extras = getExtrasTotal(user, age);

  const packageTotal =
    Number(accomodation) +
    Number(transportation) +
    Number(food) +
    Number(extras) +
    (user.package?.food?.id ? 0 : Number(extraMeals));

  const sumBeforeDiscount = Math.max(Number(packageTotal), 0);

  return (
    <div className="cart-item">
      <div className="item-info">
        <h5 className="cart-user-total fw-bold d-flex justify-content-between">
          Total Acampante: <span>R$ {formatBRL(sumBeforeDiscount)}</span>
        </h5>
      </div>
    </div>
  );
};

const Cart = ({
  cartKey,
  formValues = [],
  goToEditStep,
  setCartTotal,
  setFormValues,
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
    const extras = getExtrasTotal(user, age);
    const discount = Number(user.package?.discount || 0);

    const nonStore =
      Number(accomodation) + Number(transportation) + Number(food) + (user.package?.food?.id ? 0 : Number(extraMeals));
    const appliedDiscount = Math.min(Math.max(nonStore, 0), Number(discount));
    const preSaleFoodCredit = getPreSaleFoodCredit(user, getDiscountedProducts(age));
    const total = Math.max(nonStore + Number(extras) - appliedDiscount - preSaleFoodCredit, 0);
    return acc + total;
  }, 0);

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

  if (!validUsers.length) {
    return (
      <div className="empty-cart">
        <Icons typeIcon="cart" iconSize={48} fill="#ced4da" />
        <p>Nenhum usuário adicionado ao carrinho</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {validUsers.map((user, index) => {
        const userName = user.personalInformation.name || `Pessoa ${index + 1}`;
        const age = calculateAge(new Date(user.personalInformation.birthday));
        const itemId = user.package?.id || user.package?.accomodation?.id;

        return (
          <Card key={index} className="cart-user-card mb-4">
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
                          <h5>R$ {formatBRL(Number(user.extraMeals?.totalPrice || 0))}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <div className="packages-horizontal-line-cart"></div>

              {renderUserTotalInfo(user, age)}
            </Card.Body>
          </Card>
        );
      })}

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        variant="cancel"
        title={`Confirmação de ${modalType === 'removeUser' ? 'Exclusão' : 'Limpeza'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="btn-cancel" onClick={handleConfirmAction}>
              Confirmar
            </Button>
          </>
        }
      >
        {modalType === 'removeUser' && <p>Tem certeza que deseja remover este usuário?</p>}
        {modalType === 'clearCart' && <p>Tem certeza que deseja esvaziar o carrinho?</p>}
      </CustomModal>
    </div>
  );
};

Cart.propTypes = {
  cartKey: PropTypes.string.isRequired,
  formValues: PropTypes.array.isRequired,
  goToEditStep: PropTypes.func.isRequired,
  setCartTotal: PropTypes.func.isRequired,
  setFormValues: PropTypes.func.isRequired,
};

export default Cart;
