import { formatBRL } from '@/utils/formatBRL';
import { useCart } from 'react-use-cart';
import PropTypes from 'prop-types';
import Icons from '@/components/Global/Icons';
import { productImageUrl } from '@/services/products';
import '../Style/ProductList.scss';

const StoreItemList = ({ products, discounted }) => {
  const { getItem, addItem, updateItemQuantity, removeItem } = useCart();

  const storeItems = discounted.filter(
    (p) =>
      p.categoryKey &&
      p.categoryKey !== 'HOSPEDAGEM' &&
      p.categoryKey !== 'TRANSPORTE' &&
      products.find((prod) => prod.id === p.id) &&
      (p.stock === null || p.stock === undefined || p.stock > 0),
  );

  const currentQty = (id) => Number(getItem(id)?.quantity || 0);

  const setQty = (product, qty) => {
    const max = product.stock === null || product.stock === undefined ? Infinity : product.stock;
    const q = Math.max(0, Math.min(qty, max));
    const existing = getItem(product.id);
    if (q <= 0) {
      if (existing) removeItem(product.id);
      return;
    }
    if (existing) {
      updateItemQuantity(product.id, q);
    } else {
      addItem(product, q);
    }
  };

  if (storeItems.length === 0) {
    return <p className="text-secondary">Nenhum item disponível no momento.</p>;
  }

  return (
    <div className="product-section">
      <div className="product-grid">
        {storeItems.map((product) => {
          const qty = currentQty(product.id);
          const selected = qty > 0;
          const stockLabel =
            product.stock === null || product.stock === undefined
              ? null
              : `${product.stock} em estoque`;

          return (
            <div key={product.id} className={`product-card ${selected ? 'product-card-is-active' : ''}`}>
              {product.hasImage && (
                <div className="product-card__image">
                  <img src={productImageUrl(product.productId)} alt={product.name} loading="lazy" />
                </div>
              )}
              <div className="align-items-center mb-4">
                <h3 className="product-title">{product.name}</h3>
              </div>
              {!product.hasImage && product.iconKey && (
                <div className="product-card__icon">
                  <Icons typeIcon={product.iconKey} iconSize={42} fill="#007185" />
                </div>
              )}
              <p className="product-price mb-2">R$ {formatBRL(product.price)}</p>
              {stockLabel && <p className="store-stock small mb-3">{stockLabel}</p>}
              {product.description && <p className="discount-description small mb-3">{product.description}</p>}

              <div className="store-qty">
                <button
                  type="button"
                  className="store-qty__btn"
                  aria-label="Diminuir quantidade"
                  disabled={qty <= 0}
                  onClick={() => setQty(product, qty - 1)}
                >
                  −
                </button>
                <span className="store-qty__value">{qty}</span>
                <button
                  type="button"
                  className="store-qty__btn"
                  aria-label="Aumentar quantidade"
                  disabled={product.stock != null && qty >= product.stock}
                  onClick={() => setQty(product, qty + 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

StoreItemList.propTypes = {
  products: PropTypes.array.isRequired,
  discounted: PropTypes.array.isRequired,
};

export default StoreItemList;
