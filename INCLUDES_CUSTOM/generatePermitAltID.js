function generatePermitAltID(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];
   	var thisCustomID = licCapId.getCustomID();
   	var thisCustomIDArray = thisCustomID.split("-");
   	var newLicAInfo = new Array();
  
	loadAppSpecific(newLicAInfo, licCapId);
	
	if (arguments.length == 2) 
		var asiLicenseCounty = arguments[1];
	else
		var asiLicenseCounty = AInfo["County"];
    var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
   	var countyCodeArray = countyCodeResult.toString().split("/");
   	var countyCode = countyCodeArray[0];
   	var countyLetter = countyCodeArray[2];
 	var tierCode = lookup("TABC_Tier_Code", thisTypeArray[1]);
   	var newAltID = "";
	var str = thisCustomIDArray[0];
	var captypestr = str.substring(3);
	logDebug("thisSubType : [" + thisSubType + "]");
		
    if (matches(thisSubType, "NA", "Null")) {
    	newAltID = tierCode + captypestr + "-" + countyCode + "-" + thisCustomIDArray[2];
    }			 /* --- TTTAFI-CCC-$$SEQ07$$  --- */

			
    if (matches(thisSubType, "Application", "Null")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+"PER" + "-" + thisCustomIDArray[2] + "-" + thisCustomIDArray[3];
    }		/* ---    $$yy$$A-DPER-WRP-$$SEQ06$$  --- */


    return newAltID;
}

/* ---------------------------------------------------------------------------- */
/* Added by FJB 02-01-16     */
