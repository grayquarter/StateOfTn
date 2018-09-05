/*------------------------------------------------------------------------------------------------------/
| Program : ACA SECRETARY OF STATE INFORMATION Submit Before.js
| Event   : ACA_Before
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   : FA 06-03-2016 Updated
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;						// Set to true to see results in popup window
var showDebug = false;							// Set to true to see debug messages in popup window
var preExecute = ""
var controlString = "";		// Standard choice for control
var documentOnly = false;						// Document Only -- displays hierarchy of std choice steps
var disableTokens = false;						// turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false;			// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;			// Use Group name when populating Task Specific Info Values
var enableVariableBranching = false;			// Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99;							// Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message =	"";							// Message String
var debug = "";								// Debug String
var br = "<BR>";							// Break Tag

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
	}

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
	useSA = true; 	
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
	}
	
if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA));
	eval(getScriptText(SAScript,SA));
	}
else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
	}
	
eval(getScriptText("INCLUDES_CUSTOM"));

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
	}

function getScriptText(vScriptName){
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();	
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
		return emseScript.getScriptText() + "";	
		} catch(err) {
		return "";
	}
}


var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false ;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();					// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();				// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");				// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");

var AInfo = new Array();						// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info

/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute,true,0); 	// run Pre-execution code

// logGlobals(AInfo);// DEBUG ITEMS SHOW ON ACA ERROR BOX 

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

try {
	
	// FA 05-18-2016 
	if((AInfo['Legal Business Structure']!="Sole Proprietorship") && (AInfo['Legal Business Structure']!="General Partnership") )
	{
		if(AInfo['Legal Business Name']==null  || AInfo['Legal Business Name']=="")
		{
			showMessage = true;
			cancel = true;
			comment("Verify your Secretary of State Control Number entry, and respond whether the information is accurate.");
		}
		
		if ((AInfo['Is the above information accurate?'] != "No") && (AInfo['Is the above information accurate?'] != "Yes")) {
			showMessage = true;
			cancel = true;
			comment("Verify your Secretary of State Control Number entry, and respond whether the information is accurate.");
		}
	}else{
		if(AInfo['Do you have a Tennessee Secretary of State Control Number?']=='Yes')
		{
			if ((AInfo['Is the above information accurate?'] != "No") && (AInfo['Is the above information accurate?'] != "Yes")) {
			showMessage = true;
			cancel = true;
			comment("Verify your Secretary of State Control Number entry, and respond whether the information is accurate.");
		}
		}
	}
	
	if (AInfo['Is the above information accurate?'] == "No") {
		showMessage = true;
		cancel = true;
		comment("You may not proceed if the information from the Secretary of State is missing or is inaccurate. Please contact the Secretary of State and correct the issue before continuing.");
	}else{
		// add contact if only doesnt exist
		if (!checkIfContactExist('BUSINESS INFORMATION')){
			showMessage = false;
			cancel = false;
			
		
			if((AInfo['Legal Business Structure']!="Sole Proprietorship") && (AInfo['Legal Business Structure']!="General Partnership") )
			{
				var str = AInfo['Additional Secretary of State Info'];

				var indxFrmtnDt = str.indexOf('FORMATION DATE');
				var indxPrincAddr = str.indexOf('PRINCIPAL ADDRESS');
				var indxMailing = str.indexOf('MAILING ADDRESS');
				var indxAddr1 = str.indexOf('ADDR1=',indxMailing);
				var indxAddr2 = str.indexOf('ADDR2=',indxAddr1);
				var indxCity = str.indexOf('CITY=',indxAddr2);
				var indxSTATE = str.indexOf('STATE=',indxCity);
				var indxPOSTAL_CODE = str.indexOf('POSTAL_CODE=',indxSTATE);
				var indxCOUNTRY = str.indexOf('COUNTRY=',indxPOSTAL_CODE);

				var strFullCharDt = str.substring(indxFrmtnDt+15, indxPrincAddr).trim();
				strCharDt=strFullCharDt.substring(5,7) + "/" + strFullCharDt.substring(8,10) + "/" + strFullCharDt.substring(0,4).trim();
				var strAddress1 = str.substring(indxAddr1+6, indxAddr2).trim();
				var strAddress2 = str.substring(indxAddr2+6, indxCity).trim();
				var strCity = str.substring(indxCity+5, indxSTATE).trim();
				var strState = str.substring(indxSTATE+6, indxPOSTAL_CODE).trim();
				var strZip = str.substring(indxPOSTAL_CODE+12, indxCOUNTRY).trim();
				var strCountry = str.substring(indxCOUNTRY+8).trim();
			
			
				//createContact4ACA(AInfo['Legal Business Name'],"Business Information");
				createContact4ACA(AInfo['Legal Business Name'],"Business Information",AInfo['Legal Business Structure'],strCharDt,strAddress1,strAddress2,strCity,strState,strZip,strCountry);
			}else{
				if(AInfo['Do you have a Tennessee Secretary of State Control Number?']=='Yes')
				{
					var str = AInfo['Additional Secretary of State Info'];

					var indxFrmtnDt = str.indexOf('FORMATION DATE');
					var indxPrincAddr = str.indexOf('PRINCIPAL ADDRESS');
					var indxMailing = str.indexOf('MAILING ADDRESS');
					var indxAddr1 = str.indexOf('ADDR1=',indxMailing);
					var indxAddr2 = str.indexOf('ADDR2=',indxAddr1);
					var indxCity = str.indexOf('CITY=',indxAddr2);
					var indxSTATE = str.indexOf('STATE=',indxCity);
					var indxPOSTAL_CODE = str.indexOf('POSTAL_CODE=',indxSTATE);
					var indxCOUNTRY = str.indexOf('COUNTRY=',indxPOSTAL_CODE);

					var strFullCharDt = str.substring(indxFrmtnDt+15, indxPrincAddr).trim();
					strCharDt=strFullCharDt.substring(5,7) + "/" + strFullCharDt.substring(8,10) + "/" + strFullCharDt.substring(0,4).trim();
					var strAddress1 = str.substring(indxAddr1+6, indxAddr2).trim();
					var strAddress2 = str.substring(indxAddr2+6, indxCity).trim();
					var strCity = str.substring(indxCity+5, indxSTATE).trim();
					var strState = str.substring(indxSTATE+6, indxPOSTAL_CODE).trim();
					var strZip = str.substring(indxPOSTAL_CODE+12, indxCOUNTRY).trim();
					var strCountry = str.substring(indxCOUNTRY+8).trim();
					
					//createContact4ACA(AInfo['Legal Business Name'],"Business Information");
					createContact4ACA(AInfo['Legal Business Name'],"Business Information",AInfo['Legal Business Structure'],strCharDt,strAddress1,strAddress2,strCity,strState,strZip,strCountry);
				}
			}
		}
	}	

} catch (err) { logDebug(err)	}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
	}
else
	{
	if (cancel)
		{
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage) aa.env.setValue("ErrorMessage", message);
		if (showDebug) 	aa.env.setValue("ErrorMessage", debug);
		}
	else
		{
		aa.env.setValue("ErrorCode", "0");
		if (showMessage) aa.env.setValue("ErrorMessage", message);
		if (showDebug) 	aa.env.setValue("ErrorMessage", debug);
		}
	}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
