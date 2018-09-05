function addSpcOccEventAsParent(soEvntTrackerAlt) {

	contNumResult = new Array();
	conNumResultArray = new Array();

	contNumResult = aa.cap.getCapIDsByAppSpecificInfoField("Secretary of State Control Number", soEvntTrackerAlt);
	if (contNumResult.getSuccess())
		conNumResultArray = contNumResult.getOutput();

	aa.print("Found " + conNumResultArray.length);

	if (conNumResultArray.length > 0) {
		for (sos in conNumResultArray) {
			sEcapObj = conNumResultArray[sos];
			sEcapId = sEcapObj.getCapID();
			sEaltCapId = aa.cap.getCapID(sEcapId.getID1(), sEcapId.getID2(), sEcapId.getID3()).getOutput();
			sEcapIDString = sEaltCapId.getCustomID();
			sEcap = aa.cap.getCap(sEcapId).getOutput();
			sEcapStatus = sEcap.getCapStatus();
			sEappTypeResult = null;
			sEappTypeString = "";
			sEappTypeArray = new Array();

			sEappTypeResult = sEcap.getCapType();
			sEappTypeString = sEappTypeResult.toString();
			sEappTypeArray = sEappTypeString.split("/");

			if (!sEappTypeString.equals("TNABC/Liquor by the Drink/Event/Special Occasion Tracking"))
				continue;

			if (!sEcapStatus.equals("Active"))
				continue;

			aa.print("Found Active Special Occasion Tracking record for control " + soEvntTrackerAlt + " adding it as parent");
			aa.cap.createAppHierarchy(sEcapId, capId);
		}
	}
}
