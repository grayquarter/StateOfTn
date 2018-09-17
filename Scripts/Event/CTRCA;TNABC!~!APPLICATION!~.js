/*
Event Script: CTRCA:TNABC!NA!APPLICATION!NA
Event: ConvertToRealCapAfter
Notes: You will have to modify ASA and CTRCA at the same time or the code may not work.
CHANGE LOG:

06/04/2018: (Chris Kim)
-Added Block in Line 73. This block was added to pull DBA and add it to Short Notes Field and Inspection District Field
-Modified Block starting at line 112 to be able to update/close citizenship verification workflow task based on new ASI questions
-Added block on Line 148 to use flags to update/close citizenship workflow task.
 */

comment("===> Running Convert To Real Cap After");
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

vContactObjArray = getContactObjs_modified(capId); //parameters aren't working as expected,"Permittee,Business Owner-Individual,Business Representative,"Officer Manager-Individual","Applicant-Individual");

logDebug("Total contacts: " + vContactObjArray.length);

//Flag added for Update/Close Citizenship workflow tasks
var citizen = true;
var invRvReq = false;

for (iContNew in vContactObjArray) {
	var vContactObjNew = vContactObjArray[iContNew];
	/*Custom Function to push DBA to Short Notes. We will replace the label in Record List portlet to say DBA. Author: Chris Kim Last Modified 05/10/2018*/
	//if (matches(vContactObjNew.type, "Business Information"))
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
					//Pull DBA into Inspection District Field (Inspection District Field is an empty field we can use for DBA)
					var addrModel = aa.address.getAddressByCapId(capId).getOutput();
					for (x in addrModel) {
						var addr = addrModel[x];
						addr.setInspectionDistrict(dba);
						logDebug("getInspectionDistrict: " + addr.getInspectionDistrict());
					}

					if (aa.address.editAddress(addr).getSuccess()) {
						logDebug("Get editAddress Success True");
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

		if (convState == "Y" || alcFel10Yr == "Y" || cit2Appr == "Y" || licRev == "Y")
			invRvReq = true;

		logDebug("CITIZENSHIP FIELD IS: " + citzshp);

		if (citzshp != "" || citzshp != null) {
			if (citzshp == "N" && !matches(appTypeArray[3], "Special Occasion")) {
				logDebug("Not a US Citizen...needs checking");
				logDebug(citzshp);
				citizen = false;
			} else {
				logDebug("US Citizen or Special Occasion..no check needed");
				logDebug(citzshp);

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

//Added Block below to update Investigative Review and Citizenship Review.
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

// standard choice conversion

// DISABLED: CTRCA:TNABC/*/Application/*:01
// comment('===> Running Convert To Real Cap After');
// DISABLED: CTRCA:TNABC/*/Application/*:02
// updateAppStatus('Submitted','Online Submission status');
// updateTask('Preliminary Review','Submitted');
// DISABLED: CTRCA:TNABC/*/Application/*:03
// if (!appMatch('TNABC/Education/Application/*') && !appMatch('TNABC/Permits/Application/*')) {
// 	licCapId=capId;
// 	generateAltID(capId);
// 	newLicId=capId;
// 	updateAltID(newLicId);
// 	}

// DISABLED: CTRCA:TNABC/*/Application/*:04
// if (appMatch('TNABC/Permits/Application/*')) {
// 	licCapId=capId;
// 	generatePermitAltID(capId);
// 	newLicId=capId;
// 	updatePermitAltID(newLicId);
// DISABLED: CTRCA:TNABC/*/Application/*:15
// 	var auditId = newLicId.getCustomID();
// 	var endsWith00 = auditId.endsWith('00');
// 	}

// DISABLED: CTRCA:TNABC/*/Application/*:20
// if ((appMatch('TNABC/Permits/Application/Certified Manager') || appMatch('TNABC/Permits/Application/Server') || appMatch('TNABC/Permits/Application/Wholesale Employee') || appMatch('TNABC/Permits/Application/Wholesale Representative')) && (endsWith00)) {
// 	addAppCondition('Audit','Applied','Background Audit', '' ,'Notice' ,'');
// 	}

// DISABLED: CTRCA:TNABC/*/Application/*:30
// var appCounty = '';
// appCounty = getCountyValue(capId);
// var POD = countyLookUp('CName',appCounty);
// assignDepartment_Custom(POD);
// DISABLED: CTRCA:TNABC/*/Application/*:35
// var department = 'TABC/NA/NA/LICNPERM/NA/NA/NA';
// var wfTask='Preliminary Review';
// autoAssign(wfTask, department);
// DISABLED: CTRCA:TNABC/*/Application/*:40
// if (!matches(appTypeArray[1],'Permits','Education') && !matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	updateAddressCounty(appCounty);
// 	scheduleInspection('New License Inspection',30);
// 	}

// DISABLED: CTRCA:TNABC/*/Application/*:45
// if (matches(appTypeArray[1],'Permits','Education') && matches(appTypeArray[3],'Non-Manufacturing Non-Resident','Non-Resident Sellers','Delivery Service','Direct Shipper')) {
// 	closeTask('Investigative Review','NA','Inspection Not Needed','');
// 	}
