try {

	var capIDScriptModel = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
	var examPassed = false;

	//business process: create record; enter exam; process workflow........
	if (wfTask.equals("Preliminary Review") && wfStatus.equals("Approved")) {
		var didExamPass = getCapExamStatus(examPassed);
		if (didExamPass) {
			var asiLicenseCounty = AInfo["County"];

			comment("Permit COUNTY =  " + asiLicenseCounty);

			if (asiLicenseCounty != null) {
				var spExpireDate = dateAddMonths(null, 60);
				var contactType = TNABCgetContactType("TNABC", "Permits", "NA", "Server");
				spCapId = createPermit("TNABC", "Permits", "NA", "Server", "", "Active", true, false, contactType, false, "", asiLicenseCounty);

				logDebug("Server Permit Expiration Date: " + spExpireDate);

				holdId = capId;
				capId = spCapId;

				copyASIFields(holdId, capId);
				editAppName("Created from Application #" + capIDString);
				updateTask("Permit Status", "Active", "Updated via EMSE Script", "");
				licEditExpInfo("Active", spExpireDate);

				capId = holdId;

				spTemplateName = "TABC_LICENSE_APPROVAL";
				sendNotificationToContactTypes("Permittee", spTemplateName);

				closeTask("Application Status", "Issued", "Updated via Exam Upload Script", "");

			}
		}
	}
} catch (err) {
	aa.print("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
}

aa.print("Final Result: " + didExamPass);

function getCapExamStatus(examPassed) {
	var examListResult = aa.examination.getExaminationList(capIDScriptModel);

	if (examListResult.getSuccess) {
		examList = examListResult.getOutput();
		aa.print(examList.length);

		for (eL in examList) {
			//objectExplore(examList[eL]);
			thisExam = examList[eL].getExaminationModel();
			examStatus = thisExam.getFinalScore();
			examPassing = thisExam.getPassingScore();
			aa.print("Status: " + examStatus);
			aa.print("Passing: " + examPassing);

			if (examStatus != null && Number(examStatus) >= Number(examPassing)) {
				examPassed = true;
				aa.print("Pass it");
			} else
				aa.print("Don't");
		}
	}
	aa.print("ExamPassed: " + examPassed);
	return examPassed;
}
