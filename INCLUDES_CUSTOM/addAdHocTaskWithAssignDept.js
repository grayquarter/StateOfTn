function addAdHocTaskWithAssignDept(adHocProcess, adHocTask, adHocNote)
{
//adHocProcess must be same as one defined in R1SERVER_CONSTANT
//adHocTask must be same as Task Name defined in AdHoc Process
//adHocNote can be variable
//Optional 4 parameters = Assigned to Depart Name
//Optional 5 parameters = CapID
	var thisCap = capId;
	var thisDepart = null;
	if(arguments.length > 3)
		thisDepart = arguments[3]
	if(arguments.length > 4)
		thisCap = arguments[4];

	if (thisDepart)
	{
		var departSplits = thisDepart.split("/");
		//var assignedUser = aa.person.getUser(null,null,null,null,departSplits[0],departSplits[1],departSplits[2],departSplits[3],departSplits[4],departSplits[5]).getOutput();
	}
	else
	{
		var assignedUser = aa.person.getCurrentUser().getOutput();	
		assignedUser.setFirstName(null);
		assignedUser.setLastName(null);
		assignedUser.setMiddleName(null);
	}	
	
	var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem()
	taskObj.setProcessCode(adHocProcess);
	taskObj.setTaskDescription(adHocTask);
	taskObj.setDispositionNote(adHocNote);
	taskObj.setProcessID(0);
	taskObj.setAssignmentDate(aa.util.now());
	taskObj.setDueDate(aa.util.now());
	//taskObj.setAssignedUser(assignedUser);
	wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
	wf.createAdHocTaskItem(taskObj);
	return true;
}
