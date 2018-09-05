function removeLPConditions(pType,pStatus,pDesc,pImpact) // optional capID
{
	var resultArray = new Array();
	var lang= "ar_AE";
	
	if (arguments.length > 4)
		var itemCap = arguments[4]; // use cap ID specified in args
	else
		var itemCap = capId;

	////////////////////////////////////////
	// Check License
	////////////////////////////////////////
	
	var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
	
	if (!capLicenseResult.getSuccess())
		{
		logDebug("**WARNING: getting CAP licenses: "+ capLicenseResult.getErrorMessage());
		var licArray = new Array();
		}
	else
		{
		var licArray = capLicenseResult.getOutput();
		if (!licArray) licArray = new Array();
		}
		
	for (var thisLic in licArray)
		if (licArray[thisLic].getLicenseProfessionalModel().getLicSeqNbr())
		{
			var licCondResult = aa.caeCondition.getCAEConditions(licArray[thisLic].getLicenseProfessionalModel().getLicSeqNbr());
			if (!licCondResult.getSuccess())
				{
				logDebug("**WARNING: getting license Conditions : "+licCondResult.getErrorMessage());
				var licCondArray = new Array();
				}
			else
				{
				var licCondArray = licCondResult.getOutput();
				}
			
			for (var thisLicCond in licCondArray)
			{
				var thisCond = licCondArray[thisLicCond];
				
				//aa.print("thisCond: " + thisCond);
				
				//for (x in thisCond)
					//aa.print(x + ": " + thisCond[x]);
				
				var cType = thisCond.getConditionType();
				var cStatus = thisCond.getConditionStatus();
				var cDesc = thisCond.getConditionDescription();
				var cImpact = thisCond.getImpactCode();
				var cComment = thisCond.getConditionComment();
				cNumber = thisCond.getConditionNumber();

				if (cType == null)
					cType = " ";
				if (cStatus==null)
					cStatus = " ";
				if (cDesc==null)
					cDesc = " ";
				if (cImpact==null)
					cImpact = " ";
		
				if ( pType.toUpperCase().equals(cType.toUpperCase()) && pStatus.toUpperCase().equals(cStatus.toUpperCase()) && pDesc.toUpperCase().equals(cDesc.toUpperCase()) && pImpact.toUpperCase().equals(cImpact.toUpperCase()))
				{
					logDebug("Found Citation Condition...Changing status to On Hold");				
					thisCond.setConditionStatus("On Hold");
					thisCond.setImpactCode(null);
					aa.caeCondition.editCAECondition(thisCond);
					
					//not using this....it deletes the condition from the record...need to leave condition in a not applied status
					//aa.caeCondition.removeCAECondition(cNumber, licArray[thisLic].getLicenseProfessionalModel().getLicSeqNbr());
				}
				else
					logDebug("No Citation Condition Found");
			}
		}
}

