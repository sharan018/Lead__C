import { LightningElement,track,api } from 'lwc';
import getContacts from "@salesforce/apex/SearchableComboboxController.getContacts";


export default class CreaateConList extends LightningElement {
    isListening = false;
    @track childSelectedContacts =[];

    pickListOrdered;
   @track  searchResults;
    @track selectedSearchResult;

    get selectedValue() {
        return this.selectedSearchResult?.label ?? null;
    }

    connectedCallback() {
        // Call getContacts to fetch Contacts with Account names
        getContacts().then((result) => {
            this.pickListOrdered = result.sort((a, b) =>
                a.label.localeCompare(b.label)
            );
        });
        console.log('pickListOrdered ===>'+JSON.stringify(this.pickListOrdered));
    }

    renderedCallback() {
        if (this.isListening) return;

        window.addEventListener("click", (event) => {
            this.hideDropdown(event);
        });
        this.isListening = true;
    }

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
        this.childSelectedContacts =this.selectedSearchResult;
        console.log('selectedValue child component-->'+JSON.stringify(this.selectedSearchResult));
        const selectEvent = new CustomEvent('selection', {
            detail: this.childSelectedContacts
        });
        this.dispatchEvent(selectEvent); 
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