function scheduleInspectDateWGroup(inspGroup,iType,DateToSched) // optional inspector ID.  This function requires dateAdd function
{
	logDebug("begin schedule inspection : " + iType + " for " + DateToSched);
	var inspectorObj = null;
	if (arguments.length == 4) 
		{
		var inspRes = aa.person.getUser(arguments[3])
		if (inspRes.getSuccess())
			inspectorObj = inspRes.getOutput();
		}
	var inspModelRes = aa.inspection.getInspectionScriptModel();
	if (inspModelRes.getSuccess()){
		logDebug("Successfully get inspection model: " + iType + " for " + DateToSched);
		var inspModelObj = inspModelRes.getOutput().getInspection();
		var inspActivityModel = inspModelObj.getActivity();
		inspActivityModel.setCapID(capId);
		inspActivityModel.setSysUser(inspectorObj);
		inspActivityModel.setActivityDate(aa.util.parseDate(DateToSched));
		inspActivityModel.setActivityGroup("Inspection");
		inspActivityModel.setActivityType(iType);
		inspActivityModel.setActivityDescription(iType);
		inspActivityModel.setRecordDescription("");
		inspActivityModel.setRecordType("");
		inspActivityModel.setDocumentID("");
		inspActivityModel.setDocumentDescription('Insp Scheduled');
		inspActivityModel.setActivityJval("");
		inspActivityModel.setStatus("Scheduled");
		inspActivityModel.setTime1(null);
		inspActivityModel.setAuditID(currentUserID);
		inspActivityModel.setAuditStatus("A");
		inspActivityModel.setInspectionGroup(inspGroup);
		

		var inspTypeResult = aa.inspection.getInspectionType(inspGroup,iType);
		if (inspTypeResult.getSuccess() && inspTypeResult.getOutput())
		{
			if(inspTypeResult.getOutput().length > 0)
			{
				inspActivityModel.setCarryoverFlag(inspTypeResult.getOutput()[0].getCarryoverFlag()); //set carryoverFlag
				inspActivityModel.setActivityDescription(inspTypeResult.getOutput()[0].getDispType());
				inspActivityModel.setInspectionGroup(inspTypeResult.getOutput()[0].getGroupCode());
				inspActivityModel.setRequiredInspection(inspTypeResult.getOutput()[0].getRequiredInspection());
				inspActivityModel.setUnitNBR(inspTypeResult.getOutput()[0].getUnitNBR());
				inspActivityModel.setAutoAssign(inspTypeResult.getOutput()[0].getAutoAssign());
				inspActivityModel.setDisplayInACA(inspTypeResult.getOutput()[0].getDisplayInACA());
				inspActivityModel.setInspUnits(inspTypeResult.getOutput()[0].getInspUnits());
			}
		}

		inspModelObj.setActivity(inspActivityModel);
		
		var schedRes = aa.inspection.scheduleInspection(inspModelObj,systemUserObj);

		if (schedRes.getSuccess())
			logDebug("Successfully scheduled inspection : " + iType);
		else
			logDebug( "**ERROR: scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}else{
		logDebug( "**ERROR: getting  inspection model  " );
	}
	
}

