import { useState, useImperativeHandle, useEffect, forwardRef, useRef } from 'react';
import { useCart } from 'react-use-cart';
import { products } from '../../Pages/Packages/utils/products';
import PropTypes from 'prop-types';
import Icons from './Icons';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';
import Tips from './Tips';

const ProductList = forwardRef(({ age, cartKey, category, singleSelection = true, required = false }, ref) => {
  const { addItem, getItem, removeItem, items } = useCart();
  const [hasError, setHasError] = useState(false);
  const hasRestoredCart = useRef(false);

  useEffect(() => {
    const savedCart = sessionStorage.getItem(cartKey);

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        parsed.forEach((item) => {
          if (!getItem(item.id)) {
            addItem(item);
          }
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

  const checkRequiredPackages = () => {
    const hostingSelected = products.filter((p) => p.category === 'Hospedagem').some((p) => getItem(p.id));
    const transportationSelected = products.filter((p) => p.category === 'Transporte').some((p) => getItem(p.id));
    const allValid = hostingSelected && transportationSelected;

    setHasError(!allValid);
    return allValid;
  };

  useImperativeHandle(ref, () => ({
    checkRequiredPackages,
  }));

  const handleSelect = (product, filtered, singleSelection) => {
    if (singleSelection) {
      filtered.forEach((p) => {
        if (getItem(p.id)) removeItem(p.id);
      });
    }

    addItem(product);
  };

  const handlePackageButton = (product, filtered, singleSelection, alreadySelected) => {
    if (alreadySelected) {
      removeItem(product.id);
    } else {
      handleSelect(product, filtered, singleSelection);
    }
  };

  const renderSection = (categoryTitle, categoryKey, singleSelection, required) => {
    const filtered = getDiscountedProducts(age).filter((p) => p.category === categoryKey);

    return (
      <div className="product-section">
        <div className="product-grid">
          {filtered.map((product) => {
            const alreadySelected = !!getItem(product.id);
            return (
              <div key={product.id} className={`product-card ${alreadySelected ? 'product-card-is-active' : ''}`}>
                <div className="d-flex gap-2 align-items-center justify-content-between">
                  <h3 className="product-title">{product.name}</h3>
                  <Tips
                    placement="top"
                    typeIcon="info"
                    size={20}
                    colour={'#7f7878'}
                    text={product.description}
                  />
                </div>
                <p className="product-price">R$ {product.price.toFixed(2)}</p>
                {product.discountDescription && (
                  <p className="discount-description text-success small">
                    <em>{product.discountDescription}</em>
                  </p>
                )}
                <button
                  className={`product-button ${alreadySelected ? 'selected' : ''}`}
                  onClick={() => handlePackageButton(product, filtered, singleSelection, alreadySelected)}
                >
                  {alreadySelected ? 'Selecionado' : 'Selecionar'}
                </button>
              </div>
            );
          })}
          {hasError && required && (
            <div className="invalid-feedback text-center d-block">
              Selecione uma opção de {categoryTitle} &nbsp;
              <Icons typeIcon="error" iconSize={25} fill="#c92432" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return <>{renderSection(category, category, singleSelection, required)}</>;
});

ProductList.displayName = 'ProductList';

ProductList.propTypes = {
  age: PropTypes.number.isRequired,
  cartKey: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  singleSelection: PropTypes.bool,
  required: PropTypes.bool,
};

export default ProductList;
