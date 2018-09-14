
// DISABLED: PRA:TNABC/Education/Renewal/Server Training Program:10
// showDebug=true;
// showMessage=true;
// itemCap = getParentCapID4Renewal();
// logDebug('Parent Cap: ' + itemCap );
if (taskStatus('Application Review') == 'Approved' && balanceDue == 0) {
	logDebug('MATCH');
	itemCap = getParentCapID4Renewal();
	logDebug('Parent Cap2: ' + itemCap);
	saveCap = capId;
	capId = itemCap;
	//replaced branch(TABC_Create_Individual_Licenses_5)
	createIndividualLicenses5();
	capId = saveCap;
	aa.runScriptInNewTransaction('PaymentReceiveAfter4Renew');
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
} else {
	logDebug('NO MATCH');
}
