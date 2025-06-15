import axios from 'axios';

const API_URL = 'http://localhost:3001/carts';

/**
 * Salva o carrinho no backend via POST
 * @param {Array} cartItems - Itens do carrinho
 * @returns {Promise<Object>} - Resposta da API
 */
export async function saveCart(cartItems) {
  try {
    const response = await axios.post(API_URL, {
      items: cartItems,
      createdAt: new Date().toISOString(),
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao salvar o carrinho:', error);
    throw error;
  }
}
