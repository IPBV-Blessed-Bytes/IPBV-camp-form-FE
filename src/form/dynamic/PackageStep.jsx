import PropTypes from 'prop-types';

import Icons from '@/components/Global/Icons';
import { productPrice, packageTotal, formatPrice, discountForCategory } from './packagePricing';
import '@/components/Style/ProductList.scss';
import './PackageStep.scss';

const PackageStep = ({ categories, products, rules, age, value, onChange }) => {
  const selection = value || {};

  const toggle = (category, productId) => {
    const current = selection[category.id] || [];
    const isSelected = current.includes(productId);

    if (category.selectionRule === 'single') {
      onChange({ ...selection, [category.id]: isSelected ? [] : [productId] });
      return;
    }
    onChange({
      ...selection,
      [category.id]: isSelected ? current.filter((id) => id !== productId) : [...current, productId],
    });
  };

  const total = packageTotal(selection, products, rules, age);

  return (
    <div className="package-step">
      {categories.map((category) => {
        const catProducts = products.filter((p) => p.packageCategoryId === category.id);
        const selected = selection[category.id] || [];

        return (
          <div key={category.id} className="package-step__category mb-4">
            <h4 className="package-step__cat-title">
              {category.name}
              {category.required && <span className="text-danger"> *</span>}
            </h4>

            {catProducts.length === 0 ? (
              <p className="text-muted">Nenhum produto disponível nesta categoria.</p>
            ) : (
              <div className="product-grid">
                {catProducts.map((product) => {
                  const price = productPrice(product, rules, age);
                  const discount = discountForCategory(rules, product.packageCategoryId, age);
                  const alreadySelected = selected.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${alreadySelected ? 'product-card-is-active' : ''}`}
                    >
                      <div className="align-items-center mb-4">
                        <h3 className="product-title">{product.name}</h3>
                      </div>
                      <p className="product-price mb-2">{formatPrice(price)}</p>
                      {discount > 0 && (
                        <p className="discount-description small mb-2">
                          De <s>{formatPrice(Number(product.price || 0))}</s> · desconto de {discount}% por idade
                        </p>
                      )}
                      {product.description && (
                        <p className="discount-description small mb-4">{product.description}</p>
                      )}
                      <button
                        type="button"
                        className={`product-button ${alreadySelected ? 'selected' : ''}`}
                        onClick={() => toggle(category, product.id)}
                      >
                        {alreadySelected && <Icons typeIcon="checked" iconSize={18} fill="#fff" />}
                        {alreadySelected ? 'Selecionado' : 'Selecionar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="package-step__total">
        <span>Subtotal</span>
        <b>{formatPrice(total)}</b>
      </div>
    </div>
  );
};

PackageStep.propTypes = {
  categories: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  rules: PropTypes.array,
  age: PropTypes.number,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default PackageStep;
