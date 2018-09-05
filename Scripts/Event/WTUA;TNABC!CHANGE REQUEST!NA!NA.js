//deactivate WTUA:TNABC/Change Request/DBA Owner/*

showDebug=true;
showMessage=true;

try{
if (wfTask.equals("Application Review") && wfStatus.equals("Refused"))
	branchTask("Commission Agenda","Refused","Updated via EMSE","");

if (isTaskActive("Change Status"))
	closeTask("Change Status",wfStatus,"Updated via EMSE","");

}
catch (err) {
            logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
            }