function createSOLicense(grp, typ, stype, cat, desc, contactType,asiLicenseCounty) {
    var newLicId = null;
    var newLicenseType = null;
    var oldAltID = null;

    //create the license record
	newLicId = createChildwithAddrAttributes(grp, typ, stype, cat, desc);
	
	//copy all ASI
    copyAppSpecific(newLicId);
    copyASITables(capId, newLicId); 

    oldAltID = newLicId.getCustomID();
	
	var newAltID = generateChildAltID(newLicId,asiLicenseCounty);
	
	/*logDebug("Creating Ref LP.");
	createRefLicProf(newAltID, aa.cap.getCap(newLicId).getOutput().getCapType().getAlias(), contactType);

	newRefLic = getRefLicenseProf(newAltID);

	if (newRefLic) {
		logDebug("Reference LP successfully created");
		associateLpWithCap(newRefLic, newLicId);
	} else {
		logDebug("Reference LP not created");
	}*/

    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
    
    newLicenseType = aa.cap.getCap(newLicId).getOutput().getCapType().getAlias();
    logDebug("newLicenseType:" + newLicenseType);

    return newLicId;
}

