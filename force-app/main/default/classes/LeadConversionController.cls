Global with sharing class LeadConversionController {
  
    @AuraEnabled(cacheable=true)
public static List<Lead__c> getLeadInformation(Id recordId) {
    try {
        List<Lead__c> IsLead = [SELECT Id, Company__c, Name, Owner.Name,status__c FROM Lead__c WHERE Id = :recordId];
        return IsLead;
    } catch (Exception e) {
        System.debug('Error in getLeadInformation: ' + e.getMessage());
        return new List<Lead__c>(); 
    } 
}

 
//Existing Account
@AuraEnabled(cacheable=true)
public static List<Account> searchAccounts(String searchText) {
    if (String.isEmpty(searchText)) {
        return new List<Account>(); 
    }
    
    String searchKeyword = '%' + searchText + '%';
    
    List<Account> accList = [SELECT Id, Name, Phone FROM Account WHERE Name LIKE :searchKeyword];
    
    System.debug('accList -->' + accList);
    return accList;
}

@AuraEnabled(cacheable=true)
public static List<Contact> getContacts() {
    return [SELECT Id, Name FROM Contact ORDER BY Name ASC];
}
@AuraEnabled(cacheable=true)
public static List<Opportunityp__c> getrelatedOpportunity(String oppId) {
    List<Opportunityp__c> oppList = [ SELECT Id, Name, AccountId__c ,CloseDate__c,Amount__c,Owner.Name FROM Opportunityp__c  WHERE AccountId__c = :oppId];

    return oppList;
}

@AuraEnabled
public static List<Map<String, String>> getAccounts() {
    List<Map<String, String>> accounts = new List<Map<String, String>>();
    for (Account a : [SELECT Id, Name,(select Id,Name from Opportunities) FROM Account]) {
        accounts.add(
            new Map<String, String>{ 'label' => a.Name, 'value' => a.Id }
        );
    }
    return accounts;
}
@AuraEnabled(cacheable=true)
public static List<Contact> getRelatedContactCount(Id accId){
    try {

        List<Contact>  conCount =[Select Id,Name from contact where AccountId =:accId];
        
        return conCount;
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

@AuraEnabled
public static void convertCustomLead(Id leadId,String dontcreateOpp) {
    String getmessage =dontcreateOpp;
    System.debug('getmessage -->'+getmessage);
    SYstem.debug('leadId -->'+leadId);
    try {

               Lead__c customLead = [SELECT Name, Email__c, Phone__c, Company__c FROM Lead__c WHERE Id = :leadId];
                       System.debug('customLead -->' + customLead);

                       List<Account> accList = new List<Account>();

                                  Account acc =new Account();
                                 acc.Name =customLead.Company__c;
                                      accList.add(acc);

                                    if (!accList.isEmpty()) {
                                      insert accList; 
                                              }

                             System.debug('id -->' + accList[0].Id);
      

                     List<Contact> conList =new List<Contact>();       
                      Contact newContact = new Contact();
                      newContact.FirstName = customLead.Name; 
                      newContact.LastName = customLead.Name;
                      newContact.Phone = customLead.Phone__c;
                      newContact.Email = customLead.Email__C;
                      newContact.AccountId=accList[0].Id;
                      conList.add(newContact);
                  if(!conList.isEmpty()){
         insert conList;
         }
         System.debug('Created Contact --> ' + conList);

         //Create an Opportunity
         List<Opportunityp__c> OppList =new List<Opportunityp__c>();
         if(getmessage == null){
         
         Opportunityp__c newOpportunity = new Opportunityp__c();
         newOpportunity.Name = customLead.Company__c + ' Deal';
         newOpportunity.Stage__c = 'Prospecting'; 
         newOpportunity.CloseDate__c = Date.today().addMonths(1); 
         newOpportunity.AccountId__c = accList[0].Id;
         newOpportunity.Contact__c =conList[0].Id;
         OppList.add(newOpportunity);
         }
         if(!OppList.isEmpty()){
         insert OppList;
         }
        
        //  customLead.status__c='Closed - Converted';
         delete customLead;
         System.debug('customLead --> ' + customLead);

         System.debug('Lead converted successfully!');

       
    } catch (Exception e) {
        System.debug('Error in converting Custom Lead: ' + e.getMessage());
    }
}
}