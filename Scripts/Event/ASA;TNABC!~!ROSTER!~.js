
updateAppStatus('Submitted', 'Initial submission');
updateTask('Preliminary Review', 'Submitted');
if (AInfo['Schedule ID']) {
	addParent(AInfo['Schedule ID']);
}

if (appMatch('TNABC/Education/Roster/NA')) {
	applyadditionalpenalty();
}
