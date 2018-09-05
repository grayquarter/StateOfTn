function editRefLPASI(itemName, itemValue) {
	var newFieldValue = null;
	capLPs = getLicenseProfessional(capId);
	capLPStateNum = capLPs[0].getLicenseNbr().toUpperCase();
	refLPStateNum = getRefLicenseProf(capLPStateNum).getStateLicense();
	logDebug("REF LP TO CHECK: " + refLPStateNum);

	var licenseScriptModel = getRefLicenseProfByStateLicense(servProvCode, refLPStateNum);
	var licenseModel = licenseScriptModel.getLicenseModel();

	// update LP ASI
	if (licenseModel.getTemplate() != null) {
		var templateForms = licenseModel.getTemplate().getTemplateForms();
		if (templateForms != null) {
			for (var i = 0; i < templateForms.size(); i++) {
				var templateForm = templateForms.get(i);
				var templateGroupName = templateForm.getGroupName();
				if (templateGroupName.equals("LIC_GENERAL")) {
					var templateSubgroups = templateForm.getSubgroups();
					for (var j = 0; j < templateSubgroups.size(); j++) {
						var templateSubgroup = templateSubgroups.get(j);
						//logDebug("LP ASI Template Subgroup: " + templateSubgroup.getSubgroupName());

						if (templateSubgroup.getSubgroupName().equals("LICENSE INFORMATION")) {
							var fields = templateSubgroup.getFields();
							for (var k = 0; k < fields.size(); k++) {
								var field = fields.get(k);
								var fieldName = field.getFieldName();
								if (fieldName == itemName) {
									var fieldValue = field.getDefaultValue();
									newFieldValue = Number(fieldValue) + itemValue;
									logDebug("Field Value = " + newFieldValue);
									field.setDefaultValue(newFieldValue);
								}
							}
						}
					}
				}
			}
		}
	} else {
		logDebug("No Template data exists...creating");
		// set license template
		var result = aa.genericTemplate.getTemplateStructureByGroupName("LIC_GENERAL");
		licenseModel.setTemplate(result.getOutput());

		//now go ahead and populate data

		logDebug("Getting asi to populate now");
		var templateForms = licenseModel.getTemplate().getTemplateForms();
		if (templateForms != null) {
			var retVal = false;
			for (var i = 0; i < templateForms.size(); i++) {
				var templateForm = templateForms.get(i);
				var templateGroupName = templateForm.getGroupName();
				if (templateGroupName.equals("LIC_GENERAL")) {
					var templateSubgroups = templateForm.getSubgroups();
					for (var j = 0; j < templateSubgroups.size(); j++) {
						var templateSubgroup = templateSubgroups.get(j);
						//logDebug("LP ASI Template Subgroup: " + templateSubgroup.getSubgroupName());

						if (templateSubgroup.getSubgroupName().equals("LICENSE INFORMATION")) {
							var fields = templateSubgroup.getFields();
							for (var k = 0; k < fields.size(); k++) {
								var field = fields.get(k);
								var fieldName = field.getFieldName();
								if (fieldName == itemName) {
									var fieldValue = field.getDefaultValue();
									if (itemValue != fieldValue) {
										newFieldValue = itemValue;
										logDebug("Field Value = " + newFieldValue);
										field.setDefaultValue(newFieldValue);
									} else {
										logDebug("Field Value for " + fieldName + " is already set to " + fieldValue);
										retVal = false;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	// Create or update Ref. LP
	logDebug("Updating/Creating Ref LP");
	createOrUpdateRefLP(licenseScriptModel);

	var retVal = false;
	var retVal2 = false;

	logDebug("Refreshing Cap LP from Ref");
	aa.licenseProfessional.removeLicensedProfessional(capLPs[0]);
	capListResult = aa.licenseScript.associateLpWithCap(capId, licenseScriptModel);
	retVal = capListResult.getSuccess();

	logDebug("Did lp refresh: " + retVal);

	if (newFieldValue != null)
		return newFieldValue;
}
