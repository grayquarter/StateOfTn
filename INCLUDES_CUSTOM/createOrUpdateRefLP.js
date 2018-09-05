function createOrUpdateRefLP(licenseScriptModel){
	var refLPModelInDB = getRefLicenseProfByStateLicense(licenseScriptModel.getServiceProviderCode(), licenseScriptModel.getStateLicense());

	if (refLPModelInDB != null)
	{
		var result = aa.licenseScript.editRefLicenseProf(licenseScriptModel);
		getOutput(result, "editRefLicenseProf");
		logDebug("The Ref. LP exists, so update it.");
	}
	else
	{
		var result = aa.licenseScript.createRefLicenseProf(licenseScriptModel);
		getOutput(result, "createRefLicenseProf");
		logDebug("The Ref. LP does not exist, so create it.");
	}
}
