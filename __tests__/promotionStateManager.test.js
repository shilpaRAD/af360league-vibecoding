import promotionStateManager from "c/promotionStateManager";

describe("promotionStateManager", () => {
  test("exposes expected API and updates chosenProducts and promotionName", () => {
    const state = promotionStateManager();

    expect(state).toHaveProperty("updateProducts");
    expect(typeof state.updateProducts).toBe("function");
    expect(typeof state.updatePromotionName).toBe("function");
    expect(typeof state.removeProduct).toBe("function");
    expect(typeof state.getProductDiscount).toBe("function");

    // Update products
    state.updateProducts([
      { productId: "P1", productName: "Prod 1", discountPercent: 5 }
    ]);
    expect(state.chosenProducts.value).toEqual([
      { productId: "P1", productName: "Prod 1", discountPercent: 5 }
    ]);

    // Check promotion name update
    state.updatePromotionName("Big Sale");
    expect(state.promotionName.value).toBe("Big Sale");

    // productCount should reflect number of chosen products
    expect(state.productCount.value).toBe(1);

    // getProductDiscount
    expect(state.getProductDiscount("P1")).toBe(5);

    // remove product
    state.removeProduct("P1");
    expect(state.chosenProducts.value).toEqual([]);
  });
});
