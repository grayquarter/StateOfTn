function getParentLicenseCapID(itemCap) {
	if (itemCap == null || aa.util.instanceOfString(itemCap)) {
		return null;
	}
	var licenseCap = null;
	var result2 = aa.cap.getProjectByChildCapID(itemCap, "Renewal", null);
	if (result2.getSuccess()) {
		licenseProjects = result2.getOutput();
		if (licenseProjects != null && licenseProjects.length > 0) {
			licenseProject = licenseProjects[0];
			return licenseProject.getProjectID();
		}
	}
	var result = aa.cap.getProjectByChildCapID(itemCap, "EST", null);
	if (result.getSuccess()) {
		projectScriptModels = result.getOutput();
		if (projectScriptModels != null && projectScriptModels.length > 0) {
			projectScriptModel = projectScriptModels[0];
			licenseCap = projectScriptModel.getProjectID();
			return licenseCap;
		}
	}
	logDebug("**WARNING: Could not find parent license Cap for child CAP(" + itemCap + "): ");
	return false;
}



/* Added by F Benitez 4/5/15 */
/*
 *  Function   : sendNotificationToContactTypes
 *  Usage      : Send emails to a list of contact types using an email template.
 *             : Eg.: sendNotificationToContactTypes("Applicant,Corporate,Contact", "PERMIT ABOUT TO EXPIRE NOTIFICATION");
 *  Parameters : sendEmailToContactTypes - String - List of contact types separated by commas. Eg "Applicant,Corporate,Contact"
 *             : emailTemplate - String - Template name as defined in the Communication Manager
 *             : capId (optional) - CapIDModel - Record to use.
 *
 */

