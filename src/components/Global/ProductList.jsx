import { useCart } from 'react-use-cart';
import { products } from '../cart/products';

const ProductList = () => {
  const { addItem, getItem, removeItem } = useCart();

  const handleSelect = (product, filtered, singleSelection) => {
    if (singleSelection) {
      filtered.forEach((p) => {
        if (getItem(p.id)) removeItem(p.id);
      });
    }

    addItem(product);
  };

  const renderSection = (categoryTitle, categoryKey, singleSelection = false) => {
    const filtered = products.filter((p) => p.category === categoryKey);

    return (
      <div className="product-section">
        <h4 className="product-section-title">
          {categoryTitle} {singleSelection && <span className="required-field fw-bold">*</span>}
        </h4>
        <div className="product-grid">
          {filtered.map((product) => {
            const alreadySelected = !!getItem(product.id);
            return (
              <div key={product.id} className="product-card">
                {/* <img src={product.image} alt={product.name} className="product-image" /> */}
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">R$ {product.price.toFixed(2)}</p>
                <button
                  className="product-button"
                  onClick={() => handleSelect(product, filtered, singleSelection)}
                  disabled={alreadySelected}
                >
                  {alreadySelected ? 'Selecionado' : 'Selecionar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <hr className="horizontal-line" />
      {renderSection('Hospedagem:', 'Hospedagem', true)}
      <hr className="horizontal-line" />
      {renderSection('Transporte:', 'Transporte', true)}
      <hr className="horizontal-line" />
      {renderSection('Alimentação (Opcional):', 'Alimentação Completa')}
    </>
  );
};

export default ProductList;
