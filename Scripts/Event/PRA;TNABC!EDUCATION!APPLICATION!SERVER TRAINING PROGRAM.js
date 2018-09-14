
if (taskStatus('Application Review') == 'Approved' && balanceDue == 0) {
	logDebug('MATCH in PRA:TNABC/Education/Application/Server Training Program');
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
} else {
	logDebug('NO MATCH');
}

// DISABLED: PRA:TNABC/Education/Application/Server Training Program:11
// if (taskStatus('Application Review') == 'Approved' && balanceDue == 0) {
// 	logDebug('MATCH');
// 	itemCap = getParentCapID4Renewal();
// 	eval(getScriptText('PaymentReceiveAfter4Renew',null,false));
// 	logDebug('Parent Cap2: ' + itemCap );
// 	saveCap = capId;
// 	capId = itemCap;
// 	br_nch('TABC_Create_Individual_Licenses_5');
// 	capId = saveCap;
// 	closeTask('Application Status','Issued','Updated via EMSE','');
//	} else {
// 	logDebug('NO MATCH');
// 	}
