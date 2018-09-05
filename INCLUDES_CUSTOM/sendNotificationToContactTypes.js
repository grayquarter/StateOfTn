function sendNotificationToContactTypes(sendEmailToContactTypes, emailTemplate) {
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;
	
	if (arguments.length == 3)
		thisCapId = arguments[2]; // optional 3rd parameter, capid to use
	var recordType = aa.cap.getCap(thisCapId).getOutput().getCapType().getAlias(); 	/* Added 5/24/16 FJB */
	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
