function getRefLicenseProfByStateLicense(serviceProviderCode, stateLicense){
	var licenseScriptModel = null;

	var result = aa.licenseScript.getRefLicensesProfByLicNbr(serviceProviderCode, stateLicense);
	var licenseScriptModels = result.getOutput(); //getOutput(result, "getRefLicensesProfByLicNbr");

	if (licenseScriptModels != null && licenseScriptModels.length > 0)
	{
		// get first one
		licenseScriptModel = licenseScriptModels[0];

		// get license template
		result = aa.genericTemplate.getTemplate(licenseScriptModel.getLicenseModel().getEntityPK());
		var templateModel = getOutput(result, "getTemplate");
		licenseScriptModel.getLicenseModel().setTemplate(templateModel);
	}

	return licenseScriptModel;
}	

