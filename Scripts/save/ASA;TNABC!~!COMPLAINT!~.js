
licCapId = capId;
var appCounty = getCountyValue(capId);
if (appCounty != null) {
	generateAltID(capId);
	newLicId = capId;
	updateAltID(newLicId);
}

if (!publicUser) {
	var POD = countyLookUp('CName', appCounty);
	aa.print('POD: ' + POD);
	assignDepartment_Custom(POD);
	sendNotificationToContactTypes_ASA('Complainant', 'TABC_COMPLAINT_RECEIVED');
}
