
if (wfTask == 'Application Status' && wfStatus == 'Issued' && !balanceDue == 0) {
	showMessage = true;
	message = 'Balance pending. Must be paid before proceeding.';
	cancel = true;
}

if (wfTask.equals('Preliminary Review') && wfStatus.equals('Approved')) {
	citExists = false;
	licStMConds = new Array();
	licStMConds = getLicenseConditions('Citation', 'Applied', 'Sale To Minor', 'Notice');
	if (licStMConds.length > 0)
		citExists = true;
}
