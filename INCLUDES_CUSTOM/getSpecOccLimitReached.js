function getSpecOccLimitReached(){
	/* Special Occasion criteria:


	One 24 Hour period

	Non-Profit Special Occasion - 12
	Political Special Occasion - 12
	Alcoholic Beverage Festival - 15
	Wine Festival - 12
	*/

	var tOOc = 0;
	maxEventsMet = false;

	var vContactObjArray = getContactObjs_modified(capId,"Business Information");
                               
	for(iContNew in vContactObjArray){
		
		//aa.print("CHECKING " + iContNew + ":" + vContactObjArray[iContNew]);
		
		logDebug("Updating total number of occasions for " + AInfo['Type of Occasion']);
		
		var vContactObjNew = vContactObjArray[iContNew];
		
		var ttlNPftEvnts = vContactObjNew.getCustomField("Total Non Profit Events Held");
		//logDebug("ttlNPftEvnts: " + ttlNPftEvnts);
		
		var ttlPolEvnts = vContactObjNew.getCustomField("Total Political Events Held");
		//logDebug("ttlPolEvnts: " + ttlPolEvnts);
		
		var ttlWinEvnts = vContactObjNew.getCustomField("Total Wine Events Held");
		//logDebug("ttlWinEvnts: " + ttlWinEvnts);
		
		var ttlAlcEvnts = vContactObjNew.getCustomField("Total Alcoholic Festival Events Held");
		//logDebug("ttlAlcEvnts: " + ttlAlcEvnts);		
			
		if (AInfo['Type of Occasion'].equals("Non-Profit Special Occasion")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlNPftEvnts);
			tOOc++;
			ttlNPftEvnts = tOOc;
			vContactObjNew.setCustomField("Total Non Profit Events Held",tOOc);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}
			
		if (AInfo['Type of Occasion'].equals("Political Special Occasion")){
			//totalTypeOccasion = 12;
			tOOc = Number(ttlPolEvnts);
			tOOc++;
			ttlPolEvnts = tOOc;
			vContactObjNew.setCustomField("Total Political Events Held",tOOc);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}		

		if (AInfo['Type of Occasion'].equals("Wine Festival")){
			//totalTypeOccasion = 8;
			tOOc = Number(ttlWinEvnts);
			tOOc++;
			ttlWinEvnts = tOOc;
			vContactObjNew.setCustomField("Total Wine Events Held",tOOc);
			
			if(tOOc >= 12)
				maxEventsMet = true;
		}	
			
		if (AInfo['Type of Occasion'].equals("Alcoholic Beverage Festival")){
			//totalTypeOccasion = 15;
			tOOc = Number(ttlAlcEvnts);
			tOOc++;
			ttlAlcEvnts = tOOc;
			vContactObjNew.setCustomField("Total Alcoholic Festival Events Held",tOOc);
			
			if(tOOc >= 15)
				maxEventsMet = true;
		}
		vContactObjNew.save();
		if(vContactObjNew.refSeqNumber)
                    vContactObjNew.syncCapContactToReference();

		logDebug("Total Of " + AInfo['Type of Occasion'] + " Events held this year: " + tOOc); 
	}
	
	if(ttlNPftEvnts >= 12 && ttlPolEvnts >= 12 && ttlWinEvnts >= 12 &&  ttlAlcEvnts >= 15)
		return true;
	else
		return false;
}
 
