
if (appMatch('TNABC/Liquor by the Drink/Application/*') && isTaskStatus('Application Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information,Business Representative', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Liquor by the Drink/Renewal/*') && isTaskStatus('Renewal Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information, Business Representative', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Retail/Application/*') && isTaskStatus('Application Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information,Business Representative', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Retail/Renewal/*') && isTaskStatus('Renewal Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information, Business Representative', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Supplier/Application/*') && isTaskStatus('Application Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information,Business Representative', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Supplier/Renewal/*') && isTaskStatus('Renewal Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information, Business Representative', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Wholesale/Application/*') && isTaskStatus('Application Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information,Business Representative', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Wholesale/Renewal/*') && isTaskStatus('Renewal Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information, Business Representative', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Education/Application/*') && isTaskStatus('Application Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information,Business Representative,Applicant-Individual', 'TABC_LICENSE_FEE_NOTIFICATION');
}

if (appMatch('TNABC/Education/Renewal/*') && isTaskStatus('Renewal Status', 'Ready for Issuance')) {
	sendFeeNotificationToContactTypes('Business Information, Business Representative,Applicant-Individual', 'TABC_LICENSE_FEE_NOTIFICATION');
}
