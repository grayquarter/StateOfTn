
// DISABLED: WTUA:TNABC/*/*/*:00
// showDebug=true;
// showMessage=true;
// DISABLED: WTUA:TNABC/*/*/*:01
// if (wfStatus == 'Appeal') {
// 	LICcomm = 'Created from Application # ' + capIDString;
// 	br_nch('TABC_Create_Appeal_Record');
// 	}

// DISABLED: WTUA:TNABC/*/*/*:02
// if (wfStatus == 'Appeal') {
// 	email('Coty.Shadowens@tn.gov', 'autosender@agency.com', 'Appealed Record ' +capIDString, 'An appeal has been submitted for your attention ' + capIDString + '.  Please review and prepare for hearing.');
// 	}

// DISABLED: WTUA:TNABC/*/*/*:03
// if (wfTask == 'Preliminary Review'  && wfStatus == 'Additional Info Required') {
// 	sendNotificationToContactTypes('Business Information,Complainant,Applicant-Individual,Permittee', 'TABC_ADDITIONAL_INFO_REQUIRED');
// 	}

if (wfTask == 'Preliminary Review' && wfStatus == 'Additional Info Required') {
	sendNotificationToContactTypes('Business Information,Business Representative,Complainant,Applicant-Individual,Permittee', 'TABC_ADDITIONAL_INFO_REQUIRED');
}

// DISABLED: WTUA:TNABC/*/*/*:04
// if (wfTask == 'Investigative Review'  && wfStatus == 'Additional Info Required') {
// 	sendNotificationToContactTypes('Business Information,Complainant,Applicant-Individual,Permittee', 'TABC_ADDITIONAL_INFO_REQUIRED');
// 	}

if (wfTask == 'Investigative Review' && wfStatus == 'Additional Info Required') {
	sendNotificationToContactTypes('Business Information,Business Representative,Complainant,Applicant-Individual,Permittee', 'TABC_ADDITIONAL_INFO_REQUIRED');
}

// DISABLED: WTUA:TNABC/*/*/*:05
// if (wfTask == 'Commission Agenda'  && wfStatus == 'Additional Info Required') {
// 	sendNotificationToContactTypes('Business Information,Complainant,Applicant-Individual,Permittee', 'TABC_ADDITIONAL_INFO_REQUIRED');
// 	}

if (wfTask == 'Commission Agenda' && wfStatus == 'Additional Info Required') {
	sendNotificationToContactTypes('Business Information,Business Representative,Complainant,Applicant-Individual,Permittee', 'TABC_ADDITIONAL_INFO_REQUIRED');
}

// DISABLED: WTUA:TNABC/*/*/*:06
// if (wfTask == 'Refund Status'  && wfStatus == 'Additional Info Required') {
// 	sendNotificationToContactTypes('Business Information,Complainant,Applicant-Individual,Permittee', 'TABC_ADDITIONAL_INFO_REQUIRED');
// 	}

if (wfTask == 'Refund Status' && wfStatus == 'Additional Info Required') {
	sendNotificationToContactTypes('Business Information,Business Representative,Complainant,Applicant-Individual,Permittee', 'TABC_ADDITIONAL_INFO_REQUIRED');
}

// DISABLED: WTUA:TNABC/*/*/*:08
// if (wfTask == 'Commission Meeting'  && wfStatus == 'Approved') {
// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee', 'TABC_LICENSE_APPROVAL');
// 	}

if (wfTask == 'Commission Meeting' && wfStatus == 'Approved') {
	sendNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual,Permittee', 'TABC_LICENSE_APPROVAL');
}

// DISABLED: WTUA:TNABC/*/*/*:09
// if (wfTask == 'Commission Meeting'  && wfStatus == 'Approved with Conditions') {
// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee', 'TABC_LICENSE_APPROVAL');
// 	}

// DISABLED: WTUA:TNABC/*/*/*:11
// if (wfTask == 'Application Review'  && wfStatus == 'Denied') {
// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
// 	}

if (wfTask == 'Application Review' && wfStatus == 'Denied') {
	sendNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
}

// DISABLED: WTUA:TNABC/*/*/*:12
// if (wfTask == 'Commission Meeting'  && wfStatus == 'Denied') {
// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
// 	}

if (wfTask == 'Commission Meeting' && wfStatus == 'Denied') {
	sendNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
}

// DISABLED: WTUA:TNABC/*/*/*:13
// if (wfTask == 'Preliminary Review'  && wfStatus == 'Denied') {
// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
// 	}

if (wfTask == 'Preliminary Review' && wfStatus == 'Denied') {
	sendNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
}

// DISABLED: WTUA:TNABC/*/*/*:14
// if (wfTask == 'Citizenship Verification'  && wfStatus == 'Denied') {
// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
// 	}

if (wfTask == 'Citizenship Verification' && wfStatus == 'Denied') {
	sendNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
}

// DISABLED: WTUA:TNABC/*/*/*:15
// if (wfTask == 'Investigative Review'  && wfStatus == 'Denied') {
// 	sendNotificationToContactTypes('Business Information,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
// 	}

if (wfTask == 'Investigative Review' && wfStatus == 'Denied') {
	sendNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual,Permittee', 'TABC_LICENSE_DENIED');
}
