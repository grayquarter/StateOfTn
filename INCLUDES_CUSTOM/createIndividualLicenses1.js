function createIndividualLicenses1() {

	LICcomm = 'Created from Application # ' + capIDString;
	comment(LICcomm);
	CAPVal = lookup('TABC_Cap_Table', appTypeString);
	comment('===> CAPVal ===> ' + CAPVal);
	var newAppID = null;
	tempvalue = CAPVal;
	tempval = tempvalue.split('/');
	disableTokens = true;
	LGroup = tempval[0];
	LType = tempval[1];
	LSubType = tempval[2];
	LCateg = tempval[3];
	disableTokens = false;
	contactType = TNABCgetContactType(LGroup, LType, LSubType, LCateg);
	comment('VALUE =====> ' + LGroup + ' -  ' + LType + ' -  ' + LSubType + ' -  ' + LCateg);
	if (!matches(appTypeArray[1], 'Permits', 'Education') && !appTypeArray[3].equals('Special Occasion')) {
		newAppID = createLicense('TNABC', LType, LSubType, LCateg, LICcomm, 'Active', true, true, contactType, false, LICcomm, asiLicenseCounty);
		altid = newAppID;
	}

	if (appTypeArray[3].equals('Special Occasion')) {
		asiLicenseCounty = getCountyValue(capId);
		newAppID = createSOLicense(appTypeArray[0], appTypeArray[1], 'License', appTypeArray[3], '', contactType, asiLicenseCounty);
		var spoLmt = getSpecOcc(newAppID);
		altid = newAppID;
	}

	if (appMatch('TNABC/Permits/*/*')) {
		var asiLicenseCounty = '';
		asiLicenseCounty = getCountyValue(capId);
		if (!asiLicenseCounty || asiLicenseCounty == null)
			asiLicenseCounty = AInfo['County'];
		newAppID = createPermit('TNABC', LType, LSubType, LCateg, LICcomm, 'Active', false, false, contactType, false, LICcomm, asiLicenseCounty);
		altid = newAppID;
	}

	if (appMatch('TNABC/Education/Application/*')) {
		newAppID = createCertificate('TNABC', LType, LSubType, LCateg, LICcomm, 'Active', true, true, contactType, false, LICcomm, 'Nashville');
		altid = newAppID;
		asiLicenseCounty = 'Nashville';
	}

	if (appMatch('TNABC/Education/*/*') && (LCateg == 'RV Trainer' || LCateg == 'Server Training Trainer') && newAppID) {
		savecap = capId;
		capId = newAppID;
		if (AInfo['Program Number'] != null)
			addParent(aa.cap.getCapID(AInfo['Program Number']).getOutput());
		capId = savecap;
	}

	if (newAppID) {
		XICcomm = '=====> Source CAP # ' + capIDString;
		comment(XICcomm + ' - Target CAP # ' + altid);
		// DISABLED: TABC_Create_Individual_Licenses_1:10
		// 	savecap=capId;
		// 	capId=newAppID;
		// 	br_nch('TABC_Create_Individual_Licenses_2');
		// 	capId=savecap;
		// DISABLED: TABC_Create_Individual_Licenses_1:10_a
		// 	copyAppSpecific(newAppID);
		// 	copyASITables(capId,newAppID);
		updateShortNotes(getShortNotes(capId), newAppID);
		savecap = capId;
		capId = newAppID;

		//replaced branch(TABC_Create_Individual_Licenses_5)
		createIndividualLicenses5();
		capId = savecap;
		// DISABLED: TABC_Create_Individual_Licenses_1:12
		// 	br_nch('TABC_Create_Individual_Licenses_7');
		// 	}
	}

	if (!appTypeArray[1].equals('Education')) {
		var appCounty = '';
		appCounty = asiLicenseCounty;
		var POD = countyLookUp('CName', appCounty);
		assignDepartment_Custom(POD, newAppID);
	}

	// DISABLED: TABC_Create_Individual_Licenses_1:98
	// if (newAppID && (appTypeArray[1].equals('Permits') && taskStatus('Preliminary Review').equals('Approved')) || (!matches(appTypeArray[3],'Server Training Program','Self-Distribution') && taskStatus('Application Review').equals('Approved'))) {
	// 	var wfComment = '';
	// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee,Armed Forces Import', 'TABC_LICENSE_APPROVAL');
	// 	}

	if (newAppID && (appTypeArray[1].equals('Permits') && taskStatus('Preliminary Review').equals('Approved')) || (!matches(appTypeArray[3], 'Server Training Program', 'Self-Distribution') && taskStatus('Application Review').equals('Approved'))) {
		var wfComment = '';
		sendNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual,Permittee,Armed Forces Import', 'TABC_LICENSE_APPROVAL');
	}

	if (!newAppID) {
		showMessage = true;
		logMessage('LICENSE/CERTIFICATE was not created due to an error');
		activateTask('Application Review');
		deactivateTask('Application Status');
		updateTask('Application Review', 'LICENSE NOT CREATED', '', '');
	}

	if (newAppID && (appTypeArray[1].equals('Education') && !appTypeArray[3].equals('Server Training Program')) && taskStatus('Application Review').equals('Approved')) {
		closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
	}

}
