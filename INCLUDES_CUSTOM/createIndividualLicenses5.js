function createIndividualLicenses5() {

	comment('===> TABC_Create_Individual_Licenses_5 Set License Info Start - New');
	if (AInfo['Application Type'] == 'Renew Existing License') {
		var triggerDate = AInfo['Legacy Expiration Date'];
		logDebug('TRIGGER DATE WILL BE: ' + triggerDate);
	} else {
		var triggerDate = null;
		logDebug('TRIGGER DATE WILL BE: ' + triggerDate);
	}

	if (appTypeArray[2].equals('Renewal')) {
		licProfNum = capId.getCustomID();
		lic = getRefLicenseProf(String(licProfNum));
		var triggerDate = lic.getBusinessLicExpDate();
		logDebug('TRIGGER DATE WILL BE: ' + triggerDate.getMonth() + '/' + triggerDate.getDayOfMonth() + '/' + triggerDate.getYear());
	}

	if (appTypeArray[1].equals('Liquor by the Drink') && !appTypeArray[3].equals('Special Occasion')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:10a
	// if (appTypeArray[1].equals('Liquor by the Drink') && !appTypeArray[3].equals('Special Occasion')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('License Status', 'Active');
	// 	}

	if (appTypeArray[3].equals('Special Occasion')) {
		renewDate = AInfo['Event Date'];
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	if (appTypeArray[1].equals('Retail')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:20a
	// if (appTypeArray[1].equals('Retail')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('License Status', 'Active');
	// 	}

	if (appTypeArray[1].equals('Supplier') && !matches(appTypeArray[3], 'Non-Resident Seller License', 'Manufacturer', 'Wholesaler', 'Limited Manufacturing')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:30a
	// if (appTypeArray[1].equals('Supplier') && !matches(appTypeArray[3],'Non-Resident Seller License','Manufacturer','Wholesaler','Limited Manufacturing')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('License Status', 'Active');
	// 	}

	if (matches(appTypeArray[3], 'Non-Resident Seller License', 'Manufacturer', 'Wholesaler', 'Limited Manufacturing')) {
		renewDate = '12/31/' + startDate.getFullYear();
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	if (appTypeArray[3].equals('Self-Distribution')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:41a
	// if (appTypeArray[3].equals('Self-Distribution')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('License Status', 'Active');
	// 	}

	if (appTypeArray[1].equals('Education')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('Certificate Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:50a
	// if (appTypeArray[1].equals('Education')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('Certificate Status', 'Active');
	// 	}

	if (appTypeArray[3].equals('Armed Forces Import')) {
		renewDate = AInfo['Exact date of shipment'];
		licEditExpInfo('Active', renewDate);
		updateTask('Permit Status', 'Active');
	}

	if (appTypeArray[3].equals('Supplier Representative')) {
		renewDate = '12/31/' + startDate.getFullYear();
		licEditExpInfo('Active', renewDate);
		updateTask('Permit Status', 'Active');
	}

	if (appTypeArray[1].equals('Permits') && !matches(appTypeArray[3], 'Armed Forces Import', 'Supplier Representative')) {
		updateTask('Permit Status', 'Active');
		newYear = parseInt(fileDateObj.getYear()) + 5;
		renewDate = wfDate.substr(5, 2) + '/' + wfDate.substr(8, 2) + '/' + newYear;
		licEditExpInfo('Active', renewDate);
		comment('===> Permit 5 year date ' + renewDate);
	}

	if (!appTypeArray[1].equals('Permits') && !appTypeArray[3].equals('Special Occasion')) {
		licProfNum = capId.getCustomID();
		comment('LIC PROF #: ' + licProfNum);
		lic = getRefLicenseProf(String(licProfNum));
		lic.setBusinessLicExpDate(aa.date.parseDate(renewDate));
		lic.setLicenseIssueDate(sysDate);
		aa.licenseScript.editRefLicenseProf(lic);
	}

}
