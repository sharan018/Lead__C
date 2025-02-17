import { LightningElement,track, wire,api } from 'lwc';
import getLeadInformation from '@salesforce/apex/LeadConversionController.getLeadInformation';
import searchAccounts from '@salesforce/apex/LeadConversionController.searchAccounts';
import getContacts from '@salesforce/apex/LeadConversionController.getContacts';
import convertCustomLead from '@salesforce/apex/LeadConversionController.convertCustomLead';
import getAccounts from "@salesforce/apex/SearchableComboboxController.getAccounts";
import NAME_FIELD from '@salesforce/schema/Lead__c.Name';
import SALUTATION_FIELD from '@salesforce/schema/Lead__c.Salutation__c';
import getrelatedOpportunity from '@salesforce/apex/LeadConversionController.getrelatedOpportunity';



export default class LeadConversionPopup extends LightningElement {
    nameField = NAME_FIELD;
    SALUTATION_FIELD = SALUTATION_FIELD;

    @api recordId;
    @api objectApiName;
   // @api recordId ; 
    lead;
    @track getLeadId;
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
    @track NewAccountchecked =false;
    @track ExsistingAccountAccountchecked =false;
    @track ExistingContactChekeded =false;
    @track NewContactChekeded =false;
    @track ExistingOppotunityChekeded =false;
    @track NewOppotunityChekeded =false;
    @track tatalopp;
    @track dataFromChild =[];
     @track errorMessage = '';  
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
handleConvertLead(){
    
    alert('handleConvertLead -->');
    
    console.log('selectedSearchResult99999  ==>'+JSON.stringify(this.selectedSearchResult.value));
    console.log('dataFromChild9999  ==>'+JSON.stringify(this.dataFromChild.accountId));
    console.log('recordId -->'+this.recordId);
    this.getLeadId =this.recordId;
    if(this.selectedSearchResult.value == this.dataFromChild.accountId){
        
    }
    else if(this.selectedSearchResult.value != this.dataFromChild.accountId){
        this.errorMessage = 'Specified Contact must be parented by specified Account'; 
    }
    else{
    convertCustomLead({leadId : this.getLeadId})
    .then(result =>{

       console.log('result -->'+JSON.stringify(result));
      
    })
    .catch(error =>{
    console.log(error);
    })
}
  
  
}
handleAccountRadioChange(event){
     this.AccountRadioChange = event.target.value;
     console.log('this.AccountRadioChange -->'+this.AccountRadioChange);
     this.NewAccountchecked = true;
   

        this.ExsistingAccountAccountchecked = false; 
    
}

handleExistingAccountRadioChange(event){
    this.getExistingValue = this.selectedAccValue;
    console.log('this.getExistingValue -->'+this.getExistingValue);
    // this.AccountRadioChange =' ';
    this.ExsistingAccountAccountchecked =true;
    console.log('this.ExsistingAccountAccountchecked -->'+this.ExsistingAccountAccountchecked);

    // if (this.ExsistingAccountAccountchecked == true) {
        this.NewAccountchecked = false; 
        console.log('this.accountNameChecked -->'+this.NewAccountchecked);
    // }
   // this.existingAccountChecked = event.target.checked; // Set the state of the first checkbox

}
handleNewContactRadioChange(event){
  //  alert('handleNewContactRadioChange');
    this.NewContactChekeded = true;
    console.log('NewContactChekeded -->'+this.NewContactChekeded);
       this.ExistingContactChekeded = false; 
       console.log('ExistingContactChekeded -->'+this.ExistingContactChekeded);
}

handleExistingContactRadioChange(event){
    //this.AccountRadioChange = event.target.value;
   // console.log('this.AccountRadioChange -->'+this.AccountRadioChange);
   this.ExistingContactChekeded = true; 
   console.log('ExistingContactChekeded222 -->'+this.ExistingContactChekeded);

    this.NewContactChekeded = false;
    console.log('NewContactChekeded2222 -->'+this.NewContactChekeded);

}
handleNewOpportunityRadioChange(event){
   
    this.NewOppotunityChekeded = true;
  

       this.ExistingOppotunityChekeded = false; 
   
}
handleExistingOpportunityRadioChange(event){
   
    this.ExistingOppotunityChekeded = true;
  

       this.NewOppotunityChekeded = false; 
   
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
}
toggleIconOpportunity() {
    this.isDownOpp = !this.isDownOpp;
    if(this.isDownOpp == true){
        this.arrowshowOpportunity =true;
    }
    else{
        this.arrowshowOpportunity =false;
    }

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
    selectedNavHandler(event) {
        alert('selectedNavHandler ');
        const playerName = event.detail;
        console.log('playerName ==>'+JSON.stringify(playerName));
        this.dataFromChild =playerName;
        // this.selectedPlayer = this.navList.find(
        //     item => item.name === playerName
        // );
    }
  
}