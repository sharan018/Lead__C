public with sharing class SendEmailController {
    @AuraEnabled
    public static void sendEmail(String toAddress, String subject, String body) {
        // Create a new SingleEmailMessage object
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        // Set the recipient's email address
        mail.setToAddresses(new List<String>{ toAddress });

        // Set the email subject
        mail.setSubject(subject);

        // Set the email body (HTML content)
        mail.setHtmlBody(body);

        // Send the email using the Messaging.sendEmail method
        Messaging.sendEmail(new List<Messaging.Email> { mail });
    }

    @AuraEnabled(cacheable=true)
    public static List<EmailMessage> getEmailConversations(Id caseId) {
        System.debug('caseId -->'+caseId);
        return [SELECT Id, Subject, FromAddress, ToAddress, HtmlBody, CreatedDate
                FROM EmailMessage
                WHERE CasepId__c = :caseId
                ORDER BY CreatedDate ASC];
    }
}