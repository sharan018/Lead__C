public with sharing class CaseEmailController {

    
    @AuraEnabled(cacheable=true)
    public static List<EmailMessage> getEmails(Id caseId) {
        return [SELECT Id, Subject, FromAddress, ToAddress, TextBody, CreatedDate 
                FROM EmailMessage 
                WHERE ParentId = :caseId 
                ORDER BY CreatedDate ASC];
    }

    @AuraEnabled
    public static void sendEmail(String subject, String body, String toAddress, Id caseId) {
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setSubject(subject);
        email.setPlainTextBody(body);
        email.setToAddresses(new String[] { toAddress });
        email.setTargetObjectId(UserInfo.getUserId());
        email.setSaveAsActivity(true);

        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });

        // Optional: Create an EmailMessage record linked to the Case__c
        EmailMessage em = new EmailMessage(
            ParentId = caseId,
            Subject = subject,
            ToAddress = toAddress,
            TextBody = body,
            FromAddress = UserInfo.getUserEmail(),
            Status = 'Sent'
        );
        insert em;
    }
}
