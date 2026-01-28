import { createElement } from "lwc";
import PromotionWizardStep3 from "c/promotionWizardStep3";

describe("c-promotion-wizard-step3", () => {
  beforeEach(() => {
    const promotionStateManager = require("c/promotionStateManager").default;
    const promotionState = promotionStateManager();
    promotionState.updateProducts([]);
    promotionState.updateStores([]);
    promotionState.updatePromotionName("");
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test("allValid saves selected stores to state and getPromotionData returns proper structure", async () => {
    const element = createElement("c-promotion-wizard-step3", {
      is: PromotionWizardStep3
    });
    document.body.appendChild(element);

    // Simulate loaded stores via public API
    element.setStores([
      { id: "S1", name: "Store 1", locationGroup: "Grp1", isSelected: true },
      { id: "S2", name: "Store 2", locationGroup: "Grp2", isSelected: false }
    ]);

    // Select S1 via public API
    element.setSelectedStores(["S1"]);

    // Ensure promotion name is set in state for predictable output
    const promotionStateManager = require("c/promotionStateManager").default;
    const state = promotionStateManager();
    state.updatePromotionName("Test Promo");

    // Quick assertion of selectedStoresList via public getter
    expect(element.getSelectedStoresList().map((s) => s.id)).toEqual(["S1"]);

    const valid = element.allValid();
    expect(valid).toBe(true);

    const storesFromState = element.getChosenStoresFromState();
    expect(Array.isArray(storesFromState) && storesFromState.length === 1).toBe(
      true
    );
    expect(storesFromState).toEqual([
      { storeId: "S1", storeName: "Store 1", locationGroup: "Grp1" }
    ]);

    const promoData = element.getPromotionData();
    expect(promoData).toEqual({
      promotionName: "Test Promo",
      products: [],
      stores: [{ storeId: "S1", storeName: "Store 1", locationGroup: "Grp1" }]
    });
  });

  test("allValid fails when no stores selected", async () => {
    const element = createElement("c-promotion-wizard-step3", {
      is: PromotionWizardStep3
    });
    document.body.appendChild(element);

    // No selected stores
    const valid = element.allValid();
    expect(valid).toBe(false);
  });
});
