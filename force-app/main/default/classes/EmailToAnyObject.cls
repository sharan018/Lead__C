public with sharing class EmailToAnyObject implements Messaging.InboundEmailHandler {
    /**
     * @description This method processes inbound emails, associates them with an Casep__c record, handles attachments, and notifies the record owner via email and custom notifications.
     * @param email
     * @param envelope
     * @return Messaging.InboundEmailResult
     */
    public Messaging.InboundEmailResult handleInboundEmail(Messaging.InboundEmail email, Messaging.InboundEnvelope envelope) {
        Messaging.InboundEmailResult result = new Messaging.InboundEmailresult();
        
        String[] referencesList = email.references;
        EmailMessage emailMsgRecord;
        Casep__c appRecord;

        try {
            String emailSubject = email.subject != null ? email.subject : '';
            System.debug('emailSubject -->' + emailSubject);
            
            Pattern casePattern = Pattern.compile('\\[Case:\\s*(\\d{8})\\]');
            System.debug('casePattern -->' + casePattern);

            Matcher matcher = casePattern.matcher(emailSubject);
            System.debug('matcher -->' + matcher);

            if (matcher.find()) {
                // Extract case number from subject
                String caseNumber = matcher.group(1);
                System.debug('caseNumber -->' + caseNumber);
                
                // Query for existing case
                List<Casep__c> existingCases = [SELECT Id FROM Casep__c WHERE CaseNumber__c = :caseNumber LIMIT 1];
                System.debug('existingCases -->' + existingCases);
                
                if (!existingCases.isEmpty()) {
                    // Existing case found: Create EmailMessage linked to it
                    EmailMessage emailMsg = new EmailMessage();
                    emailMsg.CasepId__c = existingCases[0].Id;
                    emailMsg.Subject = email.subject;
                    emailMsg.TextBody = email.plainTextBody;
                    emailMsg.FromAddress = email.fromAddress;
                     emailMsg.RelatedToId = existingCases[0].Id;
                    emailMsg.Incoming = true;
                    insert emailMsg;
                    
                    // EmailMessage__c
                    EmailMessage__c emailMess = new EmailMessage__c();
                    emailMess.CasepId__c = existingCases[0].Id;
                    emailMess.Subject__c = email.subject;
                    emailMess.TextBody__c = email.plainTextBody;
                    emailMess.FromAddress__c = email.fromAddress;
                    emailMess.Incoming__c = true;
                    insert emailMess;

                    result.success = true;
                    return result; // Stop further processing
                } else {
                    System.debug('No matching case found for number: ' + caseNumber);
                }
            }

            // Create new case if no case number was found or no match
String senderEmail = extractActualEmail(email.fromAddress); 
            Casep__c newCase = new Casep__c(
                Subject__c = email.subject,
                Description__c = email.plainTextBody,
                Origin__c = 'Email',
                SuppliedEmail__c = senderEmail,
                SuppliedName__c = email.fromName,
                Status__c = 'New',
                Name = email.subject
            );
            insert newCase;
            appRecord = newCase;

            // Fetch EmailMessage record if accessible
            if (EmailMessage.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).isAccessible() &&
                Schema.SObjectType.EmailMessage.fields.id.isAccessible() &&
                Schema.SObjectType.EmailMessage.fields.relatedToId.isAccessible() &&
                Schema.SObjectType.EmailMessage.fields.MessageIdentifier.isAccessible()) {
                
                emailMsgRecord = [SELECT id, relatedToId FROM EmailMessage WHERE MessageIdentifier = :referencesList[0] WITH USER_MODE LIMIT 1];
                appRecord = [SELECT Id, Name, OwnerId FROM Casep__c WHERE Id = :emailMsgRecord.RelatedToId WITH USER_MODE LIMIT 1];
            }

            // Attach binary files to case
            if (email.binaryAttachments != null) {
                for (Messaging.InboundEmail.BinaryAttachment attachment : email.binaryAttachments) {
                    ContentVersion cv = new ContentVersion();
                    cv.VersionData = attachment.body;
                    cv.Title = attachment.fileName;
                    cv.PathOnClient = attachment.fileName;
                    insert cv;

                    ContentDocumentLink contentDocumentLink = new ContentDocumentLink();
                    contentDocumentLink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
                    contentDocumentLink.LinkedEntityId = appRecord.Id;
                    contentDocumentLink.ShareType = 'I';
                    contentDocumentLink.Visibility = 'AllUsers';
                    insert contentDocumentLink;
                }
            }

            EmailMessage appEmailMessage = appEmailMsg(email, appRecord);

            if (Schema.sObjectType.Casep__c.isAccessible() && Schema.sObjectType.Casep__c.isUpdateable()) {
                update appRecord;
            }
            if (Schema.sObjectType.EmailMessage.isAccessible() && Schema.sObjectType.EmailMessage.isCreateable()) {
                insert appEmailMessage;
            }

            // Add Email Message Relation
            EmailMessageRelation emr = new EmailMessageRelation();
            emr.EmailMessageId = appEmailMessage.id;
            emr.RelationAddress = email.fromAddress;
            emr.RelationType = 'FromAddress';
            if (Schema.sObjectType.EmailMessageRelation.isAccessible() && Schema.sObjectType.EmailMessageRelation.isCreateable()) {
                insert emr;
            }

            // Send email notification to record owner
            OrgWideEmailAddress orgWideEmail = [SELECT Id FROM OrgWideEmailAddress WHERE Address = 'sharanu.hiremath018@outlook.com'];
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setOrgWideEmailAddressId(orgWideEmail.Id);
            mail.setToAddresses(new String[] { appRecord.OwnerId });
            mail.setSubject(email.Subject);
            mail.setHtmlBody('An email message related to app record ' + appRecord.Name + ' has been created.' + email.htmlBody);
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

            // Send custom notification to record owner
            CustomNotificationType notificationType = 
                [SELECT Id FROM CustomNotificationType WHERE DeveloperName = 'Email_Notification'];
            Messaging.CustomNotification notification = new Messaging.CustomNotification();
            notification.setTitle('Customer Reply Notification');
            notification.setBody('Customer replied to App: ' + appRecord.Name);
            notification.setNotificationTypeId(notificationType.Id);
            notification.setTargetId(appRecord.Id);
            Set<String> recipientsIds = new Set<String>{ appRecord.OwnerId };
            notification.send(recipientsIds);

            result.success = true;

        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            result.success = false;
        }

        return result;
    }

    /**
     * @description This method creates and returns an EmailMessage object from an inbound email, mapping its fields and associating it with a specified App__c record.
     * @param email
     * @param appRecord
     * @return EmailMessage
     */
    public EmailMessage appEmailMsg(Messaging.InboundEmail email, Casep__c appRecord) {
        EmailMessage appEmailMessage = new EmailMessage();
        appEmailMessage.ToAddress = String.join(email.toAddresses, ',');
        if (email.ccAddresses != null) {
            appEmailMessage.CcAddress = String.join(email.ccAddresses, ',');
        }
        appEmailMessage.FromAddress = email.FromAddress;
        appEmailMessage.FromName = email.FromName;
        appEmailMessage.Subject = email.subject;
        appEmailMessage.Status = '2';
        appEmailMessage.HtmlBody = email.htmlBody;
        appEmailMessage.Incoming = true;
        appEmailMessage.TextBody = email.plainTextBody;
        appEmailMessage.RelatedToId = appRecord.Id;
        appEmailMessage.MessageIdentifier = email.messageId;
        return appEmailMessage;
    }
    private String extractActualEmail(String emailAddress) {
    Pattern emailPattern = Pattern.compile('.*=([^=]+@[^=]+\\.[^=]+)');
    Matcher matcher = emailPattern.matcher(emailAddress);
    
    if (matcher.find()) {
        return matcher.group(1); 
    }
    return emailAddress;  
}
}