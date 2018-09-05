
if (matches(wfTask, 'Preliminary Review', 'Investigative Review') && wfStatus.equals('Additional Info Required')) {
	assignTask(wfTask, currentUserID);
}

if (wfTask.equals('Application Status') && wfStatus.equals('Issued')) {
	addCertifiedManagers();
}
