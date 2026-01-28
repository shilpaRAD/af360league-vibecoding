import { createElement } from "lwc";
import PromotionWizardStep2 from "c/promotionWizardStep2";

describe("c-promotion-wizard-step2", () => {
  beforeEach(() => {
    const promotionStateManager = require("c/promotionStateManager").default;
    const state = promotionStateManager();
    state.updateProducts([]);
    state.updateStores([]);
    state.updatePromotionName("");
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test("allValid saves selected products to state and returns true", async () => {
    const element = createElement("c-promotion-wizard-step2", {
      is: PromotionWizardStep2
    });
    document.body.appendChild(element);

    // Simulate selecting products via the public test helper
    element.setSelectedProducts([
      { productId: "P1", productName: "Prod 1", discountPercent: 10 }
    ]);

    // Sanity check selected list via public getter
    console.log(
      "selected products list pre:",
      element.getSelectedProductsList()
    );
    expect(element.getSelectedProductsList()).toEqual([
      { productId: "P1", productName: "Prod 1", discountPercent: 10 }
    ]);

    const valid = element.allValid();
    expect(valid).toBe(true);

    const chosenFromState = element.getChosenProductsFromState();
    expect(Array.isArray(chosenFromState) && chosenFromState.length === 1).toBe(
      true
    );
    expect(chosenFromState).toEqual([
      { productId: "P1", productName: "Prod 1", discountPercent: 10 }
    ]);
  });

  test("allValid fails when no products selected or missing discounts", async () => {
    const element = createElement("c-promotion-wizard-step2", {
      is: PromotionWizardStep2
    });
    document.body.appendChild(element);

    // No products
    let valid = element.allValid();
    expect(valid).toBe(false);

    // Product without discount
    element.setSelectedProducts([
      { productId: "P2", productName: "Prod 2", discountPercent: 0 }
    ]);
    valid = element.allValid();
    expect(valid).toBe(false);
  });
});
