function associateLpWithCap(refLP, itemCapId) {
	//add the LP to the CAP
	var asCapResult = aa.licenseScript.associateLpWithCap(itemCapId, refLP);
	if (!asCapResult.getSuccess()) {
		logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage())
	} else {
		logDebug("Associated the CAP to the new LP")
	}
}

