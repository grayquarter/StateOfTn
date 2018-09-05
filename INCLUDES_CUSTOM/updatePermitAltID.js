function updatePermitAltID(newLicId) {
    oldAltID = newLicId.getCustomID();

    // generate the new AltID 
    var newAltID = generatePermitAltID(newLicId);
    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
}


