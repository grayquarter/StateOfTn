
// DISABLED: WTUA:TNABC/*/Citation/*:01
// if (wfTask == 'Citation Status'  && wfStatus == 'Issued' && AInfo['License Number'] != null) {
// 	addParent(AInfo['License Number']);
// 	}

if (wfTask == 'Citation Status' && wfStatus == 'Invoice Fines') {

	//start replaced branch: TABC_INVOICE_FINES
	{
		if (feeExists('CIT002', 'NEW') && AInfo['Sale of Alcoholic Beverage/Beer to Minor']) {
			invoiceFee('CIT002', 'FINAL');
		}

		if (feeExists('CIT004', 'NEW') && AInfo['Minor in Possession']) {
			invoiceFee('CIT004', 'FINAL');
		}

		if (feeExists('CIT006', 'NEW') && AInfo['Sell/Furnishing Alcoholic Beverage to Visibly Intoxicated Person']) {
			invoiceFee('CIT006', 'FINAL');
		}

		if (feeExists('CIT008', 'NEW') && AInfo['Failure to Maintain Min Seating Requirements']) {
			invoiceFee('CIT008', 'FINAL');
		}

		if (feeExists('CIT010', 'NEW') && AInfo['Failure to Properly Display Permit in a Conspicuous Place']) {
			invoiceFee('CIT010', 'FINAL');
		}

		if (feeExists('CIT012', 'NEW') && AInfo['Failure to Post GǣPregnancy WarningGǣ']) {
			invoiceFee('CIT012', 'FINAL');
		}

		if (feeExists('CIT014', 'NEW') && AInfo['Health Inspection Displayed']) {
			invoiceFee('CIT014', 'FINAL');
		}

		if (feeExists('CIT016', 'NEW') && AInfo['Employing Persons to Dispense Alcoholic Beverages W/O a Permit']) {
			invoiceFee('CIT016', 'FINAL');
		}

		if (feeExists('CIT018', 'NEW') && AInfo['Failure to Timely Renew']) {
			invoiceFee('CIT018', 'FINAL');
		}

		if (feeExists('CIT020', 'NEW') && AInfo['On Premises Sale By Bottle Restricted']) {
			invoiceFee('CIT020', 'FINAL');
		}

		if (feeExists('CIT022', 'NEW') && AInfo['Hours of Sale Violation']) {
			invoiceFee('CIT022', 'FINAL');
		}

		if (feeExists('CIT024', 'NEW') && AInfo['Purchasing Alcoholic Beverages From Other Than A Licensed Wholesaler']) {
			invoiceFee('CIT024', 'FINAL');
		}

		// DISABLED: TABC_INVOICE_FINES:13
		// if (feeExists('CIT095','NEW') && AInfo['Other #1'] && AInfo['Amount #1']) {
		// 	invoiceFee('CIT095','FINAL');
		// 	}

		// DISABLED: TABC_INVOICE_FINES:14
		// if (feeExists('CIT096','NEW') && AInfo['Other #2'] && AInfo['Amount #2']) {
		// 	invoiceFee('CIT096','FINAL');
		// 	}

		// DISABLED: TABC_INVOICE_FINES:15
		// if (feeExists('CIT097','NEW') && AInfo['Other #3'] && AInfo['Amount #3']) {
		// 	invoiceFee('CIT097','FINAL');
		// 	}

		// DISABLED: TABC_INVOICE_FINES:16
		// if (feeExists('CIT098','NEW') && AInfo['Other #4'] && AInfo['Amount #4']) {
		// 	invoiceFee('CIT098','FINAL');
		// 	}

		comment('====== Status : ' + wfStatus);

	}
	//end replaced branch: TABC_INVOICE_FINES;
}

// DISABLED: WTUA:TNABC/*/Citation/*:03
// br_nch('WTUA:TNABC/*/Application/* Update Status');
if (wfTask.equals('Payment Plan') && wfStatus.equals('Payment Plan Approved')) {
	comment('calculating schedule');
	citationDates();
}

if (wfTask.equals('Hearing') && wfStatus.equals('Proceed with Hearing')) {
	hChild = createChild('TNABC', 'Hearing', 'NA', 'NA', '');
	copyLicensedProf(capId, hChild);
}
