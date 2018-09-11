
// DISABLED: ASA:TNABC/*/Application/*:01
// if (appMatch('TNABC/*/Application/*')) {
// 	PutInFeeAssess='No';
// 	}

// DISABLED: ASA:TNABC/*/Application/*:02
// if (appMatch('TNABC/*/Application/*') && !appMatch('TNABC/Education/Application/*') && !appMatch('TNABC/Permits/*/*')) {
// 	licCapId=capId;
// 	generateAltID(capId);
// 	newLicId=capId;
// 	updateAltID(newLicId);
// DISABLED: ASA:TNABC/*/Application/*:03
// 	updateAppStatus('In Review','Initial submission');
// 	updateTask('Preliminary Review','Submitted');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:04
// if (appMatch('TNABC/Education/Application/*')) {
// 	updateAppStatus('In Review','Initial submission');
// 	updateTask('Preliminary Review','Submitted');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:05
// createRefContactsFromCapContactsAndLink(capId, null, null, false, true, comparePeopleTNABC);
// DISABLED: ASA:TNABC/*/Application/*:06
// if (appMatch('TNABC/Permits/Application/*')) {
// 	licCapId=capId;
// 	generatePermitAltID(capId);
// 	newLicId=capId;
// 	updatePermitAltID(newLicId);
// 	}

// DISABLED: ASA:TNABC/*/Application/*:15
// if (appMatch('TNABC/Permits/Application/*')) {
// 	var auditId = newLicId.getCustomID();
// 	var endsWith00 = auditId.endsWith('89');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:20
// if ((appMatch('TNABC/Permits/Application/Certified Manager') || appMatch('TNABC/Permits/Application/Server') || appMatch('TNABC/Permits/Application/Wholesale Employee') || appMatch('TNABC/Permits/Application/Wholesale Representative')) && (endsWith00)) {
// 	addAppCondition('Audit','Applied','Background Audit', '' ,'Notice' ,'');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:21
// if ((appMatch('TNABC/Permits/Application/Certified Manager') || appMatch('TNABC/Permits/Application/Server') || appMatch('TNABC/Permits/Application/Wholesale Employee') || appMatch('TNABC/Permits/Application/Wholesale Representative')) && (endsWith00)) {
// 	addStdCondition('Audit','Background Audit');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:30
// if (!publicUser) {
// 	var appCounty = '';
// 	appCounty = getCountyValue(capId);
// 	var POD = countyLookUp('CName',appCounty);
// 	assignDepartment_Custom(POD);
// DISABLED: ASA:TNABC/*/Application/*:35
// 	var department = 'TABC/NA/NA/LICNPERM/NA/NA/NA';
// 	var wfTask='Preliminary Review';
// 	autoAssign(wfTask, department);
// 	if (appCounty != '') updateAddressCounty(appCounty);
// 	}

// DISABLED: ASA:TNABC/*/Application/*:40
// if (!publicUser && !matches(appTypeArray[1],'Permits','Education') && !matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	scheduleInspection('New License Inspection',30);
// 	}

// DISABLED: ASA:TNABC/*/Application/*:45
// if (!publicUser && matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	closeTask('Investigative Review','NA','Inspection Not Needed','');
// 	}

