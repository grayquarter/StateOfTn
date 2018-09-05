function sendInspNotificationToContactTypes(sendEmailToContactTypes, emailTemplate) 

{
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;
	if (arguments.length == 3)
		thisCapId = arguments[2]; // optional 3rd parameter, capid to use

	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
