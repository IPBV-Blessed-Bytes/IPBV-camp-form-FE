import { Button } from 'react-bootstrap';
import { useCart } from 'react-use-cart';
import PropTypes from 'prop-types';
import Icons from './Icons';

const Cart = ({ savedUsers = [], setSavedUsers }) => {
  const { removeItem, emptyCart } = useCart();

  const basePrice = 100;

  const handleRemoveUser = (index, itemId) => {
    setSavedUsers((prev) => prev.filter((_, i) => i !== index));
    if (itemId) removeItem(itemId);
  };

  const totalPackages = savedUsers.reduce((acc, user) => {
    const price = Number(user?.package?.finalPrice || 0);
    return acc + price;
  }, 0);

  const finalTotal = totalPackages + basePrice;

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

            <hr className="horizontal-line" />
          </div>
        );
      })}

      <div className="cart-total">
        <p>Valor Base: R$ {basePrice.toFixed(2)}</p>
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
