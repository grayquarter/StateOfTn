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
