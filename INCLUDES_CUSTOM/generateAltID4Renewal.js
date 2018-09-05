function generateAltID4Renewal(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];

   	 var thisCustomID = licCapId.getCustomID();
   	 var thisCustomIDArray = thisCustomID.split("-");
   	 var newLicAInfo = new Array();
    	
	var asiLicenseCounty = getCountyValue(parentCapId);
   	var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
    	var countyCodeArray = countyCodeResult.toString().split("/");
    	var countyCode = countyCodeArray[0];
    	var countyLetter = countyCodeArray[2];

   	 var tierCode = lookup("TABC_Tier_Code", thisTypeArray[1]);
   	 var newAltID = "";
	
	logDebug("thisSubType : [" + thisSubType + "]");
    
    if (matches(thisSubType, "Renewal")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+tierCode + "-" + thisCustomIDArray[2] + "-" + thisCustomIDArray[3];
    }


    return newAltID;
}





/* ---------------------------------------------------------------------------- */

/* Added by FJB 12-8-15  Created by Fatih Andican   */

