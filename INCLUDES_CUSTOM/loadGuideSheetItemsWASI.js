function loadGuideSheetItemsWASI(inspId) {
	//
	// Returns an associative array of Guide Sheet Items
	// Optional second parameter, cap ID to load from
	//
	var retArray = new Array()
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var r = aa.inspection.getInspections(itemCap)

	if (r.getSuccess()){
		var inspArray = r.getOutput();
		for (i in inspArray){
			if (inspArray[i].getIdNumber() == inspId){
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets()
				if (gs){
					gsArray = gs.toArray();
					for (var loopk in gsArray){
						logDebug("Guidesheet: " + gsArray[loopk].getGuideType());
						var gsItems = gsArray[loopk].getItems().toArray()
						for (var loopi in gsItems){
							gsi = gsItems[loopi];
							logDebug("  Guidesheet Item: " + gsi.getGuideItemText() );
							logDebug("     Status = " + gsi.getGuideItemStatus());

							var itemASISubGroupList = gsi.getItemASISubgroupList();
							//If there is no ASI subgroup, it will throw warning message.
							if(itemASISubGroupList != null) //&& gsi.getGuideItemText()=="Click the View Form button to the right to complete remaining questions")
							{
								var asiSubGroupIt = itemASISubGroupList.iterator();
								while(asiSubGroupIt.hasNext())
								{
									var asiSubGroup = asiSubGroupIt.next();
									var asiItemList = asiSubGroup.getAsiList();
									if(asiItemList != null)
									{
										var asiItemListIt = asiItemList.iterator();
										while(asiItemListIt.hasNext())
										{
											var asiItemModel = asiItemListIt.next();
											logDebug("        " + asiItemModel.getAsiName() + " = " + asiItemModel.getAttributeValue());
											retArray[asiItemModel.getAsiName()] = asiItemModel.getAttributeValue();
										}
									}
								}
							}
							//else
								//aa.print("ERROR: Cannot find the ASI subgroup for guidesheet item " + itemASISubGroupList);
						}
					}
				} // if there are guidesheets
				else
					logDebug("No guidesheets for this inspection");
			} // if this is the right inspection
		} // for each inspection
	} // if there are inspections

	logDebug("loaded " + retArray + " guidesheet items");
	return retArray;
}
