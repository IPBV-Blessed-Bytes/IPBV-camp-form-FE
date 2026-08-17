import { Row, Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Icons from '@/components/Global/Icons';
import { productPrice, packageTotal, formatPrice, discountForCategory } from './packagePricing';
import '@/components/Style/ProductList.scss';
import './PackageStep.scss';

const PackageStep = ({ categories, products, rules, age, lotName, value, onChange }) => {
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
    <Row className="package-step">
      <Col xs={12} xl={8} className="mb-3 mb-xl-0">
        {lotName && <h2 className="package-step__lot-title">{lotName}</h2>}
        {categories.map((category) => {
          const catProducts = products.filter((p) => p.packageCategoryId === category.id);
          const selected = selection[category.id] || [];

          return (
            <Card key={category.id} className="mb-3">
              <Card.Body>
                <Card.Title>
                  {category.name}
                  {category.required && <span className="text-danger"> *</span>}
                </Card.Title>
                {category.description && <Card.Text>{category.description}</Card.Text>}

                {catProducts.length === 0 ? (
                  <p className="text-muted mb-0">Nenhum produto disponível nesta categoria.</p>
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
                              De <s>{formatPrice(Number(product.price || 0))}</s> · -{discount}% por idade
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
              </Card.Body>
            </Card>
          );
        })}
      </Col>

      <Col xs={12} xl={4} className="ps-xl-3">
        <Card className="package-summary">
          <Card.Body>
            <Card.Title>Resumo do Pacote</Card.Title>
            {categories.map((category) => {
              const sel = selection[category.id] || [];
              const selProducts = products.filter((p) => sel.includes(p.id));
              return (
                <div key={category.id} className="package-summary__cat">
                  <div className="package-summary__label">{category.name}:</div>
                  <div className={`package-summary__content ${selProducts.length ? 'is-selected' : ''}`}>
                    {selProducts.length === 0 ? (
                      <small className="text-secondary fst-italic">Não selecionado</small>
                    ) : (
                      selProducts.map((p) => (
                        <div key={p.id} className="package-summary__row">
                          <span>{p.name}</span>
                          <span>{formatPrice(productPrice(p, rules, age))}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <hr className="package-summary__line" />
                </div>
              );
            })}
            <div className="package-summary__total">
              <b>Total:</b>
              <b>{formatPrice(total)}</b>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

PackageStep.propTypes = {
  categories: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  rules: PropTypes.array,
  age: PropTypes.number,
  lotName: PropTypes.string,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default PackageStep;
