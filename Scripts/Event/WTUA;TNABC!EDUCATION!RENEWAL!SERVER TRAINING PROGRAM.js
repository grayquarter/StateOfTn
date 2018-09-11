if (wfTask.equals("Application Review") && wfStatus.equals("Approved")) {
	feeSch = "TABC-STP-S-A";

	if (AInfo["Type of training program"].equals("Public Training Program"))
		var feeItm = "STP-PUB";
	else
		var feeItm = "STP-IHO";

	updateFee(feeItm, feeSch, "FINAL", 1, "Y");
	feeTtl = feeAmount(feeItm);
	logDebug("The Invoiced fee amt = " + feeTtl);
	sendNotificationToContactTypes("Business Information", "TABC_LICENSE_APPROVAL");
}
