
if (capStatus != null && capStatus.equals('Additional Info Required')) {
	if (isTaskActive('Preliminary Review') && taskStatus('Preliminary Review').equals('Additional Info Required'))
		updateTask('Preliminary Review', 'Additional Docs Submitted', '', '');
	if (isTaskActive('Investigative Review') && taskStatus('Investigative Review').equals('Additional Info Required'))
		updateTask('Investigative Review', 'Additional Docs Submitted', '', '');
}
