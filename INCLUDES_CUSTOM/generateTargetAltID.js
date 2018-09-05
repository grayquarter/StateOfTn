function generateTargetAltID(licCapId, opAltId, count) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];

   	var thisCustomIDArray = opAltId.split("-");
   	var newLicAInfo = new Array();
    var countStr = count.toString()
   	var newAltID = "";
		
	var str = thisCustomIDArray[0];
    var LicType = str.substring(3);
			
	logDebug("thisSubType : [" + thisSubType + "]");
	
	/* $$yy$$E-$$SEQ03$$-000 */
	
    if (matches(thisSubType, "Target") && count > 99) {
    	newAltID = thisCustomIDArray[0] + "-" + thisCustomIDArray[1] + "-" + countStr;
    }

	 if (matches(thisSubType, "Target")&& count < 100) {
    	newAltID = thisCustomIDArray[0] + "-" + thisCustomIDArray[1] + "-0" + countStr;
    }

	 if (matches(thisSubType, "Target")&& count < 10) {
    	newAltID = thisCustomIDArray[0] + "-" + thisCustomIDArray[1] + "-00" + countStr;
    }

    return newAltID;
}

/* ---------------------------------------------------------------------------- */
/* Added by FJB 02-03-2016 to create child Cap, passing the MMDD           */

