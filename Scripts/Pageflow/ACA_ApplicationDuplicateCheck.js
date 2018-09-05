/*------------------------------------------------------------------------------------------------------/
| Program : ACA_APPLICATIONDUPLICATECHECK.js
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

try
{
	var capContactArray = null;

	var capContactArray = getContactArrayEx();

	logDebug("Contacts found: " + capContactArray.length);
	
	if (capContactArray.length > 0) {
		for (var yy in capContactArray) {
			/*ccm = capContactArray[yy];
			for (cm in ccm)
				logDebug(cm + " : " + ccm[cm]);
			*/
			conType = String(capContactArray[yy].contactType);
			logDebug("Pageflow Contact Type: " + conType);
			
			if (conType.equals("Business Information")){
				var conTypeRtrn = capContactArray[yy].businessName;
				logDebug("PageFlow Contact: " + conTypeRtrn);
			}

			if (conType.equals("Permittee")){
				var conSSRtrn = capContactArray[yy].ssNum;

				//logDebug("SS: " + conSSRtrn);
			}
		}
	}		
	relRcds = new Array();
	if (appTypeArray[1].equals("Permits")){
		
		capSearchType = "TNABC/"+appTypeArray[1]+"/NA/"+appTypeArray[3];
		relRcds = getAllRelatedCapsByContact(capSearchType,conSSRtrn);	
	}
	if (matches(appTypeArray[1],"Liquor by the Drink","Retail","Supplier","Wholesale") && !appTypeArray[3].equals("Special Occasion")){
		var capMdlAddrs = cap.getAddressModel();

		logDebug("Application Address: "+ capMdlAddrs);
		relRcds = getAllRelatedCapsByAddress(capMdlAddrs,appTypeString,conTypeRtrn);
	}
	logDebug("Related found: " + relRcds);
	
	if (relRcds){
		//logDebug("Our Records show that there is a registered TABC License OR Permit at this address with this Business Name.  Please contact the TABC office at 615-741-1602");
	
		cancel = true;
		showMessage = true;
		comment("Our Records show that there is a registered TABC License OR Permit at this address with this Business Name.  Please contact the TABC office at 615-741-1602");
		//aa.env.setValue("ErrorCode","1");
		//aa.env.setValue("ErrorMessage",debug);
	}
	
		
	//var amendCapModel = aa.cap.getCapViewBySingle4ACA(capId);

	//aa.env.setValue("CapModel", amendCapModel);
	//aa.env.setValue("CAP_MODEL_INITED", "TRUE");       

}
catch(e)
{ 
	//logError("Error: "+e); 
	//end();
	logDebug(e);
}
/*
		cancel = true;
		aa.env.setValue("ErrorCode","1");
		aa.env.setValue("ErrorMessage",debug);
*/

function getAllRelatedCapsByContact(capSearchType,conSSRtrn) {
	//logDebug("Checking for existing Contact SS: " + conSSRtrn);
	
	var conCapArray = new Array();

	

	var seqNbr = currentUserID.substring(10);

	var publicUserModel=aa.publicUser.getPublicUser(parseInt(seqNbr)).getOutput();

	var resultArray = new Array();
			
	if(conSSRtrn && publicUserModel != null)
	{
		var newConRef = null;
		
		var email = publicUserModel.getEmail();

		//get Reference Contact model to get Ref Seq#
		logDebug("Finding Reference");
		
		var newPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
		newPeople.setEmail(email);
		
		var result = aa.people.getPeopleByPeopleModel(newPeople);
		
		if (result.getOutput() != null && result.getOutput().length > 0)
		{
			newConRef = result.getOutput()[0];
			var conRefSeq = newConRef.getContactSeqNumber();			

			logDebug("Ref Seq #: " + conRefSeq);

			var pm = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
			var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput(); 
			pm.setServiceProviderCode(aa.getServiceProviderCode()) ; 
			pm.setContactSeqNumber(conRefSeq); 

			var cList = ccb.getCapContactsByRefContactModel(pm).toArray();
			
			for (var j in cList) {
				var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
				if (appMatch(capSearchType,thisCapId)){
					thisCap = aa.cap.getCap(thisCapId).getOutput();
					thisAltID = thisCapId.getCustomID();
					thisCapTypeResult = thisCap.getCapType();
					thisCapTypeString = thisCapTypeResult.toString();
					thisCapTypeArray = thisCapTypeString.split("/");
					thisCapStatus = thisCap.getCapStatus();
					if (thisCapStatus != null && thisCapStatus.equals("Active")){
						logDebug("Found Cap: " + thisAltID + "record type: " + thisCapTypeString + " with status of " + thisCapStatus);
						resultArray.push(thisCapId);
					}
				}
			}
		}	
	}	
	
	logDebug("TOTAL FOUND: "+ resultArray.length);
	var activeFound = false;
	for (ra in resultArray){
		var relCapCId = resultArray[ra];
		relCap = aa.cap.getCap(relCapCId).getOutput();
		var capContactArray = new Array();
		capStatus = relCap.getCapStatus();
		if (capStatus && capStatus.equals("Active")){
			logDebug("Getting contact info on this record");
			var capContactResult = aa.people.getCapContactByCapID(relCapCId);
			if (capContactResult.getSuccess()) {
				capContactArray = capContactResult.getOutput();
			}

			if (capContactArray) {
				for (ym in capContactArray) {
					//logDebug(capContactArray[ym].getContactType());
					logDebug(capContactArray[ym].getPeople().getSocialSecurityNumber());
					var conSSIS= capContactArray[ym].getPeople().getSocialSecurityNumber();
					
					if (conSSRtrn == conSSIS)
						activeFound = true;
				}
			}
		}
	}
	logDebug("Match found = " + activeFound);
	return activeFound;
}


function getAllRelatedCapsByAddress(capMdlAddrs,ats,conTypeRtrn) {
	var hseNum = capMdlAddrs.getHouseNumberAlphaStart();	
	var streetName = capMdlAddrs.getStreetName();

	var zip = capMdlAddrs.getZip();
	var streetUnitStart = capMdlAddrs.getUnitStart();

	if (streetUnitStart == "")
		streetUnitStart = null;

	if (zip == "")
		zip = null;

	//logDebug("Getting Caps with same address " + streetName);
	// get caps with same address
	var capAddResult = aa.cap.getCapListByDetailAddress(streetName,null,null,zip,null,null);
	if (capAddResult.getSuccess())
		var capArray = capAddResult.getOutput();
	else {
		logDebug("**ERROR: getting similar addresses: " + capAddResult.getErrorMessage());
	}

	//logDebug("Total found with address : "  + streetName + " "  + zip + " = " + capArray.length);
	var matchFound = false;
	
	//convert CapIDScriptModel objects to CapIDModel objects
	if (capArray.length > 0){
		
		for (ca in capArray){

			capAddressIDScript = capArray[ca];
			relCapCapId = capAddressIDScript.getCapID();
			//for (xx in capAddressIDScript)
				//logDebug(xx + ": " + capAddressIDScript[xx]);
			
			var addResult = aa.address.getAddressByCapId(relCapCapId);

			if (addResult.getSuccess()) {
				var addArray = addResult.getOutput();
				for (var jj in addArray) {
					var thisAddress = addArray[jj];
					
					var capStreetUnitStart = thisAddress.getUnitStart();

					if (capStreetUnitStart == "")
						capStreetUnitStart = null;

					var capHseNum = thisAddress.getHouseNumberAlphaStart();	
					var capStreetName = thisAddress.getStreetName();
					var capZip = thisAddress.getZip();

					if (hseNum == capHseNum && streetUnitStart == capStreetUnitStart){
						//logDebug("Found a match, checking record type for " + relCapCapId.getCustomID());
						// get cap type
						relCap = aa.cap.getCap(relCapCapId).getOutput();
						var relTypeResult = relCap.getCapType();
						var relTypeString = relTypeResult.toString();
						var reltypeArray = relTypeString.split("/");
						capStatus = relCap.getCapStatus();
						
						if (capStatus && !matches(capStatus,"Active","About To Expire"))
							continue;
						
						if (!matches(reltypeArray[1],"Liquor by the Drink","Retail","Supplier","Wholesale") || reltypeArray[3].equals("Special Occasion") || reltypeArray[2].equals("Application"))
							continue;
						
						var isMatch = true;
						var ata = ats.split("/");

						if (ata.length != 4)
							logDebug("ERROR: The following Application Type String is incorrectly formatted: " + ats);
						else{

							var capSType = ata[1];

							capSearchType = "TNABC/"+capSType+"/License/"+ata[3];
							
							//logDebug("Checking: " + capSearchType + " against " + relTypeString);
							
							if (!capSearchType.equals(relTypeString))
								isMatch = false;
						}
						if (isMatch){
							//get contact
							var capContactArray = null;

							var capContactResult = aa.people.getCapContactByCapID(relCapCapId);
							if (capContactResult.getSuccess()) {
								var capContactArray = capContactResult.getOutput();
							}

							if (capContactArray) {
								for (var yy in capContactArray) {
									
									var relCConType = capContactArray[yy].getPeople().getContactType();

									if (capContactArray[yy].getPeople().getContactType().equals("Business Information")) {
										var relCBusName = capContactArray[yy].getPeople().getBusinessName();
										logDebug("Name: " + relCBusName.toUpperCase());
										logDebug("S Name: "+ conTypeRtrn.toUpperCase());
										
										if(conTypeRtrn.toUpperCase().equals(relCBusName.toUpperCase()))
											matchFound = true;
									}
								}
							}
						}
					} // loop through related caps
					//else
						//logDebug("NO MATCHES FOUND BY ADDRESS: ");
				}
			}
		}
	}
	logDebug("Match found = " + matchFound);
	
	return matchFound;
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {	
	if (!servProvCode)  
		servProvCode = aa.getServiceProviderCode();	vScriptName = vScriptName.toUpperCase();	
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();	
	try {	
		if (useProductScripts)	
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName); 
		else
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName, "ADMIN");
			
		return emseScript.getScriptText() + "";	
	} 
	catch (err) {		
		return "";
	}
 }
 
function logError(error)
{
   // aa.print(error);
   // errorMessage += error + br;
    //errorCode = -1;
}
function end()
{
   // aa.env.setValue("ErrorCode", errorCode);
 
   //aa.env.setValue("ErrorMessage", errorMessage);
}
function getContactArrayEx() {
    logDebug("ENTER: getContactArrayEx");
    // Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
    // optional capid
    // added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
    // on ASA it should still be pulled normal way even though still partial cap
    var thisCap = capId;
    if (arguments.length == 1) thisCap = arguments[0];
    var cArray = new Array();
    if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
    {
        logDebug("USES: cap.getContactsGroup().toArray()");
        capContactArray = cap.getContactsGroup().toArray();
		//[kelly added begin]
		if(capContactArray.length==0){
		var capApplicant = cap.getApplicantModel();
		var ApplicantArray = new Array();
		if(capApplicant){
		ApplicantArray[0]=capApplicant;
		capContactArray=ApplicantArray;
		}
		}
		//[kelly added begin]
		
    }
    else {
        logDebug("USES: aa.people.getCapContactByCapID(thisCap);");
        var capContactResult = aa.people.getCapContactByCapID(thisCap);
        if (capContactResult.getSuccess()) {
            capContactArray = capContactResult.getOutput();
        }
    }
    if (capContactArray) {
        for (yy in capContactArray) {
            logDebug(capContactArray[yy].getContactType());
			logDebug(capContactArray[yy].getPeople().lastName);
            var aArray = new Array();
            aArray["lastName"] = capContactArray[yy].getPeople().lastName;
            aArray["firstName"] = capContactArray[yy].getPeople().firstName;
            aArray["middleName"] = capContactArray[yy].getPeople().middleName;
            aArray["businessName"] = capContactArray[yy].getPeople().businessName;
            aArray["contactSeqNumber"] = capContactArray[yy].getPeople().contactSeqNumber;
            aArray["contactType"] = capContactArray[yy].getPeople().contactType;
            aArray["relation"] = capContactArray[yy].getPeople().relation;
            aArray["phone1"] = capContactArray[yy].getPeople().phone1;
            aArray["phone2"] = capContactArray[yy].getPeople().phone2;
            aArray["email"] = capContactArray[yy].getPeople().email;
            aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
            aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
            aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
            aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
            aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
            aArray["fax"] = capContactArray[yy].getPeople().fax;
            aArray["notes"] = capContactArray[yy].getPeople().notes;
            aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
            aArray["fullName"] = capContactArray[yy].getPeople().fullName;
            aArray["gender"] = capContactArray[yy].getPeople().gender;
            aArray["birthDate"] = capContactArray[yy].getPeople().birthDate;
            aArray["driverLicenseNbr"] = capContactArray[yy].getPeople().driverLicenseNbr;
            aArray["driverLicenseState"] = capContactArray[yy].getPeople().driverLicenseState;
            aArray["deceasedDate"] = capContactArray[yy].getPeople().deceasedDate;
			aArray["ssNum"] = capContactArray[yy].getPeople().getSocialSecurityNumber();
			/*
            if (arguments.length == 0 && !cap.isCompleteCap()) // using capModel to get contacts
                var pa = capContactArray[yy].getPeople().getAttributes().toArray();
            else
                var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
            for (xx1 in pa)
                aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;*/
            cArray.push(aArray);
        }
    }
    logDebug("EXIT: getContactArrayEx");
    return cArray;
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
