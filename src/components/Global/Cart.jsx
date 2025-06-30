import { Button } from 'react-bootstrap';
import { useCart } from 'react-use-cart';
import { differenceInYears } from 'date-fns';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import Tips from './Tips';

const Cart = ({ formValues = [], setFormValues, goToEditStep, cartKey, discountValue }) => {
  const { removeItem, emptyCart } = useCart();

  const handleRemoveUser = (index, itemId) => {
    setFormValues((prev) => prev.filter((_, i) => i !== index));
    if (itemId) removeItem(itemId);
  };

  const totalPackages = formValues.reduce((acc, user) => {
    const price = Number(user?.package?.finalPrice || 0);
    return acc + price;
  }, 0);

  const totalBasePrice = formValues.reduce((acc, user) => {
    const birthDate = new Date(user?.personalInformation?.birthday);
    const age = differenceInYears(new Date(), birthDate);

    let individualBase = 0;
    if (age <= 5) {
      individualBase = 0;
    } else if (age >= 6 && age <= 10) {
      individualBase = 50;
    } else if (age > 10) {
      individualBase = 100;
    }

    return acc + individualBase;
  }, 0);

  const finalTotal = totalPackages + totalBasePrice;

  const validUsers = formValues.filter(
    (user) =>
      user && user.personalInformation && user.personalInformation.name && user.personalInformation.name.trim() !== '',
  );

  if (!validUsers.length) {
    return <p className="empty-cart">Nenhum usuário adicionado ao carrinho</p>;
  }

  const clearCart = () => {
    emptyCart();
    setFormValues([]);
    sessionStorage.removeItem('savedUsers');
    sessionStorage.removeItem(cartKey);
  };

  return (
    <div className="cart-container">
      {validUsers.map((user, index) => {
        const userName = user?.personalInformation?.name || `Pessoa ${index + 1}`;
        const userPackage = user?.package;
        const userExtraMeals = user?.extraMeals;
        const itemId = userPackage?.id || userPackage?.accomodation?.id;

        const birthDate = new Date(user?.personalInformation?.birthday);
        const age = differenceInYears(new Date(), birthDate);

        let individualBase = 0;
        if (age <= 5) {
          individualBase = 0;
        } else if (age >= 6 && age <= 10) {
          individualBase = 50;
        } else if (age > 10) {
          individualBase = 100;
        }

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

                  <Button variant="danger" size="md" onClick={() => handleRemoveUser(index, itemId)}>
                    <Icons typeIcon="delete" iconSize={30} fill="#fff" />
                    <span className="remove-user-btn">&nbsp;Remover Usuário</span>
                  </Button>
                </div>
              </div>
            )}

            {userPackage && (
              <div className="cart-item">
                <div className="item-info">
                  <h5>Acomodação: {userPackage?.accomodation.name}</h5>
                  <p>Preço: R$ {Number(userPackage?.accomodation.price || 0).toFixed(2)}</p>

                  <h5>Transporte: {userPackage?.transportation.name}</h5>
                  <p>Preço: R$ {Number(userPackage?.transportation.price || 0).toFixed(2)}</p>

                  <h5>Alimentação: {userPackage?.food.name.split(' (')[0]}</h5>
                  <p>Preço: R$ {Number(userPackage?.food.price || 0).toFixed(2)}</p>
                </div>
              </div>
            )}

            {userExtraMeals && userExtraMeals.extraMeals && (
              <div className="cart-item">
                <div className="item-info">
                  <h5>
                    Refeições Extras:{' '}
                    {Array.isArray(userExtraMeals.extraMeals)
                      ? userExtraMeals.extraMeals.filter((meal) => meal && meal.trim() !== '').join(', ')
                      : userExtraMeals.extraMeals}
                  </h5>
                  <p>Preço: R$ {Number(userExtraMeals?.totalPrice || 0).toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="cart-item">
              <div className="item-info">
                {userPackage && <p>Total do Usuário: R$ {Number(userPackage?.finalPrice || 0).toFixed(2)}</p>}
                <p>Valor Base Individual: R$ {individualBase.toFixed(2)}</p>
              </div>
            </div>

            <hr className="horizontal-line" />
          </div>
        );
      })}

      <div className="cart-total">
        <div className="d-flex justify-content-end align-items-center gap-2">
          <Tips
            placement="top"
            typeIcon="info"
            size={20}
            colour={'#000'}
            text="Valor base conforme a idade: até 5 anos = R$ 0, até 10 = R$ 50, acima de 10 = R$ 100"
          />

          <p className="m-0">Valor Base Usuário: R$ {totalBasePrice.toFixed(2)}</p>
        </div>

        <p>Total dos Pacotes: R$ {totalPackages.toFixed(2)}</p>
        <strong>Total Geral: R$ {finalTotal.toFixed(2)}</strong>
      </div>
      <div className="mt-4">
        <Button variant="danger" size="lg" onClick={clearCart} className="cart-btn-responsive">
          <Icons typeIcon="close" iconSize={30} fill="#fff" /> &nbsp;Esvaziar Carrinho
        </Button>
      </div>
    </div>
  );
};

Cart.propTypes = {
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
  setFormValues: PropTypes.func.isRequired,
  goToEditStep: PropTypes.func.isRequired,
  cartKey: PropTypes.string.isRequired,
  discountValue: PropTypes.string,
};

export default Cart;
