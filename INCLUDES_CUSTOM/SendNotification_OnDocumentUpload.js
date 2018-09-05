function SendNotification_OnDocumentUpload(){

var mailTo1 = lookup("Documents Received Dictribution List", "TPATEL");
//var mailTo2 = lookup("Documents Received Dictribution List", "TPATEL");
//var mailTo3 = lookup("Documents Received Dictribution List", "TPATEL");
//var mailTo4 = lookup("Documents Received Dictribution List", "TPATEL");

aa.print(mailTo1);

var mailFrom = "noreply.abc@tn.gov";
var thisCapId = capId;
var recordType = aa.cap.getCap(thisCapId).getOutput().getCapType().getAlias(); 	/* Added 5/24/16 FJB */
var altId = thisCapId.getCustomID();

if (mailTo1) {
				emailParameters = aa.util.newHashtable();
				//getContactParams4Notification(emailParameters, b3Contact["contactType"]);
				//getRecordParams4Notification(emailParameters);
				/* addParameter(emailParameters, "$$businessName$$", cap.getSpecialText()); */
                
				addParameter(emailParameters, "$$capType$$", recordType);
				addParameter(emailParameters, "$$altID$$", altId);
                
               
                                                
				var capId4Email = aa.cap.createCapIDScriptModel(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3());

				var fileNames = [];

				aa.document.sendEmailAndSaveAsDocument(mailFrom, mailTo1, "", "TABC_DOCUMENTS_RECEIVED_NOTIFICATION", emailParameters, capId4Email, fileNames);
				//aa.document.sendEmailAndSaveAsDocument(mailFrom, mailTo2, "", "TABC_DOCUMENTS_RECEIVED_NOTIFICATION", emailParameters, capId4Email, fileNames);
				//aa.document.sendEmailAndSaveAsDocument(mailFrom, mailTo3, "", "TABC_DOCUMENTS_RECEIVED_NOTIFICATION", emailParameters, capId4Email, fileNames);
				//aa.document.sendEmailAndSaveAsDocument(mailFrom, mailTo4, "", "TABC_DOCUMENTS_RECEIVED_NOTIFICATION", emailParameters, capId4Email, fileNames);
				logDebug(altId + ": Sent Email template " + "TABC_DOCUMENTS_RECEIVED_NOTIFICATION" + " to "  + " : " + mailTo1);
			}
}




