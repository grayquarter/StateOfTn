
if (matches(appTypeArray[3], 'Special Occasion', 'Self-Distribution', 'RV Trainer') && balanceDue == 0 && wfTask == 'Application Review' && wfStatus == 'Approved') {
	closeTask('Application Status', 'Issued', 'Updated via EMSE', '');
	eval(getScriptText('WorkflowTaskUpdateAfter4Renew', null, false));
}

// DISABLED: WTUA:TNABC/*/Renewal/*:01a
// if (((!matches(appTypeArray[3],'Server Training Program','Server Training Trainer')) || appTypeArray[3].equals('Self-Distribution'))  && wfTask == 'Application Review' && wfStatus == 'Approved') {
// 	closeTask('Application Status','Issued','Updated via EMSE','');
// 	aa.runScriptInNewTransaction('WorkflowTaskUpdateAfter4Renew');
// 	}

// DISABLED: WTUA:TNABC/*/Renewal/*:02
// if ((appTypeArray[1].equals('Education') && !appTypeArray[3].equals('Server Training Trainer') || appTypeArray[3].equals('Self-Distribution')) && wfTask == 'Application Review' && wfStatus == 'Approved') {
// 	closeTask('Application Status','Issued','Updated via EMSE','');
// 	aa.runScriptInNewTransaction('WorkflowTaskUpdateAfter4Renew');
// 	}

// DISABLED: WTUA:TNABC/*/Renewal/*:03
// if (((appTypeArray[1].equals('Education') && !appTypeArray[3].equals('Server Training Program')) || appTypeArray[3].equals('Self-Distribution'))  && wfTask == 'Application Review' && wfStatus == 'Approved') {
// 	closeTask('Application Status','Issued','Updated via EMSE','');
// 	aa.runScriptInNewTransaction('WorkflowTaskUpdateAfter4Renew');

// TODO: conversion issue, criteria is disabled but continuation line is enabled.  commenting out for now.

/*

itemCap = getParentCapID4Renewal();
saveCap = capId;
capId = itemCap;

//replaced branch(TABC_Create_Individual_Licenses_5)
createIndividualLicenses5();
capId = saveCap;
}

*/