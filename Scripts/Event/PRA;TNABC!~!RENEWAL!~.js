
// DISABLED: PRA:TNABC/*/Renewal/*:10
// showDebug=true;
// showMessage=true;
// itemCap = getParentCapID4Renewal();
// logDebug('Parent Cap: ' + itemCap );
if (matches(appTypeArray[1], 'Liquor by the Drink', 'Retail', 'Supplier', 'Wholesale') && (taskStatus('Application Review') == 'Approved' || taskStatus('Commission Meeting') == 'Approved' || taskStatus('Application Review') == 'Approved - No Commission') && balanceDue == 0) {
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

// DISABLED: PRA:TNABC/*/Renewal/*:12a
// if (matches(appTypeArray[1],'Liquor by the Drink','Retail','Supplier','Wholesale') && (taskStatus('Application Review') == 'Approved' || taskStatus('Commission Meeting') == 'Approved' || taskStatus('Application Review') == 'Approved - No Commission' ) && balanceDue == 0) {
// 	logDebug('MATCH');
// 	eval(getScriptText('PaymentReceiveAfter4Renew',null,false));
// 	itemCap = getParentCapID4Renewal();
// 	logDebug('Parent Cap2: ' + itemCap );
// 	saveCap = capId;
// 	capId = itemCap;
// 	br_nch('TABC_Create_Individual_Licenses_5');
// 	capId = saveCap;
// 	closeTask('Application Status','Issued','Updated via EMSE','');
//	} else {
// 	logDebug('NO MATCH in PRA:/TNABC/*/Renewal/*');
// 	}
