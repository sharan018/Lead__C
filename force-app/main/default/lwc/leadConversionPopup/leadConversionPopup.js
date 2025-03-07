import { LightningElement,track, wire,api } from 'lwc';
import getLeadInformation from '@salesforce/apex/LeadConversionController.getLeadInformation';
import searchAccounts from '@salesforce/apex/LeadConversionController.searchAccounts';
import getContacts from '@salesforce/apex/LeadConversionController.getContacts';
import convertCustomLead from '@salesforce/apex/LeadConversionController.convertCustomLead';
import getAccounts from "@salesforce/apex/LeadConversionController.getAccounts";
import NAME_FIELD from '@salesforce/schema/Lead__c.Name';
import SALUTATION_FIELD from '@salesforce/schema/Lead__c.Salutation__c';
import getrelatedOpportunity from '@salesforce/apex/LeadConversionController.getrelatedOpportunity';
import getRelatedContactCount from '@salesforce/apex/LeadConversionController.getRelatedContactCount';
import { CloseActionScreenEvent } from 'lightning/actions';
import { NavigationMixin } from 'lightning/navigation';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';




export default class LeadConversionPopup extends NavigationMixin(LightningElement) {
    nameField = NAME_FIELD;
    SALUTATION_FIELD = SALUTATION_FIELD;
    @track closePopUp =true;
    @api recordId;
    @api objectApiName;
   // @api recordId ; 
    lead;
    @track getLeadId;
    @track isLoading = false;

    @api owner;
    @track accountName;
    @track contactName;
    @track opportunityName;
    @track LeadStatus;

    @track accountOptions = [];
    @track searchTerm;
    @track dataPresent = false;
    @track AccountList =false;
    @track searchedText;
    @track hideButton =false;

    @track contacts = [];
    selectedContact = '';
    @track isDownAccount = false;
    @track isDownContact = false;
    @track isDownOpp = false;

    isListening = false;

    pickListOrdered;
    searchResults;
    selectedSearchResult;
    @track countAccount ='0 Account Macthes';
    @track arrowclickAcc =false;
    @track arrowclickCont =false;
    @track showContactExist=true;
    @track arrowclickOpportunity =true;
    @track arrowshowOpportunity =false;
    @track countOpportunity;
    @track getSelectedAccount;
    @track AccountReletedOppList =[];
    @track PicSelected =false;
    @track NewAccountchecked =true;
    @track ExsistingAccountAccountchecked =false;
    @track ExistingContactChekeded =false;
    @track NewContactChekeded =true;
    @track ExistingOppotunityChekeded =false;
    @track NewOppotunityChekeded =true;
    @track tatalopp;
    @track dataFromChild =[];
     @track errorMessage = '';  
     @track dontCreateOpportunity;
     @track DontChekeded =false;
     @track SelectedNewaccountName;
     @track SelectedNewcontactName;
     @track SelectedNewcOpportName;
     @track countReletedContact;
     @track getEmptySelectedOpptId;
     @track recId;
    AccradioOptions = [
        { label: '', value: 'option1' },
       
    ];
    ConradioOptions = [
        { label: '', value: 'option1' },
       
    ];

    


    @wire(getLeadInformation, { recordId: '$recordId' })
    wiredLead({ error, data }) {
        if (data) {
           
           data.forEach(lead => {
            this.accountName = lead.Company__c;
            this.opportunityName = lead.Company__c;
            this.contactName = lead.Name;
            this.owner =lead.Owner.Name;
            this.LeadStatus =lead.status__c;
            console.log('Owner:', JSON.stringify(lead.Owner.Name));
            console.log('Company:', JSON.stringify(lead));
        });
        } else if (error) {
            console.error('Error fetching lead data:', error);
        }
    }

    @wire(getContacts)
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = data.map(contact => ({
                label: contact.Name,
                value: contact.Id
            }));
        } else if (error) {
            console.error('Error fetching contacts:', error);
        }
    }

   //Existing Accounts 

   handleSearch(event){
    this.searchTerm = event.target.value;
    console.log('searchItem' +this.searchTerm);

    searchAccounts({searchText :this.searchTerm})
    .then(result =>{
        this.accountOptions = result.map(account => ({
            label: account.Name,
            value: account.Id
        }));
        this.AccountList=true;
        this.hideButton=true;
        console.log('accountOptions -->'+JSON.stringify(this.accountOptions));
    })
    .catch(error =>{
        console.log(error);
    })
}

handleClick(event){

  var getData =event.target.value;
  console.log('getData -->'+JSON.stringify(getData));
  this.searchedText =getData.label;
  console.log('searchedText -->'+JSON.stringify(this.searchedText));
 this.hideButton=false;
}

//Convert Lead
handleConvertLead(event){
    
  //  alert('handleConvertLead -->');
   
    //console.log('recId  after-->');
    console.log('this.NewOppotunityChekeded -->'+this.NewOppotunityChekeded);
    console.log('this.NewContactChekeded -->'+this.NewContactChekeded);
    console.log('this.NewAccountchecked -->'+this.NewAccountchecked);
   // console.log('selectedSearchResult99999  ==>'+JSON.stringify(this.selectedSearchResult.value));
    //console.log('dataFromChild9999  ==>'+JSON.stringify(this.dataFromChild.accountId));
    console.log('recordId -->'+this.recordId);
    console.log('this.selectedAccValue -->'+this.selectedAccValue);
    console.log('this.dataFromChild -->'+this.dataFromChild);
    console.log('this.selectedOpptId -->'+this.selectedOpptId);
    this.getLeadId =this.recordId;
    // if(this.NewContactChekeded ==true && this.NewAccountchecked ==true  && this.NewOppotunityChekeded ==true ||this.DontChekeded ==true ){
    this.forNewConversion();
    // }
    // else if(this.ExistingOppotunityChekeded == true && this.ExistingContactChekeded ==true && this.ExsistingAccountAccountchecked ==true ){
   this.forExistingConversion();
    // }
  






}
forNewConversion(){
    if(this.NewContactChekeded ==true && this.NewAccountchecked ==true  && this.NewOppotunityChekeded ==true ||this.DontChekeded ==true ){

        this.isLoading = true;
        
        // Stop spinner after 2 seconds
        setTimeout(() => {
            this.isLoading = false;
        }, 90000);
        console.log('inside forNewConversion');
        console.log('SelectedNewcOpportName' + this.SelectedNewcOpportName);
        console.log('SelectedNewcontactName' + this.SelectedNewcontactName);
        console.log('SelectedNewaccountName' + this.SelectedNewaccountName);
        // if(this.SelectedNewcOpportName && this.SelectedNewcontactName && this.SelectedNewaccountName){
            this.ExsistingAccountAccountchecked =false;
            this.ExistingContactChekeded =false;
            this.ExistingOppotunityChekeded =false;
            this.closePopUp =true;
            this.dispatchEvent(new CloseActionScreenEvent());

    console.log('closePopUp -->'+this.dontCreateOpportunity);
        console.log('this.getLeadId 123'+this.getLeadId);
        //this.errorMessage =false;

    convertCustomLead({leadId : this.getLeadId,
                       dontcreateOpp :this.dontCreateOpportunity
    })   
    .then(result =>{
       
       console.log('result -->'+JSON.stringify(result));
        this.recId = result;
         
        if (result && result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                let contactId = result[i].Id; 
               
               
                console.log('Navigating to Contact ID: ' + contactId);
                let contactUrl = ` https://powerhs-f-dev-ed.develop.lightning.force.com/lightning/r/Contact/${contactId}/view`;
                
                window.location.href = contactUrl;
                // this[NavigationMixin.Navigate]({
                //     type: 'standard__recordPage',
                //     attributes: {
                //         recordId: contactId,
                //         actionName: 'view'
                //     },
                // });
              
            }
        }
            else {
            console.error('No Contact ID found in the result.');
        }
       
   
    
    })
    .catch(error =>{
    console.log(error);
    })
    const evt = new ShowToastEvent({
        title: 'Toast Notification Success',
        message: 'Lead Conversion completed successfully',
        variant: 'success',
        mode: 'dismissable'
    });
    this.dispatchEvent(evt);
    
// }
}
}
forExistingConversion(){
    if(this.ExistingOppotunityChekeded == true && this.ExistingContactChekeded ==true && this.ExsistingAccountAccountchecked ==true ){
    if(this.selectedOpptId ==null){
    const evt = new ShowToastEvent({
                title: 'Existing Opportunity',
                message: 'Please select Releted Opportunity',
                variant: 'warning',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
        }
    }
        console.log(' this.dataFromChild --->'+JSON.stringify(this.dataFromChild));
            if(this.selectedSearchResult.value != this.dataFromChild.accountId && this.dataFromChild.length != 0){
                console.log('inside 6th if');
                this.errorMessage = 'Specified Contact must be parented by specified Account'; 
            }
            if (!this.dataFromChild || this.dataFromChild.length === 0) {
                console.log('dataFromChild is either null, undefined, or empty');
                const evt = new ShowToastEvent({
                    title: 'Existing Contact',
                    message: 'Please select Releted Contact',
                    variant: 'warning',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
            }

 if(this.selectedOpptId && this.dataFromChild && this.selectedAccValue && this.ExistingOppotunityChekeded == true && this.ExistingContactChekeded ==true && this.ExsistingAccountAccountchecked ==true && this.selectedSearchResult.value == this.dataFromChild.accountId){
                console.log('inside 7th if'+ this.selectedAccValue);;
               console.log('dataFromChild-->'+JSON.stringify(this.dataFromChild.value));
                this.ExistingOppotunityChekeded =true;
                this.ExistingContactChekeded =true;
                this.ExsistingAccountAccountchecked =true;
            
                
                    let contactId = this.dataFromChild.value
                   
                    console.log('Navigating to Contact ID: ' + contactId);
                    let contactUrl = ` https://powerhs-f-dev-ed.develop.lightning.force.com/lightning/r/Contact/${contactId}/view`;
                    
            
                    window.location.href = contactUrl;
                
                //this.closePopUp =false;
                this.isLoading = true;
        
                // Stop spinner after 2 seconds
                setTimeout(() => {
                    this.isLoading = false;
                }, 5000);
                  
                this.errorMessage =false;
                const evt = new ShowToastEvent({
                    title: 'Toast Notification Success',
                    message: 'Lead Conversion completed successfully',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
              
            }
         



   
}

handleInputChange(event){
    this.SelectedNewaccountName =event.target.value;
    console.log('SelectedNewaccountName in new222'+this.SelectedNewaccountName);
}
handleContactInputChange(event){
    this.SelectedNewcontactName =event.target.value;
    console.log('SelectedNewcontactName in new222'+this.SelectedNewcontactName);
}
handleOppInputChange(event){
    this.SelectedNewcOpportName =event.target.value;
    console.log('SelectedNewcOpportName in new222'+this.SelectedNewcOpportName);
}
handleAccountRadioChange(event){
    this.AccountRadioChange = event.target.value;
    console.log('this.AccountRadioChange -->'+this.AccountRadioChange);
    this.NewAccountchecked = true;
    this.NewContactChekeded =true;
    this.NewOppotunityChekeded =true;
    this.ExistingOppotunityChekeded =false;
    this.ExistingContactChekeded =false;
    this.ExsistingAccountAccountchecked =false;
   
}

handleExistingAccountRadioChange(event){
    
    
    const evt = new ShowToastEvent({
                title: 'Choose Existing Records',
                message: 'please select Existing Account,Contact and Opportunities',
                variant: 'warning',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
        
    this.getExistingValue = this.selectedAccValue;
    console.log('this.getExistingValue -->'+this.getExistingValue);
    // this.AccountRadioChange =' ';
    this.ExsistingAccountAccountchecked =true;
    this.ExistingContactChekeded =true;
    this.ExistingOppotunityChekeded =true;
    console.log('this.ExsistingAccountAccountchecked -->'+this.ExsistingAccountAccountchecked);

    // if (this.ExsistingAccountAccountchecked == true) {
        this.NewAccountchecked = false; 
        this.NewContactChekeded =false;
        this.NewOppotunityChekeded =false;
        console.log('this.accountNameChecked -->'+this.NewAccountchecked);
    // }
   // this.existingAccountChecked = event.target.checked; // Set the state of the first checkbox

}
handleNewContactRadioChange(event){
  //  alert('handleNewContactRadioChange');
  this.NewAccountchecked = true;
  this.NewContactChekeded =true;
  this.NewOppotunityChekeded =true;
    console.log('NewContactChekeded -->'+this.NewContactChekeded);
    this.ExistingOppotunityChekeded =false;
    this.ExistingContactChekeded =false;
    this.ExsistingAccountAccountchecked =false;
       console.log('ExistingContactChekeded -->'+this.ExistingContactChekeded);
}

handleExistingContactRadioChange(event){
    //this.AccountRadioChange = event.target.value;
   // console.log('this.AccountRadioChange -->'+this.AccountRadioChange);
   this.ExistingOppotunityChekeded = true; 
   this.ExistingContactChekeded =true;
   this.ExsistingAccountAccountchecked =true;
   console.log('ExistingContactChekeded222 -->'+this.ExistingContactChekeded);

    this.NewAccountchecked = false; 
        this.NewContactChekeded =false;
        this.NewOppotunityChekeded =false;
    console.log('NewContactChekeded2222 -->'+this.NewContactChekeded);

}
handleNewOpportunityRadioChange(event){
   
    this.NewAccountchecked = true;
    this.NewContactChekeded =true;
    this.NewOppotunityChekeded =true;    
    this.DontChekeded=false;

     //  this.ExistingOppotunityChekeded = false; 
       this.ExistingOppotunityChekeded =false;
       this.ExistingContactChekeded =false;
       this.ExsistingAccountAccountchecked =false;
   
}
handleExistingOpportunityRadioChange(event){
   
    this.ExistingOppotunityChekeded = true;
    his.ExistingContactChekeded =true;
    this.ExsistingAccountAccountchecked =true;

       this.NewOppotunityChekeded = false; 
       this.NewAccountchecked = false; 
        this.NewContactChekeded =false;
   
}

handleContactRadioChange(event){
    this.ContactRadioChange = event.detail.value;
}
get currentIconAccount() {
    return this.isDownAccount ? 'utility:chevrondown' : 'utility:chevronright';
}
get currentIconCotact() {
    return this.isDownContact ? 'utility:chevrondown' : 'utility:chevronright';
}
get currentIconOpp() {
    return this.isDownOpp ? 'utility:chevrondown' : 'utility:chevronright';
}

toggleIconAccount() {
    this.isDownAccount = !this.isDownAccount;
    //console.log('arrow -->'+this.isDownAccount);
    if(this.isDownAccount == true){
    this.arrowclickAcc =true;
    }else{
        this.arrowclickAcc =false;
    }
    this.isLoading = true;
        
    // Stop spinner after 2 seconds
    setTimeout(() => {
        this.isLoading = false;
    }, 1000);
}
toggleIconConatact() {
    this.isDownContact = !this.isDownContact;
    if(this.isDownContact == true){
        this.arrowclickCont =true;
        this.showContactExist =false;
        }else{
            this.arrowclickCont =false;
            this.showContactExist =true;
        }
        this.isLoading = true;
        
        // Stop spinner after 2 seconds
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
}
toggleIconOpportunity() {
    this.isDownOpp = !this.isDownOpp;
    if(this.isDownOpp == true){
        this.arrowshowOpportunity =true;
    }
    else{
        this.arrowshowOpportunity =false;
    }
    this.isLoading = true;
        
    // Stop spinner after 2 seconds
    setTimeout(() => {
        this.isLoading = false;
    }, 1000);

}

//accounts

    get selectedValue() {
        return this.selectedSearchResult?.label ?? null;
    }

    connectedCallback() {
        getAccounts()
        .then((result) => {
            this.pickListOrdered = result.sort((a, b) =>
                a.label.localeCompare(b.label)
            );
            console.log('pickListOrdered --->'+JSON.stringify(this.pickListOrdered));
        });
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
        var getSelectedValue =event.target.value;
        console.log('getSelectedValue -->'+getSelectedValue);
        const input = event.detail.value.toLowerCase();
        console.log('input --->'+input);
        const result = this.pickListOrdered.filter((pickListOption) =>
            pickListOption.label.toLowerCase().includes(input)
        );
        this.searchResults = result;
        if (input === '') {
            console.log('Input cleared');
            this.countAccount ='0 Account Macthes';
        }
    }

   
    selectSearchResult(event) {
        const selectedValue = event.currentTarget.dataset.value;
        this.getSelectedAccount =selectedValue;
        console.log('selectedValue2222222222222 -->'+selectedValue);
        
        var getSelectedValue =event.currentTarget.dataset.label;
        this.selectedAccValue =getSelectedValue;
         console.log('getSelectedValue832873278 -->'+getSelectedValue);
        this.selectedSearchResult = this.pickListOrdered.find(
            (pickListOption) => pickListOption.value === selectedValue
        );
        console.log('selectedSearchResult3333 -->'+JSON.stringify(this.selectedSearchResult));
        let getcountofvalues = parseInt(selectedValue, 10); 
        console.log('getcountofvalues'+getcountofvalues);
        this.countAccount =getcountofvalues +'  Account Maches';
        this.clearSearchResults();
        this.getRelatedOpportunities();
        this.getReletedContactCount();
    }

    clearSearchResults() {
        this.searchResults = null;
    }

    showPickListOptions() {
        if (!this.searchResults) {
            this.searchResults = this.pickListOrdered;
        }
    }
    getRelatedOpportunities(){
        getrelatedOpportunity({oppId :this.getSelectedAccount})
        .then(result=>{
          console.log('result -->'+JSON.stringify(result));
          this.AccountReletedOppList =result;
          let getcountofvalues = parseInt(result, 10); 
          console.log('oppocount --'+JSON.stringify(this.AccountReletedOppList.length));
          this.tatalopp =this.AccountReletedOppList.length +' Opportunitie Macthes';
          this.AccountReletedOppList = result.map(Opportunity__c => ({
            label: Opportunity__c.Name, 
            value: Opportunity__c.Id 
        }));
       
        })
        .catch(error=>{

        })
    }
    handleEditRowSelection(event){
        console.log('handleEditRowSelection -->'+event.target.value);
        var getCheckedValue =event.target.value; 
        console.log('this.PicSelected =>'+this.PicSelected);
        const dataId = event.target.dataset.id;
        console.log('Selected row data-id: ', dataId);
        // if(getCheckedValue != getCheckedValue){
            
        // }

    }
    onChangeOppourtunity(event){
       this.selectedOpptId= event.target.value;
       this.getEmptySelectedOpptId =event.target.value;
       var datset =event.target.dataset.value;
       console.log('datset: '+JSON.stringify(datset));
        console.log('Selected row data-id opoopoppp: '+JSON.stringify(this.selectedOpptId));
    }
    selectedNavHandler(event) {
      //  alert('selectedNavHandler ');
        const playerName = event.detail;
        console.log('playerName ==>'+JSON.stringify(playerName));
        this.dataFromChild =playerName;
        // this.selectedPlayer = this.navList.find(
        //     item => item.name === playerName
        // );
    }
    handleDontCreateOpportunityRadioChange(){
      //  alert('handleDontCreateOpportunityRadioChange');
        console.log('DontChekeded -->'+this.DontChekeded);
        this.DontChekeded =true;
        this.NewOppotunityChekeded =false;
        if(this.DontChekeded ==true){
            this.dontCreateOpportunity ='dontCreateOpportunity';
        }
    }
    getReletedContactCount(){
       // alert('inside');
        getRelatedContactCount({
            accId :this.getSelectedAccount
        })
        .then(result=>{
     this.countReletedContact =result.length +' Contact Matches';
        })
        .catch(error =>{

        })
    }
    handleCancel(){
        this.closePopUp =false;
        this.dispatchEvent(new CloseActionScreenEvent());

    }
  
}