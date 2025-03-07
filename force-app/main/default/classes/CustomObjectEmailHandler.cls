global  with sharing class  CustomObjectEmailHandler implements Messaging.InboundEmailHandler {
    global Messaging.InboundEmailResult handleInboundEmail(Messaging.InboundEmail email, Messaging.InboundEnvelope envelope) {
        Messaging.InboundEmailResult result = new Messaging.InboundEmailResult();

        try {
            String emailSubject = email.subject != null ? email.subject : '';
             System.debug('emailSubject -->'+emailSubject);
            Pattern casePattern = Pattern.compile('\\[Case:\\s*(\\d{8})\\]');
             System.debug('casePattern -->'+casePattern);
           


            Matcher matcher = casePattern.matcher(emailSubject);
 System.debug('matcher -->'+matcher);
            if (matcher.find()) {
                //  Extract case number from subject
                String caseNumber = matcher.group(1);
 System.debug('caseNumber -->'+caseNumber);
                //  Query for existing case
                List<Casep__c> existingCases = [SELECT Id FROM Casep__c WHERE CaseNumber__c = :caseNumber LIMIT 1];
 System.debug('existingCases -->'+existingCases);
                if (!existingCases.isEmpty()) {
                    //  Existing case found: Create EmailMessage linked to it
                    EmailMessage emailMsg = new EmailMessage();
                    emailMsg.CasepId__c = existingCases[0].Id;
                    emailMsg.Subject = email.subject;
                    emailMsg.TextBody = email.plainTextBody;
                    emailMsg.FromAddress = email.fromAddress;
                    emailMsg.Incoming = true;
                    insert emailMsg;
                    
                    //EmailMessage__c
                     EmailMessage__c emailMess = new EmailMessage__c();
                    emailMess.CasepId__c = existingCases[0].Id;
                    emailMess.Subject__c = email.subject;
                    emailMess.TextBody__c = email.plainTextBody;
                    emailMess.FromAddress__c = email.fromAddress;
                    emailMess.Incoming__c = true;
                    insert emailMess;


                    result.success = true;
                    return result; //  Stop further processing
                } else {
                    System.debug('No matching case found for number: ' + caseNumber);
                }
            }

            // Create new case if no case number was found or no match
            Casep__c newCase = new Casep__c(
                Subject__c = email.subject,
                Description__c = email.plainTextBody,
                Origin__c = 'Email',
                SuppliedEmail__c = envelope.fromAddress,
                SuppliedName__c = email.fromName,
                Status__c ='New',
                Name=email.subject
            );
            insert newCase;

            result.success = true;

        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            result.success = false;
        }

        return result;
    }
}