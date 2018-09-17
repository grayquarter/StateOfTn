
if (appTypeArray[1].equals('Permits') && !appTypeArray[3].equals('Server') && wfTask == 'Preliminary Review' && wfStatus == 'Approved') {
	var asiLicenseCounty = '';
	asiLicenseCounty = getCountyValue(capId);
	if (asiLicenseCounty == 'undefined' || asiLicenseCounty == null) {
		asiLicenseCounty = AInfo['County'];
	}
	comment('Permit COUNTY =  ' + asiLicenseCounty);
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
}

if (appTypeArray[1].equals('Education') && !appTypeArray[3].equals('Server Training Program') && wfTask == 'Application Review' && wfStatus == 'Approved') {
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
}

if (appTypeArray[3].equals('Special Occasion') && wfTask == 'Application Review' && wfStatus == 'Approved') {
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
}

if (appTypeArray[1].equals('Wholesale') && appTypeArray[3].equals('Self-Distribution') && wfTask == 'Application Review' && wfStatus == 'Approved') {
	asiLicenseCounty = getCountyValue(capId);
	//replaced branch(TABC_Create_Individual_Licenses_1)
	createIndividualLicenses1();
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
}

//replaced branch(WTUA:TNABC/*/Application/* Update Status)
applicationUpdateStatus();
if (isTaskActive('Inspection')) {
	if (taskStatus('Inspection').equals('Not Applicable')) {
		deactivateTask('Inspection');
	}
}


// merged existing script code

/*
Event Script: WTUA:TNABC!NA!APPLICATION!NA
Event: WorkflowTaskUpdateAfter

CHANGE LOG:
06/29/2018 (Chris Kim)
-- Added block on 91 to close out server permits if they are denied.

 */

if (!matches(appTypeArray[1], "Education", "Permits")) {
	if (taskStatus("Application Review") == "Approved" || taskStatus("Commission Meeting") == "Approved" || taskStatus("Application Review") == "Approved - No Commission") {
		var recType = appTypeArray[3];
		var guideASI = new Array();
		var inspectionId = 0;
		var ttlSeatCount = 0;

		if (appTypeArray[3].equals("Special Legislation")) {
			feeInfo = lookup("LIC_FEE_SPLEG_LOOKUP", AInfo["Special Legistation Type"]).split("|");

			if (feeInfo != "undefined") {}
			//Special Legislation should not autoinvoice - 02232018 CHK
			//updateFee(feeInfo[1],feeInfo[0],"FINAL",1,"Y");
		} else {
			var feeInfo = new Array();
			feeInfo = lookup("LIC_FEE_LOOKUP", recType).split("|");
			if (!matches(appTypeArray[3], "Hotel-Motel", "Limited Service", "Restaurant", "Wine Only")) {
				if (feeInfo != "NONE") {
					if (appTypeArray[3].equals("Non-Manufacturing Non-Resident"))
						logDebug("Non-Manufacturing Non-Resident");
					if (appTypeArray[3].equals("Non-Resident Sellers")) {
						if (AInfo["How many cases of alcoholic beverages were sold or distributed in TN, during the calendar year?"] == "Less than 100 cases")
							var ttlCases = 150;
						else
							var ttlCases = 250;

						updateFee(feeInfo[1], feeInfo[0], "FINAL", ttlCases, "Y");
					} else
						updateFee(feeInfo[1], feeInfo[0], "FINAL", 1, "Y");
				}
			}
			//If The License type = Hotel Motel/LMT SERV/REST/WINEONLY
			else {
				//Todo: CHK Create Functions for Limited Service and Hotel/Motel based on seat count
				if (matches(appTypeArray[3], "Hotel-Motel")) { // 02272018 Go by Room Count
					inspectionId = getInspNum();
					logDebug("InspId: " + inspectionId);
					guideASI = loadGuideSheetItemsWASI(inspectionId);
					logDebug("guideASI: " + guideASI);
					ttlRoomCount = guideASI["Total Room Count"];
					logDebug("Total Rooms = " + ttlRoomCount);
					if (ttlRoomCount > 0)
						updateFee(feeInfo[1], feeInfo[0], "FINAL", ttlRoomCount, "Y");
				}
				if (matches(appTypeArray[3], "Limited Service")) {
					inspectionId = getInspNum();
					logDebug("InspId: " + inspectionId);
					guideASI = loadGuideSheetItemsWASI(inspectionId);
					logDebug("guideASI: " + guideASI);
					ttlSales = guideASI["Gross Sales % of Prepared Food"];
					logDebug("Gross Sales % of Prepared Food = " + ttlSales);
					if (ttlSales > 0)
						updateFee(feeInfo[1], feeInfo[0], "FINAL", ttlSales, "Y");
				}
				if (matches(appTypeArray[3], "Restaurant", "Wine Only")) {
					inspectionId = getInspNum();
					logDebug("InspId: " + inspectionId);
					guideASI = loadGuideSheetItemsWASI(inspectionId);
					logDebug("guideASI: " + guideASI);
					ttlSeatCount = guideASI["Total Seat Count"];
					logDebug("Total Seats = " + ttlSeatCount);
					if (ttlSeatCount > 0)
						updateFee(feeInfo[1], feeInfo[0], "FINAL", ttlSeatCount, "Y");
				}
			}

			if (feeInfo != "NONE") {
				feeTtl = feeAmount(feeInfo[1]);
				logDebug("The Invoiced fee amt = " + feeTtl);
			}
		}
		sendNotificationToContactTypes("Business Information,Business Representative", "TABC_LICENSE_PAYMENT");
	}
}

if (matches(appTypeArray[1], "Education", "Permits")) {
	if ((wfTask.equals("Citizenship Verification") && wfStatus.equals("Denied")) || (wfTask.equals("Investigative Review") && wfStatus.equals("Denied")) || (wfTask.equals("Preliminary Review") && wfStatus.equals("Denied"))) {
		branchTask("Application Status", "Denied", "Application was Denied");
		closeTask("Application Status", "Denied", "Application was Denied");
	}
} else {
	if (wfTask.equals("Investigative Review") && wfStatus.equals("Denied") && isTaskActive("Citizenship Verification")) {
		branchTask("Citizenship Verification", "Denied", "Investigative Review was Denied")
	}
	if (wfTask.equals("Citizenship Verification") && wfStatus.equals("Denied") && isTaskActive("Investigative Review")) {
		branchTask("Investigative Review", "Denied", "Citizenship Verification was Denied")
	}
}

if (wfTask.equals("Application Review") && wfStatus.equals("Refused")) {
	branchTask("Commission Agenda", "Refused", "Updated via EMSE", "");
}
