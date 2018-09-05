function autoAssign(wfTask, department) {
	var stdChoiceVal = wfTask; //just use a standard choice value that matches the task name
	var assignTo = Number(lookup("StdChoiceNext_TaskAssign", stdChoiceVal));
	aa.print("Looking for #: " + assignTo);
	var assignNext = 0;
	var userList = new Array();
	logDebug(department);
	//get the users in the department
	var deptObj = aa.people.getSysUserListByDepartmentName(department);
	var deptUsers = deptObj.getOutput();

	//build an array of user IDs
	for (du in deptUsers) {
		duList = deptUsers[du];

		//aa.print(du + " - " + deptUsers[du]+ ": " + duList.userID);
		//aa.print("User Status= " + duList.userStatus);

		//for (xl in duList)
		//aa.print(xl + " : + " + duList[xl]);

		if (duList.userStatus != "DISABLE") {
			userList.push(duList.userID);
			logDebug(" User - " + deptUsers[du] + ": " + duList.userID + " Added");
		}
	}
	logDebug("Department has " + userList.length + " Users in the group");

	//make sure still in the bounds of the array and assign
	if (userList.length > assignTo) {
		var assgnUser = userList[assignTo];
		assignNext = assignTo + 1;
	} else {
		//if outside the bounds of the array, return to the beginning.
		var assgnUser = userList[0];
		assignNext = 1;
	}
	//assign the task
	assignTask(wfTask, assgnUser);
	//assignCap(assgnUser);
	logDebug("Assigning Task to # " + assignTo + " in the list: " + assgnUser);

	//update the standard choice value
	editLookup("StdChoiceNext_TaskAssign", stdChoiceVal, assignNext);
}
