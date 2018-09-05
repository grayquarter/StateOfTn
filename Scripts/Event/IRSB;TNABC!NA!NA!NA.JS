//Developer: Chris Kim
//05/10/2018
//IRSB
//Purpose: To prevent inspections being completed before Investigative Review and Citizenship Verification is completed.

//Step 1: We need to pull current active workflow status from the cap. We most likely need to use a Javadoc function.
 //Step 1a: Get Task Object: 
        
		//No need to iterate if we know the first 2 workflow tasks are the ones we need. Selecting first and second index.
	    var invRevDesc = aa.workflow.getTasks(capId).getOutput()[0].getTaskItem().getTaskDescription();
		var invRevActive = aa.workflow.getTasks(capId).getOutput()[0].getTaskItem().getActiveFlag();
		var citiDesc = aa.workflow.getTasks(capId).getOutput()[1].getTaskItem().getTaskDescription();
	    var citiActive = aa.workflow.getTasks(capId).getOutput()[1].getTaskItem().getActiveFlag();
		
//Step 2: Check to see if status is active
        if(invRevDesc == "Investigative Review" && invRevActive == 'Y' || citiDesc =="Citizenship Verification" && citiActive =='Y'){
			cancel=true;
			showMessage=true;
			comment("Inspections cannot be completed before Investigative Review/Citizenship Verification is completed in the workflow.");

		}