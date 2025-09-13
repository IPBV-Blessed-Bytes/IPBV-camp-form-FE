import { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useCart } from 'react-use-cart';
import { loadProducts } from '../../Pages/Packages/utils/products';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';

const ProductList = forwardRef(({ age, cartKey, category }, ref) => {
  const { addItem, getItem, removeItem, items } = useCart();
  const [productsState, setProductsState] = useState([]);
  const hasRestoredCart = useRef(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const prods = await loadProducts();
      setProductsState(prods);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const savedCart = sessionStorage.getItem(cartKey);

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        parsed.forEach((item) => {
          if (!getItem(item.id)) addItem(item);
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
    const requiredCategories = ['Hospedagem', 'Transporte', 'Alimentação'];
    const missingCategories = requiredCategories.filter(
      (cat) => !productsState.some((p) => p.category === cat && getItem(p.id)),
    );

    if (missingCategories.length > 0) {
      toast.error(`Selecione uma opção para: ${missingCategories.join(', ')}`);
      return false;
    }

    return true;
  };

  useImperativeHandle(ref, () => ({
    checkRequiredPackages,
  }));

  const handleSelect = (product, filtered) => {
    filtered.forEach((p) => {
      if (getItem(p.id)) removeItem(p.id);
    });
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

  const renderSection = (categoryKey) => {
    const filtered = getDiscountedProducts(age).filter(
      (p) => p.category === categoryKey && productsState.find((prod) => prod.id === p.id),
    );

    return (
      <div className="product-section">
        <div className="product-grid">
          {filtered.map((product) => {
            const alreadySelected = !!getItem(product.id);
            return (
              <div key={product.id} className={`product-card ${alreadySelected ? 'product-card-is-active' : ''}`}>
                <div className="align-items-center mb-4">
                  <h3 className="product-title">{product.name}</h3>
                </div>
                <p className="product-price mb-4">R$ {product.price},00</p>
                {product.description && <p className="discount-description small mb-4">{product.description}</p>}
                <button
                  className={`product-button ${alreadySelected ? 'selected' : ''}`}
                  onClick={() => handlePackageButton(product, filtered)}
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

  return <>{renderSection(category)}</>;
});

ProductList.displayName = 'ProductList';

ProductList.propTypes = {
  age: PropTypes.number.isRequired,
  cartKey: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
};

export default ProductList;
