
if (!feeExists('CIT002','NEW')) {
	addFee('CIT002','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Sale of Alcoholic Beverage/Beer to Minor']) ,'N');
	}

if (feeExists('CIT002','NEW')) {
	updateFee('CIT002','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Sale of Alcoholic Beverage/Beer to Minor']) ,'N');
	}

if (!feeExists('CIT004','NEW')) {
	addFee('CIT004','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Minor in Possession']) ,'N');
	}

if (feeExists('CIT004','NEW')) {
	updateFee('CIT004','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Minor in Possession']) ,'N');
	}

if (!feeExists('CIT006','NEW')) {
	addFee('CIT006','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Sell/Furnishing Alcoholic Beverage to Visibly Intoxicated Person']) ,'N');
	}

if (feeExists('CIT006','NEW')) {
	updateFee('CIT006','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Sell/Furnishing Alcoholic Beverage to Visibly Intoxicated Person']) ,'N');
	}

if (!feeExists('CIT008','NEW')) {
	addFee('CIT008','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Failure to Maintain Min Seating Requirements']) ,'N');
	}

if (feeExists('CIT008','NEW')) {
	updateFee('CIT008','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Failure to Maintain Min Seating Requirements']) ,'N');
	}

if (!feeExists('CIT010','NEW')) {
	addFee('CIT010','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Failure to Properly Display Permit in a Conspicuous Place']) ,'N');
	}

if (feeExists('CIT010','NEW')) {
	updateFee('CIT010','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Failure to Properly Display Permit in a Conspicuous Place']) ,'N');
	}

if (!feeExists('CIT012','NEW')) {
	addFee('CIT012','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Failure to Post GǣPregnancy WarningGǣ']) ,'N');
	}

if (feeExists('CIT012','NEW')) {
	updateFee('CIT012','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Failure to Post GǣPregnancy WarningGǣ']) ,'N');
	}

if (!feeExists('CIT014','NEW')) {
	addFee('CIT014','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Health Inspection Displayed']) ,'N');
	}

if (feeExists('CIT014','NEW')) {
	updateFee('CIT014','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Health Inspection Displayed']) ,'N');
	}

if (!feeExists('CIT016','NEW')) {
	addFee('CIT016','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Employing Persons to Dispense Alcoholic Beverages W/O a Permit']) ,'N');
	}

if (feeExists('CIT016','NEW')) {
	updateFee('CIT016','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Employing Persons to Dispense Alcoholic Beverages W/O a Permit']) ,'N');
	}

if (!feeExists('CIT018','NEW')) {
	addFee('CIT018','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Failure to Timely Renew']) ,'N');
	}

if (feeExists('CIT018','NEW')) {
	updateFee('CIT018','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Failure to Timely Renew']) ,'N');
	}

if (!feeExists('CIT020','NEW')) {
	addFee('CIT020','TABC_CITATION_FEES','FINAL', parseInt(AInfo['On Premises Sale By Bottle Restricted']) ,'N');
	}

if (feeExists('CIT020','NEW')) {
	updateFee('CIT020','TABC_CITATION_FEES','FINAL', parseInt(AInfo['On Premises Sale By Bottle Restricted']) ,'N');
	}

if (!feeExists('CIT022','NEW')) {
	addFee('CIT022','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Hours of Sale Violation']) ,'N');
	}

if (feeExists('CIT022','NEW')) {
	updateFee('CIT022','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Hours of Sale Violation']) ,'N');
	}

if (!feeExists('CIT024','NEW')) {
	addFee('CIT024','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Purchasing Alcoholic Beverages From Other Than A Licensed Wholesaler']) ,'N');
	}

if (feeExists('CIT024','NEW')) {
	updateFee('CIT024','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Purchasing Alcoholic Beverages From Other Than A Licensed Wholesaler']) ,'N');
	}

// DISABLED: TABC_ASSESS_FINES:25
// if (!feeExists('CIT095','NEW')) {
// 	addFee('CIT095','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Other #1']*AInfo['Amount #1']) ,'N');
// 	}

// DISABLED: TABC_ASSESS_FINES:26
// if (feeExists('CIT095','NEW')) {
// 	updateFee('CIT095','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Other #1']*AInfo['Amount #1']) ,'N');
// 	}

// DISABLED: TABC_ASSESS_FINES:27
// if (!feeExists('CIT096','NEW')) {
// 	addFee('CIT096','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Other #2']*AInfo['Amount #2']) ,'N');
// 	}

// DISABLED: TABC_ASSESS_FINES:28
// if (feeExists('CIT096','NEW')) {
// 	updateFee('CIT096','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Other #2']*AInfo['Amount #2']) ,'N');
// 	}

// DISABLED: TABC_ASSESS_FINES:29
// if (!feeExists('CIT097','NEW')) {
// 	addFee('CIT097','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Other #3']*AInfo['Amount #3']) ,'N');
// 	}

// DISABLED: TABC_ASSESS_FINES:30
// if (feeExists('CIT097','NEW')) {
// 	updateFee('CIT097','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Other #3']*AInfo['Amount #3']) ,'N');
// 	}

// DISABLED: TABC_ASSESS_FINES:31
// if (!feeExists('CIT098','NEW')) {
// 	addFee('CIT098','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Other #4']*AInfo['Amount #4']) ,'N');
// 	}

// DISABLED: TABC_ASSESS_FINES:32
// if (feeExists('CIT098','NEW')) {
// 	updateFee('CIT098','TABC_CITATION_FEES','FINAL', parseInt(AInfo['Other #4']*AInfo['Amount #4']) ,'N');
// 	}

