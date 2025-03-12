import { useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { BASE_URL } from '@/config';

const ShoppingCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const addPersonToCart = (personData) => {
    setCart([...cart, { ...personData, id: Date.now() }]);
    toast.success('Pessoa adicionada ao carrinho!');
  };

  const removePersonFromCart = (id) => {
    setCart(cart.filter(person => person.id !== id));
    toast.info('Pessoa removida do carrinho.');
  };

  const clearCart = () => {
    setCart([]);
    toast.info('Carrinho esvaziado.');
  };

  const submitCart = async () => {
    if (cart.length === 0) {
      toast.error('Adicione pelo menos uma pessoa antes de continuar!');
      return;
    }
    
    setLoading(true);
    try {
      const payload = cart.map(person => ({
        ...person,
        registrationDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
        totalPrice: person.package.finalPrice + person.extraMeals.totalPrice,
        manualRegistration: false,
      }));

      const response = await fetcher.post(`${BASE_URL}/checkout/create`, { registrations: payload });
      
      if (response.data.payment_url) {
        window.open(response.data.payment_url, '_self');
        toast.success('Redirecionando para pagamento...');
      } else {
        toast.success('Inscrição validada com sucesso!');
        clearCart();
      }
    } catch (error) {
      toast.error(error?.response?.data || 'Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <h2>Carrinho de Inscrição</h2>
      <ul>
        {cart.map((person) => (
          <li key={person.id}>
            {person.personalInformation.name} - {person.package.name}
            <button onClick={() => removePersonFromCart(person.id)}>Remover</button>
          </li>
        ))}
      </ul>
      <button onClick={submitCart} disabled={loading}>Finalizar Inscrição</button>
    </div>
  );
};

export default ShoppingCart;
