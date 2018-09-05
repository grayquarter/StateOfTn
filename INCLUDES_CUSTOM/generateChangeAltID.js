function generateChangeAltID(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisType = thisTypeArray[1];
   	var thisCustomID = licCapId.getCustomID();
   	var thisCustomIDArray = thisCustomID.split("-");
   	var newLicAInfo = new Array();
  
	loadAppSpecific(newLicAInfo, licCapId);
    var asiLicenseCounty = AInfo["County"];
	if (asiLicenseCounty == null)
		asiLicenseCounty = getCountyValue(licCapId);
	
	if (asiLicenseCounty == null)
		return null;
	else{
		var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
		var countyCodeArray = countyCodeResult.toString().split("/");
		var countyCode = countyCodeArray[0];
		var countyLetter = countyCodeArray[2];
		var newAltID = "";
		var str = thisCustomIDArray[1];
		var captypestr = str.substring(1);
						
		if (matches(thisType, "Change Request")) {
			newAltID = thisCustomIDArray[0] + "-" + countyLetter+captypestr + "-" + thisCustomIDArray[2];
		}		/* ---    $$yy$$M-DOWN-$$SEQ06$$  --- */

		if (matches(thisType, "Hearing")) {
			newAltID = thisCustomIDArray[0] + "-" + countyLetter + "-" + thisCustomIDArray[2];
		}		/* ---    $$yy$$H-D-$$SEQ04$$  --- */

		return newAltID;
	}
}

/* ----- FJB Added 2/18/2016 for Change control records    ---- */
/*                                                              */
