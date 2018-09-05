function addCertifiedManagers(prntCapId){
	if (typeof(CERTIFIEDMANAGERLIST) == "object" && CERTIFIEDMANAGERLIST.length >0){
		for (cm in CERTIFIEDMANAGERLIST){
			var desMangStatus = CERTIFIEDMANAGERLIST[cm]["Change Status"];
			var cmCapIDString = CERTIFIEDMANAGERLIST[cm]["Certified Manager RLPS ID"];
			if(desMangStatus == "Active"){				
				var getCapResult = aa.cap.getCapID(cmCapIDString);
				if (getCapResult.getSuccess()){
					var cmId = getCapResult.getOutput();
					var linkResult = aa.cap.createAppHierarchy(prntCapId,cmId);
					if (linkResult.getSuccess())
						logDebug("Successfully linked Certified Manager : " + cmCapIDString + " as a related record");
					else
						logDebug( "**ERROR: linking to parent application parent cap id (" + cmCapIDString + "): " + linkResult.getErrorMessage());
				}
			}
		}
	}
}

