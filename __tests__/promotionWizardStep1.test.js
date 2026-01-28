import { createElement } from "lwc";
import PromotionWizardStep1 from "c/promotionWizardStep1";

describe("c-promotion-wizard-step1", () => {
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

  test("allValid updates state and returns true when name provided", async () => {
    const element = createElement("c-promotion-wizard-step1", {
      is: PromotionWizardStep1
    });
    document.body.appendChild(element);

    // Simulate user input using public helper
    element.setPromotionName("Holiday Sale");

    // Sanity check the local value via public getter
    expect(element.getPromotionName()).toBe("Holiday Sale");

    // Call allValid
    const valid = element.allValid();
    expect(valid).toBe(true);

    // State should be updated (via public getter)
    const stateName = element.getPromotionNameFromState();
    expect(stateName).toBe("Holiday Sale");
  });

  test("allValid returns false when name is empty", async () => {
    const element = createElement("c-promotion-wizard-step1", {
      is: PromotionWizardStep1
    });
    document.body.appendChild(element);

    // No input
    const valid = element.allValid();
    expect(valid).toBe(false);
  });
});
