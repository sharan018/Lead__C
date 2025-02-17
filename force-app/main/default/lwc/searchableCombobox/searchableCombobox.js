import { LightningElement } from "lwc";
import getAccounts from "@salesforce/apex/SearchableComboboxController.getAccounts";

export default class SearchableCombobox extends LightningElement {
    isListening = false;

    pickListOrdered;
    searchResults;
    selectedSearchResult;

    get selectedValue() {
        return this.selectedSearchResult?.label ?? null;
    }

    connectedCallback() {
        getAccounts().then((result) => {
            this.pickListOrdered = result.sort((a, b) =>
                a.label.localeCompare(b.label)
            );
        });
    }

    renderedCallback() {
        if (this.isListening) return;

        window.addEventListener("click", (event) => {
            this.hideDropdown(event);
        });
        this.isListening = true;
    }

    /**
     * This function compares the name of the component (`cmpName`) with the name of the clicked element (`clickedElementSrcName`).
     * If the clicked element is outside the component, the dropdown (search results) is hidden by calling `clearSearchResults()`.
     *
     * - `cmpName` is the tag name of the host element of this component (e.g., 'C-SEARCHABLE-COMBOBOX').
     * - `clickedElementSrcName` is the tag name of the element that was clicked on the page.
     * - `isClickedOutside` is a boolean that is true if the clicked element is outside the component.
     */
    hideDropdown(event) {
        const cmpName = this.template.host.tagName;
        const clickedElementSrcName = event.target.tagName;
        const isClickedOutside = cmpName !== clickedElementSrcName;
        if (this.searchResults && isClickedOutside) {
            this.clearSearchResults();
        }
    }

    search(event) {
        const input = event.detail.value.toLowerCase();
        const result = this.pickListOrdered.filter((pickListOption) =>
            pickListOption.label.toLowerCase().includes(input)
        );
        this.searchResults = result;
    }

    selectSearchResult(event) {
        const selectedValue = event.currentTarget.dataset.value;
        this.selectedSearchResult = this.pickListOrdered.find(
            (pickListOption) => pickListOption.value === selectedValue
        );
        this.clearSearchResults();
    }

    clearSearchResults() {
        this.searchResults = null;
    }

    showPickListOptions() {
        if (!this.searchResults) {
            this.searchResults = this.pickListOrdered;
        }
    }
}