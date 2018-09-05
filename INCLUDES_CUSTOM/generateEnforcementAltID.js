function generateEnforcementAltID(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];
   	var thisCustomID = licCapId.getCustomID();
   	var thisCustomIDArray = thisCustomID.split("-");
   	var newLicAInfo = new Array();
  
	loadAppSpecific(newLicAInfo, licCapId);
    var asiLicenseCounty = AInfo["County"];
    var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
   	var countyCodeArray = countyCodeResult.toString().split("/");
   	var countyCode = countyCodeArray[0];
   	var countyLetter = countyCodeArray[2];
 	var newAltID = "";
	
	logDebug("thisSubType : [" + thisSubType + "]");
				
    if (matches(thisSubType, "Citation", "Complaint", "Random")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter  + "-" + thisCustomIDArray[2];
    }		/* ---    $$yy$$V              -         D           -       $$SEQ06$$  --- */


    return newAltID;
}

