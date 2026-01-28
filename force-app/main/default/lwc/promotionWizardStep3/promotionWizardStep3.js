import { LightningElement, api, track } from "lwc";
import { fromContext } from "@lwc/state";
import promotionStateManager from "c/promotionStateManager";
import getRetailStores from "@salesforce/apex/PromotionCreatorCtrl.getRetailStores";

export default class PromotionWizardStep3 extends LightningElement {
  promotionState;

  @api recordId; // Account Id passed from parent wizard

  @track stores = [];
  @track selectedStoreIds = new Set();

  isLoading = true;
  error = null;

  connectedCallback() {
    // Try to obtain state context; fallback to factory when not available
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

    this.restoreSelectionsFromState();
    this.loadStores();
  }

  restoreSelectionsFromState() {
    const stateStores = this.promotionState?.value?.chosenStores?.value || [];
    stateStores.forEach((store) => {
      this.selectedStoreIds.add(store.storeId);
    });
  }

  async loadStores() {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await getRetailStores({
        accountId: this.recordId
      });

      this.stores = result.map((store) => ({
        id: store.Id,
        name: store.Name,
        locationGroup: store.RetailLocationGroup?.Name || "N/A",
        isSelected: this.selectedStoreIds.has(store.Id)
      }));
    } catch (err) {
      this.error = err.body?.message || "Failed to load stores";
      console.error("Error loading stores:", err);
    } finally {
      this.isLoading = false;
    }
  }

  handleCheckboxChange(event) {
    const storeId = event.target.dataset.id;
    const isChecked = event.target.checked;

    if (isChecked) {
      this.selectedStoreIds.add(storeId);
    } else {
      this.selectedStoreIds.delete(storeId);
    }

    // Update the stores array to reflect selection change
    this.stores = this.stores.map((s) => {
      if (s.id === storeId) {
        return { ...s, isSelected: isChecked };
      }
      return s;
    });
  }

  handleSelectAll(event) {
    const isChecked = event.target.checked;

    if (isChecked) {
      this.stores.forEach((store) => {
        this.selectedStoreIds.add(store.id);
      });
    } else {
      this.selectedStoreIds.clear();
    }

    this.stores = this.stores.map((s) => ({
      ...s,
      isSelected: isChecked
    }));
  }

  get hasStores() {
    return this.stores && this.stores.length > 0;
  }

  get noStores() {
    return !this.hasStores;
  }

  get notLoading() {
    return !this.isLoading;
  }

  get selectedCount() {
    return this.selectedStoreIds.size;
  }

  get totalCount() {
    return this.stores.length;
  }

  get hasSelectedStores() {
    return this.selectedCount > 0;
  }

  get allSelected() {
    return (
      this.stores.length > 0 &&
      this.selectedStoreIds.size === this.stores.length
    );
  }

  get someSelected() {
    return (
      this.selectedStoreIds.size > 0 &&
      this.selectedStoreIds.size < this.stores.length
    );
  }

  get selectedStoresList() {
    return this.stores.filter((s) => this.selectedStoreIds.has(s.id));
  }

  // Get summary data from state for display
  get promotionName() {
    return (
      this.promotionState?.value?.promotionName?.value || "Untitled Promotion"
    );
  }

  get selectedProducts() {
    return this.promotionState?.value?.chosenProducts?.value || [];
  }

  get hasSelectedProducts() {
    return this.selectedProducts.length > 0;
  }

  @api
  allValid() {
    // Check if at least one store is selected
    if (this.selectedStoreIds.size === 0) {
      this.error = "Please select at least one store.";
      return false;
    }

    // Save selections to state
    const storesArray = this.stores
      .filter((s) => this.selectedStoreIds.has(s.id))
      .map((s) => ({
        storeId: s.id,
        storeName: s.name,
        locationGroup: s.locationGroup
      }));

    const updateStoresFn =
      this.promotionState?.value?.updateStores ||
      this.promotionState?.updateStores;
    if (typeof updateStoresFn === "function") {
      updateStoresFn(storesArray);
    }

    this.error = null;
    return true;
  }

  /**
   * Test helpers
   */
  @api
  setStores(stores) {
    this.stores = stores.map((s) => ({
      ...s,
      isSelected: this.selectedStoreIds.has(s.id)
    }));
  }

  @api
  setSelectedStores(storeIds) {
    this.selectedStoreIds = new Set(storeIds);
  }

  @api
  getSelectedStoresList() {
    return this.selectedStoresList;
  }

  @api
  getPromotionData() {
    return {
      promotionName: this.promotionName,
      products: this.selectedProducts,
      stores: this.selectedStoresList.map((s) => ({
        storeId: s.id,
        storeName: s.name,
        locationGroup: s.locationGroup
      }))
    };
  }

  @api
  getChosenStoresFromState() {
    return (
      this.promotionState?.value?.chosenStores?.value ||
      this.promotionState?.chosenStores ||
      []
    );
  }
}
