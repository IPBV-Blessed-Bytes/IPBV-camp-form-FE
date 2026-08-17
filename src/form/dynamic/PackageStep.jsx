import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { productPrice, packageTotal, formatPrice, discountForCategory } from './packagePricing';
import './PackageStep.scss';

const PackageStep = ({ categories, products, rules, age, value, onChange }) => {
  const selection = value || {};

  const selectSingle = (categoryId, productId) => onChange({ ...selection, [categoryId]: [productId] });

  const toggleMultiple = (categoryId, productId) => {
    const current = selection[categoryId] || [];
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    onChange({ ...selection, [categoryId]: next });
  };

  const total = packageTotal(selection, products, rules, age);

  return (
    <div className="package-step">
      {categories.map((category) => {
        const catProducts = products.filter((p) => p.packageCategoryId === category.id);
        const selected = selection[category.id] || [];
        const isSingle = category.selectionRule === 'single';

        return (
          <div key={category.id} className="package-step__category mb-4">
            <h5 className="package-step__cat-title">
              {category.name}
              {category.required && <span className="text-danger"> *</span>}
              <small className="text-muted ms-2">
                {isSingle ? 'escolha uma opção' : 'escolha uma ou mais'}
              </small>
            </h5>

            {catProducts.length === 0 ? (
              <p className="text-muted">Nenhum produto disponível nesta categoria.</p>
            ) : (
              catProducts.map((product) => {
                const price = productPrice(product, rules, age);
                const discount = discountForCategory(rules, product.packageCategoryId, age);
                const checked = selected.includes(product.id);
                return (
                  <Form.Check
                    key={product.id}
                    type={isSingle ? 'radio' : 'checkbox'}
                    id={`pkg-${category.id}-${product.id}`}
                    name={`pkg-${category.id}`}
                    checked={checked}
                    onChange={() =>
                      isSingle ? selectSingle(category.id, product.id) : toggleMultiple(category.id, product.id)
                    }
                    label={
                      <span className="package-step__product">
                        <span>
                          {product.name}
                          {product.description ? <small className="text-muted"> · {product.description}</small> : null}
                        </span>
                        <span className="package-step__price">
                          {discount > 0 && (
                            <s className="text-muted me-2">{formatPrice(Number(product.price || 0))}</s>
                          )}
                          <b>{formatPrice(price)}</b>
                          {discount > 0 && <small className="text-success ms-1">(-{discount}%)</small>}
                        </span>
                      </span>
                    }
                  />
                );
              })
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
