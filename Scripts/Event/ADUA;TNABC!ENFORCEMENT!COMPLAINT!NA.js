if (!isScheduled("Random Inspection")) {

	var cdScriptObjResult = aa.cap.getCapDetail(capId);

	var cdScriptObj = cdScriptObjResult.getOutput();

	cd = cdScriptObj.getCapDetailModel();

	var enfOff = cd.getEnforceOfficerName();

	aa.print("ENF: " + enfOff);

	scheduleInspectDateWGroup("TABC-Random", "Random Inspection", dateAdd(null, 30), enfOff);

}
