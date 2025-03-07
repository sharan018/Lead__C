import { LightningElement, track, wire,api } from 'lwc';
import sendEmail from '@salesforce/apex/SendEmailController.sendEmail';
import getEmailConversations from '@salesforce/apex/SendEmailController.getEmailConversations';


import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SendEmailComponent extends LightningElement {
    @api recordId ='a03Qy00000IxFGnIAN' ;  
    
    @track emails = [];
    @track toEmail = '';
    @track subject = '';
    @track message = '';
    connectedCallback(){
        console.log('recordId -->'+this.recordId);
    }
    
    @wire(getEmailConversations, { caseId: 'a03Qy00000IxFGnIAN' })
    wiredEmails({ error, data }) {
        if (data) {
            this.emails = data;
            console.log('this.emails  -->'+JSON.stringify(this.emails));
        } else if (error) {
            console.error('Error fetching emails:', error);
        }
    }

    handleToEmailChange(event) { this.toEmail = event.target.value; }
    handleSubjectChange(event) { this.subject = event.target.value; }
    handleMessageChange(event) { this.message = event.target.value; }

    sendEmail() {
        sendEmail({ toAddress: this.toEmail, subject: this.subject, body: this.message })
            .then(() => {
                this.showToast('Success', 'Email sent successfully', 'success');
                this.clearFields();
                return refreshApex(this.wiredEmails); // Refresh the email list after sending
            })
            .catch(error => {
                this.showToast('Error', 'Failed to send email', 'error');
                console.error(error);
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    clearFields() {
        this.toEmail = '';
        this.subject = '';
        this.message = '';
    }
}