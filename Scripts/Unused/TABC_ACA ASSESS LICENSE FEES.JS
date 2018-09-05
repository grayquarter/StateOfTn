
matches = (currentUserID.indexOf('PUBL') >= 0);
// DISABLED: TABC_ACA Assess License Fees:02
// if (matches) {
// 	voidRemoveAllFees();
// 	}

if (matches) {
	
//start replaced branch: TABC_LIC_FEE_ASSESS
 {
if (appMatch('TNABC/Liquor by the Drink/Application/*')) {
	updateFee('LBD010','TABC_LBD_FEES','FINAL',1,'Y');
	}

if (appMatch('TNABC/Permits/Application/Server')) {
	updateFee('PER010','TABC_PERMIT_FEES','FINAL',1,'Y');
	}

if (appMatch('TNABC/Education/Application/Server Training Trainer Cert') && AInfo['Type of Trainer'] == 'Individual') {
	addFee('EDU008','TABC_EDUCATION_FEES','FINAL',1,'Y');
	}

if (appMatch('TNABC/Education/Application/Server Training Trainer Cert') && AInfo['Type of Trainer'] == 'Corporation' && AInfo['Training provided to'] == 'Public') {
	addFee('EDU005','TABC_EDUCATION_FEES','FINAL',1,'Y');
	}

if (appMatch('TNABC/Education/Application/Server Training Trainer Cert') && AInfo['Type of Trainer'] == 'Corporation' && AInfo['Training provided to'] == 'In-house') {
	addFee('EDU007','TABC_EDUCATION_FEES','FINAL',1,'Y');
	}

if (appMatch('TNABC/Education/Application/Server Training Trainer Cert') && AInfo['Type of Trainer'] == 'Corporation' && AInfo['Training provided to'] == 'Private') {
	addFee('EDU006','TABC_EDUCATION_FEES','FINAL',1,'Y');
	}

comment('TABC_LIC_FEE_ASSESS script End');

}
//end replaced branch: TABC_LIC_FEE_ASSESS;
	}

