function generateEducationAltID(licCapId, eduAltId, mmdd) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];

   	var thisCustomIDArray = eduAltId.split("-");
   	var newLicAInfo = new Array();
    var countStr = count.toString()
   	var newAltID = "";
		
	var str = thisCustomIDArray[0];
    var LicType = str.substring(3);
			
	logDebug("thisSubType : [" + thisSubType + "]");
	
	/* $$yy$$ROS-MMDD-$$SEQ06$$  */
    if (matches(thisSubType, "Roster")) {
    	newAltID = thisCustomIDArray[0] + "-" + mmdd + "-" + thisCustomIDArray[2];
    }


    return newAltID;
}

/* ---------------------------------------------------------------------------- */
/* Added by FJB 2-15-16  Created by F. Benitez                                   */

