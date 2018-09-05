/*------------------------------------------------------------------------------------------------------/
| Program:  BATCH_EXPIRE_LICENSES.js  Trigger: Batch
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
//eval(getScriptText("INCLUDES_BATCH",null,useCustomScriptFile));
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
var sysFromEmail ="noreply.abc@tn.gov";
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

var setCreateEXP = aa.set.createSet(setID1, setNameEXP);

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
		
		/*capId = expCaps[zzz].getCapID();
		var cap = aa.cap.getCap(capId).getOutput();
		var capStatus = cap.getCapStatus();
		var capId1 = capId.getID1();	
		var capId2 = capId.getID2();		
		var capId3 = capId.getID3();
		var capidModel=aa.cap.getCapIDModel(capId1,capId2,capId3).getOutput();
		var capIDString=capId.getCustomID();*/
		
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
		
		eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));
		
		capIDString = capId.getCustomID();

		logDebugBatch(capIDString + ": Renewal Status : " + b1Status + ", Expires on " + dateAdd(b1ExpDate,1));

		cap = aa.cap.getCap(capId).getOutput();
		capStatus = cap.getCapStatus();
		capName = cap.getSpecialText();
		fileDate = null;
		fileDateYYYYMMDD = null;
		balanceDue = 0;
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

		if (appTypeString.equals("TNABC/Liquor by the Drink/License/Special Occasion")){
			capTypeFilterType++;
			logDebugBatch(capIDString + ": is a Special Occasion....Skipping")
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
			//logDebugBatch("Expiration date formatted: " + dateAdd(dtExpr,1));
		
			var today = new Date();
			
			var currentdate = new Date(today.toUTCString());
			var currentdate=currentdate.setHours(0,0,0,0);
			currentdate =new Date(currentdate);
			
			//send email notification and save report
			myHashMap.put("ALT_ID", String(capId.getCustomID()));
			email =getContactValues("EMAIL",capId);
			businessname =getContactValues("LEGALNAME",capId);
			var itemCapScriptModel = aa.cap.getCap(capId).getOutput();
			addParameter(emailParameters, "$$Licensee_Name$$", businessname);
			addParameter(emailParameters, "$$AppType$$", itemCapScriptModel.getCapType().getAlias());
			addParameter(emailParameters, "$$altId$$", capIDString);
			addParameter(emailParameters, "$$expirationDate$$", dateAdd(dtExpr,1));
			
			var acaURL = "https://rlpsdev.abc.tn.gov/devtabc";
			getRecordParams4Notification(emailParameters);
			getACARecordParam4Notification(emailParameters,acaURL);
			addParameter(emailParameters, "$$acaUrl$$", acaURL+getACAUrl());
				
				
			if(capStatus.equals("Active"))
			{
				//for License--Make it About To Expire
				var stat="About To Expire";
				var cmt="License Expiring within 60 days";
				var wfstat="About To Expire";
				var wfstr="License Status";
				var wfcomment="Status set to About to Expired by script,expires within 60 days";
				var wfnote="";                                         
				updateTask(wfstr,wfstat,wfcomment,wfnote);
				//updateTask("Certificate Status",wfstat,wfcomment,wfnote);
				//var setAddResult1=aa.set.add(setID1,"ABOUT TO EXPIRE",capId,"STATUS CHANGED")
				logDebugBatch("License Task Status has been changed to About To Expire: ");
				licEditExpInfo ("About To Expire",null);
				logDebugBatch("Updated Renewal Status to About To Expire");				
				//Added This Line to update App Status to Closed.
				updateAppStatus("About To Expire", "Updated Via Script. This License/Certificate is closed");
				logDebugBatch("Sending email to: "+ email);
				//sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
                	//Added 07272018 -CHK - Sending Expiration Email to Business Information and Business Representative.
				var capContObj = aa.people.getCapContactByCapID(capId).getOutput();
				for(x in capContObj)
			     {
			     if (aa.people.getCapContactByCapID(capId).getSuccess())
			     {
					 var contactType = getContactValues("CONTACTYPE", capId);
					  if (contactType == "Business Information")
					 {
					    email = getContactValues("EMAIL", capId);
						sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
					 }
					 if (contactType == "Business Representative")
					 {
					    email = getContactValues("EMAIL", capId);
						sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
					 }
				 }
				 }
				
				
				generatedCompletely = false;

				if (generatedCompletely) 
				{
				logDebugBatch("Report was generated and sent to " +email);

				}
			}
			if(capStatus.equals("About To Expire")){
				logDebugBatch("Checking to see if we are still in renewal window");
				if (today >= Expirationdate){
					logDebugBatch("Window has passed....expiring license");
					//for License--Make it Expired
					var stat="Expired";
					var cmt="License Expired";
					var wfstat="Expired";
					var wfstr="License Status";
					var wfcomment="Status set to Expired by script,Record Expired already";
					var wfnote="";                                         
					
					licEditExpInfo ("Expired",null);
					logDebugBatch("Updated Renewal Status to Expired");
					//Added This Line to update App Status to Closed.
					updateAppStatus("Expired", "Updated Via Script. This License/Certificate is expired.");
					updateTask(wfstr, wfstat, wfcomment, cmt);
					
					   	//Added 07272018 -CHK - Sending Expiration Email to Business Information and Business Representative.
				var capContObj = aa.people.getCapContactByCapID(capId).getOutput();
				for(x in capContObj)
			     {
			     if (aa.people.getCapContactByCapID(capId).getSuccess())
			     {
					 var contactType = capContObj[x].getCapContactModel().getPeople().getContactType();
					  if (contactType == "Business Information")
					 {
					    var email = capContObj[x].getCapContactModel().getPeople().getEmail();
						sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
					 }
					 if (contactType == "Business Representative")
					 {
					    var email = capContObj[x].getCapContactModel().getPeople().getEmail();
						sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
					 }
				 }
				 }

					logDebugBatch("********************************************************");
				}
				else{
					logDebugBatch("Window still opened....sending reminder notification");
					//sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
						var capContObj = aa.people.getCapContactByCapID(capId).getOutput();
				for(x in capContObj)
			     {
			     if (aa.people.getCapContactByCapID(capId).getSuccess())
			     {
					 var contactType = capContObj[x].getCapContactModel().getPeople().getContactType();
					  if (contactType == "Business Information")
					 {
					    var email = capContObj[x].getCapContactModel().getPeople().getEmail();
						sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
					 }
					 if (contactType == "Business Representative")
					 {
					    var email = capContObj[x].getCapContactModel().getPeople().getEmail();
						sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_NOTIFICATION",emailParameters,null);
					 }
				 }
				 }
				}
			}
				
			if(capStatus.equals("Expired")){
					//for License--Make it Closed
					var cmt="License Closed";
					var wfstat="Closed";
					var wfstr="License Status";
					var wfcomment="Status set to Closed by script,Record Expired 120 days already";
					var wfnote="";                                         
					updateTask(wfstr,wfstat,wfcomment,wfnote);
				   //Added 07272018 -CHK - Sending Expiration Email to Business Information, Applicant-Individual and Business Representative.
			      	var capContObj = aa.people.getCapContactByCapID(capId).getOutput();
				  	for(x in capContObj)
			        {
						if (aa.people.getCapContactByCapID(capId).getSuccess())
						{
					      var contactType = capContObj[x].getCapContactModel().getPeople().getContactType();
					      logDebug(contactType);
							if (contactType == "Applicant-Individual")
							{
								logDebug(contactType);
								var email = capContObj[x].getCapContactModel().getPeople().getEmail();
								businessname =getContactValues("LEGALNAME",capId);
								addParameter(emailParameters, "$$AppType$$", itemCapScriptModel.getCapType().getAlias());
								addParameter(emailParameters, "$$altId$$", capIDString);
								addParameter(emailParameters, "$$expirationDate$$", dateAdd(dtExpr,1));
								sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_EXPIRED",emailParameters,null);
							}
							if (contactType == "Business Information")
							{
								logDebug(contactType);
								var email = capContObj[x].getCapContactModel().getPeople().getEmail();
								businessname = capContObj[x].getCapContactModel().getPeople().getBusinessName();
								addParameter(emailParameters, "$$Licensee_Name$$", businessname);
								addParameter(emailParameters, "$$AppType$$", itemCapScriptModel.getCapType().getAlias());
								addParameter(emailParameters, "$$altId$$", capIDString);
								addParameter(emailParameters, "$$expirationDate$$", dateAdd(dtExpr,1));
								sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_EXPIRED",emailParameters,null);
							}
							if (contactType == "Business Representative")
							{
								logDebug(contactType);
								var email = capContObj[x].getCapContactModel().getPeople().getEmail();
								businessname = capContObj[x].getCapContactModel().getPeople().getBusinessName();
								sendNotification("noreply.abc@tn.gov",email,"","TABC_RENEWAL_EXPIRED",emailParameters,null);
							}
						}
				 
				 }
					var setAddResult1=aa.set.add(setID1,"Closed",capId,"STATUS CHANGED")
				
					closeTask("License Status", "Closed", "Updated via script.", "Updated via script.");
					//Added This Line to update App Status to Closed.
					updateAppStatus("Closed", "Updated Via Script. This License/Certificate is closed");
					logDebugBatch("License Task Status has been changed to closed" + capIDString);
					
					licEditExpInfo ("Inactive",null);
					logDebugBatch("Updated Renewal Status to Expired");
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

function getParam(pParamName) //gets parameter value and logs message showing param value
   {
   var ret = "" + aa.env.getValue(pParamName);
   logDebugBatch("Parameter : " + pParamName+" = "+ret);
   return ret;
   }

