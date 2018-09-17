showDebug = true;
function addAdHocTaskWithAssignDept(adHocProcess, adHocTask, adHocNote)
{
//adHocProcess must be same as one defined in R1SERVER_CONSTANT
//adHocTask must be same as Task Name defined in AdHoc Process
//adHocNote can be variable
//Optional 4 parameters = Assigned to Depart Name
//Optional 5 parameters = CapID
	var thisCap = capId;
	var thisDepart = null;
	if(arguments.length > 3)
		thisDepart = arguments[3]
	if(arguments.length > 4)
		thisCap = arguments[4];

	if (thisDepart)
	{
		var departSplits = thisDepart.split("/");
		//var assignedUser = aa.person.getUser(null,null,null,null,departSplits[0],departSplits[1],departSplits[2],departSplits[3],departSplits[4],departSplits[5]).getOutput();
	}
	else
	{
		var assignedUser = aa.person.getCurrentUser().getOutput();	
		assignedUser.setFirstName(null);
		assignedUser.setLastName(null);
		assignedUser.setMiddleName(null);
	}	
	
	var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem()
	taskObj.setProcessCode(adHocProcess);
	taskObj.setTaskDescription(adHocTask);
	taskObj.setDispositionNote(adHocNote);
	taskObj.setProcessID(0);
	taskObj.setAssignmentDate(aa.util.now());
	taskObj.setDueDate(aa.util.now());
	//taskObj.setAssignedUser(assignedUser);
	wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
	wf.createAdHocTaskItem(taskObj);
	return true;
}

function addCertifiedManagers(prntCapId){
	if (typeof(CERTIFIEDMANAGERLIST) == "object" && CERTIFIEDMANAGERLIST.length >0){
		for (cm in CERTIFIEDMANAGERLIST){
			var desMangStatus = CERTIFIEDMANAGERLIST[cm]["Change Status"];
			var cmCapIDString = CERTIFIEDMANAGERLIST[cm]["Certified Manager RLPS ID"];
			if(desMangStatus == "Active"){				
				var getCapResult = aa.cap.getCapID(cmCapIDString);
				if (getCapResult.getSuccess()){
					var cmId = getCapResult.getOutput();
					var linkResult = aa.cap.createAppHierarchy(prntCapId,cmId);
					if (linkResult.getSuccess())
						logDebug("Successfully linked Certified Manager : " + cmCapIDString + " as a related record");
					else
						logDebug( "**ERROR: linking to parent application parent cap id (" + cmCapIDString + "): " + linkResult.getErrorMessage());
				}
			}
		}
	}
}


function addLicenseStdConditionWGroup(licSeqNum,cType,cDesc)
	{

	var foundCondition = false;
	
	cStatus = "Applied";
	if (arguments.length > 3)
		cStatus = arguments[3]; // use condition status in args
		
	if (!aa.capCondition.getStandardConditions)
		{
		logDebug("addLicenseStdCondition function is not available in this version of Accela Automation.");
		}
        else
		{
		standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
		for(i = 0; i<standardConditions.length;i++)
			if(standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
			{
			standardCondition = standardConditions[i]; // add the last one found
			
			foundCondition = true;
		
			if (!licSeqNum) // add to all reference licenses on the current capId
				{
				var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
				if (capLicenseResult.getSuccess())
					{ var refLicArr = capLicenseResult.getOutput();  }
				else
					{ logDebug("**ERROR: getting lic profs from Cap: " + capLicenseResult.getErrorMessage()); return false; }

				for (var refLic in refLicArr)
					if (refLicArr[refLic].getLicenseProfessionalModel().getLicSeqNbr())
						{
						licSeq = refLicArr[refLic].getLicenseProfessionalModel().getLicSeqNbr();
						var 
						addCAEResult = aa.caeCondition.addCAECondition(licSeq, standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), null, null, standardCondition.getImpactCode(), cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj,"Applied","Y","Y","N","Y","","","","Licenses","Y","N");

						if (addCAEResult.getSuccess())
							{
							logDebug("Successfully added licensed professional (" + licSeq + ") condition: " + cDesc);
							}
						else
							{
							logDebug( "**ERROR: adding licensed professional (" + licSeq + ") condition: " + addCAEResult.getErrorMessage());
							}
						}
				}
			else
				{
				var addCAEResult = aa.caeCondition.addCAECondition(licSeqNum, standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), null, null, standardCondition.getImpactCode(), cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj);
				
				if (addCAEResult.getSuccess())
					{
					logDebug("Successfully added licensed professional (" + licSeqNum + ") condition: " + cDesc);
					}
					else
					{
					logDebug( "**ERROR: adding licensed professional (" + licSeqNum + ") condition: " + addCAEResult.getErrorMessage());
					}
				}	
			}
		}
	if (!foundCondition) logDebug( "**WARNING: couldn't find standard condition for " + cType + " / " + cDesc);
}


function addSpcOccEventAsParent(soEvntTrackerAlt) {

	contNumResult = new Array();
	conNumResultArray = new Array();

	contNumResult = aa.cap.getCapIDsByAppSpecificInfoField("Secretary of State Control Number", soEvntTrackerAlt);
	if (contNumResult.getSuccess())
		conNumResultArray = contNumResult.getOutput();

	aa.print("Found " + conNumResultArray.length);

	if (conNumResultArray.length > 0) {
		for (sos in conNumResultArray) {
			sEcapObj = conNumResultArray[sos];
			sEcapId = sEcapObj.getCapID();
			sEaltCapId = aa.cap.getCapID(sEcapId.getID1(), sEcapId.getID2(), sEcapId.getID3()).getOutput();
			sEcapIDString = sEaltCapId.getCustomID();
			sEcap = aa.cap.getCap(sEcapId).getOutput();
			sEcapStatus = sEcap.getCapStatus();
			sEappTypeResult = null;
			sEappTypeString = "";
			sEappTypeArray = new Array();

			sEappTypeResult = sEcap.getCapType();
			sEappTypeString = sEappTypeResult.toString();
			sEappTypeArray = sEappTypeString.split("/");

			if (!sEappTypeString.equals("TNABC/Liquor by the Drink/Event/Special Occasion Tracking"))
				continue;

			if (!sEcapStatus.equals("Active"))
				continue;

			aa.print("Found Active Special Occasion Tracking record for control " + soEvntTrackerAlt + " adding it as parent");
			aa.cap.createAppHierarchy(sEcapId, capId);
		}
	}
}

function applicationUpdateStatus() {

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Revision Accepted') {
		updateTask('Application Review', 'Revision Review');
	}

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted') {
		updateTask('Application Review', 'Pending Review');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:03
	// if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Approved') {
	// 	updateTask('Application Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Revision Required') {
		updateTask('Preliminary Review', 'Revision Required');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted' && isTaskStatus('Investigative Review', 'Accepted')) {
		updateTask('Application Review', 'Pending Review');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Investigative Review' && wfStatus == 'Accepted' && isTaskStatus('Preliminary Review', 'Accepted')) {
		updateTask('Application Review', 'Pending Review');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Refused') {
		updateTask('Refused for Commission', 'Refused');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Application Review' && (wfStatus == 'Recommend Approval' || wfStatus == 'Recommend Denial')) {
		updateTask('Commission Agenda', 'Ready For Agenda');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Agenda' && wfStatus == 'On Agenda') {
		updateTask('Commission Meeting', 'Ready For Commission');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Approval Required') {
		updateTask('Investigative Review', 'Approval Required');
		updateTask('Citizenship Verification', 'Approval Required');
	}

	if (wfProcess == 'TABC_ENF_E1_PROCESS' && wfTask == 'Execution' && wfStatus == 'Operation Complete') {
		updateTask('Post Operation Review', 'Ready for Review');
	}

	if (wfProcess == 'TABC_ENF_E1_PROCESS' && wfTask == 'Planning' && wfStatus == 'Plan Approval') {
		updateTask('Execution', 'Ready for Execution');
	}

	if (wfProcess == 'TABC_ENF_S1_PROCESS' && wfTask == 'Investigation' && wfStatus == 'Regulatory Citation Issued') {
		updateTask('Regulatory', 'Pending Resolution');
	}

	if (wfProcess == 'TABC_ENF_S1_PROCESS' && wfTask == 'Investigation' && wfStatus == 'Criminal Citation Issued') {
		updateTask('Criminal', 'Pending Case Registration');
	}

	if (wfProcess == 'TABC_ENF_S1_PROCESS' && wfTask == 'Regulatory' && wfStatus == 'Appeal') {
		updateTask('ALJ Hearing', 'Awaiting Hearing');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Complete') {
		updateTask('SAC Review', 'Pending Review');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'SAC Review' && wfStatus == 'Assigned') {
		updateTask('Investigation', 'Pending Investigation');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'Investigation' && wfStatus == 'Citation Issued Regulatory') {
		updateTask('Regulatory', 'Pending Resolution');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'Investigation' && wfStatus == 'Citation Issued Non Regulatory') {
		updateTask('Non Regulatory', 'Pending Case Registration');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'Regulatory' && wfStatus == 'Appeal') {
		updateTask('ALJ Hearing', 'Awaiting Hearing');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:21
	// if (wfProcess == 'TABC_EDU_SCH6_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted') {
	// 	updateTask('Schedule Status','Review Complete');
	// 	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:22
	// if (wfProcess == 'TABC_EDU_APP6_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Approved') {
	// 	updateTask('Schedule Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_EDU_APP6_PROCESS' && wfTask == 'Reliminary Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_EDU_APP5_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted') {
		updateTask('Application Review', 'Ready for Review');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:25
	// if (wfProcess == 'TABC_EDU_APP5_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Approved') {
	// 	updateTask('Application Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_EDU_APP5_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_EDU_ROS7_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted') {
		updateTask('Roster Status', 'Review Complete');
	}

	if (wfProcess == 'TABC_EDU_ROS7_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Denied') {
		updateTask('Roster Status', 'Denied');
	}

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Revision Required') {
		updateTask('Preliminary Review', 'Revision Required');
	}

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Application Status' && wfStatus == 'Reconsideration') {
		updateTask('Application Review', 'Revision Review');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Refused for Commission' && wfStatus == 'Reconsideration') {
		updateTask('Application Review', 'Pending Review');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Meeting' && wfStatus == 'Reschedule') {
		updateTask('Commission Agenda', 'Ready for Agenda');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Meeting' && wfStatus == 'Approved') {
		updateTask('Application Status', 'Ready for Issuance');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Meeting' && wfStatus == 'Approved with Conditions') {
		updateTask('Application Status', 'Pending Approval');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Meeting' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:38
	// if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Approved') {
	// 	updateTask('Application Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Citizenship Verification' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Investigative Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Citizenship Verification' && wfStatus == 'Approved') {
		updateTask('Preliminary Review', 'Submitted');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Investigative Review' && wfStatus == 'Approved') {
		updateTask('Preliminary Review', 'Submitted');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Investigative Review' && wfStatus == 'Denied with Conditions') {
		updateTask('Preliminary Review', 'Denied with Conditions');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:44
	// if (wfProcess == 'TABC_PER_APP4_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Approved') {
	// 	updateTask('Application Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_PER_APP4_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

}

function applyadditionalpenalty() {
	//var capId =aa.cap.getCapID("16S-EDU-ROS-000051").getOutput();

	var AInfo = new Array();
	var todaydate = new Date();
	loadAppSpecific(AInfo);
	var liceno = AInfo["Schedule ID"];
	var classdate = new Date(AInfo["Date of Class"]);
	var cid = AInfo["Class ID"];
	if (liceno) {
		schCap = aa.cap.getCapID(liceno).getOutput();

		var tblScheduleinfo = loadASITables(schCap);
		// var  classId= SCHEDULEINFO[0]["Class ID"];
		// var  trainerId =SCHEDULEINFO[0]["Trainer Certificate ID"];
		for (var i = 0; i < SCHEDULEINFO.length; i++) {
			var classId1 = SCHEDULEINFO[i]["Class ID"].toString();

			if (classId1 == cid) {

				var classId = SCHEDULEINFO[i]["Class ID"];
				var trainerId = SCHEDULEINFO[i]["Trainer Certificate ID"];

			}
		}
		logDebug("trainerId : " + trainerId);
		var trnCap = aa.cap.getCapID(trainerId).getOutput();
		var latesubmission = Number(getAppSpecific("Number of late submissions", trnCap));

		if (classdate) {
			var timeDiff = Math.abs(classdate.getTime() - todaydate.getTime());
			var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
			logDebug(diffDays);
			logDebug("latesubmission : " + latesubmission);
			if (diffDays > 21 && (latesubmission == null || latesubmission == 0)) {
				editAppSpecific("Number of late submissions", "1", trnCap);
				//add the late fee addFee(fcode, fsched, fperiod, fqty, finvoice);
				addFee("EDU011", "TABC_EDUCATION_FINES", "FINAL", 1, "Y", capId);
			}

			if (diffDays > 21 && latesubmission >= 1) {
				latesubmission = latesubmission + 1;
				editAppSpecific("Number of late submissions", latesubmission, trnCap);
				//add the late fee addFee(fcode, fsched, fperiod, fqty, finvoice);
				addFee("EDU012", "TABC_EDUCATION_FINES", "FINAL", 1, "Y", capId);
			}
		}
	}
}

function assignDepartment_Custom(department) // option CapId
{
	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args

		var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
		return false;
	}

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return false;
	}

	cd = cdScriptObj.getCapDetailModel();

	cd.setAsgnDept(department);

	cdWrite = aa.cap.editCapDetail(cd)

		if (cdWrite.getSuccess()) {
			logDebug("Assigned CAP to " + department)
		} else {
			logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage());
			return false;
		}
}

function associateLpWithCap(refLP, itemCapId) {
	//add the LP to the CAP
	var asCapResult = aa.licenseScript.associateLpWithCap(itemCapId, refLP);
	if (!asCapResult.getSuccess()) {
		logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage())
	} else {
		logDebug("Associated the CAP to the new LP")
	}
}


function autoAssign(wfTask, department) {
	var stdChoiceVal = wfTask; //just use a standard choice value that matches the task name
	var assignTo = Number(lookup("StdChoiceNext_TaskAssign", stdChoiceVal));
	aa.print("Looking for #: " + assignTo);
	var assignNext = 0;
	var userList = new Array();
	logDebug(department);
	//get the users in the department
	var deptObj = aa.people.getSysUserListByDepartmentName(department);
	var deptUsers = deptObj.getOutput();

	//build an array of user IDs
	for (du in deptUsers) {
		duList = deptUsers[du];

		//aa.print(du + " - " + deptUsers[du]+ ": " + duList.userID);
		//aa.print("User Status= " + duList.userStatus);

		//for (xl in duList)
		//aa.print(xl + " : + " + duList[xl]);

		if (duList.userStatus != "DISABLE") {
			userList.push(duList.userID);
			logDebug(" User - " + deptUsers[du] + ": " + duList.userID + " Added");
		}
	}
	logDebug("Department has " + userList.length + " Users in the group");

	//make sure still in the bounds of the array and assign
	if (userList.length > assignTo) {
		var assgnUser = userList[assignTo];
		assignNext = assignTo + 1;
	} else {
		//if outside the bounds of the array, return to the beginning.
		var assgnUser = userList[0];
		assignNext = 1;
	}
	//assign the task
	assignTask(wfTask, assgnUser);
	//assignCap(assgnUser);
	logDebug("Assigning Task to # " + assignTo + " in the list: " + assgnUser);

	//update the standard choice value
	editLookup("StdChoiceNext_TaskAssign", stdChoiceVal, assignNext);
}

function cap_assignEnfOfficer(enfName) // option CapId
{
	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args
		var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
		return false;
	}

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return false;
	}
	cd = cdScriptObj.getCapDetailModel();

	iNameResult = aa.person.getUser(enfName);
	iName = iNameResult.getOutput();

	cd.setEnforceDept(iName.getDeptOfUser());

	cd.setEnforceOfficerName(enfName);

	cdWrite = aa.cap.editCapDetail(cd);

	if (cdWrite.getSuccess()) {
		logDebug("updated enf officer name to " + enfName)
	} else {
		logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage());
		return false;
	}
}

function changeCapContactTypes(origType, newType) {
	// Renames all contacts of type origType to contact type of newType and includes Contact Address objects
	//
	var vCapId = capId;
	if (arguments.length == 3)
		vCapId = arguments[2];

	var capContactResult = aa.people.getCapContactByCapID(vCapId);
	var renamed = 0;
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			var contact = Contacts[yy].getCapContactModel();

			var people = contact.getPeople();
			var contactType = people.getContactType();
			aa.print("Contact Type " + contactType);

			if (contactType == origType) {

				var contactNbr = people.getContactSeqNumber();
				var editContact = aa.people.getCapContactByPK(vCapId, contactNbr).getOutput();
				editContact.getCapContactModel().setContactType(newType)

				aa.print("Set to: " + people.getContactType());
				renamed++;

				var updContactResult = aa.people.editCapContact(editContact.getCapContactModel());
				logDebug("contact " + updContactResult);
				logDebug("contact.getSuccess() " + updContactResult.getSuccess());
				logDebug("contact.getOutput() " + updContactResult.getOutput());
				updContactResult.getOutput();
				logDebug("Renamed contact from " + origType + " to " + newType);
			}
		}
	} else {
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return renamed;
}

function checkIfContactExist(contType) {
	// TODO: disabled try/catch since all MS 3.0 scripts execute in a try/catch
	//	try {
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		//logDebug("Count:" + Contacts.length);
		for (yy in Contacts) {
			var contact = Contacts[yy].getCapContactModel();
			var contactType = contact.getContactType();
			//logDebug("contactType:" + contactType);
			if (contactType.toUpperCase().equals(contType)) {
				return true;
			}
		}
	}
	return false;
	//	} catch (err) {
	//		logDebug(err)
	//	}
}

function citationDates() {

	counter = 1;
	var pFreq = null;
	nASIT_PPln = new Array();

	if (AInfo['Payment Frequency'].equals("Monthly"))
		pFreq = 30;
	else
		pFreq = 14;

	pPeriods = AInfo['Payment Periods'];
	pAmount = AInfo['Payment Amount'];
	pTotalDue = AInfo['Total Amount'];
	var pDueDate = null;

	aa.print("Amt: " + pAmount);
	aa.print("pFreq: " + pFreq);
	aa.print("Periods: " + pPeriods);

	for (counter = 1; counter <= pPeriods; counter++) {
		var tempObject = new Array();

		if (counter == 1) {
			pDueDate = dateAdd(AInfo['Scheduled Start Date'], 0);
			editTaskDueDate("Payment Plan", pDueDate);
		} else
			pDueDate = dateAdd(pDueDate, pFreq);

		if (counter == pPeriods) {
			if ((pAmount * pPeriods) <= pTotalDue)
				tempObject["Amount"] = String(pAmount);
			else {
				lastPAmount = pAmount - ((pAmount * pPeriods) - pTotalDue);
				tempObject["Amount"] = String(lastPAmount);
			}
		} else
			tempObject["Amount"] = String(pAmount);

		tempObject["Payment Due Date"] = pDueDate;
		tempObject["Date Paid"] = "";
		tempObject["Comments"] = "";

		nASIT_PPln.push(tempObject);
	}

	if (nASIT_PPln.length > 0) {
		aa.print("table: " + nASIT_PPln.length);
		addASITable("PAYMENT PLAN SCH", nASIT_PPln);
	}
}

function cntAssocGarageSales(strnum, strname, city, state, zip, cfname, clname)
{

	/***

	Searches for Garage-Yard Sale License records 
	- Created in the current year 
	- Matches address parameters provided
	- Matches the contact first and last name provided
	- Returns the count of records

	***/

	// Create a cap model for search
	var searchCapModel = aa.cap.getCapModel().getOutput();

	// Set cap model for search. Set search criteria for record type DCA/*/*/*
	var searchCapModelType = searchCapModel.getCapType();
	searchCapModelType.setGroup("Licenses");
	searchCapModelType.setType("Garage-Yard Sale");
	searchCapModelType.setSubType("License");
	searchCapModelType.setCategory("NA");
	searchCapModel.setCapType(searchCapModelType);

	searchAddressModel = searchCapModel.getAddressModel();
	searchAddressModel.setStreetName(strname);

	gisObject = new com.accela.aa.xml.model.gis.GISObjects;
	qf = new com.accela.aa.util.QueryFormat;

	var toDate = aa.date.getCurrentDate();
	var fromDate = aa.date.parseDate("01/01/" + toDate.getYear()); 
	
	var recordCnt = 0;
	var message = "The applicant has reached the Garage-Sale License limit of 3 per calendar year.<br>"

	capList = aa.cap.getCapListByCollection(searchCapModel, searchAddressModel, "", fromDate, toDate, qf, gisObject).getOutput();
	for (x in capList)
	{
		resultCap = capList[x];
		resultCapId = resultCap.getCapID();
		altId = resultCapId.getCustomID();
		//aa.print("Record ID: " + altId);
		resultCapIdScript = aa.cap.createCapIDScriptModel(resultCapId.getID1(),resultCapId.getID2(),resultCapId.getID3() );
		contact = aa.cap.getCapPrimaryContact(resultCapIdScript).getOutput();
		
		contactFname = contact.getFirstName();
		contactLname = contact.getLastName();
		
		if(contactFname==cfname && contactLname==clname)
		{
			recordCnt++;
			message = message + recordCnt + ": " + altId + " - " + contactFname + " " + contactLname + " @ " + strnum + " " + strname + "<br>";
		}		
	}
	
	return recordCnt;

}


function comparePeopleTNABC(peop) {

	/* 	this function will be passed as a parameter to the createRefContactsFromCapContactsAndLink function.
	takes a single peopleModel as a parameter, and will return the sequence number of the first G6Contact result
	returns null if there are no matches

	Best Practice Template Version uses the following algorithm:

	1.  Match on SSN/FEIN if either exist
	2.  else, match on Email Address if it exists
	3.  else, match on First, Middle, Last Name combined with birthdate if all exist

	This function can use attributes if desired 	*/

	if (peop.getContactTypeFlag() == "individual") {
		tmpSSN = "" + peop.getSocialSecurityNumber();
		tmpFein = "" + peop.getFein();

		if ((tmpSSN != "null" && tmpSSN != "") || (tmpFein != "null" && tmpFein != "")) {
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

			qryPeople.setSocialSecurityNumber(peop.getSocialSecurityNumber());
			qryPeople.setFein(peop.getFein());

			var r = aa.people.getPeopleByPeopleModel(qryPeople);

			if (!r.getSuccess()) {
				logDebug("WARNING: error searching for people : " + r.getErrorMessage());
				return false;
			}

			var peopResult = r.getOutput();

			if (peopResult.length > 0) {
				logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
				return peopResult[0].getContactSeqNumber();
			}
		}

		if (peop.getPhone1() && peop.getLastName() && peop.getFirstName() && peop.getEmail()) {
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

			qryPeople.setPhone1(peop.getPhone1());
			qryPeople.setLastName(peop.getLastName());
			qryPeople.setFirstName(peop.getFirstName());
			qryPeople.setMiddleName(peop.getMiddleName());
			qryPeople.setEmail(peop.getEmail());

			var r = aa.people.getPeopleByPeopleModel(qryPeople);

			if (!r.getSuccess()) {
				logDebug("WARNING: error searching for people : " + r.getErrorMessage());
				return false;
			}

			var peopResult = r.getOutput();

			if (peopResult.length > 0) {
				logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
				return peopResult[0].getContactSeqNumber();
			}
		}
	}

	if (peop.getContactTypeFlag() == "organization") {
		if (peop.getTradeName() || peop.getBusinessName()) {
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

			qryPeople.setTradeName(peop.getTradeName());
			qryPeople.setBusinessName(peop.getBusinessName());

			var r = aa.people.getPeopleByPeopleModel(qryPeople);

			if (!r.getSuccess()) {
				logDebug("WARNING: error searching for people : " + r.getErrorMessage());
				return false;
			}

			var peopResult = r.getOutput();

			if (peopResult.length > 0) {
				logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
				return peopResult[0].getContactSeqNumber();
			}
		}

	}

	logDebug("ComparePeople did not find a match");
	return false;
}

function contactObj_modified(ccsm)  {

    this.people = null;         // for access to the underlying data
    this.capContact = null;     // for access to the underlying data
    this.capContactScript = null;   // for access to the underlying data
    this.capId = null;
    this.type = null;
    this.seqNumber = null;
    this.refSeqNumber = null;
    this.asiObj = null;
    this.asi = new Array();    // associative array of attributes
	this.customFieldsObj = null;
	this.customFields = new Array();
	this.customTablesObj = null;
	this.customTables = new Array();
    this.primary = null;
    this.relation = null;
    this.addresses = null;  // array of addresses
    this.validAttrs = false;
	this.validCustomFields = false;
	this.validCustomTables = false;
        
    this.capContactScript = ccsm;
    if (ccsm)  {
        if (ccsm.getCapContactModel == undefined) {  // page flow
            this.people = this.capContactScript.getPeople();
            this.refSeqNumber = this.capContactScript.getRefContactNumber();
            }
        else {
            this.capContact = ccsm.getCapContactModel();
            this.people = this.capContact.getPeople();
            this.refSeqNumber = this.capContact.getRefContactNumber();
			// contact ASI
			var tm = this.people.getTemplate();
			if (tm)	{
				var templateGroups = tm.getTemplateForms();
				var gArray = new Array();
				if (!(templateGroups == null || templateGroups.size() == 0)) {
					var subGroups = templateGroups.get(0).getSubgroups();
					for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
						var subGroup = subGroups.get(subGroupIndex);
						var fields = subGroup.getFields();
						for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
							var field = fields.get(fieldIndex);
							this.asi[field.getDisplayFieldName()] = field.getDefaultValue();
						}
					}
				}
			}

			// contact attributes
			// Load People Template Fields
            if (this.people.getAttributes() != null) {
                this.asiObj = this.people.getAttributes().toArray();
                if (this.asiObj != null) {
                    for (var xx1 in this.asiObj) this.asi[this.asiObj[xx1].attributeName] = this.asiObj[xx1];
                    this.validAttrs = true; 
                }   
            }
			// Load Custom Template Fields
			if (this.capContact.getTemplate() != null && this.capContact.getTemplate().getTemplateForms() != null) {
				var customTemplate = this.capContact.getTemplate();
				this.customFieldsObj = customTemplate.getTemplateForms();
				
				for (var i = 0; i < this.customFieldsObj.size(); i++) {
					var eachForm = this.customFieldsObj.get(i);

					//Sub Group
					var subGroup = eachForm.subgroups;

					if (subGroup == null) {
						continue;
					}

					for (var j = 0; j < subGroup.size(); j++) {
						var eachSubGroup = subGroup.get(j);

						if (eachSubGroup == null || eachSubGroup.fields == null) {
							continue;
						}

						var allFields = eachSubGroup.fields;
						for (var k = 0; k < allFields.size(); k++) {
							var eachField = allFields.get(k);
							this.customFields[eachField.displayFieldName] = eachField.defaultValue;
							logDebug("(contactObj) {" + eachField.displayFieldName + "} = " +  eachField.defaultValue);
							this.validCustomFields = true;
						}
					}
				}
			}
        }  

        //this.primary = this.capContact.getPrimaryFlag().equals("Y");
        this.relation = this.people.relation;
        this.seqNumber = this.people.contactSeqNumber;
        this.type = this.people.getContactType();
        this.capId = this.capContactScript.getCapID();
        var contactAddressrs = aa.address.getContactAddressListByCapContact(this.capContact);
        if (contactAddressrs.getSuccess()) {
            this.addresses = contactAddressrs.getOutput();
            var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
            this.people.setContactAddressList(contactAddressModelArr);
            }
        else {
            pmcal = this.people.getContactAddressList();
            if (pmcal) {
                this.addresses = pmcal.toArray();
            }
        }
    }       
        this.toString = function() { return this.capId + " : " + this.type + " " + this.people.getLastName() + "," + this.people.getFirstName() + " (id:" + this.seqNumber + "/" + this.refSeqNumber + ") #ofAddr=" + this.addresses.length + " primary=" + this.primary;  }
        
        this.getEmailTemplateParams = function (params) {
            addParameter(params, "$$LastName$$", this.people.getLastName());
            addParameter(params, "$$FirstName$$", this.people.getFirstName());
            addParameter(params, "$$MiddleName$$", this.people.getMiddleName());
            addParameter(params, "$$BusinesName$$", this.people.getBusinessName());
            addParameter(params, "$$ContactSeqNumber$$", this.seqNumber);
            addParameter(params, "$$ContactType$$", this.type);
            addParameter(params, "$$Relation$$", this.relation);
            addParameter(params, "$$Phone1$$", this.people.getPhone1());
            addParameter(params, "$$Phone2$$", this.people.getPhone2());
            addParameter(params, "$$Email$$", this.people.getEmail());
            addParameter(params, "$$AddressLine1$$", this.people.getCompactAddress().getAddressLine1());
            addParameter(params, "$$AddressLine2$$", this.people.getCompactAddress().getAddressLine2());
            addParameter(params, "$$City$$", this.people.getCompactAddress().getCity());
            addParameter(params, "$$State$$", this.people.getCompactAddress().getState());
            addParameter(params, "$$Zip$$", this.people.getCompactAddress().getZip());
            addParameter(params, "$$Fax$$", this.people.getFax());
            addParameter(params, "$$Country$$", this.people.getCompactAddress().getCountry());
            addParameter(params, "$$FullName$$", this.people.getFullName());
            return params;
            }
        
        this.replace = function(targetCapId) { // send to another record, optional new contact type
        
            var newType = this.type;
            if (arguments.length == 2) newType = arguments[1];
            //2. Get people with target CAPID.
            var targetPeoples = getContactObjs(targetCapId,[String(newType)]);
            //3. Check to see which people is matched in both source and target.
            for (var loopk in targetPeoples)  {
                var targetContact = targetPeoples[loopk];
                if (this.equals(targetPeoples[loopk])) {
                    targetContact.people.setContactType(newType);
                    aa.people.copyCapContactModel(this.capContact, targetContact.capContact);
                    targetContact.people.setContactAddressList(this.people.getContactAddressList());
                    overwriteResult = aa.people.editCapContactWithAttribute(targetContact.capContact);
                    if (overwriteResult.getSuccess())
                        logDebug("overwrite contact " + targetContact + " with " + this);
                    else
                        logDebug("error overwriting contact : " + this + " : " + overwriteResult.getErrorMessage());
                    return true;
                    }
                }

                var tmpCapId = this.capContact.getCapID();
                var tmpType = this.type;
                this.people.setContactType(newType);
                this.capContact.setCapID(targetCapId);
                createResult = aa.people.createCapContactWithAttribute(this.capContact);
                if (createResult.getSuccess())
                    logDebug("(contactObj) contact created : " + this);
                else
                    logDebug("(contactObj) error creating contact : " + this + " : " + createResult.getErrorMessage());
                this.capContact.setCapID(tmpCapId);
                this.type = tmpType;
                return true;
        }

        this.equals = function(t) {
            if (t == null) return false;
            if (!String(this.people.type).equals(String(t.people.type))) { return false; }
            if (!String(this.people.getFirstName()).equals(String(t.people.getFirstName()))) { return false; }
            if (!String(this.people.getLastName()).equals(String(t.people.getLastName()))) { return false; }
            if (!String(this.people.getFullName()).equals(String(t.people.getFullName()))) { return false; }
            if (!String(this.people.getBusinessName()).equals(String(t.people.getBusinessName()))) { return false; }
            return  true;
        }
        
        this.saveBase = function() {
            // set the values we store outside of the models.
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            saveResult = aa.people.editCapContact(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) base contact saved : " + this);
            else
                logDebug("(contactObj) error saving base contact : " + this + " : " + saveResult.getErrorMessage());
            }               
        
        this.save = function() {
            // set the values we store outside of the models
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            this.capContact.setPeople(this.people);
            saveResult = aa.people.editCapContactWithAttribute(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) contact saved : " + this);
            else
                logDebug("(contactObj) error saving contact : " + this + " : " + saveResult.getErrorMessage());
            }
			
		this.syncCapContactToReference = function() {
			
			if(this.refSeqNumber){
				var vRefContPeopleObj = aa.people.getPeople(this.refSeqNumber).getOutput();
				var saveResult = aa.people.syncCapContactToReference(this.capContact,vRefContPeopleObj);
				if (saveResult.getSuccess())
					logDebug("(contactObj) syncCapContactToReference : " + this);
				else
					logDebug("(contactObj) error syncCapContactToReference : " + this + " : " + saveResult.getErrorMessage());
			}
			else{
				logDebug("(contactObj) error syncCapContactToReference : No Reference Contact to Syncronize With");
			}
            
		}
		this.syncCapContactFromReference = function() {
			
			if(this.refSeqNumber){
				var vRefContPeopleObj = aa.people.getPeople(this.refSeqNumber).getOutput();
				var saveResult = aa.people.syncCapContactFromReference(this.capContact,vRefContPeopleObj);
				if (saveResult.getSuccess())
					logDebug("(contactObj) syncCapContactFromReference : " + this);
				else
					logDebug("(contactObj) error syncCapContactFromReference : " + this + " : " + saveResult.getErrorMessage());
			}
			else{
				logDebug("(contactObj) error syncCapContactFromReference : No Reference Contact to Syncronize With");
			}
            
		}

        //get method for Attributes
        this.getAttribute = function (vAttributeName){
            var retVal = null;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null)
                    retVal = tmpVal.getAttributeValue();
            }
            return retVal;
        }
        
        //Set method for Attributes
        this.setAttribute = function(vAttributeName,vAttributeValue){
			var retVal = false;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null){
                    tmpVal.setAttributeValue(vAttributeValue);
                    retVal = true;
                }
            }
            return retVal;
        }
		
		//get method for Custom Template Fields
        this.getCustomField = function(vFieldName){
            var retVal = null;
            if(this.validCustomFields){
                var tmpVal = this.customFields[vFieldName.toString()];
                if(!matches(tmpVal,undefined,null,"")){
                    retVal = tmpVal;
				}
            }
            return retVal;
        }
		
		//Set method for Custom Template Fields
        this.setCustomField = function(vFieldName,vFieldValue){
            
            var retVal = false;
            if(this.validCustomFields){
				
				for (var i = 0; i < this.customFieldsObj.size(); i++) {
					var eachForm = this.customFieldsObj.get(i);

					//Sub Group
					var subGroup = eachForm.subgroups;

					if (subGroup == null) {
						continue;
					}

					for (var j = 0; j < subGroup.size(); j++) {
						var eachSubGroup = subGroup.get(j);

						if (eachSubGroup == null || eachSubGroup.fields == null) {
							continue;
						}

						var allFields = eachSubGroup.fields;
						for (var k = 0; k < allFields.size(); k++) {
							var eachField = allFields.get(k);
							if(eachField.displayFieldName == vFieldName){
							logDebug("(contactObj) updating custom field {" + eachField.displayFieldName + "} = " +  eachField.defaultValue + " to " + vFieldValue);
							eachField.setDefaultValue(vFieldValue);
							retVal = true;
							}
						}
					}
				}
            }
            return retVal;
        }

        this.remove = function() {
            var removeResult = aa.people.removeCapContact(this.capId, this.seqNumber)
            if (removeResult.getSuccess())
                logDebug("(contactObj) contact removed : " + this + " from record " + this.capId.getCustomID());
            else
                logDebug("(contactObj) error removing contact : " + this + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
            }

        this.isSingleAddressPerType = function() {
            if (this.addresses.length > 1) 
                {
                
                var addrTypeCount = new Array();
                for (y in this.addresses) 
                    {
                    thisAddr = this.addresses[y];
                    addrTypeCount[thisAddr.addressType] = 0;
                    }

                for (yy in this.addresses) 
                    {
                    thisAddr = this.addresses[yy];
                    addrTypeCount[thisAddr.addressType] += 1;
                    }

                for (z in addrTypeCount) 
                    {
                    if (addrTypeCount[z] > 1) 
                        return false;
                    }
                }
            else
                {
                return true;    
                }

            return true;

            }

        this.getAddressTypeCounts = function() { //returns an associative array of how many adddresses are attached.
           
            var addrTypeCount = new Array();
            
            for (y in this.addresses) 
                {
                thisAddr = this.addresses[y];
                addrTypeCount[thisAddr.addressType] = 0;
                }

            for (yy in this.addresses) 
                {
                thisAddr = this.addresses[yy];
                addrTypeCount[thisAddr.addressType] += 1;
                }

            return addrTypeCount;

            }

        this.createPublicUser = function() {

            if (!this.capContact.getEmail())
            { logDebug("(contactObj) Couldn't create public user for : " + this +  ", no email address"); return false; }

            if (String(this.people.getContactTypeFlag()).equals("organization"))
            { logDebug("(contactObj) Couldn't create public user for " + this + ", the contact is an organization"); return false; }
            
            // check to see if public user exists already based on email address
            var getUserResult = aa.publicUser.getPublicUserByEmail(this.capContact.getEmail())
            if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                userModel = getUserResult.getOutput();
                logDebug("(contactObj) createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
            }

            if (!userModel) // create one
                {
                logDebug("(contactObj) CreatePublicUserFromContact: creating new user based on email address: " + this.capContact.getEmail()); 
                var publicUser = aa.publicUser.getPublicUserModel();
                publicUser.setFirstName(this.capContact.getFirstName());
                publicUser.setLastName(this.capContact.getLastName());
                publicUser.setEmail(this.capContact.getEmail());
                publicUser.setUserID(this.capContact.getEmail());
                publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
                publicUser.setAuditID("PublicUser");
                publicUser.setAuditStatus("A");
                publicUser.setCellPhone(this.people.getPhone2());

                var result = aa.publicUser.createPublicUser(publicUser);
                if (result.getSuccess()) {

                logDebug("(contactObj) Created public user " + this.capContact.getEmail() + "  sucessfully.");
                var userSeqNum = result.getOutput();
                var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

                // create for agency
                aa.publicUser.createPublicUserForAgency(userModel);

                // activate for agency
                var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
                userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(aa.getServiceProviderCode(),userSeqNum,"ADMIN");

                // reset password
                var resetPasswordResult = aa.publicUser.resetPassword(this.capContact.getEmail());
                if (resetPasswordResult.getSuccess()) {
                    var resetPassword = resetPasswordResult.getOutput();
                    userModel.setPassword(resetPassword);
                    logDebug("(contactObj) Reset password for " + this.capContact.getEmail() + "  sucessfully.");
                } else {
                    logDebug("(contactObj **WARNING: Reset password for  " + this.capContact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
                }

                // send Activate email
                aa.publicUser.sendActivateEmail(userModel, true, true);

                // send another email
                aa.publicUser.sendPasswordEmail(userModel);
                }
                else {
                    logDebug("(contactObj) **WARNIJNG creating public user " + this.capContact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
                }
            }

        //  Now that we have a public user let's connect to the reference contact       
            
        if (this.refSeqNumber)
            {
            logDebug("(contactObj) CreatePublicUserFromContact: Linking this public user with reference contact : " + this.refSeqNumber);
            aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), this.refSeqNumber);
            }
            

        return userModel; // send back the new or existing public user
        }

        this.getCaps = function() { // option record type filter

        
            if (this.refSeqNumber) {
                aa.print("ref seq : " + this.refSeqNumber);
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput(); 
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ; 
                pm.setContactSeqNumber(this.refSeqNumber); 

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();
                
                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        resultArray.push(thisCapId)
                        }
                    }
            }
            
        return resultArray;
        }

        this.getRelatedContactObjs = function() { // option record type filter
        
            if (this.refSeqNumber) {
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput(); 
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ; 
                pm.setContactSeqNumber(this.refSeqNumber); 

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();
                
                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        var ccsm = aa.people.getCapContactByPK(thisCapId, cList[j].getPeople().contactSeqNumber).getOutput();
                        var newContactObj = new contactObj(ccsm);
                        resultArray.push(newContactObj)
                        }
                    }
            }
            
        return resultArray;
        }
        
        
        
        this.createRefLicProf = function(licNum,rlpType,addressType,licenseState) {
            
            // optional 3rd parameter serv_prov_code
            var updating = false;
            var serv_prov_code_4_lp = aa.getServiceProviderCode();
            if (arguments.length == 5) {
                serv_prov_code_4_lp = arguments[4];
                aa.setDelegateAgencyCode(serv_prov_code_4_lp);
                }
            
            // addressType = one of the contact address types, or null to pull from the standard contact fields.
            var newLic = getRefLicenseProf(licNum);

            if (newLic) {
                updating = true;
                logDebug("(contactObj) Updating existing Ref Lic Prof : " + licNum);
                }
            else {
                var newLic = aa.licenseScript.createLicenseScriptModel();
                }

            peop = this.people;
            cont = this.capContact;
            if (cont.getFirstName() != null) newLic.setContactFirstName(cont.getFirstName());
            if (peop.getMiddleName() != null) newLic.setContactMiddleName(peop.getMiddleName()); // use people for this
            if (cont.getLastName() != null) if (peop.getNamesuffix() != null) newLic.setContactLastName(cont.getLastName() + " " + peop.getNamesuffix()); else newLic.setContactLastName(cont.getLastName());
            if (peop.getBusinessName() != null) newLic.setBusinessName(peop.getBusinessName());
            if (peop.getPhone1() != null) newLic.setPhone1(peop.getPhone1());
            if (peop.getPhone2() != null) newLic.setPhone2(peop.getPhone2());
            if (peop.getEmail() != null) newLic.setEMailAddress(peop.getEmail());
            if (peop.getFax() != null) newLic.setFax(peop.getFax());
            newLic.setAgencyCode(serv_prov_code_4_lp);
            newLic.setAuditDate(sysDate);
            newLic.setAuditID(currentUserID);
            newLic.setAuditStatus("A");
            newLic.setLicenseType(rlpType);
            newLic.setStateLicense(licNum);
            newLic.setLicState(licenseState);
            //setting this field for a future enhancement to filter license types by the licensing board field. (this will be populated with agency names)
            var agencyLong = lookup("CONTACT_ACROSS_AGENCIES",servProvCode);
            if (!matches(agencyLong,undefined,null,"")) newLic.setLicenseBoard(agencyLong); else newLic.setLicenseBoard("");
 
            var addr = null;

            if (addressType) {
                for (var i in this.addresses) {
                    cAddr = this.addresses[i];
                    if (addressType.equals(cAddr.getAddressType())) {
                        addr = cAddr;
                    }
                }
            }
            
            if (!addr) addr = peop.getCompactAddress();   //  only used on non-multiple addresses or if we can't find the right multi-address
            
            if (addr.getAddressLine1() != null) newLic.setAddress1(addr.getAddressLine1());
            if (addr.getAddressLine2() != null) newLic.setAddress2(addr.getAddressLine2());
            if (addr.getAddressLine3() != null) newLic.getLicenseModel().setTitle(addr.getAddressLine3());
            if (addr.getCity() != null) newLic.setCity(addr.getCity());
            if (addr.getState() != null) newLic.setState(addr.getState());
            if (addr.getZip() != null) newLic.setZip(addr.getZip());
            if (addr.getCountryCode() != null) newLic.getLicenseModel().setCountryCode(addr.getCountryCode());
            
            if (updating)
                myResult = aa.licenseScript.editRefLicenseProf(newLic);
            else
                myResult = aa.licenseScript.createRefLicenseProf(newLic);

            if (arguments.length == 5) {
                aa.resetDelegateAgencyCode();
            }
                
            if (myResult.getSuccess())
                {
                logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " From Contact " + this);
                return true;
                }
            else
                {
                logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
                return false;
                }
        }
        
        this.getAKA = function() {
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            if (this.refSeqNumber) {
                return aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber)).toArray();
                }
            else {
                logDebug("contactObj: Cannot get AKA names for a non-reference contact");
                return false;
                }
            }
            
        this.addAKA = function(firstName,middleName,lastName,fullName,startDate,endDate) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot add AKA name for non-reference contact");
                return false;
                }
                
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var args = new Array();
            var akaModel = aa.proxyInvoker.newInstance("com.accela.orm.model.contact.PeopleAKAModel",args).getOutput();
            var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel",args).getOutput();

            var a = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));
            akaModel.setServiceProviderCode(aa.getServiceProviderCode());
            akaModel.setContactNumber(parseInt(this.refSeqNumber));
            akaModel.setFirstName(firstName);
            akaModel.setMiddleName(middleName);
            akaModel.setLastName(lastName);
            akaModel.setFullName(fullName);
            akaModel.setStartDate(startDate);
            akaModel.setEndDate(endDate);
            auditModel.setAuditDate(new Date());
            auditModel.setAuditStatus("A");
            auditModel.setAuditID("ADMIN");
            akaModel.setAuditModel(auditModel);
            a.add(akaModel);

            aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, a);
            }

        this.removeAKA = function(firstName,middleName,lastName) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot remove AKA name for non-reference contact");
                return false;
                }
            
            var removed = false;
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var l = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));
            
            var i = l.iterator();
            while (i.hasNext()) {
                var thisAKA = i.next();
                if ((!thisAKA.getFirstName() || thisAKA.getFirstName().equals(firstName)) && (!thisAKA.getMiddleName() || thisAKA.getMiddleName().equals(middleName)) && (!thisAKA.getLastName() || thisAKA.getLastName().equals(lastName))) {
                    i.remove();
                    logDebug("contactObj: removed AKA Name : " + firstName + " " + middleName + " " + lastName);
                    removed = true;
                    }
                }   
                    
            if (removed)
                aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, l);
            }

        this.hasPublicUser = function() { 
            if (this.refSeqNumber == null) return false;
            var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(this.refSeqNumber));
            
            if (s_publicUserResult.getSuccess()) {
                var fpublicUsers = s_publicUserResult.getOutput();
                if (fpublicUsers == null || fpublicUsers.size() == 0) {
                    logDebug("The contact("+this.refSeqNumber+") is not associated with any public user.");
                    return false;
                } else {
                    logDebug("The contact("+this.refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                    return true;
                }
            } else { logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage()); return false; }
        }

        this.linkToPublicUser = function(pUserId) { 
           
            if (pUserId != null) {
                var pSeqNumber = pUserId.replace('PUBLICUSER','');
                
                var s_publicUserResult = aa.publicUser.getPublicUser(aa.util.parseLong(pSeqNumber));

                if (s_publicUserResult.getSuccess()) {
                    var linkResult = aa.licenseScript.associateContactWithPublicUser(pSeqNumber, this.refSeqNumber);

                    if (linkResult.getSuccess()) {
                        logDebug("Successfully linked public user " + pSeqNumber + " to contact " + this.refSeqNumber);
                    } else {
                        logDebug("Failed to link contact to public user");
                        return false;
                    }
                } else {
                    logDebug("Could not find a public user with the seq number: " + pSeqNumber);
                    return false;
                }


            } else {
                logDebug("No public user id provided");
                return false;
            }
        }

        this.sendCreateAndLinkNotification = function() {
            //for the scenario in AA where a paper application has been submitted
            var toEmail = this.people.getEmail();

            if (toEmail) {
                var params = aa.util.newHashtable();
                getACARecordParam4Notification(params,acaUrl);
                addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
                addParameter(params,"$$altID$$",capIDString);
                var notificationName;

                if (this.people.getContactTypeFlag() == "individual") {
                    notificationName = this.people.getFirstName() + " " + this.people.getLastName();
                } else {
                    notificationName = this.people.getBusinessName();
                }

                if (notificationName)
                    addParameter(params,"$$notificationName$$",notificationName);
                if (this.refSeqNumber) {
                    var v = new verhoeff();
                    var pinCode = v.compute(String(this.refSeqNumber));
                    addParameter(params,"$$pinCode$$",pinCode);

                    sendNotification(sysFromEmail,toEmail,"","PUBLICUSER CREATE AND LINK",params,null);                    
                }

                               
            }

        }

        this.getRelatedRefContacts = function() { //Optional relationship types array 
            
            var relTypes;
            if (arguments.length > 0) relTypes = arguments[0];
            
            var relConsArray = new Array();

            if (matches(this.refSeqNumber,null,undefined,"")) return relConsArray;

            //check as the source
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setContactSeqNumber(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);


            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getEntityID1());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }

            //check as the target
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setEntityID1(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);

            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getContactSeqNumber());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }
            return relConsArray;
    }
	}

function copyAppSpecificTable(capId, parentCapId) {
	parentAppNum = parentCapId.getCustomID();
	var tableNameArray = getTableName(capId);
	if (tableNameArray == null) {
		return;
	}

	//for (l in tableNameArray)
	//aa.print("Table: " + tableNameArray[l]);

	for (loopk in tableNameArray) {
		var tableName = tableNameArray[loopk];
		//if (!matches(tableName,"OFFICER/OWNERSHIP INFORMATION","SIGNING AUTHORITY","POWER OF ATTORNEY INFORMATION"))
		//continue;

		aa.print("Checking Amnd Table : " + tableName + " for rows");

		amndTableArray = new Array();
		origTableArray = new Array();
		udtedTableArray = new Array();

		amndTableArray = loadTable(tableName, capId);
		origTableArray = loadTable(tableName, parentCapId);

		if (amndTableArray != undefined && amndTableArray.length > 0) {
			//for each row in orig table
			for (loopOE in origTableArray) {

				var aRowFound = false;

				var origID = origTableArray[loopOE]["Certified Manager RLPS ID"];
				var oClrkName = origTableArray[loopOE]["First Name"] + origTableArray[loopOE]["Middle Name"] + origTableArray[loopOE]["Last Name"];

				aa.print("Checking Original For updates on Row: " + origID + "/" + oClrkName);

				//for each row in amend table
				for (loopAE in amndTableArray) {
					//find matching Record#
					var amndID = amndTableArray[loopAE]["Certified Manager RLPS ID"];
					var amndStatus = amndTableArray[loopAE]["Change Status"];
					var aClrkName = amndTableArray[loopAE]["First Name"] + amndTableArray[loopAE]["Middle Name"] + amndTableArray[loopAE]["Last Name"];

					if (tableName.equals("CERTIFIED MANAGER LIST") && (amndID != undefined && String(origID) == String(amndID))) {
						//if found push amnd table row
						udtedTableArray.push(amndTableArray[loopAE]);
						aRowFound = true;
						aa.print("Original Row: " + origID + " found in Amendment; Copying");

						aa.print("Change Status: " + amndStatus);
						if (amndStatus == "Inactive") {
							//if Row has been deleted from Amendment or marked Inactive remove record from hierarchy
							var desMgrCAPId = aa.cap.getCapID(origID).getOutput();
							removeParent(parentAppNum, desMgrCAPId);
						}
						continue;
					} else {
						if (tableName.equals("CERTIFIED CLERK LIST") && (oClrkName == aClrkName)) {
							//if found push amnd table row
							udtedTableArray.push(amndTableArray[loopAE]);
							aRowFound = true;
							aa.print("Original Row: " + oClrkName + " found in Amendment; Copying");
							continue;
						}
					}

				}

				//if matching row not found update orig row inactive & push orig row
				if (!aRowFound) {
					origTableArray[loopOE]["Change Status"].fieldValue = "Inactive";
					aa.print("Row: " + origID + "/" + oClrkName + " not found in Amendment; Inactivating");

					udtedTableArray.push(origTableArray[loopOE]);
				}

			}

			//for each row in amend table

			//loop through orig table to find Record; if not found push amend table row
			for (loopAN in amndTableArray) {

				var nRowFound = true;

				var amndNID = amndTableArray[loopAN]["Certified Manager RLPS ID"];
				var amndClrkName = amndTableArray[loopAN]["First Name"] + amndTableArray[loopAN]["Middle Name"] + amndTableArray[loopAN]["Last Name"];

				aa.print("Checking Amendment For Row not in Original: " + amndNID + "/" + amndClrkName);

				//for each row in orig table
				for (loopON in origTableArray) {
					//find matching Record#
					var origNID = origTableArray[loopON]["Certified Manager RLPS ID"];
					var origClrkName = origTableArray[loopON]["First Name"] + origTableArray[loopON]["Middle Name"] + origTableArray[loopON]["Last Name"];

					if (tableName.equals("CERTIFIED MANAGER LIST") && (String(amndNID) == String(origNID))) {
						aa.print("origNID: " + origNID + "/" + origClrkName);
						aa.print("HERE");
						//if found skip & go to next
						aa.print("Amendment Row: " + amndNID + " found in Original; Skipping");
						nRowFound = false;
						continue;
					} else {
						if (tableName.equals("CERTIFIED CLERK LIST") && (amndClrkName == origClrkName)) {
							aa.print("HERE2");
							//if found skip & go to next
							aa.print("Amendment Row: " + amndClrkName + " found in Original; Skipping");
							nRowFound = false;
							continue;
						}
					}
				}
				aa.print("New Row? " + nRowFound);

				//if matching row not found push amnd row to new table
				if (nRowFound) {
					aa.print("HERE3");
					udtedTableArray.push(amndTableArray[loopAN]);
					aa.print("Row: " + amndNID + "/" + amndClrkName + " not found in Original; Copying");
				}
			}

			//update orig w/new table entries
			removeASITable(tableName, parentCapId);
			addASITable(tableName, udtedTableArray, parentCapId);
		} else
			aa.print("NO Rows on Amendment.  Skipping");
	}
}

function copyContactsWithAddress(pFromCapId, pToCapId)
{
   // Copies all contacts from pFromCapId to pToCapId and includes Contact Address objects
   //
   if (pToCapId == null)
   var vToCapId = capId;
   else
   var vToCapId = pToCapId;

   var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
   var copied = 0;
   if (capContactResult.getSuccess())
   {
      var Contacts = capContactResult.getOutput();
      for (yy in Contacts)
      {
         var newContact = Contacts[yy].getCapContactModel();

         var newPeople = newContact.getPeople();
         // aa.print("Seq " + newPeople.getContactSeqNumber());

         var addressList = aa.address.getContactAddressListByCapContact(newContact).getOutput();
         newContact.setCapID(vToCapId);
         aa.people.createCapContact(newContact);
         newerPeople = newContact.getPeople();
         // contact address copying
         if (addressList)
         {
            for (add in addressList)
            {
               var transactionAddress = false;
               contactAddressModel = addressList[add].getContactAddressModel();
			   
			   logDebug("contactAddressModel.getEntityType():" + contactAddressModel.getEntityType());
			   
               if (contactAddressModel.getEntityType() == "CAP_CONTACT")
               {
                  transactionAddress = true;
                  contactAddressModel.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
               }
               // Commit if transaction contact address
               if(transactionAddress)
               {
                  var newPK = new com.accela.orm.model.address.ContactAddressPKModel();
                  contactAddressModel.setContactAddressPK(newPK);
                  aa.address.createCapContactAddress(vToCapId, contactAddressModel);
               }
               // Commit if reference contact address
               else
               {
                  // build model
                  var Xref = aa.address.createXRefContactAddressModel().getOutput();
                  Xref.setContactAddressModel(contactAddressModel);
                  Xref.setAddressID(addressList[add].getAddressID());
                  Xref.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
                  Xref.setEntityType(contactAddressModel.getEntityType());
                  Xref.setCapID(vToCapId);
                  // commit address
                  commitAddress = aa.address.createXRefContactAddress(Xref.getXRefContactAddressModel());
				  if(commitAddress.getSuccess())
				  {
					commitAddress.getOutput();
					logDebug("Copied contact address");
				  }
               }
            }
         }
         // end if
         copied ++ ;
         logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
      }
   }
   else
   {
      logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
      return false;
   }
   return copied;
}



function copyLicenseProfWASI(sourceAltId,destAltId){
	//-1. Initialize.
	var sourceCapId = getCapByCustomID(sourceAltId); 
	var destCapId = getCapByCustomID(destAltId); 
	var callId="ADMIN";

	//-2. Get source LP values. Now there is no ASI/ASIT inside it.
	var result = aa.licenseProfessional.getLicenseProf(sourceCapId);
	if(result.getSuccess())
	{
		var sourceLPArray = result.getOutput(); //LicenseProfessionalScriptModel[]
		if(sourceLPArray!=null && sourceLPArray.length > 0 )
		{
			for(var i in sourceLPArray)
			{
				//-2.1. Get related ASI/ASIT data of LP
				var lpScriptModel = aa.licenseProfessional.getLicensedProfessionalsByPK(sourceLPArray[i]).getOutput();
				
				//-2.2. Modify source LP's CAP ID to destination CAP ID
				lpScriptModel.setCapID(destCapId);
				//-----------------------------------------
				//Here we can modify some other vlaues of LP
				//-----------------------------------------
				
				//-2.3. Modify the entity PK
				if(lpScriptModel.getLicenseProfessionalModel().getTemplate()!=null)
				{
					//ASI/ASIT data is stored in : lpScriptModel.getLicenseProfessionalModel().getTemplate();
					logDebug("ASI/ASTI:"+lpScriptModel.getLicenseProfessionalModel().getTemplate());
					
					//Modify source entity PK so that it can be stored into DB for destination CAP's LP.
					lpScriptModel.getLicenseProfessionalModel().getTemplate().setEntityPKModel(lpScriptModel.getLicenseProfessionalModel().getEntityPK());
				}
				//-2.4 Remove existing LP
				var getResult = aa.licenseProfessional.getLicensedProfessionalsByPK(lpScriptModel);
				if(getResult.getSuccess())
				{	
					var removeResult = aa.licenseProfessional.removeLicensedProfessional(lpScriptModel);
					if(!removeResult.getSuccess())
					{
						logDebug("Failed to remove existing ASI/ASIT data."+removeResult.getErrorMessage());
						aa.abortScript();
					}
				}	
				
				//-2.5 Create new LP along with related ASI/ASIT 
				var updateRes = aa.licenseProfessional.createLicensedProfessional(lpScriptModel);
				if(!updateRes.getSuccess())
				{
					logDebug("Failed to create new ASI/ASIT data."+updateRes.getErrorMessage());
					aa.abortScript();
				}
			}
		}
		else
		{
			logDebug("No ASI value need to be copied.");
		}
	}
	else
	{
		logDebug("Failed to get LP values."+result.getErrorMessage());
		aa.abortScript();
	}
}
//Get CAPIDModel by custID

function countyLookUp(retVal,appCounty){
	
	if (appCounty != null){
		var CountyInfo = lookup("TABC_County_Code",appCounty);
		comment("County Code : "+appCounty);
		tempvalue = CountyInfo;  
		tempval = tempvalue.split("/");
		CountyAbbrev=tempval[0]; 
		CountyName=tempval[1];
		CountyLetter=tempval[2];
		
		if (retVal.equals("CName")){
			if (CountyName.equals("NASHVILLE"))
				return "TABC/NA/NA/REG/NA/NASHVILL/NA";
			
			if (CountyName.equals("CHATTANOOGA"))
				return "TABC/NA/NA/REG/NA/CHATTANO/NA";
			
			if (CountyName.equals("MEMPHIS"))
				return "TABC/NA/NA/REG/NA/MEMPHIS/NA";
			
			if (CountyName.equals("KNOXVILLE"))
				return "TABC/NA/NA/REG/NA/KNOXVILL/NA";
		}
		if (retVal.equals("CLetr"))
			return CountyLetter;
		
		if (retVal.equals("CAbbr"))
			return CountyAbbrev;
	}
	else{
		if (retVal.equals("CName"))
			return "TABC/NA/NA/REG/NA/NA/NA";
		}
}


function createCertificate(grp, typ, stype, cat, desc, initStatus, copyASI, createRefLP, contactType, licHolderSwitch, licHolderType,asiLicenseCounty) 
{
    //initStatus - record status to set the Permit to initially
    //copyASI - copy ASI from Application to Permit? (true/false)
    //createRefLP - create the reference LP (true/false)
    //licHolderSwitch - switch the applicant to Permit holder

    var newLic = null;
    var newLicId = null;
    var newLicIdString = null;
    var newLicenseType = null;
    var oldAltID = null;
    var AltIDChanged = false;
	
	var prvNBR = "";
    //create the Permit record

    //create the record
    // newLicId = createChild(grp, typ, stype, cat, desc); Commented out by FJB 12-30-15
	newLicId = createChildwithAddrAttributes(grp, typ, stype, cat, desc);
	
    //copy all ASI
    if (copyASI && newLicId && typ != "Hearing") 
    {
        copyAppSpecific(newLicId);
        copyASITables(capId, newLicId); 
    }

    if (copyASI && newLicId && typ == "Hearing") 
    {
        copyAppSpecific(newLicId);
    }

    //field repurposed to represent the current term effective date
    // editScheduledDate(sysDateMMDDYYYY, newLicId);
    //field repurposed to represent the original effective date
    //editFirstIssuedDate(sysDateMMDDYYYY, newLicId);
    oldAltID = newLicId.getCustomID();


    // update the application status
    //updateAppStatus(initStatus, "", newLicId);
    newLicIdString = newLicId.getCustomID();
	
	if (appTypeArray[1].equals("Education") && matches(appTypeArray[3],"RV Trainer","Server Training Trainer"))
		newLicenseType = "Provider";
	else
		newLicenseType = aa.cap.getCap(newLicId).getOutput().getCapType().getAlias(); 	/* Added 5/4/16 FJB */

    logDebug("newLicIdString:" + newLicIdString);
    logDebug("newLicenseType:" + newLicenseType);  					/* Added 5/4/16 FJB */

	//setLicExpirationDate(newLicId);

	var vExpDate = null;
	try {
		vExpDate =  aa.expiration.getLicensesByCapID(newLicId).getOutput().getExpDate();
		}
	catch (e) 
    {
		vExpDate = null;
	}

    if (createRefLP && newLicId) 
    {
        logDebug("Creating Ref LP.");
        var refLpMdl = createRefLicProf_custom(newLicIdString, newLicenseType, contactType,newLicId);

		if (newLicenseType == "Provider"){
			prvNBR = createProviderDetails(refLpMdl);
			
			if (!prvNBR){
				newLicId = false;
				aa.print( "**ERROR: Could not Create Provider Details"); 
				return false;
			}
		}
    }

    if (licHolderSwitch && newLicId) 
    {
        conToChange = null;
        cons = aa.people.getCapContactByCapID(newLicId).getOutput();
        logDebug("Contacts:" + cons);
        logDebug("Contact Length:" + cons.length);

        for (thisCon in cons) 
        {
            if (cons[thisCon].getCapContactModel().getPeople().getContactType() == contactType) 
            {
                conToChange = cons[thisCon].getCapContactModel();
                p = conToChange.getPeople();
                p.setContactType(licHolderType);
                conToChange.setPeople(p);
                aa.people.editCapContact(conToChange);
                logDebug("Contact type successfully switched to " + licHolderType);

                //added by thp to copy contact-Addres
                var source = getPeople(capId);
                //source = aa.people.getCapContactByCapID(capId).getOutput();
                for (zz in source) 
                {
                    sourcePeopleModel = source[zz].getCapContactModel();
                    if (sourcePeopleModel.getPeople().getContactType() == contactType) 
                    {
                        p.setContactAddressList(sourcePeopleModel.getPeople().getContactAddressList());
                        aa.people.editCapContactWithAttribute(conToChange);
                        logDebug("ContactAddress Updated Successfully");
                    }
                }
            }
        }
    }

    return newLicId;
}


function createChildwithAddrAttributes(grp,typ,stype,cat,desc) // optional parent capId
{
	//
	// creates the new application and returns the capID object
	//

	var itemCap = capId
	if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args
	
	var allowDisabled = lookup("EMSE_CREATE_DISABLED_RECORD_TYPE","ENABLE");
	if (allowDisabled && allowDisabled.substring(0,1).toUpperCase().equals("Y"))
		{
			var appCreateResult = aa.cap.createAppRegardlessAppTypeStatus(grp,typ,stype,cat,desc);
			logDebug("Creating child with allow disabled record types enabled " + desc);
		}
	else
		{
			var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
			logDebug("Creating cap " + desc);
		}
		
	if (appCreateResult.getSuccess())
		{
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(newId,itemCap); 
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");

		// Copy Parcels

		var capParcelResult = aa.parcel.getParcelandAttribute(itemCap,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(Parcels[zz]);
				newCapParcel.setCapIDModel(newId);
				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
				aa.parcel.createCapParcel(newCapParcel);
				}
			}

		// Copy Contacts
		capContactResult = aa.people.getCapContactByCapID(itemCap);
		if (capContactResult.getSuccess())
			{
			Contacts = capContactResult.getOutput();
			for (yy in Contacts)
				{
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(newId);
				aa.people.createCapContact(newContact);
				logDebug("added contact");
				}
			}	

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(itemCap);
		if (capAddressResult.getSuccess())
			{
			Address = capAddressResult.getOutput();
			for (yy in Address)
				{
				newAddress = Address[yy];
				newAddress.setCapID(newId);
				// aa.address.createAddress(newAddress); Commented out by FJB
				copyAddresses(itemCap,newId);
				logDebug("added address");
				}
			}
		
		return newId;
		}
	else
		{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}
}


function createContact4ACA(strBusiName,strContType,strLglBusiStruct,strCharDt,strAddress1,strAddress2,strCity,strState,strZip,strCountry)
{
	peopleResult = aa.people.createPeopleModel();
	newPMObj = peopleResult.getOutput().getPeopleModel();

	newPMObj.setBusinessName(strBusiName);
	newPMObj.setContactType(strContType);
	newPMObj.setServiceProviderCode(aa.getServiceProviderCode());

	//Get Template
	// contact ASI
	// This is the ASI Group Name that is tied to the contact type
	var tm = aa.genericTemplate.getTemplateStructureByGroupName("C-BUSINESS").getOutput();
	if (tm)      {
		  var templateGroups = tm.getTemplateForms();
		  var gArray = new Array();
		  
		  if (!(templateGroups == null || templateGroups.size() == 0)) {
		  		 var subGroups = templateGroups.get(0).getSubgroups();
				 for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
					   var subGroup = subGroups.get(subGroupIndex);
					   var fields = subGroup.getFields();
					   for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
							  var field = fields.get(fieldIndex);
							  //aa.print("Contact Template: " + field.getDisplayFieldName()) 
							  //aa.print("Contact Tempalte Value: " + field.getDefaultValue());
							  
							  //test the attribute label to confirm you are updating right attribute
							if (String(field.getDisplayFieldName()) == "Legal Business Structure"){
								field.setDefaultValue(strLglBusiStruct); //Set the Attribute Value
							}else if(String(field.getDisplayFieldName()) == "Charter Date"){
								field.setDefaultValue(strCharDt); //Set the Attribute Value
							}
							  
					   }
				 }
		  }
	}

	//set the generic Template on the contact
    newPMObj.setTemplate(tm);
	
	// instantiate a CapContactModel
	var ccm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
	// update the peoplemodel on the new object
	ccm.setCapID(capId);
	ccm.setPeople(newPMObj);

	//Create the capContact and get the sequence number
	aa.people.createCapContact(ccm);
	var capContactID = ccm.getContactSeqNumber();

	// add the address
	// check country
	if(strCountry=="USA")
	{
		strCountry="US";
	}
	
	// remove line breaks from state
	strState=(strState + "").replace(/[\\]/g, "\\\\").replace(/[\"]/g, "\\\""); //strState.replace(/[\r\n]/g, '); //.replace(/(\r\n|\n|\r)/gm,"");
	strState=strState.trim();
	
	var conAdd = aa.address.createContactAddressModel().getOutput().getContactAddressModel();
	conAdd.setEntityType("CAP_CONTACT");
	conAdd.setEntityID(parseInt(capContactID));
	conAdd.setAddressType("Mailing");
	conAdd.setAddressLine1(strAddress1);
	conAdd.setAddressLine2(strAddress2);
    conAdd.setCity(strCity);
    conAdd.setState(strState);
    conAdd.setZip(strZip);
	conAdd.setCountryCode("US");
	conAdd.setStatus("A");
	
	//Create AddressList 
    var contactAddrModelArr = aa.util.newArrayList();
    contactAddrModelArr.add(conAdd);
    
	// set the address
	newPMObj.setContactAddressList(contactAddrModelArr);
	   
	// instantiate a CapContactModel
	var ccm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
	// update the peoplemodel on the new object
	ccm.setCapID(capId);
	ccm.setPeople(newPMObj);
	
	// update the capModel
	cap.setApplicantModel(ccm);

}



function createIndividualLicenses1() {

	LICcomm = 'Created from Application # ' + capIDString;
	comment(LICcomm);
	CAPVal = lookup('TABC_Cap_Table', appTypeString);
	comment('===> CAPVal ===> ' + CAPVal);
	var newAppID = null;
	tempvalue = CAPVal;
	tempval = tempvalue.split('/');
	disableTokens = true;
	LGroup = tempval[0];
	LType = tempval[1];
	LSubType = tempval[2];
	LCateg = tempval[3];
	disableTokens = false;
	contactType = TNABCgetContactType(LGroup, LType, LSubType, LCateg);
	comment('VALUE =====> ' + LGroup + ' -  ' + LType + ' -  ' + LSubType + ' -  ' + LCateg);
	if (!matches(appTypeArray[1], 'Permits', 'Education') && !appTypeArray[3].equals('Special Occasion')) {
		newAppID = createLicense('TNABC', LType, LSubType, LCateg, LICcomm, 'Active', true, true, contactType, false, LICcomm, asiLicenseCounty);
		altid = newAppID;
	}

	if (appTypeArray[3].equals('Special Occasion')) {
		asiLicenseCounty = getCountyValue(capId);
		newAppID = createSOLicense(appTypeArray[0], appTypeArray[1], 'License', appTypeArray[3], '', contactType, asiLicenseCounty);
		var spoLmt = getSpecOcc(newAppID);
		altid = newAppID;
	}

	if (appMatch('TNABC/Permits/*/*')) {
		var asiLicenseCounty = '';
		asiLicenseCounty = getCountyValue(capId);
		if (!asiLicenseCounty || asiLicenseCounty == null)
			asiLicenseCounty = AInfo['County'];
		newAppID = createPermit('TNABC', LType, LSubType, LCateg, LICcomm, 'Active', false, false, contactType, false, LICcomm, asiLicenseCounty);
		altid = newAppID;
	}

	if (appMatch('TNABC/Education/Application/*')) {
		newAppID = createCertificate('TNABC', LType, LSubType, LCateg, LICcomm, 'Active', true, true, contactType, false, LICcomm, 'Nashville');
		altid = newAppID;
		asiLicenseCounty = 'Nashville';
	}

	if (appMatch('TNABC/Education/*/*') && (LCateg == 'RV Trainer' || LCateg == 'Server Training Trainer') && newAppID) {
		savecap = capId;
		capId = newAppID;
		if (AInfo['Program Number'] != null)
			addParent(aa.cap.getCapID(AInfo['Program Number']).getOutput());
		capId = savecap;
	}

	if (newAppID) {
		XICcomm = '=====> Source CAP # ' + capIDString;
		comment(XICcomm + ' - Target CAP # ' + altid);
		// DISABLED: TABC_Create_Individual_Licenses_1:10
		// 	savecap=capId;
		// 	capId=newAppID;
		// 	br_nch('TABC_Create_Individual_Licenses_2');
		// 	capId=savecap;
		// DISABLED: TABC_Create_Individual_Licenses_1:10_a
		// 	copyAppSpecific(newAppID);
		// 	copyASITables(capId,newAppID);
		updateShortNotes(getShortNotes(capId), newAppID);
		savecap = capId;
		capId = newAppID;

		//replaced branch(TABC_Create_Individual_Licenses_5)
		createIndividualLicenses5();
		capId = savecap;
		// DISABLED: TABC_Create_Individual_Licenses_1:12
		// 	br_nch('TABC_Create_Individual_Licenses_7');
		// 	}
	}

	if (!appTypeArray[1].equals('Education')) {
		var appCounty = '';
		appCounty = asiLicenseCounty;
		var POD = countyLookUp('CName', appCounty);
		assignDepartment_Custom(POD, newAppID);
	}

	// DISABLED: TABC_Create_Individual_Licenses_1:98
	// if (newAppID && (appTypeArray[1].equals('Permits') && taskStatus('Preliminary Review').equals('Approved')) || (!matches(appTypeArray[3],'Server Training Program','Self-Distribution') && taskStatus('Application Review').equals('Approved'))) {
	// 	var wfComment = '';
	// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee,Armed Forces Import', 'TABC_LICENSE_APPROVAL');
	// 	}

	if (newAppID && (appTypeArray[1].equals('Permits') && taskStatus('Preliminary Review').equals('Approved')) || (!matches(appTypeArray[3], 'Server Training Program', 'Self-Distribution') && taskStatus('Application Review').equals('Approved'))) {
		var wfComment = '';
		sendNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual,Permittee,Armed Forces Import', 'TABC_LICENSE_APPROVAL');
	}

	if (!newAppID) {
		showMessage = true;
		logMessage('LICENSE/CERTIFICATE was not created due to an error');
		activateTask('Application Review');
		deactivateTask('Application Status');
		updateTask('Application Review', 'LICENSE NOT CREATED', '', '');
	}

	if (newAppID && (appTypeArray[1].equals('Education') && !appTypeArray[3].equals('Server Training Program')) && taskStatus('Application Review').equals('Approved')) {
		closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
	}

}

function createIndividualLicenses5() {

	comment('===> TABC_Create_Individual_Licenses_5 Set License Info Start - New');
	if (AInfo['Application Type'] == 'Renew Existing License') {
		var triggerDate = AInfo['Legacy Expiration Date'];
		logDebug('TRIGGER DATE WILL BE: ' + triggerDate);
	} else {
		var triggerDate = null;
		logDebug('TRIGGER DATE WILL BE: ' + triggerDate);
	}

	if (appTypeArray[2].equals('Renewal')) {
		licProfNum = capId.getCustomID();
		lic = getRefLicenseProf(String(licProfNum));
		var triggerDate = lic.getBusinessLicExpDate();
		logDebug('TRIGGER DATE WILL BE: ' + triggerDate.getMonth() + '/' + triggerDate.getDayOfMonth() + '/' + triggerDate.getYear());
	}

	if (appTypeArray[1].equals('Liquor by the Drink') && !appTypeArray[3].equals('Special Occasion')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:10a
	// if (appTypeArray[1].equals('Liquor by the Drink') && !appTypeArray[3].equals('Special Occasion')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('License Status', 'Active');
	// 	}

	if (appTypeArray[3].equals('Special Occasion')) {
		renewDate = AInfo['Event Date'];
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	if (appTypeArray[1].equals('Retail')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:20a
	// if (appTypeArray[1].equals('Retail')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('License Status', 'Active');
	// 	}

	if (appTypeArray[1].equals('Supplier') && !matches(appTypeArray[3], 'Non-Resident Seller License', 'Manufacturer', 'Wholesaler', 'Limited Manufacturing')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:30a
	// if (appTypeArray[1].equals('Supplier') && !matches(appTypeArray[3],'Non-Resident Seller License','Manufacturer','Wholesaler','Limited Manufacturing')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('License Status', 'Active');
	// 	}

	if (matches(appTypeArray[3], 'Non-Resident Seller License', 'Manufacturer', 'Wholesaler', 'Limited Manufacturing')) {
		renewDate = '12/31/' + startDate.getFullYear();
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	if (appTypeArray[3].equals('Self-Distribution')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('License Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:41a
	// if (appTypeArray[3].equals('Self-Distribution')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('License Status', 'Active');
	// 	}

	if (appTypeArray[1].equals('Education')) {
		renewDate = dateAddMonths(triggerDate, 12);
		licEditExpInfo('Active', renewDate);
		updateTask('Certificate Status', 'Active');
	}

	// DISABLED: TABC_Create_Individual_Licenses_5:50a
	// if (appTypeArray[1].equals('Education')) {
	// 	renewDate = dateAddMonths(null,12);
	// 	licEditExpInfo('Active', renewDate);
	// 	updateTask('Certificate Status', 'Active');
	// 	}

	if (appTypeArray[3].equals('Armed Forces Import')) {
		renewDate = AInfo['Exact date of shipment'];
		licEditExpInfo('Active', renewDate);
		updateTask('Permit Status', 'Active');
	}

	if (appTypeArray[3].equals('Supplier Representative')) {
		renewDate = '12/31/' + startDate.getFullYear();
		licEditExpInfo('Active', renewDate);
		updateTask('Permit Status', 'Active');
	}

	if (appTypeArray[1].equals('Permits') && !matches(appTypeArray[3], 'Armed Forces Import', 'Supplier Representative')) {
		updateTask('Permit Status', 'Active');
		newYear = parseInt(fileDateObj.getYear()) + 5;
		renewDate = wfDate.substr(5, 2) + '/' + wfDate.substr(8, 2) + '/' + newYear;
		licEditExpInfo('Active', renewDate);
		comment('===> Permit 5 year date ' + renewDate);
	}

	if (!appTypeArray[1].equals('Permits') && !appTypeArray[3].equals('Special Occasion')) {
		licProfNum = capId.getCustomID();
		comment('LIC PROF #: ' + licProfNum);
		lic = getRefLicenseProf(String(licProfNum));
		lic.setBusinessLicExpDate(aa.date.parseDate(renewDate));
		lic.setLicenseIssueDate(sysDate);
		aa.licenseScript.editRefLicenseProf(lic);
	}

}

function createLicense(grp, typ, stype, cat, desc, initStatus, copyASI, createRefLP, contactType, licHolderSwitch, licHolderType,asiLicenseCounty) {
    //initStatus - record status to set the license to initially
    //copyASI - copy ASI from Application to License? (true/false)
    //createRefLP - create the reference LP (true/false)
    //licHolderSwitch - switch the applicant to license holder

    var newLic = null;
    var newLicId = null;
    var newLicIdString = null;
    var newLicenseType = null;
    var oldAltID = null;
    var AltIDChanged = false;
	
    //create the license record

    //create the record
    // newLicId = createChild(grp, typ, stype, cat, desc); Commented out by FJB 12-30-15
	newLicId = createChildwithAddrAttributes(grp, typ, stype, cat, desc);
	
	
 //copy all ASI
    if (copyASI && newLicId && typ != "Hearing") {
        copyAppSpecific(newLicId);
        copyASITables(capId, newLicId); 
    }

    if (copyASI && newLicId && typ == "Hearing") {
        copyAppSpecific(newLicId);
    }



    //field repurposed to represent the current term effective date
    // editScheduledDate(sysDateMMDDYYYY, newLicId);
    //field repurposed to represent the original effective date
    //editFirstIssuedDate(sysDateMMDDYYYY, newLicId);
    oldAltID = newLicId.getCustomID();
	

    // generate the new AltID 
    var newAltID = generateChildAltID(newLicId,asiLicenseCounty);
	
	
    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
    newLicId = aa.cap.getCapID(newAltID).getOutput();
 

    // update the application status
    //updateAppStatus(initStatus, "", newLicId);
    newLicIdString = newLicId.getCustomID();
    newLicenseType = aa.cap.getCap(newLicId).getOutput().getCapType().getAlias(); 	/* Added 5/4/16 FJB */

    logDebug("newLicIdString:" + newLicIdString);
    logDebug("newLicenseType:" + newLicenseType);  					/* Added 5/4/16 FJB */
   
	//setLicExpirationDate(newLicId);

	var vExpDate = null;
	try {
		vExpDate =  aa.expiration.getLicensesByCapID(newLicId).getOutput().getExpDate();
		}
	catch (e) {
		vExpDate = null;
	}

    if (createRefLP && newLicId) {
        logDebug("Creating Ref LP.");
        createRefLicProf_custom(newLicIdString, newLicenseType, contactType,newLicId);

 /*       newLic = getRefLicenseProf(newLicIdString);

        if (newLic) {
        	logDebug("Reference LP successfully created");
            associateLpWithCap(newLic, newLicId);
        } else {
            logDebug("Reference LP not created");
        }*/
    }

    if (licHolderSwitch && newLicId) {
        conToChange = null;
        cons = aa.people.getCapContactByCapID(newLicId).getOutput();
        logDebug("Contacts:" + cons);
        logDebug("Contact Length:" + cons.length);

        for (thisCon in cons) {
            if (cons[thisCon].getCapContactModel().getPeople().getContactType() == contactType) {
                conToChange = cons[thisCon].getCapContactModel();
                p = conToChange.getPeople();
                p.setContactType(licHolderType);
                conToChange.setPeople(p);
                aa.people.editCapContact(conToChange);
                logDebug("Contact type successfully switched to " + licHolderType);

                //added by thp to copy contact-Addres
                var source = getPeople(capId);
                //source = aa.people.getCapContactByCapID(capId).getOutput();
                for (zz in source) {
                    sourcePeopleModel = source[zz].getCapContactModel();
                    if (sourcePeopleModel.getPeople().getContactType() == contactType) {
                        p.setContactAddressList(sourcePeopleModel.getPeople().getContactAddressList());
                        aa.people.editCapContactWithAttribute(conToChange);
                        logDebug("ContactAddress Updated Successfully");
                    }
                }
            }
        }
    }

    return newLicId;
}


function createOrUpdateRefLP(licenseScriptModel){
	var refLPModelInDB = getRefLicenseProfByStateLicense(licenseScriptModel.getServiceProviderCode(), licenseScriptModel.getStateLicense());

	if (refLPModelInDB != null)
	{
		var result = aa.licenseScript.editRefLicenseProf(licenseScriptModel);
		getOutput(result, "editRefLicenseProf");
		logDebug("The Ref. LP exists, so update it.");
	}
	else
	{
		var result = aa.licenseScript.createRefLicenseProf(licenseScriptModel);
		getOutput(result, "createRefLicenseProf");
		logDebug("The Ref. LP does not exist, so create it.");
	}
}

function createPermit(grp, typ, stype, cat, desc, initStatus, copyASI, createRefLP, contactType, licHolderSwitch, licHolderType, asiLicenseCounty) {
	//initStatus - record status to set the Permit to initially
	//copyASI - copy ASI from Application to Permit? (true/false)
	//createRefLP - create the reference LP (true/false)
	//licHolderSwitch - switch the applicant to Permit holder

	var newLic = null;
	var newLicId = null;
	var newLicIdString = null;
	var newLicenseType = null;
	var oldAltID = null;
	var AltIDChanged = false;

	//create the Permit record

	//create the record
	// newLicId = createChild(grp, typ, stype, cat, desc); Commented out by FJB 12-30-15
	newLicId = createChildwithAddrAttributes(grp, typ, stype, cat, desc);

	//copy all ASI
	if (copyASI && newLicId && typ != "Hearing") {
		copyAppSpecific(newLicId);
		copyASITables(capId, newLicId);
	}

	if (copyASI && newLicId && typ == "Hearing") {
		copyAppSpecific(newLicId);
	}

	//field repurposed to represent the current term effective date
	// editScheduledDate(sysDateMMDDYYYY, newLicId);
	//field repurposed to represent the original effective date
	//editFirstIssuedDate(sysDateMMDDYYYY, newLicId);
	oldAltID = newLicId.getCustomID();

	// generate the new AltID
	var newAltID = generatePermitAltID(newLicId, asiLicenseCounty)

		var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
	if (updateCapAltIDResult.getSuccess())
		logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
	else
		logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
	newLicId = aa.cap.getCapID(newAltID).getOutput();

	// update the application status
	//updateAppStatus(initStatus, "", newLicId);
	newLicIdString = newLicId.getCustomID();
	newLicenseType = aa.cap.getCap(newLicId).getOutput().getCapType().getAlias(); /* Added 5/4/16 FJB */

	logDebug("newLicIdString:" + newLicIdString);
	logDebug("newLicenseType:" + newLicenseType); /* Added 5/4/16 FJB */

	//setLicExpirationDate(newLicId);

	var vExpDate = null;
	try {
		vExpDate = aa.expiration.getLicensesByCapID(newLicId).getOutput().getExpDate();
	} catch (e) {
		vExpDate = null;
	}

	if (createRefLP && newLicId) {
		logDebug("Creating Ref LP.");
		createRefLicProf_custom(newLicIdString, newLicenseType, contactType, newLicId);

		/*        newLic = getRefLicenseProf(newLicIdString);

		if (newLic) {
		logDebug("Reference LP successfully created");
		associateLpWithCap(newLic, newLicId);
		} else {
		logDebug("Reference LP not created");
		}*/
	}

	if (licHolderSwitch && newLicId) {
		conToChange = null;
		cons = aa.people.getCapContactByCapID(newLicId).getOutput();
		logDebug("Contacts:" + cons);
		logDebug("Contact Length:" + cons.length);

		for (thisCon in cons) {
			if (cons[thisCon].getCapContactModel().getPeople().getContactType() == contactType) {
				conToChange = cons[thisCon].getCapContactModel();
				p = conToChange.getPeople();
				p.setContactType(licHolderType);
				conToChange.setPeople(p);
				aa.people.editCapContact(conToChange);
				logDebug("Contact type successfully switched to " + licHolderType);

				//added by thp to copy contact-Addres
				var source = getPeople(capId);
				//source = aa.people.getCapContactByCapID(capId).getOutput();
				for (zz in source) {
					sourcePeopleModel = source[zz].getCapContactModel();
					if (sourcePeopleModel.getPeople().getContactType() == contactType) {
						p.setContactAddressList(sourcePeopleModel.getPeople().getContactAddressList());
						aa.people.editCapContactWithAttribute(conToChange);
						logDebug("ContactAddress Updated Successfully");
					}
				}
			}
		}
	}

	return newLicId;
}

function createProviderDetails(refLPInfo){

	var refLicNum = refLPInfo.getStateLicense();
	var refLicNumInx = refLicNum.indexOf("-") +1;
	var refLicNumPart = refLicNum.substr(refLicNumInx);
	
	logDebug("LIC NUMBER PART: " + refLicNumPart);

	
	//Adding Provider Template
	var provNme = "";
	
	var provMdl = aa.proxyInvoker.newInstance("com.accela.orm.model.education.ProviderModel").getOutput();
	
	if (refLPInfo.getBusinessName() != null)
		provNme = refLPInfo.getBusinessName();
	else
		provNme = refLPInfo.getContactFirstName()+ " " + refLPInfo.getContactLastName();
	
	provMdl.setProviderName(provNme+refLicNumPart);
	
	provMdl.setOfferExamination("Y");
	provMdl.setOfferEducation("N");
	provMdl.setOfferContinuing ("N");
	provMdl.setServiceProviderCode(servProvCode);

	//Getting look up model
	var provBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.ProviderBusiness").getOutput();
	qf = aa.util.newQueryFormat(); 
	var args = new Array();
	
	var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel",args).getOutput();
	
	logDebug("CHECKING TO SEE IF PROV EXISTS");	
	var provExists = provBus.getProvider(provMdl);	

	provMdl.setProviderNbr(refLPInfo.getLicSeqNbr());
	provMdl.setProviderNo(refLPInfo.getStateLicense());
	
	auditModel.setAuditDate(new Date());
	auditModel.setAuditStatus("A");
	auditModel.setAuditID("ADMIN");

	provMdl.setAuditModel(auditModel);
	
	if (provExists == null){
		var provCreate = provBus.create(provMdl);
	
		logMessage("PROVCREATED: " + provCreate);
		return provMdl.getProviderNo();
	}
	else{
	logDebug("PROVIDER ALREADY EXISTS.  CANNNOT CREATE");
	return false;
	}

}


function createRefLicProf_custom(rlpId, rlpType, pContactType) {
	var itemCap = capId;

	if (arguments.length == 4)
		itemCap = arguments[3]; // use cap ID specified in args

	//Creates/updates a reference licensed prof from a Contact
	//06SSP-00074, modified for 06SSP-00238
	var updating = false;
	var capContResult = aa.people.getCapContactByCapID(capId);
	if (capContResult.getSuccess()) {
		conArr = capContResult.getOutput();
	} else {
		logDebug("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
		return false;
	}

	if (!conArr.length) {
		logDebug("**WARNING: No contact available");
		return false;
	}

	var newLic = getRefLicenseProf(rlpId)

		if (newLic) {
			updating = true;
			logDebug("Updating existing Ref Lic Prof : " + rlpId);
		} else
			var newLic = aa.licenseScript.createLicenseScriptModel();

		var licenseModel = newLic.getLicenseModel();

	// set license template
	var result = aa.genericTemplate.getTemplateStructureByGroupName("LIC_GENERAL");
	licenseModel.setTemplate(result.getOutput());

	//get contact record
	if (pContactType == null)
		var cont = conArr[0]; //if no contact type specified, use first contact
	else {
		var contFound = false;
		for (yy in conArr) {
			if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType())) {
				cont = conArr[yy];
				contFound = true;
				break;
			}
		}
		if (!contFound) {
			logDebug("**WARNING: No Contact found of type: " + pContactType);
			return false;
		}
	}

	peop = cont.getPeople();
	addr = peop.getCompactAddress();

	newLic.setContactFirstName(cont.getFirstName());
	//newLic.setContactMiddleName(cont.getMiddleName());  //method not available
	newLic.setContactLastName(cont.getLastName());
	newLic.setBusinessName(peop.getBusinessName());
	newLic.setAddress1(addr.getAddressLine1());
	newLic.setAddress2(addr.getAddressLine2());
	newLic.setAddress3(addr.getAddressLine3());
	newLic.setCity(addr.getCity());
	newLic.setState("TN");
	newLic.setZip(addr.getZip());
	newLic.setPhone1(peop.getPhone1());
	newLic.setPhone2(peop.getPhone2());
	newLic.setEMailAddress(peop.getEmail());
	newLic.setFax(peop.getFax());

	newLic.setAgencyCode(aa.getServiceProviderCode());
	newLic.setAuditDate(sysDate);
	newLic.setAuditID(currentUserID);
	newLic.setAuditStatus("A");

	if (AInfo["Insurance Co"])
		newLic.setInsuranceCo(AInfo["Insurance Co"]);
	if (AInfo["Insurance Amount"])
		newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
	if (AInfo["Insurance Exp Date"])
		newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
	if (AInfo["Policy #"])
		newLic.setPolicy(AInfo["Policy #"]);

	if (AInfo["Business License #"])
		newLic.setBusinessLicense(AInfo["Business License #"]);
	if (AInfo["Business License Exp Date"])
		newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

	newLic.setLicenseType(rlpType);

	if (addr.getState() != null)
		newLic.setLicState(addr.getState());
	else
		newLic.setLicState("TN"); //default the state if none was provided

	newLic.setStateLicense(rlpId);

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess()) {
		logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);

		lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode, myResult.getOutput())
			if (!lpsmResult.getSuccess()) {
				logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage());
				return null
			}

			lpsm = lpsmResult.getOutput();

		// Now add the LP to the CAP
		asCapResult = aa.licenseScript.associateLpWithCap(itemCap, lpsm)
			if (!asCapResult.getSuccess()) {
				logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage())
			} else {
				logDebug("Associated the CAP: " + itemCap + " to the new LP: " + rlpId)
			}

			// Find the public user by contact email address and attach
			puResult = aa.publicUser.getPublicUserByEmail(peop.getEmail())
			if (!puResult.getSuccess()) {
				logDebug("**WARNING finding public user via email address " + peop.getEmail() + " error: " + puResult.getErrorMessage())
			} else {
				var pu = puResult.getOutput();
				var asResult = aa.licenseScript.associateLpWithPublicUser(pu, lpsm)
					if (!asResult.getSuccess()) {
						logDebug("**WARNING error associating LP with Public User : " + asResult.getErrorMessage());
					} else {
						logDebug("Associated LP with public user " + peop.getEmail())
					}
			}

			return lpsm; // return the LP script model

	} else {
		logDebug("**ERROR: cant create ref lic prof: " + myResult.getErrorMessage());
		logMessage("**ERROR: cant create ref lic prof: " + myResult.getErrorMessage());
		return false;
	}
}

function createSOLicense(grp, typ, stype, cat, desc, contactType,asiLicenseCounty) {
    var newLicId = null;
    var newLicenseType = null;
    var oldAltID = null;

    //create the license record
	newLicId = createChildwithAddrAttributes(grp, typ, stype, cat, desc);
	
	//copy all ASI
    copyAppSpecific(newLicId);
    copyASITables(capId, newLicId); 

    oldAltID = newLicId.getCustomID();
	
	var newAltID = generateChildAltID(newLicId,asiLicenseCounty);
	
	/*logDebug("Creating Ref LP.");
	createRefLicProf(newAltID, aa.cap.getCap(newLicId).getOutput().getCapType().getAlias(), contactType);

	newRefLic = getRefLicenseProf(newAltID);

	if (newRefLic) {
		logDebug("Reference LP successfully created");
		associateLpWithCap(newRefLic, newLicId);
	} else {
		logDebug("Reference LP not created");
	}*/

    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
    
    newLicenseType = aa.cap.getCap(newLicId).getOutput().getCapType().getAlias();
    logDebug("newLicenseType:" + newLicenseType);

    return newLicId;
}


function createTarget(grp, typ, stype, cat, desc, initStatus, copyASI, createRefLP, contactType, licHolderSwitch, licHolderType, opAltId, count) {
    //initStatus - record status to set the license to initially
    //copyASI - copy ASI from Application to License? (true/false)
    //createRefLP - create the reference LP (true/false)
    //licHolderSwitch - switch the applicant to license holder

    var newLic = null;
    var newLicId = null;
    var newLicIdString = null;
    var newLicenseType = null;
    var oldAltID = null;
    var AltIDChanged = false;
	
    //create the Target record

    //create the record
    // newLicId = createChild(grp, typ, stype, cat, desc); Commented out by FJB 12-30-15
	newLicId = createChildwithAddrAttributes(grp, typ, stype, cat, desc);
	
	
 //copy all ASI
    if (copyASI && newLicId ) {
        copyAppSpecific(newLicId);
        copyASITables(capId, newLicId); 
    }

    /* if (copyASI && newLicId && typ == "Hearing") {
        copyAppSpecific(newLicId);
      }  */



    //field repurposed to represent the current term effective date
    // editScheduledDate(sysDateMMDDYYYY, newLicId);
    //field repurposed to represent the original effective date
    //editFirstIssuedDate(sysDateMMDDYYYY, newLicId);
    oldAltID = newLicId.getCustomID();
	

    // generate the new AltID 
    var newAltID = generateTargetAltID(newLicId,opAltId, count);
	
	
    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
    newLicId = aa.cap.getCapID(newAltID).getOutput();
 

    // update the application status
    //updateAppStatus(initStatus, "", newLicId);
    newLicIdString = newLicId.getCustomID();

    logDebug("newLicIdString:" + newLicIdString);

   
	//setLicExpirationDate(newLicId);
/* Commented by FJB 02-01-2016
/*	var vExpDate = null;
	try {
		vExpDate =  aa.expiration.getLicensesByCapID(newLicId).getOutput().getExpDate();
		}
	catch (e) {
		vExpDate = null;
	}   */

    if (createRefLP && newLicId) {
        logDebug("Creating Ref LP.");
        createRefLicProf_custom(newLicIdString, newLicenseType, contactType,newLicId);

/*        newLic = getRefLicenseProf(newLicIdString);

        if (newLic) {
        	logDebug("Reference LP successfully created");
            associateLpWithCap(newLic, newLicId);
        } else {
            logDebug("Reference LP not created");
        }*/
    }

    if (licHolderSwitch && newLicId) {
        conToChange = null;
        cons = aa.people.getCapContactByCapID(newLicId).getOutput();
        logDebug("Contacts:" + cons);
        logDebug("Contact Length:" + cons.length);

        for (thisCon in cons) {
            if (cons[thisCon].getCapContactModel().getPeople().getContactType() == contactType) {
                conToChange = cons[thisCon].getCapContactModel();
                p = conToChange.getPeople();
                p.setContactType(licHolderType);
                conToChange.setPeople(p);
                aa.people.editCapContact(conToChange);
                logDebug("Contact type successfully switched to " + licHolderType);

                //added by thp to copy contact-Addres
                var source = getPeople(capId);
                //source = aa.people.getCapContactByCapID(capId).getOutput();
                for (zz in source) {
                    sourcePeopleModel = source[zz].getCapContactModel();
                    if (sourcePeopleModel.getPeople().getContactType() == contactType) {
                        p.setContactAddressList(sourcePeopleModel.getPeople().getContactAddressList());
                        aa.people.editCapContactWithAttribute(conToChange);
                        logDebug("ContactAddress Updated Successfully");
                    }
                }
            }
        }
    }

    return newLicId;
}

function createTargetRecords0() {

	LICcomm = 'Created from Operation Record # ' + capIDString;
	comment(LICcomm);
	opAltId = capIDString;
	count = 000;
	if (typeof(TARGETLIST) == 'object') {
		for (eachrow in TARGETLIST)
			//start replaced branch: TABC_Create_Target_Records_1
		{
			count = count + 001;
			saveCap = capId;
			feeRow = TARGETLIST[eachrow];
			comment('feeRow ===> ' + count);
			licCap = TARGETLIST[eachrow]['License Number'].toString();
			tgtCap = TARGETLIST[eachrow]['Target Record ID'].toString();
			comment('===> License/Target Cap: ' + licCap + '  ' + tgtCap);
			if (!tgtCap) {
				newAppID = createTarget('TNABC', 'Enforcement', 'Target', 'NA', LICcomm, 'Pending Investigation', true, false, null, false, LICcomm, opAltId, count);
				altid = newAppID;
				XICcomm = '=====> Source CAP # ' + capIDString;
				comment(XICcomm + ' - Target CAP # ' + altid);
				updateTask('Investigation', 'Pending Investigation');
				updateAppStatus('Pending Investigation', 'Initial Target creation');
				comment('===> ChildID:' + newAppID.getCustomID());
				comment('===> License Number: ' + TARGETLIST[eachrow]['License Number'].toString());
				editASITableRow(saveCap, 'TARGET LIST', 'License Number', TARGETLIST[eachrow]['License Number'].toString(), 'Target Record ID', newAppID.getCustomID().toString());
				copyASITables(saveCap, altid);
				LicCapId = aa.cap.getCapID(licCap).getOutput();
				comment('===> Pre CopyAddress  =========> ' + LicCapId + '     ' + altid);
				copyAddresses(LicCapId, altid);
				tempCap = capId;
				capId = saveCap;
				copyAppSpecific(altid);
				capId = tempCap;
			}

		}
		//end replaced branch: TABC_Create_Target_Records_1;
	}

}

function editASITableRow(tableCapId, tableName, keyName, keyValue, editName, editValue) {
	var tableArr = loadASITable(tableName, tableCapId);
	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName, tableCapId, "TPATEL");
	if (tableArr) {
		aa.print("updated");

		for (var r in tableArr) {
			if (tableArr[r][keyName] != keyValue) {
				var rowArr = new Array();
				var tempArr = new Array();
				for (var col in tableArr[r]) {
					var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
					var tVal = tableArr[r][col];
					//bizarre string conversion - just go with it
					var colName = new String(tableArr[r][col].columnName.toString());
					colName = colName.toString();
					tempArr[colName] = tVal;
				}
				rowArr.push(tempArr);
				//for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
				addASITable(tableName, rowArr, tableCapId);
			} else {
				aa.print(" Editing row " + r);
				var rowArr = new Array();
				var tempArr = new Array();
				for (var col in tableArr[r]) {
					if (tableArr[r][col].columnName.toString() == editName) {
						var tVal = tableArr[r][col];
						tVal.fieldValue = editValue;
					} else {
						var tVal = tableArr[r][col];
					}
					//bizarre string conversion - just go with it
					var colName = new String(tableArr[r][col].columnName.toString());
					colName = colName.toString();
					tempArr[colName] = tVal;
				}
				rowArr.push(tempArr);
				//for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
				addASITable(tableName, rowArr, tableCapId);
			}
		}
	} //end loop
}

function editRefLPASI(itemName, itemValue) {
	var newFieldValue = null;
	capLPs = getLicenseProfessional(capId);
	capLPStateNum = capLPs[0].getLicenseNbr().toUpperCase();
	refLPStateNum = getRefLicenseProf(capLPStateNum).getStateLicense();
	logDebug("REF LP TO CHECK: " + refLPStateNum);

	var licenseScriptModel = getRefLicenseProfByStateLicense(servProvCode, refLPStateNum);
	var licenseModel = licenseScriptModel.getLicenseModel();

	// update LP ASI
	if (licenseModel.getTemplate() != null) {
		var templateForms = licenseModel.getTemplate().getTemplateForms();
		if (templateForms != null) {
			for (var i = 0; i < templateForms.size(); i++) {
				var templateForm = templateForms.get(i);
				var templateGroupName = templateForm.getGroupName();
				if (templateGroupName.equals("LIC_GENERAL")) {
					var templateSubgroups = templateForm.getSubgroups();
					for (var j = 0; j < templateSubgroups.size(); j++) {
						var templateSubgroup = templateSubgroups.get(j);
						//logDebug("LP ASI Template Subgroup: " + templateSubgroup.getSubgroupName());

						if (templateSubgroup.getSubgroupName().equals("LICENSE INFORMATION")) {
							var fields = templateSubgroup.getFields();
							for (var k = 0; k < fields.size(); k++) {
								var field = fields.get(k);
								var fieldName = field.getFieldName();
								if (fieldName == itemName) {
									var fieldValue = field.getDefaultValue();
									newFieldValue = Number(fieldValue) + itemValue;
									logDebug("Field Value = " + newFieldValue);
									field.setDefaultValue(newFieldValue);
								}
							}
						}
					}
				}
			}
		}
	} else {
		logDebug("No Template data exists...creating");
		// set license template
		var result = aa.genericTemplate.getTemplateStructureByGroupName("LIC_GENERAL");
		licenseModel.setTemplate(result.getOutput());

		//now go ahead and populate data

		logDebug("Getting asi to populate now");
		var templateForms = licenseModel.getTemplate().getTemplateForms();
		if (templateForms != null) {
			var retVal = false;
			for (var i = 0; i < templateForms.size(); i++) {
				var templateForm = templateForms.get(i);
				var templateGroupName = templateForm.getGroupName();
				if (templateGroupName.equals("LIC_GENERAL")) {
					var templateSubgroups = templateForm.getSubgroups();
					for (var j = 0; j < templateSubgroups.size(); j++) {
						var templateSubgroup = templateSubgroups.get(j);
						//logDebug("LP ASI Template Subgroup: " + templateSubgroup.getSubgroupName());

						if (templateSubgroup.getSubgroupName().equals("LICENSE INFORMATION")) {
							var fields = templateSubgroup.getFields();
							for (var k = 0; k < fields.size(); k++) {
								var field = fields.get(k);
								var fieldName = field.getFieldName();
								if (fieldName == itemName) {
									var fieldValue = field.getDefaultValue();
									if (itemValue != fieldValue) {
										newFieldValue = itemValue;
										logDebug("Field Value = " + newFieldValue);
										field.setDefaultValue(newFieldValue);
									} else {
										logDebug("Field Value for " + fieldName + " is already set to " + fieldValue);
										retVal = false;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	// Create or update Ref. LP
	logDebug("Updating/Creating Ref LP");
	createOrUpdateRefLP(licenseScriptModel);

	var retVal = false;
	var retVal2 = false;

	logDebug("Refreshing Cap LP from Ref");
	aa.licenseProfessional.removeLicensedProfessional(capLPs[0]);
	capListResult = aa.licenseScript.associateLpWithCap(capId, licenseScriptModel);
	retVal = capListResult.getSuccess();

	logDebug("Did lp refresh: " + retVal);

	if (newFieldValue != null)
		return newFieldValue;
}

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}

function examScheduler(servProvCode, providerNbr, examID, proctorID, add1, add2, city, state, zip, phone, maxSeats, handicapOK, scheduleName, startDate, endDate, startTime, endTime) {
	var args = new Array();
	var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args).getOutput();
	auditModel.setAuditDate(new Date());
	auditModel.setAuditStatus("A");
	auditModel.setAuditID("ADMIN");

	//Step 1 is to create a location
	//Set Defaults
	locBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.RefProviderLocationBusiness").getOutput();
	provLocPKModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationPKModel").getOutput();
	provLocPKModel.setServiceProviderCode(servProvCode);

	//First Check if Location already exists, if so use that one
	//Having to create a new model, NULL fields affects this search.  Could cause issues down the road
	checkModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationModel").getOutput();
	checkModel.setAddress1(add1);
	checkModel.setCity(city);
	checkModel.setState(state);
	checkModel.setLocationPKModel(provLocPKModel);

	provFound = false;
	provLocList = new Array();

	logDebug("Checking to see if location for provider # " + providerNbr + " exists");

	locList = locBus.getProviderLocationList(checkModel).toArray();

	for (x in locList) {
		var lList = locList[x];

		if (lList.getProviderNbr() == providerNbr) {
			provFound = true;
			provLocList.push(lList);
			continue;
		}

	}
	if (provFound) {
		logDebug("Location for Provider " + providerNbr + " exists already...Using it");
		refLoc = provLocList[0];
		refLocPK = refLoc.getLocationPKModel();
		refLocNbr = refLocPK.getLocationNbr();

		//logDebug("Prov Loc: " + refLoc.getProviderNbr());
	} else {
		logDebug("Location for Provider " + providerNbr + " doesn't exist...Creating it");
		//No Location found so create it
		provLocModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationModel").getOutput();
		provLocModel.setProviderNbr(providerNbr); //need this from the ref providerNbr and NOT provideNo
		provLocModel.setAddress1(add1);
		provLocModel.setAddress2(add2);
		provLocModel.setPhone(phone);
		provLocModel.setCity(city);
		provLocModel.setState(state);
		provLocModel.setZip(zip);
		provLocModel.setMaxSeats(maxSeats);
		provLocModel.setAuditModel(auditModel);
		provLocModel.setIsHandicapAccessible(handicapOK);
		provLocModel.setLocationPKModel(provLocPKModel);

		//Create the Location from Model and grab the ID
		refLoc = locBus.createProviderLocation(provLocModel);
		refLocPK = refLoc.getLocationPKModel();
		refLocNbr = refLocPK.getLocationNbr();
		//Location is created and now tied to Provider
	}

	//Step 2 Create the schedule calendar
	logDebug("Creating schedule....");
	newCal = aa.proxyInvoker.newInstance("com.accela.orm.model.calendarengine.CalendarEngineModel").getOutput();
	newCal.setName(scheduleName);
	newCal.setCategory("EXAM");
	newCal.setServiceProviderCode(servProvCode);
	newCal.setIsBusy(0);
	newCal.setAuditModel(auditModel);
	newCal.setStartDate(startTime);
	newCal.setEndDate(endTime);
	newCal.setFrequency(-1);
	newCal.setPriority(0);
	newCal.setInterval(0);
	newCal.setDayOfMonth(0);
	newCal.setWeekOfMonth(0);
	newCal.setDayOfWeek(0);
	newCal.setRecurrenceStartDate(startDate);
	newCal.setRecurrenceEndDate(endDate);
	newCal.setMonthOfYear(0);
	newCal.setAlertInAdvance(0);
	newCal.setParentId(0);
	newCal.setUnits(0.00);

	//Step 3 Create Schedule
	provSchedModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderScheduleModel").getOutput();
	provSchedModel.setProviderNbr(providerNbr);
	provSchedModel.setEntityID(examID); //This is the Exam refExamNbr
	provSchedModel.setEntityType("EXAM"); //most likely always EXAM
	provSchedModel.setScheduleName(scheduleName);
	provSchedModel.setStartDate(startDate);
	provSchedModel.setEndDate(endDate);
	provSchedModel.setAuditModel(auditModel);
	provSchedModel.setServiceProviderCode(servProvCode);

	//Need to link Location with schedule here
	logDebug("Linking location with Schedule");
	provSchedLocModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.XRProviderScheduleLocationModel").getOutput();
	provSchedLocModel.setAuditModel(auditModel);
	provSchedLocModel.setRefExamLocationModel(refLoc);
	provSchedLocModel.setLocationNbr(refLocNbr);
	provSchedLocModel.setRefExamProviderScheduleModel(provSchedModel);
	provSchedLocModel.setServiceProviderCode(servProvCode);
	provSchedLocModel.setSupportedLanguages("English"); //Hard coding english

	//Then add it back to the schedule Model (must be list)
	provSchedLocList = [];
	provSchedLocList.push(provSchedLocModel);
	provSchedModel.setRefExamScheduleLocationModels(provSchedLocList);

	//add calendar
	calList = [];
	calList.push(newCal);
	provSchedModel.setCalenderEngineModels(calList);

	//Create the Schedule from Model and grab the ID
	schedBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.RefProviderScheduleBusiness").getOutput();
	refSched = schedBus.addRefProviderSchedule(provSchedModel);
	//Schedule is created and now tied to Location


	/* THIS IS BLOCKING THE MANUAL DELETE ABILITY
	//Step 4 Create an Event to track time
	eventPKModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.ProviderEventPKModel").getOutput();
	eventPKModel.setServiceProviderCode(servProvCode);

	eventModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.ProviderEventModel").getOutput();
	eventModel.setProviderEventPKModel(eventPKModel);
	eventModel.setScheduleID(refSched);
	eventModel.setrProviderScheduleModel(provSchedModel);
	eventModel.setLocationID(refLocNbr);
	eventModel.setrProviderLocationModel(refLoc);
	eventModel.setStartTime(startTime);
	eventModel.setEndTime(endTime);
	eventModel.setAuditModel(auditModel);
	eventModel.setCalendarEngineModel(newCal);

	//Create the Event from Model
	eventBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.ProviderEventBusiness").getOutput();
	refEvent = eventBus.addProviderEvent(eventModel);
	eventPK = refEvent.getProviderEventPKModel();
	eventID = eventPK.getEventNbr();
	//Event is created
	 */

	/*
	//Step 4 Create the Proctor
	//Add proctor from model
	provAdapterBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.ProviderAdapterBusiness").getOutput();
	eventList = [];
	eventList.push(refEvent);
	proctorIDs = [proctorID];
	provAdapterBus.assignProctor(eventList ,proctorIDs ,servProvCode ,"ADMIN","N");
	 */
}

//Modified this function to accept Military Date/Time Conversion. 01/11/2018

function generateAltID(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];
	
   	 var thisCustomID = licCapId.getCustomID();
	 logDebug("thisCustomID ======> : [" + thisCustomID + "]");
   	 var thisCustomIDArray = thisCustomID.split("-");
   	 var newLicAInfo = new Array();
    	
	var asiLicenseCounty = getCountyValue(licCapId);
   	var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
    	var countyCodeArray = countyCodeResult.toString().split("/");
    	var countyCode = countyCodeArray[0];
    	var countyLetter = countyCodeArray[2];

   	 var tierCode = lookup("TABC_Tier_Code", thisTypeArray[1]);
   	 var newAltID = "";
	
	logDebug("thisSubType : [" + thisSubType + "]");
    if (matches(thisSubType, "License", "NA")) {
    	newAltID = tierCode + "-" + thisCustomIDArray[1] + "-" + countyCode + "-" + thisCustomIDArray[3];
    }

    if (matches(thisSubType, "Application", "Renewal", "Request")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+tierCode + "-" + thisCustomIDArray[2] + "-" + thisCustomIDArray[3];
    }

    if (matches(thisSubType, "Random", "Complaint", "Appeal","Event")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+ "-" + thisCustomIDArray[2];
    }

    return newAltID;
}

/* Added by FJB 12-30-15  Created by D Dejesus Modified by FJB to handle Renewals*/


function generateAltID4Renewal(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];

   	 var thisCustomID = licCapId.getCustomID();
   	 var thisCustomIDArray = thisCustomID.split("-");
   	 var newLicAInfo = new Array();
    	
	var asiLicenseCounty = getCountyValue(parentCapId);
   	var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
    	var countyCodeArray = countyCodeResult.toString().split("/");
    	var countyCode = countyCodeArray[0];
    	var countyLetter = countyCodeArray[2];

   	 var tierCode = lookup("TABC_Tier_Code", thisTypeArray[1]);
   	 var newAltID = "";
	
	logDebug("thisSubType : [" + thisSubType + "]");
    
    if (matches(thisSubType, "Renewal")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+tierCode + "-" + thisCustomIDArray[2] + "-" + thisCustomIDArray[3];
    }


    return newAltID;
}





/* ---------------------------------------------------------------------------- */

/* Added by FJB 12-8-15  Created by Fatih Andican   */


function generateChangeAltID(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisType = thisTypeArray[1];
   	var thisCustomID = licCapId.getCustomID();
   	var thisCustomIDArray = thisCustomID.split("-");
   	var newLicAInfo = new Array();
  
	loadAppSpecific(newLicAInfo, licCapId);
    var asiLicenseCounty = AInfo["County"];
	if (asiLicenseCounty == null)
		asiLicenseCounty = getCountyValue(licCapId);
	
	if (asiLicenseCounty == null)
		return null;
	else{
		var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
		var countyCodeArray = countyCodeResult.toString().split("/");
		var countyCode = countyCodeArray[0];
		var countyLetter = countyCodeArray[2];
		var newAltID = "";
		var str = thisCustomIDArray[1];
		var captypestr = str.substring(1);
						
		if (matches(thisType, "Change Request")) {
			newAltID = thisCustomIDArray[0] + "-" + countyLetter+captypestr + "-" + thisCustomIDArray[2];
		}		/* ---    $$yy$$M-DOWN-$$SEQ06$$  --- */

		if (matches(thisType, "Hearing")) {
			newAltID = thisCustomIDArray[0] + "-" + countyLetter + "-" + thisCustomIDArray[2];
		}		/* ---    $$yy$$H-D-$$SEQ04$$  --- */

		return newAltID;
	}
}

/* ----- FJB Added 2/18/2016 for Change control records    ---- */
/*                                                              */

function generateChildAltID(licCapId,asiLicenseCounty) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];

   	var thisCustomID = licCapId.getCustomID();
   	var thisCustomIDArray = thisCustomID.split("-");
   	var newLicAInfo = new Array();
    
   	var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
    var countyCodeArray = countyCodeResult.toString().split("/");
    var countyCode = countyCodeArray[0];
    var countyLetter = countyCodeArray[2];

   	var tierCode = lookup("TABC_Tier_Code", thisTypeArray[1]);
   	var newAltID = "";
	
	var str = thisCustomIDArray[0];
    var LicType = str.substring(3);
			
	logDebug("thisSubType : [" + thisSubType + "]");
    if (matches(thisSubType, "License")) {
    	newAltID = tierCode + LicType + "-" + countyCode + "-" + thisCustomIDArray[2];
    }

    if (matches(thisSubType, "Application", "Renewal", "Request")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+tierCode + "-" + thisCustomIDArray[2] + "-" + thisCustomIDArray[3];
    }

    if (matches(thisSubType, "Random", "Operation", "Citation", "Complaint", "Appeal")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+ "-" + thisCustomIDArray[2];
    }

    return newAltID;
}

/* ---------------------------------------------------------------------------- */

/* Added by FJB 12-8-15  Created by D Dejesus */


function generateEducationAltID(licCapId, eduAltId, mmdd) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];

   	var thisCustomIDArray = eduAltId.split("-");
   	var newLicAInfo = new Array();
    var countStr = count.toString()
   	var newAltID = "";
		
	var str = thisCustomIDArray[0];
    var LicType = str.substring(3);
			
	logDebug("thisSubType : [" + thisSubType + "]");
	
	/* $$yy$$ROS-MMDD-$$SEQ06$$  */
    if (matches(thisSubType, "Roster")) {
    	newAltID = thisCustomIDArray[0] + "-" + mmdd + "-" + thisCustomIDArray[2];
    }


    return newAltID;
}

/* ---------------------------------------------------------------------------- */
/* Added by FJB 2-15-16  Created by F. Benitez                                   */


function generateEnforcementAltID(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];
   	var thisCustomID = licCapId.getCustomID();
   	var thisCustomIDArray = thisCustomID.split("-");
   	var newLicAInfo = new Array();
  
	loadAppSpecific(newLicAInfo, licCapId);
    var asiLicenseCounty = AInfo["County"];
    var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
   	var countyCodeArray = countyCodeResult.toString().split("/");
   	var countyCode = countyCodeArray[0];
   	var countyLetter = countyCodeArray[2];
 	var newAltID = "";
	
	logDebug("thisSubType : [" + thisSubType + "]");
				
    if (matches(thisSubType, "Citation", "Complaint", "Random")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter  + "-" + thisCustomIDArray[2];
    }		/* ---    $$yy$$V              -         D           -       $$SEQ06$$  --- */


    return newAltID;
}


function generatePermitAltID(licCapId) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];
   	var thisCustomID = licCapId.getCustomID();
   	var thisCustomIDArray = thisCustomID.split("-");
   	var newLicAInfo = new Array();
  
	loadAppSpecific(newLicAInfo, licCapId);
	
	if (arguments.length == 2) 
		var asiLicenseCounty = arguments[1];
	else
		var asiLicenseCounty = AInfo["County"];
    var countyCodeResult = lookup("TABC_County_Code", asiLicenseCounty);
   	var countyCodeArray = countyCodeResult.toString().split("/");
   	var countyCode = countyCodeArray[0];
   	var countyLetter = countyCodeArray[2];
 	var tierCode = lookup("TABC_Tier_Code", thisTypeArray[1]);
   	var newAltID = "";
	var str = thisCustomIDArray[0];
	var captypestr = str.substring(3);
	logDebug("thisSubType : [" + thisSubType + "]");
		
    if (matches(thisSubType, "NA", "Null")) {
    	newAltID = tierCode + captypestr + "-" + countyCode + "-" + thisCustomIDArray[2];
    }			 /* --- TTTAFI-CCC-$$SEQ07$$  --- */

			
    if (matches(thisSubType, "Application", "Null")) {
    	newAltID = thisCustomIDArray[0] + "-" + countyLetter+"PER" + "-" + thisCustomIDArray[2] + "-" + thisCustomIDArray[3];
    }		/* ---    $$yy$$A-DPER-WRP-$$SEQ06$$  --- */


    return newAltID;
}

/* ---------------------------------------------------------------------------- */
/* Added by FJB 02-01-16     */

function generateTargetAltID(licCapId, opAltId, count) {
	var thisCap = aa.cap.getCap(licCapId).getOutput();
	var thisCapType = thisCap.getCapType();
	var thisTypeArray = thisCapType.toString().split("/");
	var thisSubType = thisTypeArray[2];

   	var thisCustomIDArray = opAltId.split("-");
   	var newLicAInfo = new Array();
    var countStr = count.toString()
   	var newAltID = "";
		
	var str = thisCustomIDArray[0];
    var LicType = str.substring(3);
			
	logDebug("thisSubType : [" + thisSubType + "]");
	
	/* $$yy$$E-$$SEQ03$$-000 */
	
    if (matches(thisSubType, "Target") && count > 99) {
    	newAltID = thisCustomIDArray[0] + "-" + thisCustomIDArray[1] + "-" + countStr;
    }

	 if (matches(thisSubType, "Target")&& count < 100) {
    	newAltID = thisCustomIDArray[0] + "-" + thisCustomIDArray[1] + "-0" + countStr;
    }

	 if (matches(thisSubType, "Target")&& count < 10) {
    	newAltID = thisCustomIDArray[0] + "-" + thisCustomIDArray[1] + "-00" + countStr;
    }

    return newAltID;
}

/* ---------------------------------------------------------------------------- */
/* Added by FJB 02-03-2016 to create child Cap, passing the MMDD           */


function getAppSpecificTable(capId,tableName)
{
	appSpecificTable = null;
	var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId,tableName);
	if(s_result.getSuccess())
	{
		appSpecificTable = s_result.getOutput();
		if (appSpecificTable == null || appSpecificTable.length == 0)
		{
			aa.print("WARNING: no appSpecificTable on this CAP:" + capId);
			appSpecificTable = null;
		}
	}
	else
	{
		aa.print("ERROR: Failed to appSpecificTable: " + s_result.getErrorMessage());
		appSpecificTable = null;	
	}
	return appSpecificTable;
}


function getAppSpecificValue(pItemName, pItemCapId)
 {
 //modified version of getAppSpecific function created for this batch script
 //
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(pItemCapId);
 if (appSpecInfoResult.getSuccess())
   {
  var appspecObj = appSpecInfoResult.getOutput();
 
  if (pItemName != "")
   for (i in appspecObj)
    if (appspecObj[i].getCheckboxDesc() == pItemName)
     {
     return appspecObj[i].getChecklistComment();
     break;
     }
  }
 else
 {
           logDebug( "ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
    return false;
 }

// FA 06-03-2016 creates contact on ACA

function getCapByCustomID(custID)
{
	return aa.cap.getCapID(custID).getOutput();
}


function getChildNodeVal(fString,fParent,fChild)
{
 var fValue = "";
 var startTag = "<"+fParent+">";
 var endTag = "</"+fParent+">";
 
 
 // if tag not available, return.
 if (fString.indexOf(startTag) < 0) {
	fValue = "";
	return unescape(fValue);
 }
 
 
pStartPos = fString.indexOf(startTag) + startTag.length;
pEndPos = fString.indexOf(endTag);
 
startTag = "<"+fChild+">";
endTag = "</"+fChild+">";


 // if tag not available, return.
 if (fString.indexOf(startTag,pStartPos) < 0) {
	fValue = "";
	return unescape(fValue);
 }


cStartPos = fString.indexOf(startTag,pStartPos) + startTag.length;
cEndPos = fString.indexOf(endTag,cStartPos);

 // make sure startPos and endPos are valid before using them
 if (cStartPos > 0 && cStartPos < cEndPos)
	  fValue = fString.substring(cStartPos,cEndPos);

 return unescape(fValue);
}


//##################function getAppSpecificValue --Added by THP

function getContactObjs_modified(itemCap) // optional typeToLoad, optional return only one instead of Array?
{
    var typesToLoad = false;
    if (arguments.length == 2) typesToLoad = arguments[1];
    var capContactArray = new Array();
    var cArray = new Array();
    //if (itemCap.getClass().toString().equals("com.accela.aa.aamain.cap.CapModel"))   { // page flow script 
	 if ("ApplicationSubmitBefore".equals(aa.env.getValue("EventName"))) {
		var envContactList = aa.env.getValue("ContactList");
        var capContactArray = envContactList.toArray();
	}
    else if (!cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") {

        if (cap.getApplicantModel()) {
            capContactArray[0] = cap.getApplicantModel();
        }
            
        if (cap.getContactsGroup().size() > 0) {
            var capContactAddArray = cap.getContactsGroup().toArray();
            for (ccaa in capContactAddArray)
                capContactArray.push(capContactAddArray[ccaa]);     
        }
    }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (!typesToLoad || matches(capContactArray[yy].getPeople().contactType, typesToLoad)) {
                cArray.push(new contactObj_modified(capContactArray[yy]));
            }
        }
    }
    
    logDebug("getContactObj returned " + cArray.length + " contactObj(s)");
    return cArray;
            
}



function getContactValues(strItem,capId)
                {
                var capContactResult = aa.people.getCapContactByCapID(capId);
                if (capContactResult.getSuccess())
                {
                                var capContactArray = capContactResult.getOutput();
                }

                if (capContactArray)
                                {
                                for (yy in capContactArray)
                                                                                             
                                                {
                                                if(capContactArray[yy].getPeople().getContactType() == "Business Information")
                                                {                                               
                                                if(strItem.toUpperCase()=="FIRSTNAME")
                                                {
                                                                return capContactArray[yy].getPeople().firstName;
                                                }else if(strItem.toUpperCase()=="LASTNAME")
                                                {
                                                                return capContactArray[yy].getPeople().lastName;
                                                }else if(strItem.toUpperCase()=="ADDRESSLINE1")
                                                {
                                                                return capContactArray[yy].getPeople().getAddressLine1;
                                                }else if(strItem.toUpperCase()=="ADDRESSLINE2")
                                                {
                                                                return capContactArray[yy].getPeople().getAddressLine2;
                                                }else if(strItem.toUpperCase()=="CITY")
                                                {
                                                                return capContactArray[yy].getPeople().getCity;
                                                }else if(strItem.toUpperCase()=="STATE")
                                                {
                                                                return capContactArray[yy].getPeople().getState;
                                                }else if(strItem.toUpperCase()=="ZIP")
                                                {
                                                                return capContactArray[yy].getPeople().getZip;
                                                }else if(strItem.toUpperCase()=="TRADENAME")
                                                {
                                                               
                                                                return capContactArray[yy].getPeople().getTradeName();
                                                }
                                                else if(strItem.toUpperCase()=="LEGALNAME")
                                                {
                                                               
                                                                return capContactArray[yy].getPeople().getBusinessName();
                                                }

                                                else if(strItem.toUpperCase()=="CONTACTYPE")
                                                {
                                                                return capContactArray[yy].getPeople().getContactType();
                                                }
                                                 else if(strItem.toUpperCase()=="EMAIL")
                                                {
                                                                return capContactArray[yy].getPeople().getEmail();
                                                }


                                        }
                                }
                }
}


//edit an ASIT with col/edit value where key matches col value

function getContactValuesForTrainer(strItem,capId)
 {
                var capContactResult = aa.people.getCapContactByCapID(capId);
                if (capContactResult.getSuccess())
                {
                                var capContactArray = capContactResult.getOutput();
                }

                if (capContactArray)
                {
                                for (yy in capContactArray)
                                                                                             
                                 {
                                                                                               
                                                if(strItem.toUpperCase()=="FIRSTNAME")
                                                {
                                                                return capContactArray[yy].getPeople().firstName;
                                                }else if(strItem.toUpperCase()=="LASTNAME")
                                                {
                                                                return capContactArray[yy].getPeople().lastName;
                                                }else if(strItem.toUpperCase()=="ADDRESSLINE1")
                                                {
                                                                return capContactArray[yy].getPeople().getAddressLine1;
                                                }else if(strItem.toUpperCase()=="ADDRESSLINE2")
                                                {
                                                                return capContactArray[yy].getPeople().getAddressLine2;
                                                }else if(strItem.toUpperCase()=="CITY")
                                                {
                                                                return capContactArray[yy].getPeople().getCity;
                                                }else if(strItem.toUpperCase()=="STATE")
                                                {
                                                                return capContactArray[yy].getPeople().getState;
                                                }else if(strItem.toUpperCase()=="ZIP")
                                                {
                                                                return capContactArray[yy].getPeople().getZip;
                                                }else if(strItem.toUpperCase()=="TRADENAME")
                                                {
                                                               
                                                                return capContactArray[yy].getPeople().getTradeName();
                                                }
                                                else if(strItem.toUpperCase()=="LEGALNAME")
                                                {
                                                               
                                                                return capContactArray[yy].getPeople().getBusinessName();
                                                }

                                                else if(strItem.toUpperCase()=="CONTACTYPE")
                                                {
                                                                return capContactArray[yy].getPeople().getContactType();
                                                }

                                        
                                }
                }
}

/* ---------------------------------------------------------------------------- */
/* Added by FJB 5-5-16  Created by D Dejesus                                   */


function getCountyValue(licCapId) {
	
	var fcapAddressObj = null;
   	var capAddressResult = aa.address.getAddressWithAttributeByCapId(licCapId);
	
   	if (capAddressResult.getSuccess())
   		var fcapAddressObj = capAddressResult.getOutput();
   	else
     		logDebug("**ERROR: Failed to get Address object: " + capAddressResult.getErrorType() + ":" + capAddressResult.getErrorMessage())

	if (fcapAddressObj.length < 1)
		return null;
	else{
		for (i in fcapAddressObj)
		{
			addressAttrObj = fcapAddressObj[i].getAttributes().toArray();
			for (z in addressAttrObj){
				if(addressAttrObj[z].getB1AttributeName().toUpperCase().equals("COUNTY")){
					//aa.print ("Attribute Name:" + addressAttrObj[z].getB1AttributeName());
					//aa.print ("Attribute Value:" + addressAttrObj[z].getB1AttributeValue());
					return addressAttrObj[z].getB1AttributeValue();
				}
			}
		}
	}
}


function getInspNum(){
	
	var inspId = 0;
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();

		for (xx in inspList)
			if (matches(inspList[xx].getInspectionType(),"New License Inspection","Follow-up Inspection","Renewal Inspection") && matches(inspList[xx].getInspectionStatus(),"Passed","Pass","Correct Onsite-Citation Issued"))
				{
				inspId = inspList[xx].getIdNumber();
				}
		}
	return inspId;
}


function getInspRecordParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

        var inspNa = String(inspObj.getInspector()).split("/");
        var inspN = inspNa[inspNa.length - 1];

	addParameter(params, "$$altID$$", capIDString);
	addParameter(params, "$$capName$$", capName);
	addParameter(params, "$$capStatus$$", capStatus);
	addParameter(params, "$$fileDate$$", fileDate);
	addParameter(params, "$$iResult$$",inspResult);
	addParameter(params, "$$inspType$$",inspType);
	addParameter(params, "$$inspName$$",inspN);
	addParameter(params, "$$inspComm$$",inspResultComment);
	addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));
	return params;
}


function getOutput(result, object){
	if (result.getSuccess())
	{
		return result.getOutput();
	}
	else
	{
		logDebug("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
		return null;
	}
}


function getParentNew(capId) 
	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(capId,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
	}

/* Added/Modified by FJB, developed by DDeJesus   5-9-2016      */
/* Get contact type for Licensed Professional creation                    */


function getProviderInfo(refLPInfo){
	//Adding Provider Template
	var provMdl = aa.proxyInvoker.newInstance("com.accela.orm.model.education.ProviderModel").getOutput();
	
	if (refLPInfo.getBusinessName() != null)
		provNme = refLPInfo.getBusinessName();
	else
		provNme = refLPInfo.getContactFirstName()+ " " + refLPInfo.getContactLastName();
	
	provMdl.setProviderName(provNme);

	//Getting look up model
	var provBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.ProviderBusiness").getOutput();
	qf = aa.util.newQueryFormat(); 
	provList = provBus.getProviderList(provMdl, qf).toArray();

	firstModel = provList[0];
	
	//for (pL in firstModel)
		//aa.print(pL + " = " + firstModel[pL]);
	
	prvNo = firstModel.getProviderNo();
	prvNBR = firstModel.getProviderNbr();
	
	return prvNBR;
}

function getRecordParams4Notification_mod(params) {
	// pass in a hashtable and it will add the additional parameters to the table

	var capDetailObjResult = aa.cap.getCapDetail(capId);		
	if (capDetailObjResult.getSuccess())
	{
		capDetail = capDetailObjResult.getOutput();
		var balanceDueAtRenewal = capDetail.getBalance();
	}
	
	addParameter(params, "$$balanceDueAtRenewal$$", "$" + parseFloat(balanceDueAtRenewal).toFixed(2));
	return params;
}

/* Added by FJB 4/6/2015  */


function getRefLicenseProfByStateLicense(serviceProviderCode, stateLicense){
	var licenseScriptModel = null;

	var result = aa.licenseScript.getRefLicensesProfByLicNbr(serviceProviderCode, stateLicense);
	var licenseScriptModels = result.getOutput(); //getOutput(result, "getRefLicensesProfByLicNbr");

	if (licenseScriptModels != null && licenseScriptModels.length > 0)
	{
		// get first one
		licenseScriptModel = licenseScriptModels[0];

		// get license template
		result = aa.genericTemplate.getTemplate(licenseScriptModel.getLicenseModel().getEntityPK());
		var templateModel = getOutput(result, "getTemplate");
		licenseScriptModel.getLicenseModel().setTemplate(templateModel);
	}

	return licenseScriptModel;
}	


function getSpecOcc(soLCapId){
	/* Special Occasion criteria:

	One 24 Hour period

	Non-Profit Special Occasion - 12
	Political Special Occasion - 12
	Alcoholic Beverage Festival - 15
	Wine Festival - 12
	*/

	aa.print("Starting:");
	var tOOc = 0;
	maxEventsMet = false;

	var soParent = new Array();
	
	soParent = getParents("TNABC/Liquor by the Drink/Event/Special Occasion Tracking");
	
	aa.print("PARENT: " + soParent.length);
	
	for (x in soParent)
		aa.print("Parent: " + soParent[x]);
	
	
	if (soParent.length > 0)
		var soEvntTrackerCapID = soParent[0];
	else{
		holdId = capId;
		capId = soLCapId;
		
		appNameSoS = sysDate.getYear() + "-" + AInfo['Secretary of State Control Number'];
		aa.print("Tracker App Name is: "+ appNameSoS);
		
		var soEvntTrackerCapID = createParent("TNABC","Liquor by the Drink","Event","Special Occasion Tracking",appNameSoS);
		capId = soEvntTrackerCapID;

		editAppSpecific("Total Wine Events Held",0,soEvntTrackerCapID);
		editAppSpecific("Total Non Profit Events Held",0,soEvntTrackerCapID);
		editAppSpecific("Total Political Events Held",0,soEvntTrackerCapID);
		editAppSpecific("Total Alcoholic Festival Events Held",0,soEvntTrackerCapID);
		
		licEditExpInfo ("Active", "12/31/"+sysDate.getYear());
		copyASIFields(holdId,soEvntTrackerCapID,"SPECIAL OCCASION INFORMATION");
		
		capId = holdId;
	}

		var ttlNPftEvnts = getAppSpecific("Total Non Profit Events Held",soEvntTrackerCapID);
		aa.print("ttlNPftEvnts: " + ttlNPftEvnts);
		
		var ttlPolEvnts = getAppSpecific("Total Political Events Held",soEvntTrackerCapID);
		aa.print("ttlPolEvnts: " + ttlPolEvnts);
		
		var ttlWinEvnts = getAppSpecific("Total Wine Events Held",soEvntTrackerCapID);
		aa.print("ttlWinEvnts: " + ttlWinEvnts);
		
		var ttlAlcEvnts = getAppSpecific("Total Alcoholic Festival Events Held",soEvntTrackerCapID);
		aa.print("ttlAlcEvnts: " + ttlAlcEvnts);

		if (AInfo['Type of Occasion'].equals("Non-Profit Special Occasion")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlNPftEvnts);
			tOOc++;
			ttlNPftEvnts = tOOc;
			editAppSpecific("Total Non Profit Events Held",tOOc,soEvntTrackerCapID);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}
			
		if (AInfo['Type of Occasion'].equals("Political Special Occasion")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlPolEvnts);
			tOOc++;
			ttlPolEvnts = tOOc;
			editAppSpecific("Total Political Events Held",tOOc,soEvntTrackerCapID);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}		

		if (AInfo['Type of Occasion'].equals("Wine Festival")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlWinEvnts);
			tOOc++;
			ttlWinEvnts = tOOc;
			editAppSpecific("Total Wine Events Held",tOOc,soEvntTrackerCapID);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}	
			
		if (AInfo['Type of Occasion'].equals("Alcoholic Beverage Festival")){
			//totalTypeOccasion = 15;
			tOOc = Number(ttlAlcEvnts);
			tOOc++;
			ttlAlcEvnts = tOOc;
			editAppSpecific("Total Alcoholic Festival Events Held",tOOc,soEvntTrackerCapID);
			
			if(tOOc >= 15)
				maxEventsMet = true;
		}

		aa.print("Total Of " + AInfo['Type of Occasion'] + " Events held this year: " + tOOc); 

	
	if(ttlNPftEvnts >= 12 && ttlPolEvnts >= 12 && ttlWinEvnts >= 12 &&  ttlAlcEvnts >= 15){
		holdId = capId;
		capId = soEvntTrackerCapID;
		licEditExpInfo ("Expired", null);
		capId = holdId;
		closeTask("Application Status","Closed","Total allowable events have been reached for year",""); 
		
		return true;
	}
	else
		return false;
}

function getSpecOccLimitReached(){
	/* Special Occasion criteria:


	One 24 Hour period

	Non-Profit Special Occasion - 12
	Political Special Occasion - 12
	Alcoholic Beverage Festival - 15
	Wine Festival - 12
	*/

	var tOOc = 0;
	maxEventsMet = false;

	var vContactObjArray = getContactObjs_modified(capId,"Business Information");
                               
	for(iContNew in vContactObjArray){
		
		//aa.print("CHECKING " + iContNew + ":" + vContactObjArray[iContNew]);
		
		logDebug("Updating total number of occasions for " + AInfo['Type of Occasion']);
		
		var vContactObjNew = vContactObjArray[iContNew];
		
		var ttlNPftEvnts = vContactObjNew.getCustomField("Total Non Profit Events Held");
		//logDebug("ttlNPftEvnts: " + ttlNPftEvnts);
		
		var ttlPolEvnts = vContactObjNew.getCustomField("Total Political Events Held");
		//logDebug("ttlPolEvnts: " + ttlPolEvnts);
		
		var ttlWinEvnts = vContactObjNew.getCustomField("Total Wine Events Held");
		//logDebug("ttlWinEvnts: " + ttlWinEvnts);
		
		var ttlAlcEvnts = vContactObjNew.getCustomField("Total Alcoholic Festival Events Held");
		//logDebug("ttlAlcEvnts: " + ttlAlcEvnts);		
			
		if (AInfo['Type of Occasion'].equals("Non-Profit Special Occasion")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlNPftEvnts);
			tOOc++;
			ttlNPftEvnts = tOOc;
			vContactObjNew.setCustomField("Total Non Profit Events Held",tOOc);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}
			
		if (AInfo['Type of Occasion'].equals("Political Special Occasion")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlPolEvnts);
			tOOc++;
			ttlPolEvnts = tOOc;
			vContactObjNew.setCustomField("Total Political Events Held",tOOc);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}		

		if (AInfo['Type of Occasion'].equals("Wine Festival")){
			//totalTypeOccasion = 8;
			tOOc = Number(ttlWinEvnts);
			tOOc++;
			ttlWinEvnts = tOOc;
			vContactObjNew.setCustomField("Total Wine Events Held",tOOc);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}	
			
		if (AInfo['Type of Occasion'].equals("Alcoholic Beverage Festival")){
			//totalTypeOccasion = 15;
			tOOc = Number(ttlAlcEvnts);
			tOOc++;
			ttlAlcEvnts = tOOc;
			vContactObjNew.setCustomField("Total Alcoholic Festival Events Held",tOOc);
			
			if(tOOc >= 15)
				maxEventsMet = true;
		}
		vContactObjNew.save();
		if(vContactObjNew.refSeqNumber)
                    vContactObjNew.syncCapContactToReference();

		logDebug("Total Of " + AInfo['Type of Occasion'] + " Events held this year: " + tOOc); 
	}
	
	if(ttlNPftEvnts >= 12 && ttlPolEvnts >= 12 && ttlWinEvnts >= 12 &&  ttlAlcEvnts >= 15)
		return true;
	else
		return false;
}
 

function getTableName(capId)
{
	var tableName = null;
	var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
	if(result.getSuccess())
	{
		tableName = result.getOutput();
		if(tableName!=null)
		{
			return tableName;
		}
	}
	return tableName;
}


function loadGuideSheetItemsWASI(inspId) {
	//
	// Returns an associative array of Guide Sheet Items
	// Optional second parameter, cap ID to load from
	//
	var retArray = new Array()
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var r = aa.inspection.getInspections(itemCap)

	if (r.getSuccess()){
		var inspArray = r.getOutput();
		for (i in inspArray){
			if (inspArray[i].getIdNumber() == inspId){
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets()
				if (gs){
					gsArray = gs.toArray();
					for (var loopk in gsArray){
						logDebug("Guidesheet: " + gsArray[loopk].getGuideType());
						var gsItems = gsArray[loopk].getItems().toArray()
						for (var loopi in gsItems){
							gsi = gsItems[loopi];
							logDebug("  Guidesheet Item: " + gsi.getGuideItemText() );
							logDebug("     Status = " + gsi.getGuideItemStatus());

							var itemASISubGroupList = gsi.getItemASISubgroupList();
							//If there is no ASI subgroup, it will throw warning message.
							if(itemASISubGroupList != null) //&& gsi.getGuideItemText()=="Click the View Form button to the right to complete remaining questions")
							{
								var asiSubGroupIt = itemASISubGroupList.iterator();
								while(asiSubGroupIt.hasNext())
								{
									var asiSubGroup = asiSubGroupIt.next();
									var asiItemList = asiSubGroup.getAsiList();
									if(asiItemList != null)
									{
										var asiItemListIt = asiItemList.iterator();
										while(asiItemListIt.hasNext())
										{
											var asiItemModel = asiItemListIt.next();
											logDebug("        " + asiItemModel.getAsiName() + " = " + asiItemModel.getAttributeValue());
											retArray[asiItemModel.getAsiName()] = asiItemModel.getAttributeValue();
										}
									}
								}
							}
							//else
								//aa.print("ERROR: Cannot find the ASI subgroup for guidesheet item " + itemASISubGroupList);
						}
					}
				} // if there are guidesheets
				else
					logDebug("No guidesheets for this inspection");
			} // if this is the right inspection
		} // for each inspection
	} // if there are inspections

	logDebug("loaded " + retArray + " guidesheet items");
	return retArray;
}

function loadTable(tableName, capId)
{
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(capId).getOutput();
		var ta = gm.getTablesArray()
		var tai = ta.iterator();

		while (tai.hasNext())
		{
			var tsm = tai.next();
			var tn = tsm.getTableName();

			
			if (!tn.equals(tableName))
				continue;

			if (!tsm.rowIndex.isEmpty())
			{
				var tempObject = new Array();
				var tempArray = new Array();

				var tsmfldi = tsm.getTableField().iterator();
				var tsmcoli = tsm.getColumns().iterator();
				var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly field
				var numrows = 1;
				var columnSize = tsm.getColumns().size();
				
				while (tsmfldi.hasNext())  // cycle through fields
				{
					if (!tsmcoli.hasNext())  // cycle through columns
					{
						var tsmcoli = tsm.getColumns().iterator();
						tempArray.push(tempObject);  // end of record
						var tempObject = new Array();  // clear the temp obj
						numrows++;
					}
					var tcol = tsmcoli.next();
					var tval = tsmfldi.next();
					var readOnly = 'N';
					if (readOnlyi.hasNext()) 
						readOnly = readOnlyi.next();
					var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
					tempObject[tcol.getColumnName()] = fieldInfo;

				}
				tempArray.push(tempObject);  // end of record
			}
		}
		//if (tempArray != undefined)
			//aa.print("Total Rows in " + tableName + ": " + tempArray.length);	

	return tempArray;
}


function pinRegistration(pin, publicUserId) {
	if (arguments.length > 2) {
		setAsCreator = arguments[2];
	} else {
		setAsCreator = true;
	}
	if (arguments.length > 3) {
		linkFirstLP = arguments[3];
	} else {
		linkFirstLP = true;
	}
	if (arguments.length > 4) {
		linkFirstContact = arguments[4];
	} else {
		linkFirstContact = true;
	}
	if (arguments.length > 5) {
		contactType = arguments[5];
	}

	// get the public user
	var puserObj = aa.publicUser.getPublicUserByPUser(publicUserId).getOutput();
	if (puserObj) {
		var puserSeq = puserObj.getUserSeqNum();
		logDebug("public user: " + puserObj);
	} else {
		logDebug("Public user does not exist. " + publicUserId);
		return false;
	}

	//get parent record
	var parentCapIdResult = aa.cap.getCapID(pin.substr(0, 5), "00000", pin.substr(5, 10));
	if (!parentCapIdResult.getSuccess()) {
		logDebug("Could not find parent record with PIN: " + pin);
		return false;
	}

	var parentCapId = parentCapIdResult.getOutput();

	if (linkFirstContact) {
		// find the record contact with the correct contact type
		var refContactNbr = null;
		var contacts = aa.people.getCapContactByCapID(parentCapId).getOutput();
		var refContactNbr;
		var recContactExists = false;

		// if contactType was not specified, get the first contact
		if (contactType) {
			for (c in contacts) {
				if (contactType && contacts[c].getCapContactModel().getContactType() == contactType) {
					refContactNbr = contacts[c].getCapContactModel().getRefContactNumber();
					recContactExists = true;
					// create ref contact if the record contact is not already linked to reference
					if (!refContactNbr) {
						logDebug("Ref contact does not exist, creating one.")
						var contactTypeArray = new Array(contactType);
						createRefContactsFromCapContactsAndLink(parentCapId, contactTypeArray, iArr, false, false, comparePeopleStandard);
					}
					break;
				}
			}
			if (!recContactExists)
				logDebug("No record contact exists with type: " + contactType);
		} else {
			logDebug("No contact type specified. No contact was linked to public user.")
		}

		// associate the ref contact with the public user
		var linkResult = aa.licenseScript.associateContactWithPublicUser(puserSeq, refContactNbr);
		logDebug("Successfully associated contact with public user: " + refContactNbr);
	}

	// find the LP and associate to the public user
	if (linkFirstLP) {
		logDebug("Parent CAP ID: " + parentCapId);
		var licProf = createRefLicProfFromLicProf(parentCapId);
		logDebug("Reference License Professional ID: " + licProf);

		// var licProfArray = getLicenseProfessional(parentCapId);
		// var licProf = licProfArray[0];
		 if (licProf) {
			
			var refLP = aa.licenseScript.getRefLicensesProfByLicNbr(aa.servProvCode, licProf).getOutput();
			if (refLP) {
	            aa.licenseScript.associateLpWithPublicUser(puserObj, refLP[0]);
		        logDebug("Successfully associated LP with public user.");
			} else {
				logDebug("No reference LP exists to associate to the public user.");
			 }
		 } else {
			 logDebug("No LP on record to associate to public user.");
		 }
	}

	// make the public user the record creator
	if (setAsCreator) {
		var createdByResult = aa.cap.updateCreatedAccessBy4ACA(parentCapId, publicUserId, "Y", "N");
		if (!createdByResult.getSuccess()) {
			logDebug("Error updating created by ACA: " + createdbyResult.getErrorMessage());
		} else {
			logDebug("Successfully set public user as record creator.");
		}
	}
}


function refExamObj(vRefExamModel) {
	/**
	 * This function is intended to create reference exam data for use with transactional records.
	 *
	 * Call Example:
	 * 	var vRefExmObj = new refExamObj();
	 *
	 * @param vRefExamModel {RefExamModel} (Optional)
	 * Methods:
	 * refreshObject() - Refreshes the object data following a createExamination() or updateExam() call
	 * createExamination() - Uses the current object information to create a new Exam record.
	 * updateExam() - Uses the current object information to update an existing Exam record.
	 * getReferenceExamList() - Returns an array of RefExamModel objects that match the current refExamName
	 */

	this.auditModel = null;
	this.providerModels = null;
	this.resId = null;
	this.refExamModel = null;
	this.refExamName = null;
	this.refExamNbr = null;
	this.refExmProviderModels = null;
	this.refExmAppTypeModels = null;
	this.comments = null;
	this.templateModel = null;
	this.valid = false;
	this.gradingStyle = null;
	this.passingNumber = null;
	this.isSchedulingInACA = null;

	var newRefExamModel = null;

	if (vRefExamModel) {
		this.refExamModel = vRefExamModel;
		this.valid = (this.refExamModel != null);
	}

	this.refreshObject = function () {
		if (this.valid) {
			//this.auditModel = this.refExamModel.getAuditModel();
			//this.comments = this.refExamModel.getComments();
			this.refExamName = this.refExamModel.getExamName();
			this.refExamNbr = this.refExamModel.getRefExamNbr();
			this.refExmProviderModels = this.refExamModel.getRefExamProviderModels();
			this.refExmAppTypeModels = this.refExamModel.getRefExamAppTypeModels();
			this.templateModel = this.refExamModel.getTemplate();
		} else {
			this.valid = false;
		}
	}
	this.refreshObject(); //Invoke the Object Refresh to popualte our object variables

	this.generateNewRefExamModel = function () {
		var args = new Array();
		newRefExamModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RefExaminationModel", args).getOutput();
		var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args).getOutput();

		auditModel.setAuditDate(new Date());
		auditModel.setAuditStatus("A");
		auditModel.setAuditID("ADMIN");

		newRefExamModel.setAuditModel(auditModel);
		newRefExamModel.setServiceProviderCode(aa.getServiceProviderCode());
		newRefExamModel.setExamName(this.refExamName);
		newRefExamModel.setComments(this.comments);
		newRefExamModel.setGradingStyle(this.gradingStyle);
		newRefExamModel.setIsSchedulingInACA(this.isSchedulingInACA);
		newRefExamModel.setPassingScore(this.passingNumber);

		if (this.templateModel)
			newRefExamModel.setTemplate(this.templateModel);
	}

	this.createExaminationcreateExamination = function () {
		this.generateNewRefExamModel();
		var refExmBus = aa.proxyInvoker.newInstance("com.accela.aa.education.refexamination.RefExaminationBusiness").getOutput();
		// TODO: disabled try/catch since all MS 3.0 scripts execute in a try/catch
		//		try {
		var addedRefExamModel = refExmBus.create(newRefExamModel);
		logDebug("Created Reference Exam: " + this.refExamName + ": " + addedRefExamModel.getRefExamNbr());
		this.refExamNumber = addedRefExamModel.getRefExamNbr();

		//for (xr in refExmBus)
		//aa.print(xr + " - " + refExmBus[xr]);

		this.refreshObject();
		//}
		//		catch (err) {
		//			logDebug("createExam: A JavaScript Error occured: " + err.message);
		//		}
	}
	this.getReferenceExamList = function () {
		// Returns a list of RefExaminationModels based on the Exam Name
		var refExmBus = aa.proxyInvoker.newInstance("com.accela.aa.education.refexamination.RefExaminationBusiness").getOutput();
		var args = new Array();
		var newRefExamModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RefExaminationModel", args).getOutput();
		newRefExamModel.setServiceProviderCode(aa.getServiceProviderCode());
		newRefExamModel.setExamName(this.refExamName);
		var exmList = refExmBus.getRefExaminationList(newRefExamModel, true);

		if (exmList.toArray().length > 0) {
			logDebug("Exam " + this.refExamName + " has been found in reference");
			return exmList.toArray();
		} else
			return false;
	}
	this.assignProvider = function () {

		logDebug("Assigning Exam to provider");
		// Returns a list of RefExaminationModels based on the Exam Name
		var refExmBus = aa.proxyInvoker.newInstance("com.accela.aa.education.refexamination.RefExaminationBusiness").getOutput();
		var xRefExmMdl = aa.proxyInvoker.newInstance("com.accela.orm.model.education.XRefExaminationProviderModel").getOutput();

		var args = new Array();
		var newRefExamModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RefExaminationModel", args).getOutput();
		newRefExamModel.setServiceProviderCode(aa.getServiceProviderCode());
		newRefExamModel.setExamName(this.refExamName);

		//setting xref examprovider
		xRefExmMdl.setGradingStyle(this.gradingStyle);
		xRefExmMdl.setPassingScore2String(String(this.passingNumber));
		xRefExmMdl.setPassingScore(Number(this.passingNumber));
		xRefExmMdl.setServiceProviderCode(aa.getServiceProviderCode());
		xRefExmMdl.setRefExamNbr(this.refExamNumber);
		xRefExmMdl.setExternalExamName(this.refExamName);
		xRefExmMdl.setIsSchedulingInACA(this.isSchedulingInACA);
		xRefExmMdl.setProviderNbr(prvNBR);
		var args2 = new Array();
		var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args2).getOutput();

		auditModel.setAuditDate(new Date());
		auditModel.setAuditStatus("A");
		auditModel.setAuditID("ADMIN");
		xRefExmMdl.setAuditModel(auditModel);

		logDebug("ProvNbr to Check = " + prvNBR);

		var provAss = false;

		var exmProvAssigned = refExmBus.getProviderList(newRefExamModel).toArray();

		logDebug("Total Providers assigned to Exam: " + exmProvAssigned.length);

		for (x in exmProvAssigned) {
			var ePAssNbr = exmProvAssigned[x].getProviderNbr();
			logDebug("Existing ProvNbr = " + ePAssNbr);

			if (ePAssNbr == prvNBR) {
				logDebug("Provider Already Assocated to Exam");
				provAss = true;
				examAssigned = true;
				return examAssigned;
			}
		}

		if (!provAss) {
			//Assigning Providers
			provList = [];
			provList.push(xRefExmMdl);
			provAssign = refExmBus.assignProviders(provList, false);

			examAssigned = true;
		}
		logDebug("Now is exam assigned: " + examAssigned);
		return examAssigned;
	}
	this.assignRecord = function (refGroup, refType, refSub, refCat, refAlias) {

		logDebug("Now assigning record to Exam");

		//Building capTypeI18NModel
		var i18nModel = aa.proxyInvoker.newInstance("com.accela.orm.model.cap.CapTypeI18NModel").getOutput();
		var args = new Array();
		var args2 = new Array();
		var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args2).getOutput();
		var refExmBus = aa.proxyInvoker.newInstance("com.accela.aa.education.refexamination.RefExaminationBusiness").getOutput();

		var newRefExamModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RefExaminationModel", args).getOutput();
		newRefExamModel.setServiceProviderCode(aa.getServiceProviderCode());
		newRefExamModel.setExamName(this.refExamName);
		var exmAppTypeList = refExmBus.getAssignedAppTypeList(aa.getServiceProviderCode(), this.refExamNumber);

		for (x in exmAppTypeList) {
			var exmAppL = exmAppTypeList.getRefExamAppTypeModels;
			for (eaL in exmAppL)
				logDebug(eaL + " = " + exmAppL[eaL]);
		}

		auditModel.setAuditDate(new Date());
		auditModel.setAuditStatus("A");
		auditModel.setAuditID("ADMIN");

		i18nModel.setGroup(refGroup);
		i18nModel.setType(refType);
		i18nModel.setSubType(refSub);
		i18nModel.setCategory(refCat);
		i18nModel.setAlias(refAlias);
		i18nModel.setAuditModel(auditModel);

		var xRefAppModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.XRefExaminationAppTypeModel").getOutput();
		xRefAppModel.setServiceProviderCode(aa.getServiceProviderCode());
		xRefAppModel.setRequired("Y");
		xRefAppModel.setAuditModel(auditModel);
		xRefAppModel.setGroup(refGroup);
		xRefAppModel.setType(refType);
		xRefAppModel.setSubType(refSub);
		xRefAppModel.setCategory(refCat);
		xRefAppModel.setRequired("N");
		xRefAppModel.setRefExamNbr(this.refExamNumber);
		xRefAppModel.setCapTypeI18nModel(i18nModel);

		//Assigning AppTypes
		typeList = [];
		typeList.push(xRefAppModel);
		typeAssign = refExmBus.assignAppTypes(typeList);

		logDebug("Record type has been assigned");

		this.valid = true;

		//this.refreshObject();
	}
}

function removeLPConditions(pType,pStatus,pDesc,pImpact) // optional capID
{
	var resultArray = new Array();
	var lang= "ar_AE";
	
	if (arguments.length > 4)
		var itemCap = arguments[4]; // use cap ID specified in args
	else
		var itemCap = capId;

	////////////////////////////////////////
	// Check License
	////////////////////////////////////////
	
	var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
	
	if (!capLicenseResult.getSuccess())
		{
		logDebug("**WARNING: getting CAP licenses: "+ capLicenseResult.getErrorMessage());
		var licArray = new Array();
		}
	else
		{
		var licArray = capLicenseResult.getOutput();
		if (!licArray) licArray = new Array();
		}
		
	for (var thisLic in licArray)
		if (licArray[thisLic].getLicenseProfessionalModel().getLicSeqNbr())
		{
			var licCondResult = aa.caeCondition.getCAEConditions(licArray[thisLic].getLicenseProfessionalModel().getLicSeqNbr());
			if (!licCondResult.getSuccess())
				{
				logDebug("**WARNING: getting license Conditions : "+licCondResult.getErrorMessage());
				var licCondArray = new Array();
				}
			else
				{
				var licCondArray = licCondResult.getOutput();
				}
			
			for (var thisLicCond in licCondArray)
			{
				var thisCond = licCondArray[thisLicCond];
				
				//aa.print("thisCond: " + thisCond);
				
				//for (x in thisCond)
					//aa.print(x + ": " + thisCond[x]);
				
				var cType = thisCond.getConditionType();
				var cStatus = thisCond.getConditionStatus();
				var cDesc = thisCond.getConditionDescription();
				var cImpact = thisCond.getImpactCode();
				var cComment = thisCond.getConditionComment();
				cNumber = thisCond.getConditionNumber();

				if (cType == null)
					cType = " ";
				if (cStatus==null)
					cStatus = " ";
				if (cDesc==null)
					cDesc = " ";
				if (cImpact==null)
					cImpact = " ";
		
				if ( pType.toUpperCase().equals(cType.toUpperCase()) && pStatus.toUpperCase().equals(cStatus.toUpperCase()) && pDesc.toUpperCase().equals(cDesc.toUpperCase()) && pImpact.toUpperCase().equals(cImpact.toUpperCase()))
				{
					logDebug("Found Citation Condition...Changing status to On Hold");				
					thisCond.setConditionStatus("On Hold");
					thisCond.setImpactCode(null);
					aa.caeCondition.editCAECondition(thisCond);
					
					//not using this....it deletes the condition from the record...need to leave condition in a not applied status
					//aa.caeCondition.removeCAECondition(cNumber, licArray[thisLic].getLicenseProfessionalModel().getLicSeqNbr());
				}
				else
					logDebug("No Citation Condition Found");
			}
		}
}


function removeParent(parentAppNum)
//
// removes the current application from the parent
//
{
    itemCap = capId;
    if (arguments.length == 2) {
        itemCap = arguments[1]; // subprocess

    }

    var getCapResult = aa.cap.getCapID(parentAppNum);
    if (getCapResult.getSuccess()) {
        var parentId = getCapResult.getOutput();
        var linkResult = aa.cap.removeAppHierarchy(parentId, itemCap);
        if (linkResult.getSuccess())
            logDebug("Successfully removed link to Parent Application : " + parentAppNum);
        else
            logDebug("**WARNING: removing link to parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());
    }
    else
    { logDebug("**WARNING: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage()) }

}

/* ---------------------------------------------------------------------------- */

/* Added by FJB 09-08-15 to include comment on send email for Hearing */


function runReportAsyncAttach(itemCapId, aaReportName) {
	// optional parameters are report parameter pairs
	// for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");

	var reportName = aaReportName;
	reportResult = aa.reportManager.getReportInfoModelByName(reportName);
	if (!reportResult.getSuccess()) {
		logDebug("**WARNING** couldnt load report " + reportName + " " + reportResult.getErrorMessage());
		return false;
	}
	var report = reportResult.getOutput();
	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString();
	appTypeArray = appTypeString.split("/");
	report.setModule(appTypeArray[0]);
	report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3());
	report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());
	var parameters = aa.util.newHashMap();
	for (var i = 2; i < arguments.length; i = i + 2) {
		parameters.put(arguments[i], arguments[i + 1]);
		logDebug("Report parameter: " + arguments[i] + " = " + arguments[i + 1]);
	}
	report.setReportParameters(parameters);
	var permit = aa.reportManager.hasPermission(reportName, 'ADMIN');

	if (permit.getOutput().booleanValue()) {
		var scriptName = "RUNREPORTATTACHASYNC";
		var envParameters = aa.util.newHashMap();
		envParameters.put("report", report);
		aa.runAsyncScript(scriptName, envParameters);
		//var reportResult = aa.reportManager.getReportResult(report);
		logDebug("Report " + aaReportName + " has been run async for " + itemCapId.getCustomID());
	} else
		logDebug("No permission to report: " + reportName + " for user: " + currentUserID);
}


function scheduleExamViaASIT(){
		var capLPs = getLicenseProfessional(capId);

		for (lpType in capLPs){
			if (capLPs[lpType].getLicenseType().equals("Provider")){
				var refLP = capLPs[lpType].getLicenseNbr();

				logDebug("Ref LP Num: " + refLP);

				refLPLModel = getRefLicenseProf(refLP);
				//var busName = refLPLModel.getBusinessName();

				prvNBR = getProviderInfo(refLPLModel);

				var proctorID = "";

					var capContact = getContactArray();
					for (cCont in capContact){
						if (capContact[cCont]["contactType"].equals("Applicant-Individual")){
							proctorID = capContact[cCont]["refSeqNumber"];
						}
					}
				var examAssigned = false;
				
				if (typeof(SCHEDULEINFO) == "object"){
					var newSchTable = new Array();
					
					for (sd in SCHEDULEINFO){
						var schedExist = false;
						var tempObject = new Array();
						if (SCHEDULEINFO[sd]["Agency Approved"] == "Yes" && SCHEDULEINFO[sd]["Schedule Status"] == "Submitted"){
							//if (SCHEDULEINFO[sd]["Is class open to the public?"] == "Yes")
							var className = SCHEDULEINFO[sd]["Class Name"]
							//else
								//var className = SCHEDULEINFO[sd]["Class Name"] + " - "+busName;
							
							logDebug("And the class START TIME IS: " + SCHEDULEINFO[sd]["Start Time"]);
							
							var vNewRefExamObj = new refExamObj();
							vNewRefExamObj.refExamName = className;
							vNewRefExamObj.gradingStyle = "score";
							vNewRefExamObj.passingNumber = "70";
							vNewRefExamObj.isSchedulingInACA = "Y";
							vNewRefExamObj.comments = SCHEDULEINFO[sd]["Comments"];
							
							examExists = vNewRefExamObj.getReferenceExamList();
							
							if (!examExists){
								vNewRefExamObj.createExamination();
								examID = vNewRefExamObj.refExamNumber;
								logDebug("New EXAMID " + examID);
							}
							else
							{
								for (x in examExists){
									examMod = examExists[x];
									
									if (examMod.getExamName().toString() == className.toString()){
										examID = examMod.getRefExamNbr();
										logDebug("Existing EXAMID " + examID);
										vNewRefExamObj.refExamNumber = examID;
									}
								}
							}
							
							logDebug("Is exam assigned to provider: "+ examAssigned);
							
							if (!examAssigned){
								//Assign the Provider to the exam
								logDebug("Assigning the Provider to the Exam");
								examAssigned = vNewRefExamObj.assignProvider();
								
								//Assign the Record to the Exam
								logDebug("Assigning the Record to the Exam");
								vNewRefExamObj.assignRecord("TNABC","Permits","Application","Server","Server Permit Application");
								
							}
							
							//Set location stuff
							var provLocBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.RefProviderLocationBusiness").getOutput();
							var rProvLocModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationModel").getOutput();
							var rProvLocPKModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationPKModel").getOutput();
							
							rProvLocPKModel.setServiceProviderCode(aa.getServiceProviderCode());
							
							var maxSeats = Number(SCHEDULEINFO[sd]["Max Seats"]);
							var add1 = SCHEDULEINFO[sd]["Location Address"];
							var add2 = SCHEDULEINFO[sd]["Location Name"];
							var city = SCHEDULEINFO[sd]["Location City"];
							var state = "Tennessee";
							var zip = SCHEDULEINFO[sd]["Location Zip Code"];
							var handicapOK = "Y";
							var startDate = new Date(SCHEDULEINFO[sd]["Date of Class"]); 
							startDate.setHours(0,0,0,0); //Date time must be set to 00
							var endDate = new Date(SCHEDULEINFO[sd]["Date of Class"]);
							endDate.setHours(23,59,59,0); //Date time must be 23:59
													
							var sTimeToMilitary = timeStandardToMilitary(String(SCHEDULEINFO[sd]["Start Time"]));
										
							logDebug("Start Time " + String(SCHEDULEINFO[sd]["Start Time"]) + " needs to be converted to Military: "+ sTimeToMilitary);
							logDebug("INDEX OF: " + sTimeToMilitary.indexOf(":"));
							
							
							if (sTimeToMilitary.indexOf(":") == 1){
								logDebug("HERE");
								var startTimeHours = "0" + sTimeToMilitary.substr(0,1);
							}
							else
								var startTimeHours = sTimeToMilitary.substr(0,2);
									
							logDebug("START HOURS: "+ startTimeHours);
							
							var startTime = new Date(SCHEDULEINFO[sd]["Date of Class"]);
							startTime.setHours(startTimeHours,sTimeToMilitary.substr(-2),00,0); //Must be date time of exam													
							
							logDebug("The FINAL Start TIME IS: "+ startTime);
							
							var eTimeToMilitary = timeStandardToMilitary(String(SCHEDULEINFO[sd]["End Time"]));
							
							logDebug("End Time " + String(SCHEDULEINFO[sd]["End Time"]) + " needs to be converted to Military: "+ eTimeToMilitary);
							logDebug("INDEX OF: " + eTimeToMilitary.indexOf(":"));

							if (eTimeToMilitary.indexOf(":") == 1){
								logDebug("HERE");
								var endTimeHours = "0" + eTimeToMilitary.substr(0,1);
							}
							else
								var endTimeHours = eTimeToMilitary.substr(0,2);
									
							logDebug("END HOURS: "+ endTimeHours);
							
							var endTime = new Date(SCHEDULEINFO[sd]["Date of Class"]); 
							endTime.setHours(endTimeHours,eTimeToMilitary.substr(-2),00,0); //Must be date time of exam													
							
							logDebug("The FINAL END TIME IS: "+ endTime);

							var phone = SCHEDULEINFO[sd]["Contact Phone"];
							var scheduleName = String(SCHEDULEINFO[sd]["Date of Class"])+" "+String(SCHEDULEINFO[sd]["Start Time"]) + "|"+prvNBR;
							
							//..check to see if schedule exists
							schedList = aa.examination.getAvailableSchedules(className).getOutput().toArray();
							for (y in schedList) {
								schedModel = schedList[y];
								
								extStartTime = new Date(schedModel.getStartTime());

								extProvNbr = schedModel.getProviderNbr();
								
								if (prvNBR != extProvNbr)
									continue;
								
								if (startTime.getTime() == extStartTime.getTime()){
									logDebug("Class already exists, no action being taken");

									tempObject["Schedule Status"] = "Rejected";
									tempObject["Comments"] = "Class already exists, no action being taken";
									tempObject["Agency Approved"] = String("No");
									
									schedExist = true;
									continue;
								}
							}
							
							if (!schedExist){
								logDebug("Class is being scheduled");
								examScheduler(servProvCode, prvNBR, examID, proctorID, add1, add2, city, state, zip, phone, maxSeats, handicapOK, scheduleName, startDate, endDate, startTime, endTime);
								
								tempObject["Schedule Status"] = "Scheduled";
								tempObject["Comments"] = String("Class has been approved by Agency and is now available for scheduling");
								tempObject["Agency Approved"] = String(SCHEDULEINFO[sd]["Agency Approved"]);
							}
							
							tempObject["Class Name"] = SCHEDULEINFO[sd]["Class Name"];
							tempObject["Date of Class"] = SCHEDULEINFO[sd]["Date of Class"];
							tempObject["Start Time"] = String(SCHEDULEINFO[sd]["Start Time"]);
							tempObject["End Time"] = String(SCHEDULEINFO[sd]["End Time"]);
							tempObject["Max Seats"] = String(maxSeats);
							tempObject["Location Name"] = add2;
							tempObject["Location Address"] = add1;
							tempObject["Location City"] = city;
							tempObject["Location Zip Code"] = String(zip);
							tempObject["Contact Phone"] = SCHEDULEINFO[sd]["Contact Phone"];
							tempObject["Is class open to the public?"] = SCHEDULEINFO[sd]["Is class open to the public?"];
							
							newSchTable.push(tempObject);		
						}
						else
							newSchTable.push(SCHEDULEINFO[sd]);
					}
				}
				
				if(newSchTable.length >0){
					removeASITable("SCHEDULE INFO");
					addASITable("SCHEDULE INFO",newSchTable,capId);
				}
			}
		}
	}







function scheduleInspectDateWGroup(inspGroup,iType,DateToSched) // optional inspector ID.  This function requires dateAdd function
{
	logDebug("begin schedule inspection : " + iType + " for " + DateToSched);
	var inspectorObj = null;
	if (arguments.length == 4) 
		{
		var inspRes = aa.person.getUser(arguments[3])
		if (inspRes.getSuccess())
			inspectorObj = inspRes.getOutput();
		}
	var inspModelRes = aa.inspection.getInspectionScriptModel();
	if (inspModelRes.getSuccess()){
		logDebug("Successfully get inspection model: " + iType + " for " + DateToSched);
		var inspModelObj = inspModelRes.getOutput().getInspection();
		var inspActivityModel = inspModelObj.getActivity();
		inspActivityModel.setCapID(capId);
		inspActivityModel.setSysUser(inspectorObj);
		inspActivityModel.setActivityDate(aa.util.parseDate(DateToSched));
		inspActivityModel.setActivityGroup("Inspection");
		inspActivityModel.setActivityType(iType);
		inspActivityModel.setActivityDescription(iType);
		inspActivityModel.setRecordDescription("");
		inspActivityModel.setRecordType("");
		inspActivityModel.setDocumentID("");
		inspActivityModel.setDocumentDescription('Insp Scheduled');
		inspActivityModel.setActivityJval("");
		inspActivityModel.setStatus("Scheduled");
		inspActivityModel.setTime1(null);
		inspActivityModel.setAuditID(currentUserID);
		inspActivityModel.setAuditStatus("A");
		inspActivityModel.setInspectionGroup(inspGroup);
		

		var inspTypeResult = aa.inspection.getInspectionType(inspGroup,iType);
		if (inspTypeResult.getSuccess() && inspTypeResult.getOutput())
		{
			if(inspTypeResult.getOutput().length > 0)
			{
				inspActivityModel.setCarryoverFlag(inspTypeResult.getOutput()[0].getCarryoverFlag()); //set carryoverFlag
				inspActivityModel.setActivityDescription(inspTypeResult.getOutput()[0].getDispType());
				inspActivityModel.setInspectionGroup(inspTypeResult.getOutput()[0].getGroupCode());
				inspActivityModel.setRequiredInspection(inspTypeResult.getOutput()[0].getRequiredInspection());
				inspActivityModel.setUnitNBR(inspTypeResult.getOutput()[0].getUnitNBR());
				inspActivityModel.setAutoAssign(inspTypeResult.getOutput()[0].getAutoAssign());
				inspActivityModel.setDisplayInACA(inspTypeResult.getOutput()[0].getDisplayInACA());
				inspActivityModel.setInspUnits(inspTypeResult.getOutput()[0].getInspUnits());
			}
		}

		inspModelObj.setActivity(inspActivityModel);
		
		var schedRes = aa.inspection.scheduleInspection(inspModelObj,systemUserObj);

		if (schedRes.getSuccess())
			logDebug("Successfully scheduled inspection : " + iType);
		else
			logDebug( "**ERROR: scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}else{
		logDebug( "**ERROR: getting  inspection model  " );
	}
	
}


/* Added by LRS 6/14/2015  */
function sendFeeNotificationToContactTypes(sendEmailToContactTypes, emailTemplate) {
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;
	if (arguments.length == 3)
		thisCapId = arguments[2]; // optional 3rd parameter, capid to use
	var recordType = aa.cap.getCap(thisCapId).getOutput().getCapType().getAlias(); /* Added 5/24/16 FJB */
	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
		logDebug("ERROR: Function sendNotificationToContactTypes requres two arguments.  Usage: sendNotificationToContactTypes(string sendEmailToContactTypes, string emailTemplate)");
		return false
	}

	if (sendEmailToContactTypes == null || sendEmailToContactTypes.length == 0) {
		logDebug("ERROR: No contact types list found.");
		return false;
	}

	if (emailTemplate == null || emailTemplate.length == 0) {
		logDebug("ERROR: No email template submitted.");
		return false;
	}

	if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {

		var conTypeArray = sendEmailToContactTypes.split(",");
		var conArray = getContactArray(thisCapId);

		if (conArray && conArray.length > 0)
			logDebug("Have the contactArray");

		for (thisCon in conArray) {
			conEmail = null;
			b3Contact = conArray[thisCon];
			if (exists(b3Contact["contactType"], conTypeArray)) {
				conEmail = b3Contact["email"];
				logDebug(altId + ": Contact type " + b3Contact["contactType"] + " found. Email: " + conEmail);
			}

			if (conEmail) {
				emailParameters = aa.util.newHashtable();
				getContactParams4Notification(emailParameters, b3Contact["contactType"]);
				getRecordParams4Notification(emailParameters);
				/* addParameter(emailParameters, "$$businessName$$", cap.getSpecialText()); */
				addParameter(emailParameters, "$$altID$$", capIDString);
				addParameter(emailParameters, "$$recordType$$", recordType);

				try {
					b1ExpResult = aa.expiration.getLicensesByCapID(capId);
					if (b1ExpResult.getSuccess()) {
						this.b1Exp = b1ExpResult.getOutput();
						var tmpDate = this.b1Exp.getExpDate();
						var expDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
						addParameter(emailParameters, "$$expirationDate$$", expDate);
					}
				} catch (err) {
					logDebug("Expiration Date does not apply for permit # " + altId);
				}

				var capId4Email = aa.cap.createCapIDScriptModel(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3());

				var fileNames = [];

				aa.document.sendEmailAndSaveAsDocument(mailFrom, conEmail, "", emailTemplate, emailParameters, capId4Email, fileNames);
				logDebug(altId + ": Sent Email template " + emailTemplate + " to " + b3Contact["contactType"] + " : " + conEmail);
			}
		}
	}
}

function sendInspNotificationToContactTypes(sendEmailToContactTypes, emailTemplate) 

{
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;
	if (arguments.length == 3)
		thisCapId = arguments[2]; // optional 3rd parameter, capid to use

	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
		logDebug("ERROR: Function sendNotificationToContactTypes requres two arguments.  Usage: sendNotificationToContactTypes(string sendEmailToContactTypes, string emailTemplate)");
		return false
	}

	if (sendEmailToContactTypes == null || sendEmailToContactTypes.length == 0) {
		logDebug("ERROR: No contact types list found.");
		return false;
	}

	if (emailTemplate == null || emailTemplate.length == 0) {
		logDebug("ERROR: No email template submitted.");
		return false;
	}

	if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {

		var conTypeArray = sendEmailToContactTypes.split(",");
		var conArray = getContactArray(thisCapId);

		if (conArray && conArray.length > 0)
			logDebug("Have the contactArray");

		for (thisCon in conArray) {
			conEmail = null;
			b3Contact = conArray[thisCon];
			if (exists(b3Contact["contactType"], conTypeArray)) {
				conEmail = b3Contact["email"];
				logDebug(altId + ": Contact type " + b3Contact["contactType"] + " found. Email: " + conEmail);
			}

			if (conEmail) {
				emailParameters = aa.util.newHashtable();
				getContactParams4Notification(emailParameters, b3Contact["contactType"]);
				getInspRecordParams4Notification(emailParameters);
				
				                       
				var capId4Email = aa.cap.createCapIDScriptModel(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3());

				var fileNames = [];

				aa.document.sendEmailAndSaveAsDocument(mailFrom, conEmail, "", emailTemplate, emailParameters, capId4Email, fileNames);
				logDebug(altId + ": Sent Email template " + emailTemplate + " to " + b3Contact["contactType"] + " : " + conEmail);
			}
		}
	}
}

function sendNotificationToContactTypes(sendEmailToContactTypes, emailTemplate) {
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;

	if (arguments.length == 3)
		thisCapId = arguments[2]; // optional 3rd parameter, capid to use
	var recordType = aa.cap.getCap(thisCapId).getOutput().getCapType().getAlias(); /* Added 5/24/16 FJB */
	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
		logDebug("ERROR: Function sendNotificationToContactTypes requres two arguments.  Usage: sendNotificationToContactTypes(string sendEmailToContactTypes, string emailTemplate)");
		return false
	}

	if (sendEmailToContactTypes == null || sendEmailToContactTypes.length == 0) {
		logDebug("ERROR: No contact types list found.");
		return false;
	}

	if (emailTemplate == null || emailTemplate.length == 0) {
		logDebug("ERROR: No email template submitted.");
		return false;
	}

	if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {

		var conTypeArray = sendEmailToContactTypes.split(",");
		var conArray = getContactArray(thisCapId);

		if (conArray && conArray.length > 0)
			logDebug("Have the contactArray");

		for (thisCon in conArray) {
			conEmail = null;
			b3Contact = conArray[thisCon];
			if (exists(b3Contact["contactType"], conTypeArray)) {
				conEmail = b3Contact["email"];
				logDebug(altId + ": Contact type " + b3Contact["contactType"] + " found. Email: " + conEmail);
			}

			if (conEmail) {
				emailParameters = aa.util.newHashtable();
				getContactParams4Notification(emailParameters, b3Contact["contactType"]);
				getRecordParams4Notification(emailParameters);

				var acaURL = "https://rlpsdev.abc.tn.gov/devtabc";
				getRecordParams4Notification_mod(emailParameters);
				getACARecordParam4Notification(emailParameters, acaURL);

				/* addParameter(emailParameters, "$$businessName$$", cap.getSpecialText()); */
				addParameter(emailParameters, "$$altID$$", capIDString);
				addParameter(emailParameters, "$$recordType$$", recordType);
				addParameter(emailParameters, "$$acaUrl$$", acaURL + getACAUrl());
				addParameter(emailParameters, "$$acaUrlOnly$$", acaURL);

				//if (wfComment)
				addParameter(emailParameters, "$$wfComment$$", "");
				//if (wfStatus)
				addParameter(emailParameters, "$$wfStatus$$", "");

				try {
					b1ExpResult = aa.expiration.getLicensesByCapID(capId);
					if (b1ExpResult.getSuccess()) {
						this.b1Exp = b1ExpResult.getOutput();
						var tmpDate = this.b1Exp.getExpDate();
						var expDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
						addParameter(emailParameters, "$$expirationDate$$", expDate);
					}
				} catch (err) {
					logDebug("Expiration Date does not apply for permit # " + altId);
				}

				var capId4Email = aa.cap.createCapIDScriptModel(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3());

				var fileNames = [];

				logDebug("ACA URL: " + acaURL);

				aa.document.sendEmailAndSaveAsDocument(mailFrom, conEmail, "", emailTemplate, emailParameters, capId4Email, fileNames);
				logDebug(altId + ": Sent Email template " + emailTemplate + " to " + b3Contact["contactType"] + " : " + conEmail);
			}
		}
	}
}

function sendNotificationToContactTypesTN(sendEmailToContactTypes, emailTemplate, TNcomment) {
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;
	if (arguments.length == 4)
		thisCapId = arguments[3]; // optional 4th parameter, capid to use

	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
		logDebug("ERROR: Function sendNotificationToContactTypes requres two arguments.  Usage: sendNotificationToContactTypes(string sendEmailToContactTypes, string emailTemplate)");
		return false
	}

	if (sendEmailToContactTypes == null || sendEmailToContactTypes.length == 0) {
		logDebug("ERROR: No contact types list found.");
		return false;
	}

	if (emailTemplate == null || emailTemplate.length == 0) {
		logDebug("ERROR: No email template submitted.");
		return false;
	}

	if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {

		var conTypeArray = sendEmailToContactTypes.split(",");
		var conArray = getContactArray(thisCapId);

		if (conArray && conArray.length > 0)
			logDebug("Have the contactArray");

		for (thisCon in conArray) {
			conEmail = null;
			b3Contact = conArray[thisCon];
			if (exists(b3Contact["contactType"], conTypeArray)) {
				conEmail = b3Contact["email"];
				logDebug(altId + ": Contact type " + b3Contact["contactType"] + " found. Email: " + conEmail);
			}

			if (conEmail) {
				emailParameters = aa.util.newHashtable();
				getContactParams4Notification(emailParameters, b3Contact["contactType"]);
				getRecordParams4Notification(emailParameters);
				/* addParameter(emailParameters, "$$businessName$$", cap.getSpecialText()); */
                addParameter(emailParameters, "$$wfComment$$", wfComment);
				addParameter(emailParameters, "$$capType$$", capType);
				addParameter(emailParameters, "$$altID$$", capIDString);
                addParameter(emailParameters, "$$wfStatus$$", wfStatus);
                addParameter(emailParameters, "$$TNComment$$", TNcomment);                
                                   try {
					b1ExpResult = aa.expiration.getLicensesByCapID(capId);
					if (b1ExpResult.getSuccess()) {
						this.b1Exp = b1ExpResult.getOutput();
						var tmpDate = this.b1Exp.getExpDate();
						var expDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
						addParameter(emailParameters, "$$expirationDate$$", expDate);
					}
				} catch (err) {
					logDebug("Expiration Date does not apply for permit # " + altId);
				}
				                       
				var capId4Email = aa.cap.createCapIDScriptModel(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3());

				var fileNames = [];

				aa.document.sendEmailAndSaveAsDocument(mailFrom, conEmail, "", emailTemplate, emailParameters, capId4Email, fileNames);
				logDebug(altId + ": Sent Email template " + emailTemplate + " to " + b3Contact["contactType"] + " : " + conEmail);
			}
		}
	}
}

function sendNotificationToContactTypes_ASA(sendEmailToContactTypes, emailTemplate) {
	var mailFrom = "noreply.abc@tn.gov";
	var thisCapId = capId;
	
	if (arguments.length == 3)
		thisCapId = arguments[2]; // optional 3rd parameter, capid to use
	var recordType = aa.cap.getCap(thisCapId).getOutput().getCapType().getAlias(); 	/* Added 5/24/16 FJB */
	var altId = thisCapId.getCustomID();

	if (arguments.length < 2) {
		logDebug("ERROR: Function sendNotificationToContactTypes requres two arguments.  Usage: sendNotificationToContactTypes(string sendEmailToContactTypes, string emailTemplate)");
		return false
	}

	if (sendEmailToContactTypes == null || sendEmailToContactTypes.length == 0) {
		logDebug("ERROR: No contact types list found.");
		return false;
	}

	if (emailTemplate == null || emailTemplate.length == 0) {
		logDebug("ERROR: No email template submitted.");
		return false;
	}

	if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {

		var conTypeArray = sendEmailToContactTypes.split(",");
		var conArray = getContactArray(thisCapId);

		if (conArray && conArray.length > 0)
			logDebug("Have the contactArray");

		for (thisCon in conArray) {
			conEmail = null;
			b3Contact = conArray[thisCon];
			if (exists(b3Contact["contactType"], conTypeArray)) {
				conEmail = b3Contact["email"];
				logDebug(altId + ": Contact type " + b3Contact["contactType"] + " found. Email: " + conEmail);
			}

			if (conEmail) {
				emailParameters = aa.util.newHashtable();
				getContactParams4Notification(emailParameters, b3Contact["contactType"]);
				getRecordParams4Notification(emailParameters);
				/* addParameter(emailParameters, "$$businessName$$", cap.getSpecialText()); */
				addParameter(emailParameters, "$$altID$$", capIDString);	
				addParameter(emailParameters, "$$recordType$$", recordType);
                              
                try {
					b1ExpResult = aa.expiration.getLicensesByCapID(capId);
					if (b1ExpResult.getSuccess()) {
						this.b1Exp = b1ExpResult.getOutput();
						var tmpDate = this.b1Exp.getExpDate();
						var expDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
						addParameter(emailParameters, "$$expirationDate$$", expDate);
					}
				} catch (err) {
					logDebug("Expiration Date does not apply for permit # " + altId);
				}
				                       
				var capId4Email = aa.cap.createCapIDScriptModel(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3());

				var fileNames = [];

				aa.document.sendEmailAndSaveAsDocument(mailFrom, conEmail, "", emailTemplate, emailParameters, capId4Email, fileNames);
				logDebug(altId + ": Sent Email template " + emailTemplate + " to " + b3Contact["contactType"] + " : " + conEmail);
			}
		}
	}
}


function SendNotification_OnDocumentUpload(){

var mailTo1 = lookup("Documents Received Dictribution List", "TPATEL");
//var mailTo2 = lookup("Documents Received Dictribution List", "TPATEL");
//var mailTo3 = lookup("Documents Received Dictribution List", "TPATEL");
//var mailTo4 = lookup("Documents Received Dictribution List", "TPATEL");

aa.print(mailTo1);

var mailFrom = "noreply.abc@tn.gov";
var thisCapId = capId;
var recordType = aa.cap.getCap(thisCapId).getOutput().getCapType().getAlias(); 	/* Added 5/24/16 FJB */
var altId = thisCapId.getCustomID();

if (mailTo1) {
				emailParameters = aa.util.newHashtable();
				//getContactParams4Notification(emailParameters, b3Contact["contactType"]);
				//getRecordParams4Notification(emailParameters);
				/* addParameter(emailParameters, "$$businessName$$", cap.getSpecialText()); */
                
				addParameter(emailParameters, "$$capType$$", recordType);
				addParameter(emailParameters, "$$altID$$", altId);
                
               
                                                
				var capId4Email = aa.cap.createCapIDScriptModel(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3());

				var fileNames = [];

				aa.document.sendEmailAndSaveAsDocument(mailFrom, mailTo1, "", "TABC_DOCUMENTS_RECEIVED_NOTIFICATION", emailParameters, capId4Email, fileNames);
				//aa.document.sendEmailAndSaveAsDocument(mailFrom, mailTo2, "", "TABC_DOCUMENTS_RECEIVED_NOTIFICATION", emailParameters, capId4Email, fileNames);
				//aa.document.sendEmailAndSaveAsDocument(mailFrom, mailTo3, "", "TABC_DOCUMENTS_RECEIVED_NOTIFICATION", emailParameters, capId4Email, fileNames);
				//aa.document.sendEmailAndSaveAsDocument(mailFrom, mailTo4, "", "TABC_DOCUMENTS_RECEIVED_NOTIFICATION", emailParameters, capId4Email, fileNames);
				logDebug(altId + ": Sent Email template " + "TABC_DOCUMENTS_RECEIVED_NOTIFICATION" + " to "  + " : " + mailTo1);
			}
}





function setLicExpirationDate(itemCap) {
    //itemCap - license capId
    //the following are optional parameters
    //calcDateFrom - MM/DD/YYYY - the from date to use in the date calculation
    //dateOverride - MM/DD/YYYY - override the calculation, this date will be used
    //renewalStatus - if other than active override the status  


    var licNum = itemCap.getCustomID();

    if (arguments.length == 1) {
        calcDateFrom = null;
        dateOverride = null;
        renewalStatus = null;
    }

    if (arguments.length == 2) {
        calcDateFrom = arguments[1];
        dateOverride = null;
        renewalStatus = null;
    }

    if (arguments.length == 3) {
        calcDateFrom = arguments[1];
        dateOverride = arguments[2];
        renewalStatus = null;
    }

    if (arguments.length == 4) {
        calcDateFrom = arguments[1];
        dateOverride = arguments[2];
        renewalStatus = arguments[3];
    }

    var tmpNewDate = "";
    
    b1ExpResult = aa.expiration.getLicensesByCapID(itemCap);
    
    if (b1ExpResult.getSuccess()) {

        try {
            this.b1Exp = b1ExpResult.getOutput();
            //Get expiration details
            var expUnit = this.b1Exp.getExpUnit();
            var expInterval = this.b1Exp.getExpInterval();
            var expDate = this.b1Exp.getExpDate();

            if (calcDateFrom == null) {
                if (expDate)
                    calcDateFrom = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
            }

        } catch (err) {
            logDebug("Could not set the expiration date, no expiration unit defined for expiration code: " + itemCap + " Error: "+err);
            return false;
        }
 
        if(expUnit == null) {
            logDebug("Could not set the expiration date, no expiration unit defined for expiration code: " + this.b1Exp.getExpCode());
            return false;
        }

        if(expUnit == "Days") {
            tmpNewDate = dateAdd(calcDateFrom, expInterval);
        }

        if(expUnit == "Months") {
            tmpNewDate = dateAddMonths(calcDateFrom, expInterval);
        }

        if(expUnit == "Years") {
            tmpNewDate = dateAddMonths(calcDateFrom, expInterval * 12);
        }
    }

    thisLic = new licenseObject(licNum,itemCap); 

    if(dateOverride == null) {
        thisLic.setExpiration(dateAdd(tmpNewDate,0));
    } else {
        thisLic.setExpiration(dateAdd(dateOverride,0));
    }

    if(renewalStatus != null) {
        thisLic.setStatus(renewalStatus); 
    } else {
        thisLic.setStatus("Active"); 
    }

    logDebug("Successfully set the expiration date and status");

    return true;

}


/* Added by F Benitez 6/23/15 */

function timeStandardToMilitary(time){
    return time.replace(/(\d{1,2})\s*:?\s*(\d{1,2})?\s*(am|pm)/gi, function(string, hour, minute, suffix){
        minute = minute || '00';
        return (+hour + 11)%((suffix.toLowerCase() == 'am') ? 12 : 24)+1+':'+((minute.length === 1) ? minute+'0' : minute);
    });
}

function TNABCgetContactType(LGroup, LType, LSubType, LCateg) 
{
	var contactType = null;

	if (matches(LType, "Liquor by the Drink", "Retail", "Supplier", "Wholesale") && LSubType == "License") 
	{
	contactType = "Business Information";
	}

	if (LType == "Permits" && LSubType == "NA") 
	{
	contactType = "Permittee";
	}

	if (LType == "Education" && LSubType == "Certificate" && matches(LCateg, "RV Trainer", "Server Training Trainer")) 
	{
	contactType = "Applicant-Individual";
	}

	if (LType == "Education" && LSubType == "Certificate" && matches(LCateg, "Server Training Program", "RV Program")) 
	{
	contactType = "Business Information";
	}

	return contactType;
}

/* Added by Laurent Sorrentino, developed by Larry Cooper   06-05-2016      */
/* New client-specific reference contact compare before creation            */


function updateAddressCounty(countyValue) {

    var addResult = aa.address.getAddressByCapId(capId);
	
    if (addResult.getSuccess()) {
    	var addArray = addResult.getOutput();
		
    	for (var jj in addArray) {
    		var thisAddress = addArray[jj];

			thisAddress.setCounty(countyValue);
	    	aa.print("Address County field updated to " + countyValue);
    	}
		var addressUpdate = aa.address.editAddress(thisAddress);
		if (addressUpdate.getSuccess())
			return true;
		else
			return false;
    }
    else {
    	logDebug("Could not return address: " + addResult.getErrorMessage());
    	return false;
    }
}

function updateAltID(newLicId) {
    oldAltID = newLicId.getCustomID();

    // generate the new AltID 
    var newAltID = generateAltID(newLicId);
    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
}

/* ---------------------------------------------------------------------------- */

/* Added by FJB 08-25-15 to remove */


function updateChangeAltID(newLicId) {
    oldAltID = newLicId.getCustomID();

    // generate the new AltID 
    var newAltID = generateChangeAltID(newLicId);
	if (newAltID != null){
		var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
		if (updateCapAltIDResult.getSuccess())
			logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
		else
			logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
	}
	else
		logDebug("**WARNING: ALTID wasn't provided a value to be changed");
}

// FA 03-07-2016 modify given table field with the value provided

function updateEnforcementAltID(newLicId) {
    oldAltID = newLicId.getCustomID();

    // generate the new AltID 
    var newAltID = generateEnforcementAltID(newLicId);
    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
}

/* ----- FJB Added 2/18/2016 for Change control records    ---- */
/*                                                              */

function updatePermitAltID(newLicId) {
    oldAltID = newLicId.getCustomID();

    // generate the new AltID 
    var newAltID = generatePermitAltID(newLicId);
    var updateCapAltIDResult = aa.cap.updateCapAltID(newLicId, newAltID);
    if (updateCapAltIDResult.getSuccess())
        logDebug(newLicId + " AltID changed from " + oldAltID + " to " + newAltID);
    else
        logDebug("**WARNING: AltID was not changed from " + oldAltID + " to " + newAltID + ": " + updateCapAltIDResult.getErrorMessage());
}



function validateControlNumber(cntrlNum) {
    var wsdl = "https://rlpsdev.abc.tn.gov/TABCSOS/ServiceTABCSOS.svc?wsdl";    
	var method = "GetBusinessEntityInfo";
    var my_array = new Array();
    my_array[0] = cntrlNum; //"000221622";

    var res = aa.wsConsumer.consume(wsdl, method, my_array);
    if (res.getSuccess()) {
        var result = res.getOutput();
        logDebug("Success:" + result[0]);
		return result[0];
        //aa.env.setValue("ScriptReturnCode", "0");
        //aa.env.setValue("ScriptReturnMessage", result);
    } else {
        logDebug("NOT Success:");
        aa.env.setValue("ScriptReturnCode", "-1");
        aa.env.setValue("ScriptReturnMessage", res.getErrorMessage());
    }
}


function validateLicenseRules4Expression(){
	var restrictedTypes = checkLicenseRestrictions4Expression();
	var requiredTypes = checkLicenseRequirements4Expression();
	if(restrictedTypes){
		msg += "The " + appTypeAlias + " does not allow you to concurrently hold a " + restrictedTypes +". " + br + br;
	}
	if(requiredTypes){
		if(requiredTypes == "Missing Valid License Number"){
			msg += "The " + appTypeAlias + " requires a valid ID Number." + br + br;
		}
		else{
			msg += "The " + appTypeAlias + " requires at least one of the following: " + requiredTypes +"." + br + br;
		}
	}
	
	if(!isEmpty(msg)){
		msg += " Contact TABC at TABC_RLPS.Licensing@tn.gov if you have additional questions.";
		return msg;
	}
	else{
		return false;
	}
}


