function getInspNum(){
	
	var inspId = 0;
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();

		for (xx in inspList)
			if (matches(inspList[xx].getInspectionType(),"New License Inspection","Follow-up Inspection","Renewal Inspection") && matches(inspList[xx].getInspectionStatus(),"Passed","Pass","Correct Onsite-Citation Issued"))
				{
				inspId = inspList[xx].getIdNumber();
				}
		}
	return inspId;
}

