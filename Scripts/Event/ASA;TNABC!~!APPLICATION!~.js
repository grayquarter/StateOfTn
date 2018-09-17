/*
Event Script: ASA:TNABC!NA!APPLICATION!NA
Event: ApplicationSubmitAfter

CHANGE LOG:
07/18/2018 - Chris Kim
-- Added check to look for active and inactive certified clerks to add to counts. This is manually for renewals and amendments.
-- Starting on line 227 and line 282.

06/21/2018 - Chris Kim
--Edited Line 170 and added block on line 188 to Check for Investigative Review needs to be checked.

06/14/2018 (Chris Kim)
--Commented out block on line 395 and 196 because this is not needed for applications. I will remove from code once UAT is completed for Delivery Service Employees.

06/11/2018: (Chris Kim)
-Added code in line 390 to calculate delivery service employee fees based on ASI field.
-Commented out Blocks on 183 and 278 because we are calculating fees based on ASI field instead of ASIT.


06/08/2018: (Chris Kim)
-Added a block in 189 and 387 for first year/new licenses to calculate Delivery Service fees based on ASI Question.

06/07/2018: (Chris Kim)
-Added Code starting on line 183 and 278 to calculate Delivery Service Fee based on Active Employees.

06/04/2018: (Chris Kim)
-Added Block in Line 73. This block was added to pull DBA and add it to Short Notes Field and Inspection District Field
-Modified Block starting at line 117 to be able to update/close citizenship verification workflow task based on new ASI questions
-Added block on Line 151 to use flags to update/close citizenship workflow task.
 */

comment("===> Running Application Submit After");
if (!publicUser) {
	if (!appMatch("TNABC/Education/Application/*") && !appMatch("TNABC/Permits/*/*")) {
		licCapId = capId;
		generateAltID(capId);
		newLicId = capId;
		updateAltID(newLicId);
	}

	if (appMatch("TNABC/Education/Application/*")) {
		updateAppStatus("In Review", "Initial submission");
		updateTask("Preliminary Review", "Submitted");
	}

	createRefContactsFromCapContactsAndLink(capId, null, null, false, true, comparePeopleTNABC);
	if (appMatch("TNABC/Permits/Application/*")) {
		licCapId = capId;
		generatePermitAltID(capId);
		newLicId = capId;
		updatePermitAltID(newLicId);
	}

	if (appMatch("TNABC/Permits/Application/*")) {
		var auditId = newLicId.getCustomID();
		var endsWith00 = auditId.endsWith("89");
	}

	if (appMatch("TNABC/Permits/Application/Server") && (endsWith00)) {
		addStdCondition("Audit", "Background Audit");
	}

	var appCounty = "";
	appCounty = getCountyValue(capId);
	var POD = countyLookUp("CName", appCounty);
	assignDepartment_Custom(POD);
	var department = "TABC/NA/NA/LICNPERM/NA/NA/NA";
	var wfTask = "Preliminary Review";

	autoAssign(wfTask, department);

	logDebug("County Field = " + appCounty);
	if (appCounty != null)
		updateAddressCounty(appCounty);

	var vContactObjArray = new Array();
	//Flag
	var citizen = true;
	var invRvReq = false;

	vContactObjArray = getContactObjs_modified(capId); //parameters aren't working as expected,"Permittee,Business Owner-Individual,Business Representative,"Officer Manager-Individual","Applicant-Individual");

	logDebug("Total contacts: " + vContactObjArray.length);

	for (iContNew in vContactObjArray) {
		var vContactObjNew = vContactObjArray[iContNew];
		/*Custom Function to push DBA to Short Notes. We will replace the label in Record List portlet to say DBA. Author: Chris Kim Last Modified 05/10/2018*/
		if (matches(vContactObjNew.type, "Business Information")) {
			// Call People Object and get Trade Name DBA from it.
			var capContObj = aa.people.getCapContactByCapID(capId).getOutput();
			if (aa.people.getCapContactByCapID(capId).getSuccess()) {
				for (x in capContObj) {
					//call getTradeName()
					var dba = capContObj[x].getCapContactModel().getPeople().getTradeName();
					logDebug("DBA = " + dba);
					//get ContactType from people object.
					var contactType = capContObj[x].getCapContactModel().getPeople().getContactType();
					//Just run update short notes for Business Information (Short Notes is an empty field we can use in ACA and Back Office)
					if ((dba != null && contactType == "Business Information") || (dba != "" && contactType == "Business Information") || (dba != "null" && contactType == "Business Information")) {
						updateShortNotes(dba);

						//Pulling DBA into Inspection District which is a part of the Address Model
						var addrModel = aa.address.getAddressByCapId(capId).getOutput();
						for (x in addrModel) {
							var addr = addrModel[x];
							//Set just sets in memory. Need to commit with editAddress
							addr.setInspectionDistrict(dba);
							logDebug("getInspectionDistrict: " + addr.getInspectionDistrict());
						}
						//if successful commit the change.
						if (aa.address.editAddress(addr).getSuccess()) {
							logDebug("Get editAddress Success True");
							//Commit the change.
							aa.address.editAddress(addr);
						} else {
							logDebug("Get editAddress Success False");
						}
					}
				}
			}
		}

		if (matches(vContactObjNew.type, "Permittee", "Business Owner-Individual", "Business Representative", "Officer Manager-Individual", "Applicant-Individual")) { //
			logDebug("TYPE: " + vContactObjNew.type);

			var citzshp = vContactObjNew.getCustomField("Are you a U.S. Citizen?");
			var convState = vContactObjNew.getCustomField("Any convictions under the laws of Tennessee or of any other State or of the United States?");
			var alcFel10Yr = vContactObjNew.getCustomField("Any convictions under TN, any state or US, involving alcohol, or any felony in 10 years prior?");
			var cit2Appr = vContactObjNew.getCustomField("Been cited to appear before the COR or TABC charged with a violation of the law or rules and regs?");
			var licRev = vContactObjNew.getCustomField("Have you ever had a license related to any form of alcoholic beverages revoked for cause?");

			if (convState == "Y" || alcFel10Yr == "Y" || cit2Appr == "Y" || licRev == "Y") {
				invRvReq = true;
			}

			logDebug("CITIZENSHIP FIELD IS: " + citzshp);

			if (citzshp != "" || citzshp != null) {
				if (citzshp == "N" && !matches(appTypeArray[3], "Special Occasion")) {
					logDebug("Not a US Citizen...needs checking");
					citizen = false;
				} else {
					logDebug("US Citizen or Special Occasion..no check needed");
				}
			}

		}
	}

	//Added this block below to use flags to either update or close task.
	if (citizen == false) {
		updateTask("Citizenship Verification", "Non US Verification Required", "Updated via EMSE.  Citizenship Status: " + citzshp, "");
	} else {
		closeTask("Citizenship Verification", "Not Applicable", "Updated via EMSE.", "");
	}

	//TODO: Add Block below to update Investigative Review and Citizenship Review.
	if (invRvReq == true) {
		updateTask("Investigative Review", "Approval Required", "Updated via EMSE", "");
	} else {
		closeTask("Investigative Review", "Not Applicable", "Updated via EMSE", "");
	}

	if (!matches(appTypeArray[1], "Permits", "Education") && !matches(appTypeArray[3], "Non-Manufacturing Non-Resident", "Non-Resident Sellers", "Delivery Service", "Direct Shipper", "Special Occasion")) {
		scheduleInspectDateWGroup("TABC-New App", "New License Inspection", dateAdd(null, 30));
		//scheduleInspection("New License Inspection",30);
		updateTask("Inspection", "Pending", "Inspection Pending", "");
	} else {
		closeTask("Inspection", "Not Applicable", "Inspection Not Needed", "");
		deactivateTask("Application Review");
	}

}

var applicationType = AInfo["Application Type"];
logDebug("TYPE " + applicationType);

if (!appTypeArray[1].equals("Permits")) {
	if (applicationType != 'undefined' && applicationType != null) {
		if (applicationType.equals("New License")) {

			if (matches(appTypeArray[3], "Wine in Grocery Store", "Retail Package Store")) {

				if (typeof(CERTIFIEDCLERKLIST) == "object" && CERTIFIEDCLERKLIST.length > 0) {
					var certClkQty = 0;
					for (x in CERTIFIEDCLERKLIST) {
						if (CERTIFIEDCLERKLIST[x]["Change Status"] == 'Active') {
							certClkQty++;
						}
					}
					logDebug("Active Certified Clerks: " + certClkQty);
					var feeCodePrfx = "";
					var feeSch = "";
					var feeItm = "";

					if (appTypeArray[3].equals("Wine in Grocery Store")) {
						feeCodePrfx = "WGA";
						feeSch = "TABC-WGS-A";
					}
					if (appTypeArray[3].equals("Wine in Grocery Store") && (AInfo['Type of Vendor'].equals("Beer Vendor"))) {
						feeItm = feeCodePrfx + "-BEER01";
					} else {
						feeItm = feeCodePrfx + "-WINE01"
					}
					if (appTypeArray[3].equals("Retail Package Store")) {
						feeCodePrfx = "RPS";
						feeSch = "TABC-RPS-A";
						feeItm = feeCodePrfx + "-WINE02";
					}

					logDebug("Assessing fee item: " + feeItm + "with a quantity of " + certClkQty);
					updateFee(feeItm, feeSch, "FINAL", Number(certClkQty), "Y");
				}
			}
			var recType = appTypeArray[3];

			if (recType.equals("Special Legislation"))
				if (appTypeArray[1].equals("Liquor by the Drink"))
					recType = "LBD Special Legislation";
				else
					recType = "Retail Special Legislation";
			logDebug("Lookup Type: " + recType);

			var feeInfo = new Array();
			feeInfo = lookup("APP_FEE_LOOKUP", recType).split("|");
			if (feeInfo != "NONE") {
				feeSch = feeInfo[0];
				feeItm = feeInfo[1];
				updateFee(feeItm, feeSch, "FINAL", 1, "Y");
			}
		} else {
			if (matches(appTypeArray[3], "Wine in Grocery Store", "Retail Package Store")) {
				//Certified Clerks Fees need to be charged for 1st year renewals as well.
				//First year renewals do not usually get charged application fees.
				//To determine first year renewals, an ASI dropdown field is used.

				if (typeof(CERTIFIEDCLERKLIST) == "object" && CERTIFIEDCLERKLIST.length > 0) {
					var certClkQty = 0;

					for (x in CERTIFIEDCLERKLIST) {
						if (CERTIFIEDCLERKLIST[x]["Change Status"] == 'Active') {
							certClkQty++;
						}
					}

					logDebug("Active Certified Clerks: " + certClkQty);
					var feeCodePrfx = "";
					var feeSch = "";
					var feeItm = "";

					if (appTypeArray[3].equals("Wine in Grocery Store")) {
						feeCodePrfx = "WGA";
						feeSch = "TABC-WGS-A";
					}
					if (appTypeArray[3].equals("Wine in Grocery Store") && (AInfo['Type of Vendor'].equals("Beer Vendor"))) {
						feeItm = feeCodePrfx + "-BEER01";
					} else {
						feeItm = feeCodePrfx + "-WINE01"
					}
					if (appTypeArray[3].equals("Retail Package Store")) {
						feeCodePrfx = "RPS";
						feeSch = "TABC-RPS-A";
						feeItm = feeCodePrfx + "-WINE02";
					}

					logDebug("Assessing fee item: " + feeItm + "with a quantity of " + certClkQty);
					updateFee(feeItm, feeSch, "FINAL", Number(certClkQty), "Y");
				}
			}

			//added to add fees to Responsible Vendor Program for first year renewals - AF03304
			if (matches(appTypeArray[3], "RV Program")) {
				logDebug("RVP Condition");
				feeSch = "TABC-RTP-S";
				feeItm = "RTP-APP";
				updateFee(feeItm, feeSch, "FINAL", 1, "Y");
			}

		}
	}
}

// Standard Choice conversion follows

// DISABLED: ASA:TNABC/*/Application/*:01
// if (appMatch('TNABC/*/Application/*')) {
// 	PutInFeeAssess='No';
// 	}

// DISABLED: ASA:TNABC/*/Application/*:02
// if (appMatch('TNABC/*/Application/*') && !appMatch('TNABC/Education/Application/*') && !appMatch('TNABC/Permits/*/*')) {
// 	licCapId=capId;
// 	generateAltID(capId);
// 	newLicId=capId;
// 	updateAltID(newLicId);
// DISABLED: ASA:TNABC/*/Application/*:03
// 	updateAppStatus('In Review','Initial submission');
// 	updateTask('Preliminary Review','Submitted');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:04
// if (appMatch('TNABC/Education/Application/*')) {
// 	updateAppStatus('In Review','Initial submission');
// 	updateTask('Preliminary Review','Submitted');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:05
// createRefContactsFromCapContactsAndLink(capId, null, null, false, true, comparePeopleTNABC);
// DISABLED: ASA:TNABC/*/Application/*:06
// if (appMatch('TNABC/Permits/Application/*')) {
// 	licCapId=capId;
// 	generatePermitAltID(capId);
// 	newLicId=capId;
// 	updatePermitAltID(newLicId);
// 	}

// DISABLED: ASA:TNABC/*/Application/*:15
// if (appMatch('TNABC/Permits/Application/*')) {
// 	var auditId = newLicId.getCustomID();
// 	var endsWith00 = auditId.endsWith('89');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:20
// if ((appMatch('TNABC/Permits/Application/Certified Manager') || appMatch('TNABC/Permits/Application/Server') || appMatch('TNABC/Permits/Application/Wholesale Employee') || appMatch('TNABC/Permits/Application/Wholesale Representative')) && (endsWith00)) {
// 	addAppCondition('Audit','Applied','Background Audit', '' ,'Notice' ,'');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:21
// if ((appMatch('TNABC/Permits/Application/Certified Manager') || appMatch('TNABC/Permits/Application/Server') || appMatch('TNABC/Permits/Application/Wholesale Employee') || appMatch('TNABC/Permits/Application/Wholesale Representative')) && (endsWith00)) {
// 	addStdCondition('Audit','Background Audit');
// 	}

// DISABLED: ASA:TNABC/*/Application/*:30
// if (!publicUser) {
// 	var appCounty = '';
// 	appCounty = getCountyValue(capId);
// 	var POD = countyLookUp('CName',appCounty);
// 	assignDepartment_Custom(POD);
// DISABLED: ASA:TNABC/*/Application/*:35
// 	var department = 'TABC/NA/NA/LICNPERM/NA/NA/NA';
// 	var wfTask='Preliminary Review';
// 	autoAssign(wfTask, department);
// 	if (appCounty != '') updateAddressCounty(appCounty);
// 	}

// DISABLED: ASA:TNABC/*/Application/*:40
// if (!publicUser && !matches(appTypeArray[1],'Permits','Education') && !matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	scheduleInspection('New License Inspection',30);
// 	}

// DISABLED: ASA:TNABC/*/Application/*:45
// if (!publicUser && matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	closeTask('Investigative Review','NA','Inspection Not Needed','');
// 	}

