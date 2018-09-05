function scheduleExamViaASIT(){
		var capLPs = getLicenseProfessional(capId);

		for (lpType in capLPs){
			if (capLPs[lpType].getLicenseType().equals("Provider")){
				var refLP = capLPs[lpType].getLicenseNbr();

				logDebug("Ref LP Num: " + refLP);

				refLPLModel = getRefLicenseProf(refLP);
				//var busName = refLPLModel.getBusinessName();

				prvNBR = getProviderInfo(refLPLModel);

				var proctorID = "";

					var capContact = getContactArray();
					for (cCont in capContact){
						if (capContact[cCont]["contactType"].equals("Applicant-Individual")){
							proctorID = capContact[cCont]["refSeqNumber"];
						}
					}
				var examAssigned = false;
				
				if (typeof(SCHEDULEINFO) == "object"){
					var newSchTable = new Array();
					
					for (sd in SCHEDULEINFO){
						var schedExist = false;
						var tempObject = new Array();
						if (SCHEDULEINFO[sd]["Agency Approved"] == "Yes" && SCHEDULEINFO[sd]["Schedule Status"] == "Submitted"){
							//if (SCHEDULEINFO[sd]["Is class open to the public?"] == "Yes")
							var className = SCHEDULEINFO[sd]["Class Name"]
							//else
								//var className = SCHEDULEINFO[sd]["Class Name"] + " - "+busName;
							
							logDebug("And the class START TIME IS: " + SCHEDULEINFO[sd]["Start Time"]);
							
							var vNewRefExamObj = new refExamObj();
							vNewRefExamObj.refExamName = className;
							vNewRefExamObj.gradingStyle = "score";
							vNewRefExamObj.passingNumber = "70";
							vNewRefExamObj.isSchedulingInACA = "Y";
							vNewRefExamObj.comments = SCHEDULEINFO[sd]["Comments"];
							
							examExists = vNewRefExamObj.getReferenceExamList();
							
							if (!examExists){
								vNewRefExamObj.createExamination();
								examID = vNewRefExamObj.refExamNumber;
								logDebug("New EXAMID " + examID);
							}
							else
							{
								for (x in examExists){
									examMod = examExists[x];
									
									if (examMod.getExamName().toString() == className.toString()){
										examID = examMod.getRefExamNbr();
										logDebug("Existing EXAMID " + examID);
										vNewRefExamObj.refExamNumber = examID;
									}
								}
							}
							
							logDebug("Is exam assigned to provider: "+ examAssigned);
							
							if (!examAssigned){
								//Assign the Provider to the exam
								logDebug("Assigning the Provider to the Exam");
								examAssigned = vNewRefExamObj.assignProvider();
								
								//Assign the Record to the Exam
								logDebug("Assigning the Record to the Exam");
								vNewRefExamObj.assignRecord("TNABC","Permits","Application","Server","Server Permit Application");
								
							}
							
							//Set location stuff
							var provLocBus = aa.proxyInvoker.newInstance("com.accela.aa.education.provider.RefProviderLocationBusiness").getOutput();
							var rProvLocModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationModel").getOutput();
							var rProvLocPKModel = aa.proxyInvoker.newInstance("com.accela.orm.model.education.RProviderLocationPKModel").getOutput();
							
							rProvLocPKModel.setServiceProviderCode(aa.getServiceProviderCode());
							
							var maxSeats = Number(SCHEDULEINFO[sd]["Max Seats"]);
							var add1 = SCHEDULEINFO[sd]["Location Address"];
							var add2 = SCHEDULEINFO[sd]["Location Name"];
							var city = SCHEDULEINFO[sd]["Location City"];
							var state = "Tennessee";
							var zip = SCHEDULEINFO[sd]["Location Zip Code"];
							var handicapOK = "Y";
							var startDate = new Date(SCHEDULEINFO[sd]["Date of Class"]); 
							startDate.setHours(0,0,0,0); //Date time must be set to 00
							var endDate = new Date(SCHEDULEINFO[sd]["Date of Class"]);
							endDate.setHours(23,59,59,0); //Date time must be 23:59
													
							var sTimeToMilitary = timeStandardToMilitary(String(SCHEDULEINFO[sd]["Start Time"]));
										
							logDebug("Start Time " + String(SCHEDULEINFO[sd]["Start Time"]) + " needs to be converted to Military: "+ sTimeToMilitary);
							logDebug("INDEX OF: " + sTimeToMilitary.indexOf(":"));
							
							
							if (sTimeToMilitary.indexOf(":") == 1){
								logDebug("HERE");
								var startTimeHours = "0" + sTimeToMilitary.substr(0,1);
							}
							else
								var startTimeHours = sTimeToMilitary.substr(0,2);
									
							logDebug("START HOURS: "+ startTimeHours);
							
							var startTime = new Date(SCHEDULEINFO[sd]["Date of Class"]);
							startTime.setHours(startTimeHours,sTimeToMilitary.substr(-2),00,0); //Must be date time of exam													
							
							logDebug("The FINAL Start TIME IS: "+ startTime);
							
							var eTimeToMilitary = timeStandardToMilitary(String(SCHEDULEINFO[sd]["End Time"]));
							
							logDebug("End Time " + String(SCHEDULEINFO[sd]["End Time"]) + " needs to be converted to Military: "+ eTimeToMilitary);
							logDebug("INDEX OF: " + eTimeToMilitary.indexOf(":"));

							if (eTimeToMilitary.indexOf(":") == 1){
								logDebug("HERE");
								var endTimeHours = "0" + eTimeToMilitary.substr(0,1);
							}
							else
								var endTimeHours = eTimeToMilitary.substr(0,2);
									
							logDebug("END HOURS: "+ endTimeHours);
							
							var endTime = new Date(SCHEDULEINFO[sd]["Date of Class"]); 
							endTime.setHours(endTimeHours,eTimeToMilitary.substr(-2),00,0); //Must be date time of exam													
							
							logDebug("The FINAL END TIME IS: "+ endTime);

							var phone = SCHEDULEINFO[sd]["Contact Phone"];
							var scheduleName = String(SCHEDULEINFO[sd]["Date of Class"])+" "+String(SCHEDULEINFO[sd]["Start Time"]) + "|"+prvNBR;
							
							//..check to see if schedule exists
							schedList = aa.examination.getAvailableSchedules(className).getOutput().toArray();
							for (y in schedList) {
								schedModel = schedList[y];
								
								extStartTime = new Date(schedModel.getStartTime());

								extProvNbr = schedModel.getProviderNbr();
								
								if (prvNBR != extProvNbr)
									continue;
								
								if (startTime.getTime() == extStartTime.getTime()){
									logDebug("Class already exists, no action being taken");

									tempObject["Schedule Status"] = "Rejected";
									tempObject["Comments"] = "Class already exists, no action being taken";
									tempObject["Agency Approved"] = String("No");
									
									schedExist = true;
									continue;
								}
							}
							
							if (!schedExist){
								logDebug("Class is being scheduled");
								examScheduler(servProvCode, prvNBR, examID, proctorID, add1, add2, city, state, zip, phone, maxSeats, handicapOK, scheduleName, startDate, endDate, startTime, endTime);
								
								tempObject["Schedule Status"] = "Scheduled";
								tempObject["Comments"] = String("Class has been approved by Agency and is now available for scheduling");
								tempObject["Agency Approved"] = String(SCHEDULEINFO[sd]["Agency Approved"]);
							}
							
							tempObject["Class Name"] = SCHEDULEINFO[sd]["Class Name"];
							tempObject["Date of Class"] = SCHEDULEINFO[sd]["Date of Class"];
							tempObject["Start Time"] = String(SCHEDULEINFO[sd]["Start Time"]);
							tempObject["End Time"] = String(SCHEDULEINFO[sd]["End Time"]);
							tempObject["Max Seats"] = String(maxSeats);
							tempObject["Location Name"] = add2;
							tempObject["Location Address"] = add1;
							tempObject["Location City"] = city;
							tempObject["Location Zip Code"] = String(zip);
							tempObject["Contact Phone"] = SCHEDULEINFO[sd]["Contact Phone"];
							tempObject["Is class open to the public?"] = SCHEDULEINFO[sd]["Is class open to the public?"];
							
							newSchTable.push(tempObject);		
						}
						else
							newSchTable.push(SCHEDULEINFO[sd]);
					}
				}
				
				if(newSchTable.length >0){
					removeASITable("SCHEDULE INFO");
					addASITable("SCHEDULE INFO",newSchTable,capId);
				}
			}
		}
	}






