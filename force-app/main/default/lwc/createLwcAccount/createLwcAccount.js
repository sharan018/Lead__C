import { LightningElement,wire,track } from 'lwc';
import getContactsWithAccount from '@salesforce/apex/ContactAccountController.getContactsWithAccount';

export default class CreateLwcAccount extends LightningElement 

{
    get selectedContactValue() {
        return this.selectedContactSearchResult?.label ?? null;
    }

    getContactSerachlists(){
        getContactsWithRelatedAccounts()
        .then((result) => {
            this.contactpickListOrdered = result.sort((a, b) =>
                a.label.localeCompare(b.label)
            );
            console.log('reultt333--->'+JSON.stringify(result));
        });
    }
    handlehiding(){
        if (this.iscontactListing) return;

        window.addEventListener("click", (event) => {
            this.hideContactDropdown(event);
        });
        this.iscontactListing = true;
    }
    hideContactDropdown(event) {
        const cmpName = this.template.host.tagName;
        const clickedElementSrcName = event.target.tagName;
        const isClickedOutside = cmpName !== clickedElementSrcName;
        if (this.searchContactResults && isClickedOutside) {
            this.clearContactSearchResults();
        }
    }
    clearContactSearchResults() {
        this.searchContactResults = null;
    }
    selectSearchResult(event) {
        const selectedContactValue = event.currentTarget.dataset.value;
        this.selectedContactSearchResult = this.pickListOrdered.find(
            (pickListOption) => pickListOption.value === selectedContactValue
        );
        this.clearContactSearchResults();
    }
    searchContacts(event) {
        const input = event.detail.value.toLowerCase();
        const result = this.contactpickListOrdered.filter((pickListOption) =>
            pickListOption.label.toLowerCase().includes(input)
        );
        this.searchContactResults = result;
    }
    showContactPickListOptions() {
        if (!this.searchContactResults) {
            this.searchContactResults = this.contactpickListOrdered;
        }
    }
}