
licCapId = capId;
var appCounty = getCountyValue(capId);
if (appCounty != null) {
	generateAltID(capId);
	newLicId = capId;
	updateAltID(newLicId);
}

var POD = countyLookUp('CName', appCounty);
aa.print('POD: ' + POD);
assignDepartment_Custom(POD);
updateAppStatus('Submitted', 'Online Submission status');
updateTask('Preliminary Review', 'Submitted');
if (publicUser) {
	sendNotificationToContactTypes_ASA('Complainant', 'TABC_COMPLAINT_RECEIVED');
}
