function sendInspNotificationToContactTypes(sendEmailToContactTypes, emailTemplate) 

{
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;
	if (arguments.length == 3)
		thisCapId = arguments[2]; // optional 3rd parameter, capid to use

	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
		logDebug("ERROR: Function sendNotificationToContactTypes requres two arguments.  Usage: sendNotificationToContactTypes(string sendEmailToContactTypes, string emailTemplate)");
		return false
	}

	if (sendEmailToContactTypes == null || sendEmailToContactTypes.length == 0) {
		logDebug("ERROR: No contact types list found.");
		return false;
	}

	if (emailTemplate == null || emailTemplate.length == 0) {
		logDebug("ERROR: No email template submitted.");
		return false;
	}

	if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {

		var conTypeArray = sendEmailToContactTypes.split(",");
		var conArray = getContactArray(thisCapId);

		if (conArray && conArray.length > 0)
			logDebug("Have the contactArray");

		for (thisCon in conArray) {
			conEmail = null;
			b3Contact = conArray[thisCon];
			if (exists(b3Contact["contactType"], conTypeArray)) {
				conEmail = b3Contact["email"];
				logDebug(altId + ": Contact type " + b3Contact["contactType"] + " found. Email: " + conEmail);
			}

			if (conEmail) {
				emailParameters = aa.util.newHashtable();
				getContactParams4Notification(emailParameters, b3Contact["contactType"]);
				getInspRecordParams4Notification(emailParameters);
				
				                       
				var capId4Email = aa.cap.createCapIDScriptModel(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3());

				var fileNames = [];

				aa.document.sendEmailAndSaveAsDocument(mailFrom, conEmail, "", emailTemplate, emailParameters, capId4Email, fileNames);
				logDebug(altId + ": Sent Email template " + emailTemplate + " to " + b3Contact["contactType"] + " : " + conEmail);
			}
		}
	}
}
