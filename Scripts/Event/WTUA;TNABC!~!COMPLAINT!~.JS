
if (wfTask == 'SAC Review' && (wfStatus == 'No Jurisdiction' || wfStatus == 'Unsubstantiated')) {
	sendNotificationToContactTypes('Complainant', 'TABC_COMPLAINT_DISPOSITION_NOTIFICATION');
}

if (wfTask == 'Investigation' && (wfStatus == 'Closed' || wfStatus == 'Unsubstantiated' || wfStatus == 'Citation Issued Regulatory' || wfStatus == 'Citation Issued Non Regulatory')) {
	sendNotificationToContactTypes('Complainant','Contact', 'TABC_COMPLAINT_DISPOSITION_NOTIFICATION');
}

//replaced branch(WTUA:TNABC/*/Application/* Update Status)
applicationUpdateStatus();
