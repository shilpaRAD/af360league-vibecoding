// Use the LWC state utilities when available; provide lightweight fallbacks for older runtimes
import {
  defineState as lwcDefineState,
  atom as lwcAtom,
  compute as lwcCompute,
  setAtom as lwcSetAtom
} from "@lwc/state";

// Provide safe fallbacks when the runtime does not expose @lwc/state
const atom =
  typeof lwcAtom === "function" ? lwcAtom : (initial) => ({ value: initial });
const setAtom =
  typeof lwcSetAtom === "function"
    ? lwcSetAtom
    : (a, v) => {
        a.value = v;
      };
const compute =
  typeof lwcCompute === "function"
    ? lwcCompute
    : (fn) => ({
        get value() {
          return fn();
        }
      });

const defineState =
  typeof lwcDefineState === "function"
    ? lwcDefineState
    : (initFn) => {
        // Simple factory that returns a singleton per initFn (mimics @lwc/state behavior)
        let instance;
        return () => {
          if (!instance) {
            instance = initFn();
          }
          return instance;
        };
      };

const promotionStateManager = defineState(() => {
  const promotionName = atom("");
  const chosenProducts = atom([]);
  const chosenStores = atom([]);

  const setProduct = (product) => {
    let chosenProductsTemp = [...(chosenProducts.value || chosenProducts)];
    const existingIndex = chosenProductsTemp.findIndex(
      (existingProduct) => existingProduct.productId === product.productId
    );
    if (existingIndex >= 0) {
      chosenProductsTemp[existingIndex] = {
        ...chosenProductsTemp[existingIndex],
        ...product
      };
    } else {
      chosenProductsTemp.push(product);
    }
    setAtom(chosenProducts, chosenProductsTemp);
  };

  const productCount = compute(() => {
    const arr =
      (chosenProducts && chosenProducts.value) || chosenProducts || [];
    return Array.isArray(arr) ? arr.length : 0;
  });

  const updateProducts = (products) => {
    setAtom(chosenProducts, [...products]);
  };

  const updatePromotionName = (name) => {
    setAtom(promotionName, name);
  };

  const removeProduct = (productId) => {
    const arr =
      (chosenProducts && chosenProducts.value) || chosenProducts || [];
    setAtom(
      chosenProducts,
      arr.filter((p) => p.productId !== productId)
    );
  };

  const isProductSelected = (productId) => {
    const arr =
      (chosenProducts && chosenProducts.value) || chosenProducts || [];
    return arr.some((p) => p.productId === productId);
  };

  const getProductDiscount = (productId) => {
    const arr =
      (chosenProducts && chosenProducts.value) || chosenProducts || [];
    const foundProduct = arr.find((p) => p.productId === productId);
    return foundProduct ? foundProduct.discountPercent || 0 : 0;
  };

  const updateStores = (stores) => {
    setAtom(chosenStores, [...stores]);
  };

  // This returns the "Bucket" that every other file will share
  return {
    promotionName,
    chosenProducts,
    chosenStores,
    setProduct,
    removeProduct,
    isProductSelected,
    getProductDiscount,
    productCount,
    updateProducts,
    updateStores,
    updatePromotionName
  };
});

export default promotionStateManager;
