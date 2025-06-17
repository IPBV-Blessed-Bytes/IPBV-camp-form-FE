import { useCart } from 'react-use-cart';
import { saveCart } from '@/services/cartService';
import PropTypes from 'prop-types';

const Cart = ({ formValues }) => {
  const { isEmpty, items, cartTotal, removeItem, emptyCart } = useCart();

  const basePrice = 100;
  const finalTotal = basePrice + cartTotal;

  const handleSaveCart = async () => {
    try {
      await saveCart(items);
      alert('Carrinho salvo com sucesso!');
    } catch (err) {
      alert('Erro ao salvar carrinho');
    }
  };

  if (isEmpty) return <p className="empty-cart">Seu carrinho está vazio</p>;

  const userName = formValues?.personalInformation?.name || 'Usuário Desconhecido';

  return (
    <div className="cart-container">
      <div className="cart-user-group">
        <h4 className="cart-user-title">
          <b>{userName}:</b>
        </h4>

        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <h3>{item.category || item.name}</h3>
              {item.category && <p>{item.name}</p>}
              <p>Preço: R$ {item.price.toFixed(2)}</p>
            </div>

            <div className="item-actions">
              <button onClick={() => removeItem(item.id)} className="remove">
                Remover
              </button>
            </div>
          </div>
        ))}
        <hr className="horizontal-line" />
      </div>

      <div className="cart-total">
        <p>Valor Base: R$ {basePrice.toFixed(2)}</p>
        <strong>Total:</strong> R$ {finalTotal.toFixed(2)}
      </div>

      <div className="cart-buttons">
        <button onClick={emptyCart}>Esvaziar Carrinho</button>
        <button onClick={handleSaveCart} className="save">
          Salvar Carrinho
        </button>
      </div>
    </div>
  );
};

Cart.propTypes = {
  formValues: PropTypes.shape({
    personalInformation: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
};

export default Cart;
