function applicationUpdateStatus() {

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Revision Accepted') {
		updateTask('Application Review', 'Revision Review');
	}

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted') {
		updateTask('Application Review', 'Pending Review');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:03
	// if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Approved') {
	// 	updateTask('Application Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Revision Required') {
		updateTask('Preliminary Review', 'Revision Required');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted' && isTaskStatus('Investigative Review', 'Accepted')) {
		updateTask('Application Review', 'Pending Review');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Investigative Review' && wfStatus == 'Accepted' && isTaskStatus('Preliminary Review', 'Accepted')) {
		updateTask('Application Review', 'Pending Review');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Refused') {
		updateTask('Refused for Commission', 'Refused');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Application Review' && (wfStatus == 'Recommend Approval' || wfStatus == 'Recommend Denial')) {
		updateTask('Commission Agenda', 'Ready For Agenda');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Agenda' && wfStatus == 'On Agenda') {
		updateTask('Commission Meeting', 'Ready For Commission');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Approval Required') {
		updateTask('Investigative Review', 'Approval Required');
		updateTask('Citizenship Verification', 'Approval Required');
	}

	if (wfProcess == 'TABC_ENF_E1_PROCESS' && wfTask == 'Execution' && wfStatus == 'Operation Complete') {
		updateTask('Post Operation Review', 'Ready for Review');
	}

	if (wfProcess == 'TABC_ENF_E1_PROCESS' && wfTask == 'Planning' && wfStatus == 'Plan Approval') {
		updateTask('Execution', 'Ready for Execution');
	}

	if (wfProcess == 'TABC_ENF_S1_PROCESS' && wfTask == 'Investigation' && wfStatus == 'Regulatory Citation Issued') {
		updateTask('Regulatory', 'Pending Resolution');
	}

	if (wfProcess == 'TABC_ENF_S1_PROCESS' && wfTask == 'Investigation' && wfStatus == 'Criminal Citation Issued') {
		updateTask('Criminal', 'Pending Case Registration');
	}

	if (wfProcess == 'TABC_ENF_S1_PROCESS' && wfTask == 'Regulatory' && wfStatus == 'Appeal') {
		updateTask('ALJ Hearing', 'Awaiting Hearing');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Complete') {
		updateTask('SAC Review', 'Pending Review');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'SAC Review' && wfStatus == 'Assigned') {
		updateTask('Investigation', 'Pending Investigation');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'Investigation' && wfStatus == 'Citation Issued Regulatory') {
		updateTask('Regulatory', 'Pending Resolution');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'Investigation' && wfStatus == 'Citation Issued Non Regulatory') {
		updateTask('Non Regulatory', 'Pending Case Registration');
	}

	if (wfProcess == 'TABC_ENF_S3_PROCESS' && wfTask == 'Regulatory' && wfStatus == 'Appeal') {
		updateTask('ALJ Hearing', 'Awaiting Hearing');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:21
	// if (wfProcess == 'TABC_EDU_SCH6_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted') {
	// 	updateTask('Schedule Status','Review Complete');
	// 	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:22
	// if (wfProcess == 'TABC_EDU_APP6_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Approved') {
	// 	updateTask('Schedule Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_EDU_APP6_PROCESS' && wfTask == 'Reliminary Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_EDU_APP5_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted') {
		updateTask('Application Review', 'Ready for Review');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:25
	// if (wfProcess == 'TABC_EDU_APP5_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Approved') {
	// 	updateTask('Application Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_EDU_APP5_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_EDU_ROS7_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Accepted') {
		updateTask('Roster Status', 'Review Complete');
	}

	if (wfProcess == 'TABC_EDU_ROS7_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Denied') {
		updateTask('Roster Status', 'Denied');
	}

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Application Review' && wfStatus == 'Revision Required') {
		updateTask('Preliminary Review', 'Revision Required');
	}

	if (wfProcess == 'TABC_APP1_PROCESS' && wfTask == 'Application Status' && wfStatus == 'Reconsideration') {
		updateTask('Application Review', 'Revision Review');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Refused for Commission' && wfStatus == 'Reconsideration') {
		updateTask('Application Review', 'Pending Review');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Meeting' && wfStatus == 'Reschedule') {
		updateTask('Commission Agenda', 'Ready for Agenda');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Meeting' && wfStatus == 'Approved') {
		updateTask('Application Status', 'Ready for Issuance');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Meeting' && wfStatus == 'Approved with Conditions') {
		updateTask('Application Status', 'Pending Approval');
	}

	if (wfProcess == 'TABC_APP2_PROCESS' && wfTask == 'Commission Meeting' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:38
	// if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Approved') {
	// 	updateTask('Application Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Citizenship Verification' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Investigative Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Citizenship Verification' && wfStatus == 'Approved') {
		updateTask('Preliminary Review', 'Submitted');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Investigative Review' && wfStatus == 'Approved') {
		updateTask('Preliminary Review', 'Submitted');
	}

	if (wfProcess == 'TABC_PER_APP3_PROCESS' && wfTask == 'Investigative Review' && wfStatus == 'Denied with Conditions') {
		updateTask('Preliminary Review', 'Denied with Conditions');
	}

	// DISABLED: WTUA:TNABC/*/Application/* Update Status:44
	// if (wfProcess == 'TABC_PER_APP4_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Approved') {
	// 	updateTask('Application Status','Ready for Issuance');
	// 	}

	if (wfProcess == 'TABC_PER_APP4_PROCESS' && wfTask == 'Preliminary Review' && wfStatus == 'Denied') {
		updateTask('Application Status', 'Denied');
	}

}
