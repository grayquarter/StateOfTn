
aa.runScript('ApplicationSubmitAfter4Renew');
comment('===> Running Renewal ApplicationSubmitAfter4Renew');
currentCapAlt = capId.getCustomID();
comment('===> Current CapId : ' + capId + '     Current Alt Id : ' + currentCapAlt);
ParentCap = parentCapId.getCustomID();
comment('===> ParentCap : ' + ParentCap);
comment('===> parentCapId : ' + parentCapId);
if (!appMatch('TNABC/Education/Renewal/*') && !publicUser) {
	var appCounty = '';
	appCounty = getCountyValue(parentCapId);
	var POD = countyLookUp('CName', appCounty);
	assignDepartment_Custom(POD);
}

// DISABLED: ASA:TNABC/*/Renewal/*:31
// if (!appMatch('TNABC/Education/Renewal/*')  && asiLicenseCounty) {
// 	licCapId=capId;
// 	generateAltID(capId);
// 	newLicId=capId;
// 	updateAltID(newLicId);
var department = 'TABC/NA/NA/LICNPERM/NA/NA/NA';
var wfTask = 'Preliminary Review';
autoAssign(wfTask, department);
if (appCounty != '')
	updateAddressCounty(appCounty);
}

if (!publicUser && !appTypeArray[3].equals('Renewal') && !matches(appTypeArray[1], 'Permits', 'Education') && !matches(appTypeArray[3], 'Non-Manufacturing Non-Resident', 'Non-Resident Sellers', 'Delivery Service', 'Direct Shipper')) {
	scheduleInspection('Renewal Inspection', 30);
}

if (!publicUser && !appTypeArray[3].equals('Renewal') && matches(appTypeArray[3], 'Non-Manufacturing Non-Resident', 'Non-Resident Sellers', 'Delivery Service', 'Direct Shipper')) {
	closeTask('Investigative Review', 'NA', 'Inspection Not Needed', '');
}
