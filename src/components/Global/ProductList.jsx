import { useState, useImperativeHandle, forwardRef } from 'react';
import { useCart } from 'react-use-cart';
import { products } from '../cart/products';
import Icons from './Icons';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';

const ProductList = forwardRef(({ age }, ref) => {
  const { addItem, getItem, removeItem } = useCart();
  const [hasError, setHasError] = useState(false);

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

  const renderSection = (categoryTitle, categoryKey, singleSelection = false, required) => {
    const filtered = getDiscountedProducts(age).filter((p) => p.category === categoryKey);

    return (
      <div className="product-section">
        <h4 className="product-section-title mt-4">
          {categoryTitle}: {required && <span className="required-field fw-bold">*</span>}
        </h4>
        <div className="product-grid">
          {filtered.map((product) => {
            const alreadySelected = !!getItem(product.id);
            return (
              <div key={product.id} className={`product-card ${alreadySelected ? 'product-card-is-active' : ''}`}>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">R$ {product.price.toFixed(2)}</p>
                {product.discountDescription && (
                  <p className="discount-description text-success small">
                    <em>{product.discountDescription}</em>
                  </p>
                )}
                <button
                  className={`product-button ${alreadySelected ? 'selected' : ''}`}
                  onClick={() => {
                    handlePackageButton(product, filtered, singleSelection, alreadySelected);
                  }}
                >
                  {alreadySelected ? 'Remover' : 'Selecionar'}
                </button>
              </div>
            );
          })}
          {hasError && required && (
            <div className={`invalid-feedback text-center d-block`}>
              Selecione uma opção de {categoryTitle} &nbsp;
              <Icons typeIcon="error" iconSize={25} fill="#c92432" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <hr className="horizontal-line" />
      {renderSection('Hospedagem', 'Hospedagem', true, true)}
      <hr className="horizontal-line" />
      {renderSection('Transporte', 'Transporte', true, true)}
      <hr className="horizontal-line" />
      {renderSection('Alimentação (Opcional)', 'Alimentação', true, false)}
    </>
  );
});

ProductList.displayName = 'ProductList';

export default ProductList;
