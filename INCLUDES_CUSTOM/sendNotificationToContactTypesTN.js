function sendNotificationToContactTypesTN(sendEmailToContactTypes, emailTemplate, TNcomment) {
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;
	if (arguments.length == 4)
		thisCapId = arguments[3]; // optional 4th parameter, capid to use

	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
