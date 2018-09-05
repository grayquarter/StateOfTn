function updateChangeAltID(newLicId) {
    oldAltID = newLicId.getCustomID();

    // generate the new AltID 
    var newAltID = generateChangeAltID(newLicId);
	if (newAltID != null){
		var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
		if (updateCapAltIDResult.getSuccess())
			logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
		else
			logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
	}
	else
		logDebug("**WARNING: ALTID wasn't provided a value to be changed");
}

// FA 03-07-2016 modify given table field with the value provided
