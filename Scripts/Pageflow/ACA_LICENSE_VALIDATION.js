/*------------------------------------------------------------------------------------------------------/
| Program : ACA_LICENSE_VALIDATION.js
| Event   : ACA_Before
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
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
var preExecute = "PreExecuteForBeforeEvents"
var controlString = "";						// Standard choice for control
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
var feeSeqList = new Array();						// invoicing fee list
var paymentPeriodList = new Array();					// invoicing pay periods

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
	}

var useSA = false;
var SA = null;
var SAScript = null;
var useProductInclude = false; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
	useSA = true; 	
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
	}
	
if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));
	eval(getScriptText(SAScript,SA));
	}
else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript));
	}
	
eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
	}

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
var	appTypeAlias = cap.getCapType().getAlias();
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	// Calculated valuation
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
	}

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail
if (capDetailObjResult.getSuccess())
	{
	capDetail = capDetailObjResult.getOutput();
	var houseCount = capDetail.getHouseCount();
	var feesInvoicedTotal = capDetail.getTotalFee();
	var balanceDue = capDetail.getBalance();
	}

var AInfo = new Array();						// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("appTypeAlias = " + appTypeAlias);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);

/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

//if (preExecute.length) doStandardChoiceActions(preExecute,true,0); 	// run Pre-execution code

logGlobals(AInfo);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

try {
	var restrictedTypes = checkLicenseRestrictions4ACA();
	if(restrictedTypes){
		showMessage = true;
		
		comment("The " + appTypeAlias + " does not allow you to concurrently hold a " + restrictedTypes +". Please contact TN Alcoholic Beverage Commission for further information.");
		cancel = true; 
		//comment("-------------------------------------------------");
		
	}

		
} catch (err) { logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);	}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function checkLicenseRestrictions4ACA(){
	var licenseRestrictionsStdChoice = "LICENSE_LIMITATIONS";
	//var licensesTable = loadASITable("LICENSES"); // The loadASITable method may not work for pageflow
	var licRestrictionTypes = lookup(licenseRestrictionsStdChoice,appTypeString);
	var licRestrictionTypesArray = null;
	var restrictedTypeFound = false;
	if(!isEmpty(licRestrictionTypes)){
		licRestrictionTypesArray = licRestrictionTypes.split("|");
	}

	if (typeof(LICENSES) == "object" && !isEmpty(licRestrictionTypesArray)) {
			
		for (j in LICENSES) {
			var vLicenseType = LICENSES[j]["License Type"];
			
			for(i in licRestrictionTypesArray){
				if(vLicenseType == licRestrictionTypesArray[i]){
					logDebug("(checkLicenseRestrictions4ACA) Restricted License Type Match: " + licRestrictionTypesArray[i]);
					
					if(restrictedTypeFound == false){
						// We are adding the first one
						restrictedTypeFound = licRestrictionTypesArray[i];
					}
					else{
						// We are adding multiple
						restrictedTypeFound += ", " + licRestrictionTypesArray[i];
					}
				}
			}
		}	
	}
	
	return restrictedTypeFound;
}

function validDate(dValue) {
  var result = false;
  dValue = dValue.split('/');
  var patternMM = /^\d{2}$/;
  var patternYYYY = /^\d{4}$/;


  if (dValue[0] < 1 || dValue[0] > 12)
      result = true;

  if (!patternMM.test(dValue[0]) || !patternYYYY.test(dValue[1]))
      result = true;

  if (dValue[2])
      result = true;

  if (result) 
  	return false;
  else
  	return true;
}

//
// Check for invoicing of fees
//
if (feeSeqList.length)
	{
	invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
	if (invoiceResult.getSuccess())
		logMessage("Invoicing assessed fee items is successful.");
	else
		logMessage("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
	}

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

function getApplicationCapId4Renewal(appRecType) {
	//returns the first record found of the type appRecType as a child to the license

	var appCapId = null;

	var parentResult = aa.cap.getProjectByChildCapID(capId,"Renewal","Incomplete");
	
	if (parentResult.getSuccess()) {
		//get the license record
		var projectModelList = parentResult.getOutput();
		var projectModel = projectModelList[0].getProject();
		var parentCapId = projectModel.getProjectID();
		logDebug("Parent found");

		var licenseChildren = getChildren(appRecType, parentCapId);
		logDebug(licenseChildren.length);

		appCapId = licenseChildren[0]; 
	} else {
		//could not find the parent
		logDebug("Could not find the parent: " + parentResult.getErrorType() + ":" + parentResult.getErrorMessage());
	}

	return appCapId;

}

