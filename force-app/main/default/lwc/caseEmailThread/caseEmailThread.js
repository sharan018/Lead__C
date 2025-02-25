import { LightningElement, api, wire, track } from 'lwc';
import getEmails from '@salesforce/apex/CaseEmailController.getEmails';
import sendEmailApex from '@salesforce/apex/CaseEmailController.sendEmail';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CaseEmailThread extends LightningElement {
    @api recordId; // Gets the Case__c Id from the record page
    @track emails = [];
    subject = '';
    body = '';
    toAddress = '';

    @wire(getEmails, { caseId: '$recordId' })
    wiredEmails({ data, error }) {
        if (data) {
            this.emails = data;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleBodyChange(event) {
        this.body = event.target.value;
    }

    handleToAddressChange(event) {
        this.toAddress = event.target.value;
    }

    sendEmail() {
        if (this.subject && this.body && this.toAddress) {
            sendEmailApex({ subject: this.subject, body: this.body, toAddress: this.toAddress, caseId: this.recordId })
                .then(() => {
                    this.showToast('Success', 'Email sent successfully', 'success');
                    this.clearFields();
                    return refreshApex(this.wiredEmails); // Refresh the email thread
                })
                .catch(error => {
                    this.showToast('Error', error.body.message, 'error');
                });
        } else {
            this.showToast('Warning', 'Please fill in all fields', 'warning');
        }
    }

    clearFields() {
        this.subject = '';
        this.body = '';
        this.toAddress = '';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
