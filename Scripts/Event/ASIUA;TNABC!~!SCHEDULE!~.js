scheduleExamViaASIT();

params = aa.util.newHashtable();
parameters = aa.util.newHashMap();
parameters.put("altID", capId.getCustomID());

acaUrl = "https://rlps.abc.tn.gov/citizenaccess/";
getRecordParams4Notification(params);
getACARecordParam4Notification(params, acaUrl);

contactArray = new Array();
contactArray = getContactArray();
getContactParams4Notification(params, "Applicant-Individual");
var educSchRpt = new Array();
//reportPath = generateReport(capId,"Education Schedule","TABC",parameters);
//educSchRpt.push(reportPath);
sendNotification("noreply.abc@tn.gov", "", "", "TABC_EDUCATION_SCHEDULE_STATUS", params, null);

var allApp = true;
if (SCHEDULEINFO.length > 0) {
	for (sd in SCHEDULEINFO) {
		if (SCHEDULEINFO[sd]["Schedule Status"] == "Submitted") {
			allApp = false;
			logDebug("And the class START TIME IS: " + String(SCHEDULEINFO[sd]["Start Time"]));
		}
	}

	if (allApp)
		updateAppStatus("Closed", "Updated via EMSE");
}
