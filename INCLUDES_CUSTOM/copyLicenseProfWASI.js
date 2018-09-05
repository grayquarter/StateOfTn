function copyLicenseProfWASI(sourceAltId,destAltId){
	//-1. Initialize.
	var sourceCapId = getCapByCustomID(sourceAltId); 
	var destCapId = getCapByCustomID(destAltId); 
	var callId="ADMIN";

	//-2. Get source LP values. Now there is no ASI/ASIT inside it.
	var result = aa.licenseProfessional.getLicenseProf(sourceCapId);
	if(result.getSuccess())
	{
		var sourceLPArray = result.getOutput(); //LicenseProfessionalScriptModel[]
		if(sourceLPArray!=null && sourceLPArray.length > 0 )
		{
			for(var i in sourceLPArray)
			{
				//-2.1. Get related ASI/ASIT data of LP
				var lpScriptModel = aa.licenseProfessional.getLicensedProfessionalsByPK(sourceLPArray[i]).getOutput();
				
				//-2.2. Modify source LP's CAP ID to destination CAP ID
				lpScriptModel.setCapID(destCapId);
				//-----------------------------------------
				//Here we can modify some other vlaues of LP
				//-----------------------------------------
				
				//-2.3. Modify the entity PK
				if(lpScriptModel.getLicenseProfessionalModel().getTemplate()!=null)
				{
					//ASI/ASIT data is stored in : lpScriptModel.getLicenseProfessionalModel().getTemplate();
					logDebug("ASI/ASTI:"+lpScriptModel.getLicenseProfessionalModel().getTemplate());
					
					//Modify source entity PK so that it can be stored into DB for destination CAP's LP.
					lpScriptModel.getLicenseProfessionalModel().getTemplate().setEntityPKModel(lpScriptModel.getLicenseProfessionalModel().getEntityPK());
				}
				//-2.4 Remove existing LP
				var getResult = aa.licenseProfessional.getLicensedProfessionalsByPK(lpScriptModel);
				if(getResult.getSuccess())
				{	
					var removeResult = aa.licenseProfessional.removeLicensedProfessional(lpScriptModel);
					if(!removeResult.getSuccess())
					{
						logDebug("Failed to remove existing ASI/ASIT data."+removeResult.getErrorMessage());
						aa.abortScript();
					}
				}	
				
				//-2.5 Create new LP along with related ASI/ASIT 
				var updateRes = aa.licenseProfessional.createLicensedProfessional(lpScriptModel);
				if(!updateRes.getSuccess())
				{
					logDebug("Failed to create new ASI/ASIT data."+updateRes.getErrorMessage());
					aa.abortScript();
				}
			}
		}
		else
		{
			logDebug("No ASI value need to be copied.");
		}
	}
	else
	{
		logDebug("Failed to get LP values."+result.getErrorMessage());
		aa.abortScript();
	}
}
//Get CAPIDModel by custID
