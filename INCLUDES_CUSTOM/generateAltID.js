function generateAltID(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];
	
   	 var thisCustomID = licCapId.getCustomID();
	 logDebug("thisCustomID ======> : [" + thisCustomID + "]");
   	 var thisCustomIDArray = thisCustomID.split("-");
   	 var newLicAInfo = new Array();
    	
	var asiLicenseCounty = getCountyValue(licCapId);
   	var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
    	var countyCodeArray = countyCodeResult.toString().split("/");
    	var countyCode = countyCodeArray[0];
    	var countyLetter = countyCodeArray[2];

   	 var tierCode = lookup("TABC_Tier_Code", thisTypeArray[1]);
   	 var newAltID = "";
	
	logDebug("thisSubType : [" + thisSubType + "]");
    if (matches(thisSubType, "License", "NA")) {
    	newAltID = tierCode + "-" + thisCustomIDArray[1] + "-" + countyCode + "-" + thisCustomIDArray[3];
    }

    if (matches(thisSubType, "Application", "Renewal", "Request")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+tierCode + "-" + thisCustomIDArray[2] + "-" + thisCustomIDArray[3];
    }

    if (matches(thisSubType, "Random", "Complaint", "Appeal","Event")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+ "-" + thisCustomIDArray[2];
    }

    return newAltID;
}

/* Added by FJB 12-30-15  Created by D Dejesus Modified by FJB to handle Renewals*/

