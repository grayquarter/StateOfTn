function getSpecOcc(soLCapId){
	/* Special Occasion criteria:

	One 24 Hour period

	Non-Profit Special Occasion - 12
	Political Special Occasion - 12
	Alcoholic Beverage Festival - 15
	Wine Festival - 12
	*/

	aa.print("Starting:");
	var tOOc = 0;
	maxEventsMet = false;

	var soParent = new Array();
	
	soParent = getParents("TNABC/Liquor by the Drink/Event/Special Occasion Tracking");
	
	aa.print("PARENT: " + soParent.length);
	
	for (x in soParent)
		aa.print("Parent: " + soParent[x]);
	
	
	if (soParent.length > 0)
		var soEvntTrackerCapID = soParent[0];
	else{
		holdId = capId;
		capId = soLCapId;
		
		appNameSoS = sysDate.getYear() + "-" + AInfo['Secretary of State Control Number'];
		aa.print("Tracker App Name is: "+ appNameSoS);
		
		var soEvntTrackerCapID = createParent("TNABC","Liquor by the Drink","Event","Special Occasion Tracking",appNameSoS);
		capId = soEvntTrackerCapID;

		editAppSpecific("Total Wine Events Held",0,soEvntTrackerCapID);
		editAppSpecific("Total Non Profit Events Held",0,soEvntTrackerCapID);
		editAppSpecific("Total Political Events Held",0,soEvntTrackerCapID);
		editAppSpecific("Total Alcoholic Festival Events Held",0,soEvntTrackerCapID);
		
		licEditExpInfo ("Active", "12/31/"+sysDate.getYear());
		copyASIFields(holdId,soEvntTrackerCapID,"SPECIAL OCCASION INFORMATION");
		
		capId = holdId;
	}

		var ttlNPftEvnts = getAppSpecific("Total Non Profit Events Held",soEvntTrackerCapID);
		aa.print("ttlNPftEvnts: " + ttlNPftEvnts);
		
		var ttlPolEvnts = getAppSpecific("Total Political Events Held",soEvntTrackerCapID);
		aa.print("ttlPolEvnts: " + ttlPolEvnts);
		
		var ttlWinEvnts = getAppSpecific("Total Wine Events Held",soEvntTrackerCapID);
		aa.print("ttlWinEvnts: " + ttlWinEvnts);
		
		var ttlAlcEvnts = getAppSpecific("Total Alcoholic Festival Events Held",soEvntTrackerCapID);
		aa.print("ttlAlcEvnts: " + ttlAlcEvnts);

		if (AInfo['Type of Occasion'].equals("Non-Profit Special Occasion")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlNPftEvnts);
			tOOc++;
			ttlNPftEvnts = tOOc;
			editAppSpecific("Total Non Profit Events Held",tOOc,soEvntTrackerCapID);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}
			
		if (AInfo['Type of Occasion'].equals("Political Special Occasion")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlPolEvnts);
			tOOc++;
			ttlPolEvnts = tOOc;
			editAppSpecific("Total Political Events Held",tOOc,soEvntTrackerCapID);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}		

		if (AInfo['Type of Occasion'].equals("Wine Festival")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlWinEvnts);
			tOOc++;
			ttlWinEvnts = tOOc;
			editAppSpecific("Total Wine Events Held",tOOc,soEvntTrackerCapID);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}	
			
		if (AInfo['Type of Occasion'].equals("Alcoholic Beverage Festival")){
			//totalTypeOccasion = 15;
			tOOc = Number(ttlAlcEvnts);
			tOOc++;
			ttlAlcEvnts = tOOc;
			editAppSpecific("Total Alcoholic Festival Events Held",tOOc,soEvntTrackerCapID);
			
			if(tOOc >= 15)
				maxEventsMet = true;
		}

		aa.print("Total Of " + AInfo['Type of Occasion'] + " Events held this year: " + tOOc); 

	
	if(ttlNPftEvnts >= 12 && ttlPolEvnts >= 12 && ttlWinEvnts >= 12 &&  ttlAlcEvnts >= 15){
		holdId = capId;
		capId = soEvntTrackerCapID;
		licEditExpInfo ("Expired", null);
		capId = holdId;
		closeTask("Application Status","Closed","Total allowable events have been reached for year",""); 
		
		return true;
	}
	else
		return false;
}
