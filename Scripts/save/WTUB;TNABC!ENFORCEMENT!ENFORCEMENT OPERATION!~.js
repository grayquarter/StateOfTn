
if (wfTask == 'Planning' && wfStatus == 'Plan Approval' && !AInfo['Estimated Hours']) {
	showMessage = false;
	message = ' Must enter Estimated Hours before proceeding.';
	showMessage = true;
	cancel = true;
}

if (wfTask == 'Planning' && wfStatus == 'Plan Approval' && !AInfo['Estimated Funds']) {
	showMessage = false;
	message = 'Must enter Funding amount before proceeding.';
	showMessage = true;
	cancel = true;
}

if (wfTask == 'Planning' && wfStatus == 'Plan Approval' && !AInfo['Estimated Hours'] && !AInfo['Estimated Hours']) {
	showMessage = false;
	message = 'Estimated Hours and Funding information is missing.';
	showMessage = true;
	cancel = true;
}
