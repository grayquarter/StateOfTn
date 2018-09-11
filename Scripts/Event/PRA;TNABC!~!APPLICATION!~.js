
// DISABLED: PRA:TNABC/*/Application/*:00
// showDebug=true;
// showMessage=true;
// DISABLED: PRA:TNABC/*/Application/*:10
// if (matches(appTypeArray[1],'Liquor by the Drink','Retail','Supplier','Wholesale') && (taskStatus('Application Review') == 'Approved' || taskStatus('Commission Meeting') == 'Approved') && balanceDue == 0) {
// 	logDebug('MATCH in PRA:TNABC/*/Application/*');
// 	asiLicenseCounty = getCountyValue(capId);
// 	br_nch('TABC_Create_Individual_Licenses_1');
// 	closeTask('Application Status','Issued','Updated via EMSE','');
//	} else {
// 	logDebug('NO MATCH in PRA:TNABC/*/Application/*');
// 	}

if (matches(appTypeArray[1], 'Liquor by the Drink', 'Retail', 'Supplier', 'Wholesale') && (taskStatus('Application Review') == 'Approved' || taskStatus('Commission Meeting') == 'Approved' || taskStatus('Application Review') == 'Approved - No Commission') && balanceDue == 0) {
	logDebug('MATCH in PRA:TNABC/*/Application/*');
	asiLicenseCounty = getCountyValue(capId);

	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
} else {
	logDebug('NO MATCH in PRA:TNABC/*/Application/*');
}
