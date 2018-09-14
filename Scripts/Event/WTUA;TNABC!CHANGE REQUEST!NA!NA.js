//deactivate WTUA:TNABC/Change Request/DBA Owner/*

// TODO: disabled try/catch since all MS 3.0 scripts execute in a try/catch
//try {
if (wfTask.equals("Application Review") && wfStatus.equals("Refused"))
	branchTask("Commission Agenda", "Refused", "Updated via EMSE", "");

if (isTaskActive("Change Status"))
	closeTask("Change Status", wfStatus, "Updated via EMSE", "");

//} catch (err) {
//	logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
//}
