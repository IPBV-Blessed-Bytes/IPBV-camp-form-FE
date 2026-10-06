import { useEffect, useState, useRef } from 'react';
import { formatBRL } from '@/utils/formatBRL';
import { useCart } from 'react-use-cart';
import PropTypes from 'prop-types';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';
import Icons from '@/components/Global/Icons';
import { productImageUrl } from '@/services/products';
import '../Style/ProductList.scss';

const ProductList = ({ age, cartKey, categoryKey, selectionRule = 'SINGLE', products, packageCount }) => {
  const { addItem, getItem, removeItem, items } = useCart();
  const [productsState, setProductsState] = useState(products || []);
  const hasRestoredCart = useRef(false);

  useEffect(() => {
    if (products && products.length > 0) {
      setProductsState(products);
    }
  }, [products]);

  useEffect(() => {
    const savedCart = sessionStorage.getItem(cartKey);

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        parsed.forEach((item) => {
          if (!getItem(item.id)) addItem(item, Number(item.quantity) || 1);
        });
      } catch (e) {
        console.error('[ProductList] Erro ao restaurar carrinho:', e);
      }
    }

    hasRestoredCart.current = true;
  }, []);

  useEffect(() => {
    if (hasRestoredCart.current) {
      sessionStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items]);

  const getAvailability = (product) => {
    if (age < 9) return true;

    if (categoryKey === 'HOSPEDAGEM') {
      const total = packageCount?.hospedagemLotTotal;
      if (total !== null && total !== undefined) {
        const used = Number(packageCount?.hospedagemLotUsed || 0);
        if (used >= Number(total)) return false;
      }

      const globalCap = product.globalVacancies;
      if (globalCap !== null && globalCap !== undefined) {
        const usedAccommodation = Number(packageCount?.usedValidPackages?.[product.id] || 0);
        if (usedAccommodation >= Number(globalCap)) return false;
      }

      return true;
    }

    if (product.id === 'bus-yes') {
      const busCap = packageCount?.totalBusVacancies;
      if (busCap !== null && busCap !== undefined) {
        const usedBus = Number(packageCount?.usedValidPackages?.['bus-yes'] || 0);
        if (usedBus >= Number(busCap)) return false;
      }
    }

    if (product.vacancies === null || product.vacancies === undefined) return true;
    const used = Number(packageCount?.usedValidPackages?.[product.id] || 0);
    return Number(product.vacancies) > used;
  };

  const handleSelect = (product, filtered) => {
    if (selectionRule !== 'MULTIPLE') {
      filtered.forEach((p) => {
        if (getItem(p.id)) removeItem(p.id);
      });
    }
    addItem(product);
  };

  const handlePackageButton = (product, filtered) => {
    const alreadySelected = !!getItem(product.id);
    if (alreadySelected) {
      removeItem(product.id);
    } else {
      handleSelect(product, filtered);
    }
  };

  const filtered = getDiscountedProducts(age).filter(
    (p) => p.categoryKey === categoryKey && productsState.find((prod) => prod.id === p.id),
  );

  return (
    <div className="product-section">
      <div className="product-grid">
        {filtered.map((product) => {
          const alreadySelected = !!getItem(product.id);
          const isAvailable = getAvailability(product);

          return (
            <div
              key={product.id}
              className={`product-card
    ${alreadySelected ? 'product-card-is-active' : ''}
    ${!isAvailable ? 'product-card-unavailable' : ''}`}
            >
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
              <p className="product-price mb-4">R$ {formatBRL(product.price)}</p>
              {product.description && <p className="discount-description small mb-4">{product.description}</p>}

              {!isAvailable ? (
                <span className="product-card__badge">Indisponível</span>
              ) : (
                <button
                  className={`product-button ${alreadySelected ? 'selected' : ''}`}
                  onClick={() => handlePackageButton(product, filtered)}
                >
                  {alreadySelected && <Icons typeIcon="checked" iconSize={18} fill="#fff" />}
                  {alreadySelected ? 'Selecionado' : 'Selecionar'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProductList.propTypes = {
  age: PropTypes.number.isRequired,
  cartKey: PropTypes.string.isRequired,
  categoryKey: PropTypes.string.isRequired,
  selectionRule: PropTypes.string,
  packageCount: PropTypes.object,
  products: PropTypes.array.isRequired,
};

export default ProductList;
