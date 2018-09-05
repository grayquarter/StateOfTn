/*
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("appGroup", "TNABC");
aa.env.setValue("appTypeType", "*");
aa.env.setValue("appSubtype", "Application");
aa.env.setValue("appCategory", "*");
aa.env.setValue("showDebug", "Y");
aa.env.setValue("BatchJobName", "Close the Record");
aa.env.setValue("StartDate","1/1/2016"); //set startdate from where to script checking Licenses
aa.env.setValue("EndDate","12/31/2016"); //Set Enddate to end checking Licenses
*/
//
// Body
//
/*------------------------------------------------------------------------------------------------------/
| Program:  CLOSE Record.js  Trigger: Batch
|
| Version 2.0 - Base Version. 03/08/2016 
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0
//eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
//eval(getScriptText("INCLUDES_BATCH"));
//eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
    return emseScript.getScriptText() + "";
}
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;
batchJobID = aa.batchJob.getJobID().getOutput();
var timeExpired = false;
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var currentTime = new Date();
var month = currentTime.getMonth() + 1
var day = currentTime.getDate()
var year= currentTime.getFullYear()
var hour=currentTime.getHours()
var minute=currentTime.getMinutes()
var setNameEXP = "TNABC_CLOSE_RECORD_"+year+month+day+hour+minute;
var setID1= "TNABC_CLOSE_RECORD__"+year+month+day+hour+minute;
aa.env.setValue("ScriptReturnMessage","" + setID1 + " " + setNameEXP);
var setCreateEXP = aa.set.createSet(setID1, setNameEXP);
aa.print(setNameEXP);
var type=0;
var maxSeconds = 4.5 * 60;  
var startDate = new Date();
var startTime = startDate.getTime();
var appGroup = aa.env.getValue("appGroup");       
var appTypeType = aa.env.getValue("appTypeType");   
var appSubtype = aa.env.getValue("appSubtype");
var appCategory = aa.env.getValue("appCategory");  
var StartDate=aa.env.getValue("StartDate"); 
var EndDate=aa.env.getValue("EndDate");     

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
logDebug("Start of Job");
if (!timeExpired) mainProcess();
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
//Getting  Licenses
//#########################getting id's from type
function mainProcess() 
{
  var capCount = 0;
 var lookAhead = -30;
var searchDays = 5;
var emptyGISArray = new Array();
//var fromDt = aa.date.parseDate(dateAdd(null,parseInt(lookAhead)));
//var toDt = aa.date.parseDate(dateAdd(null,parseInt(searchDays)));
var fromDt = aa.date.parseDate(StartDate);
var toDt = aa.date.parseDate(EndDate);  
   var emptyCm = aa.cap.getCapModel().getOutput();
   var emptyCt = emptyCm.getCapType();
   emptyCt.setGroup(appGroup);  
    emptyCt.setType(null); 
     emptyCt.setSubType(appSubtype);
    emptyCt.setCategory(null);
  emptyCm.setCapType(emptyCt);

var typeResult= aa.cap.getCapListByCollection(emptyCm, null, null, fromDt,toDt,null, emptyGISArray);
 
 
 if(typeResult.getSuccess())
   {  
   expCaps=typeResult.getOutput();    
   } 
else
   {   
   logDebug("ERROR: Getting the Licenses Expirations, reason is: " + typeResult.getErrorType() + ":" + typeResult.getErrorMessage()); return false 
   }

 //#######################################
  for(zzz in expCaps)
 {
    if (elapsed() > maxSeconds) // only continue if time hasn't expired
     {
                logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
                timeExpired = true;
                break;
     }
     
      capId = expCaps[zzz].getCapID();
      var cap = aa.cap.getCap(capId).getOutput();
      var capStatus = cap.getCapStatus();
      var capId1 = capId.getID1();	
      var capId2 = capId.getID2();		
      var capId3 = capId.getID3();
      var capidModel=aa.cap.getCapIDModel(capId1,capId2,capId3).getOutput();
      var capIDString=capId.getCustomID();
      var generatedCompletely = true;
	  var myHashMap = aa.util.newHashMap();
      var email= "";
	  var emailParameters = aa.util.newHashtable();
	  var businessname ="";

           //Check for the licence which are about to expired
           
                  
            var today = new Date();
            var currentdate = new Date(today.toUTCString());
            var currentdate=currentdate.setHours(0,0,0,0);
            currentdate =new Date(currentdate);
            
            if(capStatus =="Additional Info Required")
            {
                  
               logDebug("Parent CAPID: " + capIDString);

                //get workflowtask status
                var wfObj = aa.workflow.getTasks(capId).getOutput();
               for (i in wfObj)
	      {
	        fTask = wfObj[i];
	        
                wfTask =fTask.getTaskDescription();
                wfStatus =fTask.getDisposition();
		        wfStep = fTask.getStepNumber();
		        wfProcess = fTask.getProcessCode();
		        wfComment = fTask.getDispositionComment();
		        wfNote = fTask.getDispositionNote();
                        wfDate = fTask.getDispositionDate();
		        wfDue = fTask.getDueDate();
		          wfTaskObj = fTask
                
               if(wfDate != null) 
               { 
                                 
                   var taskdate = wfDate.getMonth() + "/" + wfDate.getDayOfMonth() + "/" + wfDate.getYear();
                   taskdate =new Date(taskdate);
                   

                if(wfTask =="Preliminary Review" && wfStatus =="Additional Info Required")
                {

                 
                 if (AddDaysToDate(taskdate,90)<=currentdate)  //checkdayspassed
                 {   
                   logDebug("Parent CAPID: " + capIDString);
                    aa.print("taskdate: " +taskdate);
                    //for License--Make it Closed
                     var cmt="License Closed";
                     var wfstat="Closed";
                     var wfstr="Application Status";
                     var wfcomment="Status set to Closed by script,Record Expired 120 days already";
                     var wfnote="";                                         
                     updateTask(wfstr,wfstat,wfcomment,wfnote);
                     closeTask("Application Status", "Closed", "Updated via script.", "Updated via script.");
                     var setAddResult1=aa.set.add(setID1,"Closed",capId,"STATUS CHANGED")
                     logDebug("License Status has been changed to closed" + capIDString);
                     logDebug("*****************************************************");
                      //send email notification and save report
					    myHashMap.put("ALT_ID", String(capId.getCustomID()));
					    email =getContactValues("EMAIL",capId);
						businessname =getContactValues("LEGALNAME",capId);
						var itemCapScriptModel = aa.cap.getCap(capId).getOutput();
						addParameter(emailParameters, "$$Licensee_Name$$", businessname);
                        addParameter(emailParameters, "$$AppType$$", itemCapScriptModel.getCapType().getAlias());
                        addParameter(emailParameters, "$$altId$$", capIDString);
                        addParameter(emailParameters, "$$expirationDate$$", dtExpr);
						logDebug(email);
						
						if (!generateReportSaveAndEmail("Incomplete Info Letter", myHashMap, "TABC_INCOMPLETE_RECORD_NOTIFICATION", emailParameters, String(email), capId))
                            generatedCompletely = false;

                     if (generatedCompletely) 
					     {
                            logDebug("Report was generated and sent to " +email);
                    
                          } 

		     capCount++;
               
                 }
                }
               }
               
             
            } 
			
          } //end if
  } //end for
 
   logDebug("Total CAPS processed: " + capCount);
  
 } //end main process



//##################Function adddate
function AddDaysToDate(date, days)
{
    date.setDate(date.getDate() + days)
    return date;
}
//------------

function getExpdate(capId)
{
b1ExpResult = aa.expiration.getLicensesByCapID(capId);
    
    if (b1ExpResult.getSuccess()) {

		this.b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expDateFull = this.b1Exp.getExpDate();
		var expdateFull1 = expDateFull .getMonth() + "/" + expDateFull .getDayOfMonth() + "/" + expDateFull .getYear();
                expdateFull1 =expdateFull1.toString();
		//aa.print ("expDate:" + expdateFull);
		return expdateFull1;
	}
}
//############################################
function updateTask(wfstr,wfstat,wfcomment,wfnote) // optional process name, cap id
	{
        var systemUserObj = aa.person.getUser("ADMIN").getOutput();
	var useProcess = false;
	var processName = "";
	if (arguments.length > 4) 
		{
		if (arguments[4] != "")
			{
			processName = arguments[4]; // subprocess
			useProcess = true;
			}
		}
	var itemCap = capId;
	if (arguments.length == 6) itemCap = arguments[5]; // use cap ID specified in args
 
	var workflowResult = aa.workflow.getTasks(itemCap);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else
	{ logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
            
	if (!wfstat) wfstat = "NA";
            
	for (i in wfObj)
		{
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			if (useProcess)
				aa.workflow.handleDisposition(itemCap,stepnumber,processID,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj,"U");
			else
				aa.workflow.handleDisposition(itemCap,stepnumber,wfstat,dispositionDate,wfnote,wfcomment,systemUserObj,"U");
			//logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
			logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
			}                                   
		}
	}
//##################Function logdebug
function logDebug(dstr)
	{
	if(showDebug)
		{
		aa.print(dstr)
		//emailText+= dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr);
		aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", dstr,batchJobID);
		}
	}
//##################Function elapsed
function elapsed() 
{
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000) 
}

//######################

function dateAdd(td,amt)
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	// if optional parameter #3 is present, use working days only
	{

	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td)
		dDate = new Date();
	else
		dDate = convertDate(td);
		
	var i = 0;
	if (useWorking)
		if (!aa.calendar.getNextWorkDay)
			{
			logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt))
				{
				dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
				}
			}
		else
			{
			while (i < Math.abs(amt))
				{
				dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
				i++;
				}
			}
	else
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
	}

function closeTask(wfstr,wfstat,wfcomment,wfnote) // optional process name
	{

         var systemUserObj = aa.person.getUser("ADMIN").getOutput();
	var useProcess = false;
	var processName = "";
	if (arguments.length == 5) 
		{
		processName = arguments[4]; // subprocess
		useProcess = true;
		}

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	if (!wfstat) wfstat = "NA";
	
	for (i in wfObj)
		{
   		var fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess)
				aa.workflow.handleDisposition(capId,stepnumber,processID,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"Y");
			else
				aa.workflow.handleDisposition(capId,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"Y");
			
			//logMessage("Closing Workflow Task: " + wfstr + " with status " + wfstat);
			logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat);
			}			
		}
	}


function generateReportSaveAndEmail(reportName, hashMapReportParameters, emailTemplate, hashTableEmailTemplateParameters, emailTo) {
   var itemCap = capId;

   if (arguments.length < 3) {
      logDebug("function generateReportSaveAndEmail requres two arguments.  Usage: generateReportSaveAndEmail(string reportName, string emailTo)");
      return false
   }

   if (arguments.length > 4) // assume capId was passed
      itemCap = arguments[5];

   if (emailTemplate == null || emailTemplate == "") {
      logDebug("function generateReportSaveAndEmail parameter emailTemplate is required");
      return false;
   }

   if (String(hashMapReportParameters.getClass()) !== "class java.util.HashMap") {
      logDebug("Function generateReportSaveAndEmail parameter hashMapReportParameters must be of class java.util.HashMap.  Usage: var myHashMap = aa.util.newHashMap()");
      return false;
   }

   if (String(hashTableEmailTemplateParameters.getClass()) !== "class java.util.Hashtable") {
      logDebug("Function generateReportSaveAndEmail parameter hashTableEmailTemplateParameters must be of class java.util.newHashtable.  Usage: var myHashtable = aa.util.newHashtable()");
      return false;
   }

   if (emailTo)
      if (emailTo.indexOf("@") == -1) {
         logDebug("Function generateReportSaveAndEmail parameter emailTo must be a valid email address.");
         return false;
      }

   var capIdStr = String(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
   // var capIdStr = "";

   var report = aa.reportManager.getReportInfoModelByName(reportName);
   var reportResult = null;

   if (report.getSuccess()) {
      report = report.getOutput();
      report.setModule("*");
      
      report.setCapId(capIdStr);

      // specific to * Licensing
      report.setReportParameters(hashMapReportParameters);
      var ed1 = report.getEDMSEntityIdModel();
      ed1.setCapId(capIdStr);
      // Needed to determine which record the document is attached
      ed1.setAltId(itemCap.getCustomID());
      // Needed to determine which record the document is attached
      report.setEDMSEntityIdModel(ed1);

      reportResult = aa.reportManager.getReportResult(report);
	  
   }
   if (reportResult) {
      reportResult = reportResult.getOutput();
	  aa.print(reportResult);
      if (reportResult != null) {
         var reportFile = aa.reportManager.storeReportToDisk(reportResult);
         reportFile = reportFile.getOutput();
         if (emailTo) {
            var capIDScriptModel = aa.cap.createCapIDScriptModel(itemCap.getID1(), itemCap.getID2(), itemCap.getID3());

            var reportArr = new Array();
            reportArr.push(reportFile);

            var sendNotificationResult = null;
            // sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile)
            sendNotificationResult = aa.document.sendEmailAndSaveAsDocument(sysFromEmail, emailTo, "", emailTemplate, hashTableEmailTemplateParameters, capIDScriptModel, new Array(reportFile));

            if (sendNotificationResult.getSuccess()) logDebug("SendNotification is: " + sendNotificationResult.getSuccess());
            // if(sendResult)logDebug(sendResult.getSuccess());
         }
         // ---------------------------------------------------
      } else {
         logDebug("Report Result is null in function generateReportSaveAndEmailForRecord with reportName: " + reportName);
         return false;
      }
   } else {
      logDebug("Unable to retrieve report result in function generateReportSaveAndEmailForRecord with reportName: " + reportName);
      return false;
   }

   return true;
}


