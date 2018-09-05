
// DISABLED: CTRCA:TNABC/*/Application/*:01
// comment('===> Running Convert To Real Cap After');
// DISABLED: CTRCA:TNABC/*/Application/*:02
// updateAppStatus('Submitted','Online Submission status');
// updateTask('Preliminary Review','Submitted');
// DISABLED: CTRCA:TNABC/*/Application/*:03
// if (!appMatch('TNABC/Education/Application/*') && !appMatch('TNABC/Permits/Application/*')) {
// 	licCapId=capId;
// 	generateAltID(capId);
// 	newLicId=capId;
// 	updateAltID(newLicId);
// 	}

// DISABLED: CTRCA:TNABC/*/Application/*:04
// if (appMatch('TNABC/Permits/Application/*')) {
// 	licCapId=capId;
// 	generatePermitAltID(capId);
// 	newLicId=capId;
// 	updatePermitAltID(newLicId);
// DISABLED: CTRCA:TNABC/*/Application/*:15
// 	var auditId = newLicId.getCustomID();
// 	var endsWith00 = auditId.endsWith('00');
// 	}

// DISABLED: CTRCA:TNABC/*/Application/*:20
// if ((appMatch('TNABC/Permits/Application/Certified Manager') || appMatch('TNABC/Permits/Application/Server') || appMatch('TNABC/Permits/Application/Wholesale Employee') || appMatch('TNABC/Permits/Application/Wholesale Representative')) && (endsWith00)) {
// 	addAppCondition('Audit','Applied','Background Audit', '' ,'Notice' ,'');
// 	}

// DISABLED: CTRCA:TNABC/*/Application/*:30
// var appCounty = '';
// appCounty = getCountyValue(capId);
// var POD = countyLookUp('CName',appCounty);
// assignDepartment_Custom(POD);
// DISABLED: CTRCA:TNABC/*/Application/*:35
// var department = 'TABC/NA/NA/LICNPERM/NA/NA/NA';
// var wfTask='Preliminary Review';
// autoAssign(wfTask, department);
// DISABLED: CTRCA:TNABC/*/Application/*:40
// if (!matches(appTypeArray[1],'Permits','Education') && !matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	updateAddressCounty(appCounty);
// 	scheduleInspection('New License Inspection',30);
// 	}

// DISABLED: CTRCA:TNABC/*/Application/*:45
// if (matches(appTypeArray[1],'Permits','Education') && matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	closeTask('Investigative Review','NA','Inspection Not Needed','');
// 	}
