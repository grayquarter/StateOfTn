//WTUA:TNABC/*/RENEWAL/*

if (currentUserID.equals("LFISHER") || currentUserID.equals("AF03304")){
	showDebug=true;
	showMessage=true;
}

try{
	if (!matches(appTypeArray[1],"Education","Permits")){
		if (taskStatus("Application Review") == "Approved" || taskStatus("Commission Meeting") == "Approved" || taskStatus("Application Review") == "Approved - No Commission"){
			var recType = appTypeArray[3];
			var guideASI = new Array();
			var inspectionId = 0;
			var ttlSeatCount = 0;

			if (appTypeArray[3].equals("Special Legislation")){		
				feeInfo = lookup("LIC_FEE_SPLEG_LOOKUP",AInfo["Special Legistation Type"]).split("|");
				
				if (feeInfo != "undefined")
					updateFee(feeInfo[1],feeInfo[0],"FINAL",1,"Y");
			}	
			else{
			var feeInfo = new Array(); 
			feeInfo = lookup("LIC_FEE_LOOKUP",recType).split("|");
			if (!matches(appTypeArray[3],"Hotel-Motel","Limited Service","Restaurant","Wine Only")){
				if (feeInfo != "NONE"){
					if (appTypeArray[3].equals("Non-Manufacturing Non-Resident")){
					logDebug("Non-Manufacturing Non-Resident");}
					
					if (appTypeArray[3].equals("Non-Resident Sellers")){
						if (AInfo["How many cases of alcoholic beverages were sold or distributed in TN, during the calendar year?"] == "Less than 100 cases")
							var ttlCases = 150;
						else
							var ttlCases = 250;
						
						updateFee(feeInfo[1],feeInfo[0],"FINAL",ttlCases,"Y");
					}
					
					
					else{
						updateFee(feeInfo[1],feeInfo[0],"FINAL",1,"Y");
					}
				}
			}
			//If The License type = Hotel Motel/LMT SERV/REST/WINEONLY
			else{
			//Todo: CHK Create Functions for Limited Service and Hotel/Motel based on seat count
				if(matches(appTypeArray[3],"Hotel-Motel")){ // 02272018 Go by Room Count
				inspectionId = getInspNum();
				logDebug("InspId: "+ inspectionId);
				guideASI = loadGuideSheetItemsWASI(inspectionId);
				logDebug("guideASI: "+ guideASI);
				ttlRoomCount = guideASI["Total Room Count"];
				logDebug("Total Rooms = " + ttlRoomCount);
				if (ttlRoomCount > 0)
					updateFee(feeInfo[1],feeInfo[0],"FINAL",ttlRoomCount ,"Y");
				}
				if(matches(appTypeArray[3],"Limited Service")){ 
			    inspectionId = getInspNum();
				logDebug("InspId: "+ inspectionId);
				guideASI = loadGuideSheetItemsWASI(inspectionId);
				logDebug("guideASI: "+ guideASI);
				ttlSales = guideASI["Gross Sales % of Prepared Food"];
				logDebug("Gross Sales % of Prepared Food = " + ttlSales);
				if (ttlSales > 0)
					updateFee(feeInfo[1],feeInfo[0],"FINAL",ttlSales ,"Y");	
				}
				if(matches(appTypeArray[3],"Restaurant","Wine Only")){
				inspectionId = getInspNum();
				logDebug("InspId: "+ inspectionId);
				guideASI = loadGuideSheetItemsWASI(inspectionId);
				logDebug("guideASI: "+ guideASI);
				ttlSeatCount = guideASI["Total Seat Count"];
				logDebug("Total Seats = " + ttlSeatCount);
				if (ttlSeatCount > 0)
					updateFee(feeInfo[1],feeInfo[0],"FINAL",ttlSeatCount ,"Y");
				}
			}
				
			if (feeInfo != "NONE"){
				feeTtl = feeAmount(feeInfo[1]);
				logDebug("The Invoiced fee amt = " + feeTtl);
			}
		}
			sendNotificationToContactTypes("Business Information,Business Representative", "TABC_LICENSE_PAYMENT");
		}
	}
	
	//added to add fees to trainers - AF03304
      if(matches(appTypeArray[1],"Education") && matches(appTypeArray[2], "Renewal") && matches(appTypeArray[3], "Server Training Trainer") && taskStatus("Application Review") == "Approved"){
         logDebug("STT Condition");
		var feeSch = "TABC_EDUCATION_FEES";
		var feeItm = "EDU002";
		addFee(feeItm,feeSch,"FINAL",1,"Y");
	    feeTtl = feeAmount(feeItm);
	    logDebug("The Invoiced fee amt = " + feeTtl);
		//test template
		sendNotificationToContactTypes("Applicant-Individual", "TABC_LICENSE_PAYMENT");
	}
	
			//added to add fees to Responsible Vendor Program - AF03304
        if(matches(appTypeArray[1],"Education") && matches(appTypeArray[2], "Renewal") && matches(appTypeArray[3], "RV Program") && taskStatus("Application Review") == "Approved")
		{
            logDebug("RVP Condition");
		    feeSch = "TABC-RTP-S";
			feeItm = "RTP-APP";
			updateFee(feeItm,feeSch,"FINAL",1,"Y");
			logDebug(feeItm);
		    sendNotificationToContactTypes("Business Information, Business Representative", "TABC_LICENSE_PAYMENT");
		}
	
	
	if(matches(appTypeArray[1],"Education") && matches(appTypeArray[2], "Renewal") && matches(appTypeArray[3], "Server Training Program") && taskStatus("Application Review") == "Approved")
	{
		logDebug("Server Training Program Condition");	
		feeSch = "TABC-STP-S-A";
	
		if (AInfo["Type of training program"].equals("Public Training Program"))
			var feeItm = "STP-PUB";
		else 
			var feeItm = "STP-IHO";
	
		updateFee(feeItm,feeSch,"FINAL",1,"Y");
		feeTtl = feeAmount(feeItm);
		logDebug("The Invoiced fee amt = " + feeTtl);
	
		sendNotificationToContactTypes("Business Information,Business Representative", "TABC_LICENSE_PAYMENT");
	}

	if (wfTask.equals("Investigative Review") && wfStatus.equals("Denied") && isTaskActive("Citizenship Verification"))
		branchTask ("Citizenship Verification", "Denied", "Investigative Review was Denied") ;

	if (wfTask.equals("Citizenship Verification")  && wfStatus.equals("Denied") && isTaskActive("Investigative Review"))
		branchTask ("Investigative Review", "Denied", "Citizenship Verification was Denied") ;

	if (wfTask.equals("Application Review") && wfStatus.equals("Denied - No Commission"))
		closeTask("Application Status","Denied","Updated via EMSE","");
}
catch (err) 
{
      logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
            
}
			
			
			
			
			/*if (wfTask.equals("Application Review") && wfStatus.equals("Approved")){
	feeSch = "TABC-STP-S-A";
	
	if (AInfo["Type of training program"].equals("Public Training Program"))
		var feeItm = "STP-PUB";
	else 
		var feeItm = "STP-IHO";
	
	updateFee(feeItm,feeSch,"FINAL",1,"Y");
	feeTtl = feeAmount(feeItm);
	logDebug("The Invoiced fee amt = " + feeTtl);
        sendNotificationToContactTypes("Business Information", "TABC_LICENSE_PAYMENT");
}*/