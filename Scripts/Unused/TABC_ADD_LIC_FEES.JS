
// DISABLED: TABC_ADD_LIC_FEES:05
// var recType = appTypeArray[3];
// var guideASI = new Array();
// var inspectionId = 0;
// var ttlSeatCount = 0;
// DISABLED: TABC_ADD_LIC_FEES:10
// if (appTypeArray[3].equals('Special Legislation')) {
// 	if (appTypeArray[1].equals('Liquor by the Drink')) recType = 'LBD Special Legislation';
// 	if (appTypeArray[1].equals('Retail')) recType = 'Retail Special Legislation';
// 	aa.print('IT IS: ' +recType);
// 	}

// DISABLED: TABC_ADD_LIC_FEES:15
// var feeInfo = new Array();
// feeInfo = lookup('LIC_FEE_LOOKUP',recType).split('|');
// DISABLED: TABC_ADD_LIC_FEES:20
// if (!matches(appTypeArray[3],'Hotel Motel','Limited Service','Restaurant','Wine Only')) {
// 	if (feeInfo != 'NONE') updateFee(feeInfo[1],feeInfo[0],'FINAL',1,'Y');
//	} else {
// 	inspectionId = getInspNum();
// 	guideASI = loadGuideSheetItemsWASI(inspectionId);
// 	ttlSeatCount = guideASI['Total Seat Count'];
// 	logDebug('Total Seats = ' + ttlSeatCount);
// 	if (ttlSeatCount > 0) updateFee(feeInfo[1],feeInfo[0],'FINAL',ttlSeatCount ,'Y');
// 	}

// DISABLED: TABC_ADD_LIC_FEES:25
// if (feeInfo != 'NONE') {
// 	feeTtl = feeAmount(feeInfo[1]);
// 	logDebug('The Invoiced fee amt = ' + feeTtl);
// 	}

