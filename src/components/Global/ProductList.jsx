import { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useCart } from 'react-use-cart';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import getDiscountedProducts from '@/Pages/Packages/utils/getDiscountedProducts';

const ProductList = forwardRef(({ age, cartKey, category, products, packageCount }, ref) => {
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

  const getAvailability = (product, packageCount) => {
    if (age < 9) return true;

    if (!packageCount) return true;

    const { totalPackages, usedValidPackages, totalBusVacancies } = packageCount;

    if (product.id === 'bus-yes') {
      const usedBus = Object.entries(usedValidPackages)
        .filter(([key]) => key.includes('WithBus'))
        .reduce((acc, [, val]) => acc + val, 0);
      return usedBus < totalBusVacancies;
    }

    const packageKeys = {
      'host-seminario': 'seminary',
      'host-college-collective': 'schoolIndividual',
      'host-college-family': 'schoolFamily',
      'host-college-camping': 'schoolCamping',
      'host-external': 'other',
    };

    const key = packageKeys[product.id];
    if (key) {
      const total = totalPackages[key] || 0;

      const used =
        (usedValidPackages[`${key}WithBusWithFood`] || 0) +
        (usedValidPackages[`${key}WithBusWithoutFood`] || 0) +
        (usedValidPackages[`${key}WithoutBusWithFood`] || 0) +
        (usedValidPackages[`${key}WithoutBusWithoutFood`] || 0);

      return used < total;
    }

    return true;
  };

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
            const isAvailable = getAvailability(product, packageCount);

            return (
              <div
                key={product.id}
                className={`product-card 
    ${alreadySelected ? 'product-card-is-active' : ''} 
    ${!isAvailable ? 'product-card-unavailable' : ''}`}
              >
                <div className="align-items-center mb-4">
                  <h3 className="product-title">{product.name}</h3>
                </div>
                <p className="product-price mb-4">R$ {product.price},00</p>
                {product.description && <p className="discount-description small mb-4">{product.description}</p>}

                {!isAvailable ? (
                  <p className="text-danger small fw-bold">Indisponível</p>
                ) : (
                  <button
                    className={`product-button ${alreadySelected ? 'selected' : ''}`}
                    onClick={() => handlePackageButton(product, filtered)}
                  >
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

  return <>{renderSection(category)}</>;
});

ProductList.displayName = 'ProductList';

ProductList.propTypes = {
  age: PropTypes.number.isRequired,
  cartKey: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  packageCount: PropTypes.object,
  products: PropTypes.array.isRequired,
};

export default ProductList;
