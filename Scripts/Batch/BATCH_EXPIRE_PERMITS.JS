/*------------------------------------------------------------------------------------------------------/
| Program:  BATCH_EXPIRE_PERMITS.js  Trigger: Batch
|
| Version 1.0 - Base Version. 02/14/2017 
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
SCRIPT_VERSION = 2.0;
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var debug = "";
var br = "<br>";
var br = "<br>";
var message = "";

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_BATCH",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = aa.env.getValue("showDebug");
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
var systemUserObj = aa.person.getUser("ADMIN").getOutput();  // Current User Object
var currentUserID = "ADMIN";
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebugBatch("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebugBatch("Batch job ID not found " + batchJobResult.getErrorMessage());

wfObjArray = null;

var timeExpired = false;
var sysFromEmail ="noreply@accela.com";
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var currentTime = new Date();
var month = currentTime.getMonth() + 1
var day = currentTime.getDate()
var year= currentTime.getFullYear()
var year1 = currentTime.getFullYear().toString().substr(2,2);
var hour=currentTime.getHours()
var minute=currentTime.getMinutes()
var setNameEXP = "TNABC_SET_EXPIRATION_STATUS_"+year+month+day+hour+minute;
var setID1= "TNABC_SET_EXPIRATION_STATUS_"+year+month+day+hour+minute;

//var setCreateEXP = aa.set.createSet(setID1, setNameEXP);

var type=0;
var maxSeconds = 4.5 * 60;  
var startDate = new Date();
var startTime = startDate.getTime();
var expStatus = getParam("expirationStatus")       //   test for this expiration status
var appGroup = aa.env.getValue("appGroup");       
var appTypeType = aa.env.getValue("appTypeType");   
var appSubtype = aa.env.getValue("appSubtype");
var appCategory = aa.env.getValue("appCategory");   
var StartDate=aa.env.getValue("StartDate"); 
var EndDate=aa.env.getValue("EndDate");
var lookAheadDays = aa.env.getValue("lookAheadDays");   // Number of days from today
var daySpan = aa.env.getValue("daySpan");          // Days to search (6 if run weekly, 0 if daily, etc.)
var fromDate = getParam("fromDate");
var toDate = getParam("toDate");
var emailAddress = getParam("e-mail");
var wfTask = getParam("WfTask");
var wfstat = getParam("WfStatus");


if (appGroup=="")
   appGroup="*";
if (appTypeType=="")
   appTypeType="*";
if (appSubtype=="")
   appSubtype="*";
if (appCategory=="")
   appCategory="*";
var appType = appGroup+"/"+appTypeType+"/"+appSubtype+"/"+appCategory;

var systemUserObj = aa.person.getUser("ADMIN").getOutput();
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;

if (!fromDate.length) // no "from" date, assume today + number of days to look ahead
   fromDate = dateAdd(null,parseInt(lookAheadDays))

if (!toDate.length)  // no "to" date, assume today + number of look ahead days + span
   toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan))

logDebugBatch("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate)

logDebugBatch("Start of Job");
if (!timeExpired) mainProcess();
logDebugBatch("End of Job: Elapsed Time : " + elapsed() + " Seconds");
aa.env.setValue("ScriptReturnMessage",debug);
//aa.env.setValue("ScriptReturnCode","1");

if (emailAddress.length)
	aa.sendMail("noreply.abc@tn.gov","AF03_ITSUPPORT@tn.gov","",batchJobName,emailText);

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
	var emptyCm = aa.cap.getCapModel().getOutput();
	var emptyCt = emptyCm.getCapType();
	emptyCt.setGroup(appGroup);  
	emptyCt.setType(null); 
	emptyCt.setSubType(appSubtype);
	emptyCt.setCategory(null);
	emptyCm.setCapType(emptyCt);

	//var typeResult= aa.cap.getCapListByCollection(emptyCm, null, null, fromDate,toDate,null, emptyGISArray);
	var typeResult = aa.expiration.getLicensesByDate(expStatus,fromDate,toDate);
	 
	 if(typeResult.getSuccess())
	   {  
	   expCaps=typeResult.getOutput();    
	   } 
	else
	   {   
	   logDebugBatch("ERROR: Getting the Licenses Expirations, reason is: " + typeResult.getErrorType() + ":" + typeResult.getErrorMessage()); return false 
	   }

	logDebugBatch("Total Records found: "+ expCaps.length);

	 //#######################################
	for(thisExp in expCaps)
	{
		if (elapsed() > maxSeconds) // only continue if time hasn't expired
		 {
					logDebugBatch("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
					timeExpired = true;
					break;
		 }
		var capFilterType = 0;
		var capTypeFilterType = 0;

		b1Exp = expCaps[thisExp];
		var   expDate = b1Exp.getExpDate();
		if (expDate) var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
		var b1Status = b1Exp.getExpStatus();

		capId = aa.cap.getCapID(b1Exp.getCapID().getID1(),b1Exp.getCapID().getID2(),b1Exp.getCapID().getID3()).getOutput();

		if (!capId)
		{
		logDebugBatch("Could not get a Cap ID for " + b1Exp.getCapID().getID1() + "-" + b1Exp.getCapID().getID2() + "-" + b1Exp.getCapID().getID3());
		logDebugBatch("This is likely being caused by 09ACC-03874.   Please disable outgoing emails until this is resolved")
		continue;
		}

		capIDString = capId.getCustomID();

		logDebugBatch(capIDString + ": Renewal Status : " + b1Status + ", Expires on " + dateAdd(b1ExpDate,1));

		cap = aa.cap.getCap(capId).getOutput();
		var capStatus = cap.getCapStatus();

		appTypeResult = cap.getCapType();      //create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");

		// Filter by CAP Type
		if (appTypeString.length && !appMatch(appType))
		{
			capFilterType++;
			logDebugBatch(capIDString + ": Application Type does not match")
			continue;
		}

		capCount++;

		var generatedCompletely = true;
		var myHashMap = aa.util.newHashMap();
		var email= "";
		var emailParameters = aa.util.newHashtable();
		var businessname ="";
	   //Check for the licence which are about to expired  
					 
		var dtExpr = getExpdate(capId);   
		if(dtExpr != null){	
			var Expirationdate = new Date(dtExpr); 
			// var expdateFull1 = dtExpr.getMonth() + "/" + dtExpr.getDayOfMonth() + "/" + dtExpr.getYear();
			//logDebugBatch("Expirationdate: " +dtExpr);      
			var today = new Date();
			var currentdate = new Date(today.toUTCString());
			var currentdate=currentdate.setHours(0,0,0,0);
			currentdate =new Date(currentdate);

			if(capStatus.equals("Active"))
			{
				logDebugBatch("Checking to see if we are still in renewal window");
				if (today >= Expirationdate){
					logDebugBatch("Window has passed....expiring license");
					//for License--Make it Expired
					var cmt="Expired";

					var wfcomment="Status set to Closed by script BATCH_EXPIRE";
					var wfnote="";                                         
					closeTask(wfTask,wfstat,wfcomment,wfnote);
					logDebugBatch("Permit Task Status has been changed to Closed" + capIDString);
					
					licEditExpInfo ("Expired",null);
					logDebugBatch("Updated Renewal Status to Expired");
					sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_EXPIRED",emailParameters,null);
					logDebugBatch("********************************************************");
				}
				else{
					logDebugBatch("Window still opened....sending reminder notification");
					sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
				}
			}
		}
		  
	}
 
	logDebugBatch("Total CAPS processed: " + capCount);
  
 }

//##################Batch Functions

function logDebugBatch(dstr) {
	if (showDebug){
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
		aa.print(dstr);
	}
	emailText+=dstr + "<br>";
}

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
		//logDebug ("expDate:" + expdateFull);
		return expdateFull1;
	}
}



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
	 logDebug(reportResult);
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
function getParam(pParamName) //gets parameter value and logs message showing param value
   {
   var ret = "" + aa.env.getValue(pParamName);
   logDebug("Parameter : " + pParamName+" = "+ret);
   return ret;
   }