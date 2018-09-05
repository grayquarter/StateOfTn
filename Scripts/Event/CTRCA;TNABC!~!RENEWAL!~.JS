
// DISABLED: CTRCA:TNABC/*/Renewal/*:02
// aa.runScript('Convert2RealCapAfter4Renew');
// Cap=capId.getCustomID();
// comment('===> CapId : '+capId+'    '+ Cap);
// DISABLED: CTRCA:TNABC/*/Renewal/*:03
// ParentCap=parentCapId.getCustomID();
// comment('===> PparentCapId : '+ ParentCap);
// DISABLED: CTRCA:TNABC/*/Renewal/*:04
// if (!appMatch('TNABC/Education/Renewal/*')) {
// 	appCounty= getCountyValue(capId);
// 	var POD = countyLookUp('CName',appCounty);
// 	assignDepartment_Custom(POD);
// 	}

// DISABLED: CTRCA:TNABC/*/Renewal/*:05
// if (!appMatch('TNABC/Education/Renewal/*')  && appCounty != null) {
// 	licCapId=capId;
// 	generateAltID(capId);
// 	newLicId=capId;
// 	updateAltID(newLicId);
// 	}

// DISABLED: CTRCA:TNABC/*/Renewal/*:35
// var department = 'TABC/NA/NA/LICNPERM/NA/NA/NA';
// var wfTask='Preliminary Review';
// autoAssign(wfTask, department);
// if (appCounty != '') updateAddressCounty(appCounty);
// DISABLED: CTRCA:TNABC/*/Renewal/*:40
// if (!matches(appTypeArray[1],'Permits','Education') && !matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	scheduleInspection('Renewal Inspection',30);
// 	}

// DISABLED: CTRCA:TNABC/*/Renewal/*:45
// if (matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	closeTask('Investigative Review','NA','Inspection Not Needed','');
// 	}
