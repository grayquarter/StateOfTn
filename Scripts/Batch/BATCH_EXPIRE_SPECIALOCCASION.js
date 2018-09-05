/*------------------------------------------------------------------------------------------------------/
| Program:  Set Expiration Status.js  Trigger: Batch
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
SCRIPT_VERSION = 2.0;
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var debug = "";
var br = "<br>";
var br = "<br>";
var message = "";

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_BATCH",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));

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
var emailText = "";
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

var lookAheadDays = aa.env.getValue("lookAheadDays");   // Number of days from today
var daySpan = aa.env.getValue("daySpan");          // Days to search (6 if run weekly, 0 if daily, etc.)
var emailAddress = getParam("e-mail");

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

var timeExpired = false;


var fromDate = dateAdd(null,parseInt(lookAheadDays))

var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan))

logDebugBatch("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate)

logDebugBatch("Start of Job on : "+ startDate + " at " + startTime);
if (!timeExpired) mainProcess();
logDebugBatch("End of Job: Elapsed Time : " + elapsed() + " Seconds");
aa.env.setValue("ScriptReturnMessage",debug);
aa.env.setValue("ScriptReturnCode","1");

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

	var typeResult = aa.expiration.getLicensesByDate(expStatus,fromDate,toDate);
	 
	 if(typeResult.getSuccess())
	   {  
	   expCaps=typeResult.getOutput();    
	   } 
	else
	   {   
	   logDebugBatch("ERROR: Getting the Licenses Expirations, reason is: " + typeResult.getErrorType() + ":" + typeResult.getErrorMessage()); return false 
	   }

	 //#######################################
	for(thisExp in expCaps)
	{
		if (elapsed() > maxSeconds) // only continue if time hasn't expired
		 {
					logDebugBatch("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
					timeExpired = true;
					break;
		 }
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

		logDebugBatch(capIDString + ": Renewal Status : " + b1Status + ", Expires on " + b1ExpDate);

		cap = aa.cap.getCap(capId).getOutput();
		var capStatus = cap.getCapStatus();

		appTypeResult = cap.getCapType();      //create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");

		if (!appTypeString.equals("TNABC/Liquor by the Drink/License/Special Occasion")){
			capTypeFilterType++;
			logDebugBatch(capIDString + ": is a not Special Occasion....Skipping")
			continue;
		}
		capCount++;

		var generatedCompletely = true;
		var myHashMap = aa.util.newHashMap();
		var email= "";
		var emailParameters = aa.util.newHashtable();
		var businessname ="";
	   //Check for the licence which are about to expired
		logDebugBatch("Record: " + capIDString);  
					 
		var dtExpr = getExpdate(capId);   
		if(dtExpr != null){	
			var Expirationdate = new Date(dtExpr); 
			// var expdateFull1 = dtExpr.getMonth() + "/" + dtExpr.getDayOfMonth() + "/" + dtExpr.getYear();
			logDebugBatch("Expirationdate: " +dtExpr);      
			var today = new Date();
			var currentdate = new Date(today.toUTCString());
			var currentdate=currentdate.setHours(0,0,0,0);
			currentdate =new Date(currentdate);			

			//for License--Make it Expired                                        
			closeTask("License Status","Closed","Status set to Expired by script,Record Expired already","");

			logDebugBatch("License Task Status has been changed to Closed for " + capIDString);
			
			licEditExpInfo ("Expired",null);
			logDebugBatch("Updated Renewal Status to Expired");
							
			//send email notification and save report
			myHashMap.put("ALT_ID", String(capId.getCustomID()));
			email =getContactValues("EMAIL",capId);
			businessname =getContactValues("LEGALNAME",capId);
			var itemCapScriptModel = aa.cap.getCap(capId).getOutput();
			addParameter(emailParameters, "$$Licensee_Name$$", businessname);
			addParameter(emailParameters, "$$AppType$$", itemCapScriptModel.getCapType().getAlias());
			addParameter(emailParameters, "$$altId$$", capIDString);
			addParameter(emailParameters, "$$expirationDate$$", dtExpr);
			logDebugBatch(email);
			
			//sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
			
			//if (!generateReportSaveAndEmail("Renewal - Single Letter", myHashMap, "TABC_RENEWAL_NOTIFICATION", emailParameters, String(email), capId))
			generatedCompletely = false;

			if (generatedCompletely) 
				logDebugBatch("Report was generated and sent to " +email);
			
			logDebugBatch("********************************************************");
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
		//logDebugBatch ("expDate:" + expdateFull);
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
			logDebugBatch("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
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
      logDebugBatch("function generateReportSaveAndEmail requres two arguments.  Usage: generateReportSaveAndEmail(string reportName, string emailTo)");
      return false
   }

   if (arguments.length > 4) // assume capId was passed
      itemCap = arguments[5];

   if (emailTemplate == null || emailTemplate == "") {
      logDebugBatch("function generateReportSaveAndEmail parameter emailTemplate is required");
      return false;
   }

   if (String(hashMapReportParameters.getClass()) !== "class java.util.HashMap") {
      logDebugBatch("Function generateReportSaveAndEmail parameter hashMapReportParameters must be of class java.util.HashMap.  Usage: var myHashMap = aa.util.newHashMap()");
      return false;
   }

   if (String(hashTableEmailTemplateParameters.getClass()) !== "class java.util.Hashtable") {
      logDebugBatch("Function generateReportSaveAndEmail parameter hashTableEmailTemplateParameters must be of class java.util.newHashtable.  Usage: var myHashtable = aa.util.newHashtable()");
      return false;
   }

   if (emailTo)
      if (emailTo.indexOf("@") == -1) {
         logDebugBatch("Function generateReportSaveAndEmail parameter emailTo must be a valid email address.");
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
	 logDebugBatch(reportResult);
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

            if (sendNotificationResult.getSuccess()) logDebugBatch("SendNotification is: " + sendNotificationResult.getSuccess());
            // if(sendResult)logDebugBatch(sendResult.getSuccess());
         }
         // ---------------------------------------------------
      } else {
         logDebugBatch("Report Result is null in function generateReportSaveAndEmailForRecord with reportName: " + reportName);
         return false;
      }
   } else {
      logDebugBatch("Unable to retrieve report result in function generateReportSaveAndEmailForRecord with reportName: " + reportName);
      return false;
   }

   return true;
}
function getParam(pParamName) //gets parameter value and logs message showing param value
   {
   var ret = "" + aa.env.getValue(pParamName);
   logDebugBatch("Parameter : " + pParamName+" = "+ret);
   return ret;
   }