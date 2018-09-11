// TODO is this file name correct?

try {

	var capIDScriptModel = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
	var examPassed = false;

	//business process: create record; enter exam; process workflow........
	if (wfTask.equals("Preliminary Review") && wfStatus.equals("Approved")) {
		var outStateExam = AInfo["Class Out of State"];
		var didExamPass = getCapExamStatus(examPassed);
		if (!didExamPass && outStateExam == "Yes") {
			showMessage = true;
			comment("This review cannot be approved;  A passing exam does not exist.  Please complete the exam information before Approving the Preliminary Review");
			cancel = true;
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
