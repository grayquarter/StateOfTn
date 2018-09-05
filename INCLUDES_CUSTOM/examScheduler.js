function examScheduler(servProvCode, providerNbr, examID, proctorID, add1, add2, city, state, zip, phone, maxSeats, handicapOK, scheduleName, startDate, endDate, startTime, endTime) {
	var args = new Array();
	var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args).getOutput();
	auditModel.setAuditDate(new Date());
	auditModel.setAuditStatus("A");
	auditModel.setAuditID("ADMIN");

	//Step 1 is to create a location
	//Set Defaults
	locBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.RefProviderLocationBusiness").getOutput();
	provLocPKModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationPKModel").getOutput();
	provLocPKModel.setServiceProviderCode(servProvCode);

	//First Check if Location already exists, if so use that one
	//Having to create a new model, NULL fields affects this search.  Could cause issues down the road
	checkModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationModel").getOutput();
	checkModel.setAddress1(add1);
	checkModel.setCity(city);
	checkModel.setState(state);
	checkModel.setLocationPKModel(provLocPKModel);

	provFound = false;
	provLocList = new Array();

	logDebug("Checking to see if location for provider # " + providerNbr + " exists");

	locList = locBus.getProviderLocationList(checkModel).toArray();

	for (x in locList) {
		var lList = locList[x];

		if (lList.getProviderNbr() == providerNbr) {
			provFound = true;
			provLocList.push(lList);
			continue;
		}

	}
	if (provFound) {
		logDebug("Location for Provider " + providerNbr + " exists already...Using it");
		refLoc = provLocList[0];
		refLocPK = refLoc.getLocationPKModel();
		refLocNbr = refLocPK.getLocationNbr();

		//logDebug("Prov Loc: " + refLoc.getProviderNbr());
	} else {
		logDebug("Location for Provider " + providerNbr + " doesn't exist...Creating it");
		//No Location found so create it
		provLocModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationModel").getOutput();
		provLocModel.setProviderNbr(providerNbr); //need this from the ref providerNbr and NOT provideNo
		provLocModel.setAddress1(add1);
		provLocModel.setAddress2(add2);
		provLocModel.setPhone(phone);
		provLocModel.setCity(city);
		provLocModel.setState(state);
		provLocModel.setZip(zip);
		provLocModel.setMaxSeats(maxSeats);
		provLocModel.setAuditModel(auditModel);
		provLocModel.setIsHandicapAccessible(handicapOK);
		provLocModel.setLocationPKModel(provLocPKModel);

		//Create the Location from Model and grab the ID
		refLoc = locBus.createProviderLocation(provLocModel);
		refLocPK = refLoc.getLocationPKModel();
		refLocNbr = refLocPK.getLocationNbr();
		//Location is created and now tied to Provider
	}

	//Step 2 Create the schedule calendar
	logDebug("Creating schedule....");
	newCal = aa.proxyInvoker.newInstance("com.accela.orm.model.calendarengine.CalendarEngineModel").getOutput();
	newCal.setName(scheduleName);
	newCal.setCategory("EXAM");
	newCal.setServiceProviderCode(servProvCode);
	newCal.setIsBusy(0);
	newCal.setAuditModel(auditModel);
	newCal.setStartDate(startTime);
	newCal.setEndDate(endTime);
	newCal.setFrequency(-1);
	newCal.setPriority(0);
	newCal.setInterval(0);
	newCal.setDayOfMonth(0);
	newCal.setWeekOfMonth(0);
	newCal.setDayOfWeek(0);
	newCal.setRecurrenceStartDate(startDate);
	newCal.setRecurrenceEndDate(endDate);
	newCal.setMonthOfYear(0);
	newCal.setAlertInAdvance(0);
	newCal.setParentId(0);
	newCal.setUnits(0.00);

	//Step 3 Create Schedule
	provSchedModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderScheduleModel").getOutput();
	provSchedModel.setProviderNbr(providerNbr);
	provSchedModel.setEntityID(examID); //This is the Exam refExamNbr
	provSchedModel.setEntityType("EXAM"); //most likely always EXAM
	provSchedModel.setScheduleName(scheduleName);
	provSchedModel.setStartDate(startDate);
	provSchedModel.setEndDate(endDate);
	provSchedModel.setAuditModel(auditModel);
	provSchedModel.setServiceProviderCode(servProvCode);

	//Need to link Location with schedule here
	logDebug("Linking location with Schedule");
	provSchedLocModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.XRProviderScheduleLocationModel").getOutput();
	provSchedLocModel.setAuditModel(auditModel);
	provSchedLocModel.setRefExamLocationModel(refLoc);
	provSchedLocModel.setLocationNbr(refLocNbr);
	provSchedLocModel.setRefExamProviderScheduleModel(provSchedModel);
	provSchedLocModel.setServiceProviderCode(servProvCode);
	provSchedLocModel.setSupportedLanguages("English"); //Hard coding english

	//Then add it back to the schedule Model (must be list)
	provSchedLocList = [];
	provSchedLocList.push(provSchedLocModel);
	provSchedModel.setRefExamScheduleLocationModels(provSchedLocList);

	//add calendar
	calList = [];
	calList.push(newCal);
	provSchedModel.setCalenderEngineModels(calList);

	//Create the Schedule from Model and grab the ID
	schedBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.RefProviderScheduleBusiness").getOutput();
	refSched = schedBus.addRefProviderSchedule(provSchedModel);
	//Schedule is created and now tied to Location


	/* THIS IS BLOCKING THE MANUAL DELETE ABILITY
	//Step 4 Create an Event to track time
	eventPKModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.ProviderEventPKModel").getOutput();
	eventPKModel.setServiceProviderCode(servProvCode);

	eventModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.ProviderEventModel").getOutput();
	eventModel.setProviderEventPKModel(eventPKModel);
	eventModel.setScheduleID(refSched);
	eventModel.setrProviderScheduleModel(provSchedModel);
	eventModel.setLocationID(refLocNbr);
	eventModel.setrProviderLocationModel(refLoc);
	eventModel.setStartTime(startTime);
	eventModel.setEndTime(endTime);
	eventModel.setAuditModel(auditModel);
	eventModel.setCalendarEngineModel(newCal);

	//Create the Event from Model
	eventBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.ProviderEventBusiness").getOutput();
	refEvent = eventBus.addProviderEvent(eventModel);
	eventPK = refEvent.getProviderEventPKModel();
	eventID = eventPK.getEventNbr();
	//Event is created
	 */

	/*
	//Step 4 Create the Proctor
	//Add proctor from model
	provAdapterBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.ProviderAdapterBusiness").getOutput();
	eventList = [];
	eventList.push(refEvent);
	proctorIDs = [proctorID];
	provAdapterBus.assignProctor(eventList ,proctorIDs ,servProvCode ,"ADMIN","N");
	 */
}

//Modified this function to accept Military Date/Time Conversion. 01/11/2018
