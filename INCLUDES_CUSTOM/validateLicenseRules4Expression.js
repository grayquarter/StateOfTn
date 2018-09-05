function validateLicenseRules4Expression(){
	var restrictedTypes = checkLicenseRestrictions4Expression();
	var requiredTypes = checkLicenseRequirements4Expression();
	if(restrictedTypes){
		msg += "The " + appTypeAlias + " does not allow you to concurrently hold a " + restrictedTypes +". " + br + br;
	}
	if(requiredTypes){
		if(requiredTypes == "Missing Valid License Number"){
			msg += "The " + appTypeAlias + " requires a valid ID Number." + br + br;
		}
		else{
			msg += "The " + appTypeAlias + " requires at least one of the following: " + requiredTypes +"." + br + br;
		}
	}
	
	if(!isEmpty(msg)){
		msg += " Contact TABC at TABC_RLPS.Licensing@tn.gov if you have additional questions.";
		return msg;
	}
	else{
		return false;
	}
}

