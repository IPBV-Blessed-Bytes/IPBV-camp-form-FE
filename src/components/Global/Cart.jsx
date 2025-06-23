import { Button } from 'react-bootstrap';
import { useCart } from 'react-use-cart';
import { differenceInYears } from 'date-fns';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import Tips from './Tips';

const Cart = ({ savedUsers = [], setSavedUsers }) => {
  const { removeItem, emptyCart } = useCart();

  const handleRemoveUser = (index, itemId) => {
    setSavedUsers((prev) => prev.filter((_, i) => i !== index));
    if (itemId) removeItem(itemId);
  };

  const totalPackages = savedUsers.reduce((acc, user) => {
    const price = Number(user?.package?.finalPrice || 0);
    return acc + price;
  }, 0);

  const totalBasePrice = savedUsers.reduce((acc, user) => {
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

  if (!savedUsers.length) {
    return <p className="empty-cart">Nenhum usuário adicionado ao carrinho</p>;
  }

  return (
    <div className="cart-container">
      {savedUsers.map((user, index) => {
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
            <h4 className="cart-user-title">
              <b>{userName}:</b>
            </h4>

            {userPackage && (
              <div className="cart-item">
                <div className="item-info">
                  <h3>Pacote: {userPackage?.title}</h3>
                  <p>Preço: R$ {Number(userPackage?.finalPrice || 0).toFixed(2)}</p>
                </div>

                <div>
                  <Button variant="danger" size="md" onClick={() => handleRemoveUser(index, itemId)}>
                    <Icons typeIcon="delete" iconSize={30} fill="#fff" />
                    <span className="remove-user-btn">&nbsp;Remover Usuário</span>
                  </Button>
                </div>
              </div>
            )}

            {userExtraMeals && userExtraMeals.extraMeals && (
              <div className="cart-item">
                <div className="item-info">
                  <h3>
                    Refeições Extras:{' '}
                    {Array.isArray(userExtraMeals.extraMeals)
                      ? userExtraMeals.extraMeals.filter((meal) => meal && meal.trim() !== '').join(', ')
                      : userExtraMeals.extraMeals}
                  </h3>
                  <p>Preço: R$ {Number(userExtraMeals?.totalPrice || 0).toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="cart-item">
              <div className="item-info">
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
      <div className="cart-buttons">
        <Button variant="warning" size="md" onClick={emptyCart} className="cart-btn-responsive">
          <Icons typeIcon="close" iconSize={30} fill="#000" /> &nbsp;Esvaziar Carrinho
        </Button>
      </div>
    </div>
  );
};

Cart.propTypes = {
  savedUsers: PropTypes.arrayOf(
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
  setSavedUsers: PropTypes.func.isRequired,
};

export default Cart;
