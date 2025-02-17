public with sharing class ContactAccountController {

    // Method to get contacts with their associated account names based on search keyword
    @AuraEnabled(cacheable=true)
    public static List<ContactAccountWrapper> getContactsWithAccount(String searchKey) {
        List<ContactAccountWrapper> contactAccountList = new List<ContactAccountWrapper>();

        // Query Contacts that have Account and match the search keyword
        List<Contact> contacts = [SELECT Id, Name, Account.Name
                                  FROM Contact 
                                  WHERE Name LIKE :('%' + searchKey + '%') 
                                  AND AccountId != null 
                                  LIMIT 10];

        // Iterate over contacts and prepare the wrapper list
        for (Contact c : contacts) {
            contactAccountList.add(new ContactAccountWrapper(
                c.Id, 
                c.Name, 
                c.Account.Name
            ));
        }

        return contactAccountList;
    }

    // Wrapper class to send contact and account details to the LWC
    public class ContactAccountWrapper {
        @AuraEnabled public String contactId { get; set; }
        @AuraEnabled public String contactName { get; set; }
        @AuraEnabled public String accountName { get; set; }

        public ContactAccountWrapper(String contactId, String contactName, String accountName) {
            this.contactId = contactId;
            this.contactName = contactName;
            this.accountName = accountName;
        }
    }
}
