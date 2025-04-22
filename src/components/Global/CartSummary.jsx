import { useCart } from '@/hooks/useCart/CartContext';

const CartSummary = () => {
  const { cartItems, totalPrice, removeFromCart, clearCart } = useCart();

  const finalizeCartAndPay = () => {
    alert('Finalizando compra!');
  };

  return (
    <div>
      {/* <h2>Carrinho ({cartItems.length} inscrições)</h2> */}
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>
            {item.personalInformation.name} — R$ {item.totalPrice.toFixed(2)}
            <button onClick={() => removeFromCart(index)}>Remover</button>
          </li>
        ))}
      </ul>
      <h3>Total: R$ {totalPrice.toFixed(2)}</h3>
      <button onClick={clearCart}>Limpar Carrinho</button>
      <button onClick={finalizeCartAndPay}>Finalizar e Pagar</button>
    </div>
  );
};


export default CartSummary;
