/*
Event Script: ASA:TNABC!NA!RENEWAL!NA
Event: ApplicationSubmitAfter
Notes: You will have to modify ASA and CTRCA at the same time or the code may not work.
CHANGE LOG:

07/18/2018 (Chris Kim)
-- Added block on line 153 to add Certified Clerks Fees to Renewals.


06/21/2018 (Chris Kim)
--Edited Line 103 and added block on line 121 to Check for Investigative Review needs to be checked.

06/07/2018: (Chris Kim)
-Added Code Line 220 to calculate Delivery Service Fees based on ASI.

-Added Code in Line 173 to calculate Delivery Service Fee based on Active Employees.

06/04/2018: (Chris Kim)
-Added Block in Line 28. This block was added to pull DBA and add it to Short Notes Field and Inspection District Field
-Modified Block starting at line 71 to be able to update/close citizenship verification workflow task based on new ASI questions
-Added block on Line 107 to use flags to update/close citizenship workflow task.
 */

comment("===> Running Application Submit After for Renewals");

var vContactObjArray = new Array();
vContactObjArray = getContactObjs_modified(capId); //parameters aren't working as expected,"Permittee,Business Owner-Individual,Business Representative,"Officer Manager-Individual","Applicant-Individual");
logDebug("Total contacts: " + vContactObjArray.length);

//Flag added to close or update workflow tasks.
var citizen = true;
invRvReq = false;

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

var applicationType = AInfo["Application Type"];
logDebug("TYPE " + applicationType);

var deliveryDriverCount = AInfo['Number of delivery employees or independent contractors during the current license year.'];
if (matches(appTypeArray[3], "Delivery Service") && (deliveryDriverCount != undefined || deliveryDriverCount != null)) {
	//AInfo to pull ASI Values
	logDebug("Number of Delivery Drivers = " + deliveryDriverCount);
	var feeSch = "TABC-DLS-A";
	var feeItm = "DLS-DSPCOUNT";
	logDebug("Assessing fee item: " + feeItm + "with a quantity of " + deliveryDriverCount);
	//Update Fees Accordingly
	updateFee(feeItm, feeSch, "FINAL", deliveryDriverCount, "Y");
}

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
