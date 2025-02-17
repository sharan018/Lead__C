public with sharing class SearchableComboboxController {
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
    @AuraEnabled
    public static List<Map<String, String>> getContactsWithRelatedAccounts() {
        List<Map<String, String>> contacts = new List<Map<String, String>>();
        for (Contact a : [SELECT Id, Name,Account.Name,AccountId FROM contact ]) {
            contacts.add(
                new Map<String, String>{ 'label' => a.Name, 'value' => a.Id }
            );
        }
        return contacts;
    }

  /*  @AuraEnabled
    public static List<Map<String, String>> getContacts() {
        List<Map<String, String>> contactsWithAccounts = new List<Map<String, String>>();
        
        // Query Contacts with their related Account names
        for (Contact c : [SELECT Id, Name, Account.Name,AccountId FROM Contact]) {
            String displayLabel = c.Name;
            if (c.Account != null) {
                displayLabel += ' - ' + c.Account.Name;  // Append Account name
            }
            
            contactsWithAccounts.add(
                new Map<String, String>{ 'label' => displayLabel, 'value' => c.Id }
            );
        }
        
        return contactsWithAccounts;
    }*/
    @AuraEnabled
public static List<Map<String, String>> getContacts() {
    List<Map<String, String>> contactsWithAccounts = new List<Map<String, String>>();
    
    for (Contact c : [SELECT Id, Name, Account.Name, AccountId FROM Contact]) {
        String displayLabel = c.Name;
        
        if (c.Account != null) {
            displayLabel += ' - ' + c.Account.Name; 
        }
        
        Map<String, String> contactMap = new Map<String, String>();
        contactMap.put('label', displayLabel);  
        contactMap.put('value', c.Id);        
        contactMap.put('accountId', c.AccountId); 
        
        contactsWithAccounts.add(contactMap);
    }
    
    return contactsWithAccounts;
}

    @AuraEnabled
       public static List<Map<String, String>> getContactstwo() {
        List<Map<String, String>> contactsWithAccounts = new List<Map<String, String>>();
        
        // Query Contacts with their related Account names
        for (Contact c : [SELECT Id, Name, Account.Name FROM Contact]) {
            String displayLabel = c.Name;
            
            // Only append account name if it exists, with a newline
            if (c.Account != null && c.Account.Name != null) {
                displayLabel += '\n' + c.Account.Name;  // Add line break between Contact and Account
            }
            
            contactsWithAccounts.add(
                new Map<String, String>{ 'label' => displayLabel, 'value' => c.Id }
            );
        }
        
        return contactsWithAccounts;
    }


    //account and contact
    
}