
if (appTypeArray[1].equals('Permits') && !appTypeArray[3].equals('Server') && wfTask == 'Preliminary Review' && wfStatus == 'Approved') {
	var asiLicenseCounty = '';
	asiLicenseCounty = getCountyValue(capId);
	if (asiLicenseCounty == 'undefined' || asiLicenseCounty == null) {
		asiLicenseCounty = AInfo['County'];
	}
	comment('Permit COUNTY =  ' + asiLicenseCounty);
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
}

if (appTypeArray[1].equals('Education') && !appTypeArray[3].equals('Server Training Program') && wfTask == 'Application Review' && wfStatus == 'Approved') {
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
}

if (appTypeArray[3].equals('Special Occasion') && wfTask == 'Application Review' && wfStatus == 'Approved') {
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
}

if (appTypeArray[1].equals('Wholesale') && appTypeArray[3].equals('Self-Distribution') && wfTask == 'Application Review' && wfStatus == 'Approved') {
	asiLicenseCounty = getCountyValue(capId);
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
}

//replaced branch(WTUA:TNABC/*/Application/* Update Status)
applicationUpdateStatus();
if (isTaskActive('Inspection')) {
	if (taskStatus('Inspection').equals('Not Applicable')) {
		deactivateTask('Inspection');
	}
}
