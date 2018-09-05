
if (wfTask == 'Application Status' && wfStatus == 'Issued' && balanceDue > 0) {
	showMessage = false;
	message = 'Balance pending. Must be paid before proceeding.';
	showMessage = true;
	cancel = true;
}

if (appTypeArray[1].equals('Permits') && !appTypeArray[3].equals('Server') && wfTask == 'Preliminary Review' && wfStatus == 'Approved' && balanceDue > 0) {
	showMessage = true;
	message = 'Balance pending. Must be paid before proceeding.';
	cancel = true;
}

var backgroundDocCheck = false;
if (wfTask == 'Investigative Review' && wfStatus == 'Approved' && appHasCondition('Audit', 'Applied', 'Background Audit', null)) {
	backgroundDocCheck = true;
}

if (backgroundDocCheck) {
	var doclist = aa.document.getCapDocumentList(capId, 'ADMIN');
	var docArray = null;
	var docBackgroundCheckFound = false;
}

if (backgroundDocCheck && doclist.getSuccess()) {
	docArray = doclist.getOutput();
	for (docItem in docArray)
		if (docArray[docItem].getDocCategory() == 'Results of Background Check' || docArray[docItem].getDocCategory() == 'Background check')
			docBackgroundCheckFound = true;
}

if (backgroundDocCheck && !docBackgroundCheckFound) {
	showMessage = false;
	message = 'The Background Audit Condition requires the Background Check document to be attached to this record before proceeding.';
	showMessage = true;
	cancel = true;
}

if (backgroundDocCheck && docBackgroundCheckFound) {
	editCapConditionStatus('Audit', 'Background Audit', 'Satisfied', '');
}

if (matches(appTypeArray[1], 'Licenses', 'Liquor by the Drink', 'Retail', 'Supplier', 'Wholesale') && wfTask.equals('Application Status') && wfStatus.equals('Issued')) {
	asiLicenseCounty = getCountyValue(capId);
}

if (matches(appTypeArray[1], 'Licenses', 'Liquor by the Drink', 'Retail', 'Supplier', 'Wholesale') && wfTask.equals('Application Status') && wfStatus.equals('Issued') && asiLicenseCounty == null) {
	showMessage = true;
	comment('Address County field is null;
		Please complete prior to Issuing Permit or License');
	cancel = true;
}
