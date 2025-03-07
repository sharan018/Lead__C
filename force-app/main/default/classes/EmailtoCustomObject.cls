public with sharing class EmailtoCustomObject implements Messaging.InboundEmailHandler {
    /**
     * @description This method processes inbound emails, associates them with an App__c record, handles attachments, and notifies the record owner via email and custom notifications.
     * @param email
     * @param envelope
     * @return Messaging.InboundEmailResult
     */
    public Messaging.InboundEmailResult handleInboundEmail(Messaging.InboundEmail email, Messaging.InboundEnvelope envelope) {
        Messaging.InboundEmailResult result = new Messaging.InboundEmailresult();
        String[] referencesList = email.references;
        EmailMessage emailMsgRecord;
        Casep__c appRecord;
        if(EmailMessage.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).isAccessible() && Schema.SObjectType.EmailMessage.fields.id.isAccessible() && Schema.SObjectType.EmailMessage.fields.relatedToId.isAccessible() && Schema.SObjectType.EmailMessage.fields.MessageIdentifier.isAccessible()) {
            emailMsgRecord  = [select id,relatedToId from EmailMessage where MessageIdentifier = :referencesList[0] WITH USER_MODE LIMIT 1];
        }
        Id appId = emailMsgRecord.RelatedToId;
        if(Casep__c.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).isAccessible() && Schema.SObjectType.Casep__c.fields.id.isAccessible() && Schema.SObjectType.Casep__c.fields.Name.isAccessible()){
            appRecord = [SELECT Id, Name,OwnerId
                                  FROM Casep__c
                                  WHERE Id = :appId
                                  WITH USER_MODE
                                  LIMIT 1];
        }
        //Attach the binary attachment to the Files related list.
        if(email.binaryAttachments!= null){
            Messaging.InboundEmail.BinaryAttachment[] attachment = email.binaryAttachments ;
            Integer attachmentSize = attachment.size();
            for(Integer i=0;i< attachmentSize;i++){
                Blob bodyAttachment = attachment[i].body;
                String attachmentName = attachment[i].fileName;
                ContentVersion cv = new ContentVersion();
                cv.VersionData = bodyAttachment;
                cv.Title = attachmentName;
                cv.PathOnClient = attachmentName;
                insert cv;
                ContentDocumentLink contentDocumentLink = new ContentDocumentLink();
                contentDocumentLink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
                contentDocumentLink.LinkedEntityId = appRecord.Id;  
                contentDocumentLink.ShareType = 'I';  // 'I' means Inferred permission (default for internal users)
                contentDocumentLink.Visibility = 'AllUsers';
                insert contentDocumentLink;
            }
        }
        EmailMessage appEmailMessage = appEmailMsg(email,appRecord);
        if(Schema.sObjectType.Casep__c.isAccessible() && Schema.sObjectType.Casep__c.isUpdateable()){
            update appRecord;
        }
        if(Schema.sObjectType.EmailMessage.isAccessible() && Schema.sObjectType.EmailMessage.isCreateable()){
            insert appEmailMessage;
        }
        // Add Email Message Relation for id of the sender
        EmailMessageRelation emr = new EmailMessageRelation();
        emr.EmailMessageId = appEmailMessage.id;
        emr.RelationAddress = email.fromAddress;
        emr.RelationType = 'FromAddress';
        if(Schema.sObjectType.EmailMessageRelation.isAccessible() && Schema.sObjectType.EmailMessageRelation.isCreateable()){
            insert emr;
        }
       
        //This piece of code sends an email to the owner of the App__c record, using an organization-wide email address, with details about the associated email message and its content.
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        OrgWideEmailAddress orgWideEmail = [Select Id from OrgWideEmailAddress where Address = 'sharanu.hiremath018@outlook.com'];
        Id orgWideEmailId = orgWideEmail.Id;
        mail.setOrgWideEmailAddressId(orgWideEmailId);
        mail.setToAddresses(new String[] { appRecord.OwnerId });
        mail.setSubject(email.Subject);
        mail.setHtmlBody('An email message related to app record ' + appRecord.Name + ' has been created.' + email.htmlBody);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
       
        //This piece of code sends a Salesforce notification to the owner of the App__c record, informing them of a customer reply.
        CustomNotificationType notificationType =
            [SELECT Id, DeveloperName
             FROM CustomNotificationType
             WHERE DeveloperName='Email_Notification']; //Create a custom notification type called 'Email_Notification' in salesforce
        Messaging.CustomNotification notification = new Messaging.CustomNotification();
        notification.setTitle('Customer Reply Notification');
        notification.setBody('Customer replied to App: ' + appRecord.Name);
        notification.setNotificationTypeId(notificationType.Id);
        notification.setTargetId(appRecord.Id);
        Set<String> recipientsIds = new Set<String>();
        recipientsIds.add(appRecord.OwnerId);
        notification.send(recipientsIds);
       
        return result;
    }
    /**
     * @description This method creates and returns an EmailMessage object from an inbound email, mapping its fields and associating it with a specified App__c record.
     * @param email
     * @param appRecord
     * @return EmailMessage
     */
    public EmailMessage appEmailMsg(Messaging.InboundEmail email,Casep__c appRecord){
        EmailMessage appEmailMessage = new EmailMessage();
        appEmailMessage.ToAddress =  String.join(email.toAddresses, ',');
        if(email.ccAddresses != null){
            appEmailMessage.CcAddress =  String.join(email.ccAddresses, ',');
        }
        appEmailMessage.FromAddress =  email.FromAddress;
        appEmailMessage.FromName = email.FromName;
        appEmailMessage.Subject = email.subject;
        appEmailMessage.status = '2';
        appEmailMessage.HtmlBody = email.htmlBody;
        appEmailMessage.Incoming= True;
        appEmailMessage.TextBody = email.plainTextBody;
        appEmailMessage.RelatedToId = appRecord.Id;
        appEmailMessage.MessageIdentifier = email.messageId;
        return appEmailMessage;
    }
}