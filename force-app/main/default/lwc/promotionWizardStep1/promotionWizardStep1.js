import { LightningElement, api } from "lwc";
import promotionStateManager from "c/promotionStateManager";
import { fromContext } from "@lwc/state";

export default class PromotionWizardStep1 extends LightningElement {
  /** Initialize/inherit the state from the parent (use fallback when fromContext not available) */
  promotionState;

  promotionName;

  connectedCallback() {
    // Try to get the shared state from LWC context API; otherwise fall back to calling factory()
    try {
      if (typeof fromContext === "function") {
        this.promotionState = fromContext(this, promotionStateManager);
      } else {
        this.promotionState = promotionStateManager();
      }
    } catch (e) {
      this.promotionState = promotionStateManager();
      // eslint-disable-next-line no-console
      console.warn(
        "fromContext not available; using fallback state instance.",
        e
      );
    }

    this.promotionName =
      this.promotionState?.value?.promotionName?.value ||
      this.promotionState?.promotionName ||
      "";
  }

  handleChange(event) {
    this.promotionName = event.detail.value;
  }

  /** Test helpers */
  @api
  setPromotionName(name) {
    this.promotionName = name;
  }

  @api
  getPromotionName() {
    return this.promotionName;
  }

  @api
  getPromotionNameFromState() {
    return (
      this.promotionState?.value?.promotionName?.value ||
      this.promotionState?.promotionName ||
      ""
    );
  }

  @api
  allValid() {
    if (this.promotionName === undefined || this.promotionName === "") {
      return false;
    }

    // Update the promotion name in the state (support both context-wrapped and direct factory shapes)
    const updatePromotionNameFn =
      this.promotionState?.value?.updatePromotionName ||
      this.promotionState?.updatePromotionName;
    if (typeof updatePromotionNameFn === "function") {
      updatePromotionNameFn(this.promotionName);
    }

    return true;
  }
}
