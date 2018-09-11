
// DISABLED: PRA:TNABC/Education/Renewal/Server Training Trainer:10
// showDebug=false;
// showMessage=false;
// itemCap = getParentCapID4Renewal();
// logDebug('Parent Cap: ' + itemCap );
if (matches(appTypeArray[3], 'Server Training Trainer') && (taskStatus('Application Review') == 'Approved' || taskStatus('Commission Meeting') == 'Approved' || taskStatus('Application Review') == 'Approved - No Commission') && balanceDue == 0) {
	logDebug('MATCH');
	eval(getScriptText('PaymentReceiveAfter4Renew', null, false));
	itemCap = getParentCapID4Renewal();
	logDebug('Parent Cap2: ' + itemCap);
	saveCap = capId;
	capId = itemCap;

	//replaced branch(TABC_Create_Individual_Licenses_5)
	createIndividualLicenses5();
	capId = saveCap;
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
} else {
	logDebug('NO MATCH in PRA:/TNABC/*/Renewal/Server Training Trainer');
}

// DISABLED: PRA:TNABC/Education/Renewal/Server Training Trainer:13OLD
// if (matches(appTypeArray[3],'Server Training Trainer') && (taskStatus('Application Review') == 'Approved' || taskStatus('Commission Meeting') == 'Approved' || taskStatus('Application Review') == 'Approved - No Commission' ) && balanceDue == 0) {
// 	logDebug('MATCH');
// 	itemCap = getParentCapID4Renewal();
// 	logDebug('Parent Cap2: ' + itemCap );
// 	saveCap = capId;
// 	capId = itemCap;
// 	br_nch('TABC_Create_Individual_Licenses_5');
// 	capId = saveCap;
// 	aa.runScriptInNewTransaction('PaymentReceiveAfter4Renew');
// 	closeTask('Application Status','Issued','Updated via EMSE','');
//	} else {
// 	logDebug('NO MATCH in PRA:/TNABC/Education/Renewal/Server Training Trainer');
// 	}


// DISABLED: PRA:/TNABC/Education/Renewal/Server Training Trainer:10
// showDebug=false;
// showMessage=false;
// itemCap = getParentCapID4Renewal();
// logDebug('Parent Cap: ' + itemCap );
// DISABLED: PRA:/TNABC/Education/Renewal/Server Training Trainer:12
// if (matches(appTypeArray[3],'Server Training Trainer') && (taskStatus('Application Review') == 'Approved' || taskStatus('Commission Meeting') == 'Approved' || taskStatus('Application Review') == 'Approved - No Commission' ) && balanceDue == 0) {
// 	logDebug('MATCH');
// 	itemCap = getParentCapID4Renewal();
// 	logDebug('Parent Cap2: ' + itemCap );
// 	saveCap = capId;
// 	capId = itemCap;
// 	br_nch('TABC_Create_Individual_Licenses_5');
// 	capId = saveCap;
// 	aa.runScriptInNewTransaction('PaymentReceiveAfter4Renew');
// 	closeTask('Application Status','Issued','Updated via EMSE','');
//	} else {
// 	logDebug('NO MATCH in PRA:/TNABC/Education/Renewal/Server Training Trainer');
// 	}
